import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';

export const quickLeadSchema = z.object({
  nome: z.string().min(2),
  telefone: z.string().min(8),
  data_evento: z.string().date().optional().nullable(),
  interesse: z.string().optional().nullable(),
  criar_tarefa: z.boolean().default(true)
});

export const taskSchema = z.object({
  titulo: z.string().min(2),
  tipo: z.string().default('follow_up'),
  descricao: z.string().optional().nullable(),
  prioridade: z.string().default('normal'),
  data_limite: z.string().datetime().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable()
});

export const leadStatusSchema = z.object({
  status: z.string().min(2)
});

export async function findLeadDuplicates(telefone?: string, email?: string) {
  const result = await pool.query(
    `
    SELECT id, nome, telefone, email, status, criado_em
    FROM leads
    WHERE deleted_at IS NULL
      AND (($1::text IS NOT NULL AND telefone = $1) OR ($2::text IS NOT NULL AND email = $2))
    ORDER BY criado_em DESC
    LIMIT 10
    `,
    [telefone ?? null, email ?? null]
  );
  return result.rows;
}

export async function createQuickLead(input: z.infer<typeof quickLeadSchema>, usuarioId: string) {
  const data = quickLeadSchema.parse(input);

  return withTransaction(async (client) => {
    const duplicates = await client.query(
      `
      SELECT id, nome, telefone, email, status
      FROM leads
      WHERE deleted_at IS NULL AND telefone = $1
      ORDER BY criado_em DESC
      `,
      [data.telefone]
    );

    const lead = await client.query<{ id: string }>(
      `
      INSERT INTO leads (nome, telefone, data_evento, interesse, responsavel_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [data.nome, data.telefone, data.data_evento ?? null, data.interesse ?? null, usuarioId]
    );

    if (data.criar_tarefa) {
      await client.query(
        `
        INSERT INTO tarefas (titulo, tipo, descricao, responsavel_id, lead_id, data_limite)
        VALUES ('Retornar contato da nova noiva', 'follow_up', 'Criada automaticamente pelo Atendimento Rápido.', $1, $2, now() + interval '1 day')
        `,
        [usuarioId, lead.rows[0].id]
      );
    }

    await client.query(
      `
      INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
      VALUES ('lead', $1, $2, 'lead_criado', 'Nova noiva criada pelo Atendimento Rápido.')
      `,
      [lead.rows[0].id, usuarioId]
    );

    await client.query(
      `
      INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json)
      VALUES ('lead_criado', 'lead', $1, jsonb_build_object('origem', 'cadastro_rapido'))
      `,
      [lead.rows[0].id]
    );

    return { id: lead.rows[0].id, duplicados: duplicates.rows };
  });
}

export async function listLeads() {
  const result = await pool.query(`
    SELECT l.*, u.nome AS responsavel_nome
    FROM leads l
    LEFT JOIN usuarios u ON u.id = l.responsavel_id
    WHERE l.deleted_at IS NULL
    ORDER BY l.criado_em DESC
  `);
  return result.rows;
}

export async function getLead(id: string) {
  const [lead, tasks] = await Promise.all([
    pool.query('SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL', [id]),
    pool.query('SELECT * FROM tarefas WHERE lead_id = $1 AND deleted_at IS NULL ORDER BY criado_em DESC', [id])
  ]);
  return { lead: lead.rows[0], tarefas: tasks.rows };
}

export async function updateLeadStatus(id: string, status: string, usuarioId: string) {
  const result = await pool.query(
    `
    UPDATE leads
    SET status = $2, atualizado_em = now()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
    `,
    [id, status]
  );
  if (!result.rowCount) throw new Error('Lead nao encontrado.');

  await pool.query(
    `
    INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
    VALUES ('lead', $1, $2, 'status_alterado', $3)
    `,
    [id, usuarioId, `Status alterado para ${status}.`]
  );

  await pool.query(
    `
    INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json, idempotency_key)
    VALUES ('lead_status_alterado', 'lead', $1, $2, $3)
    ON CONFLICT DO NOTHING
    `,
    [id, JSON.stringify({ status }), `lead_status_alterado:${id}:${status}:${Date.now()}`]
  );

  return result.rows[0];
}

export async function listClients() {
  const result = await pool.query('SELECT * FROM clientes WHERE deleted_at IS NULL ORDER BY nome');
  return result.rows;
}

export async function convertLeadToClient(id: string, usuarioId: string) {
  return withTransaction(async (client) => {
    const lead = await client.query('SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [id]);
    if (!lead.rowCount) throw new Error('Lead não encontrado.');

    const created = await client.query<{ id: string }>(
      `
      INSERT INTO clientes (lead_id, nome, telefone, email, data_evento, estilo_notas)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [id, lead.rows[0].nome, lead.rows[0].telefone, lead.rows[0].email, lead.rows[0].data_evento, lead.rows[0].interesse]
    );

    await client.query(
      `UPDATE leads SET status = 'convertido', convertido_cliente_id = $2, atualizado_em = now() WHERE id = $1`,
      [id, created.rows[0].id]
    );

    await client.query(
      `
      INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
      VALUES ('lead', $1, $2, 'lead_convertido', 'Noiva convertida em cliente.')
      `,
      [id, usuarioId]
    );

    return { cliente_id: created.rows[0].id };
  });
}

export async function listTasks() {
  const result = await pool.query(`
    SELECT t.*, l.nome AS lead_nome, c.nome AS cliente_nome
    FROM tarefas t
    LEFT JOIN leads l ON l.id = t.lead_id
    LEFT JOIN clientes c ON c.id = t.cliente_id
    WHERE t.deleted_at IS NULL
    ORDER BY t.status, t.data_limite NULLS LAST, t.criado_em DESC
  `);
  return result.rows;
}

export async function createTask(input: z.infer<typeof taskSchema>, usuarioId: string) {
  const data = taskSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO tarefas (titulo, tipo, descricao, responsavel_id, prioridade, data_limite, lead_id, cliente_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [data.titulo, data.tipo, data.descricao ?? null, usuarioId, data.prioridade, data.data_limite ?? null, data.lead_id ?? null, data.cliente_id ?? null]
  );
  await pool.query(
    `
    INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
    VALUES ('tarefa', $1, $2, 'tarefa_criada', 'Tarefa criada.')
    `,
    [result.rows[0].id, usuarioId]
  );
  await pool.query(
    `
    INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json, idempotency_key)
    VALUES ('tarefa_criada', 'tarefa', $1, '{}', $2)
    ON CONFLICT DO NOTHING
    `,
    [result.rows[0].id, `tarefa_criada:${result.rows[0].id}`]
  );
  return result.rows[0];
}
