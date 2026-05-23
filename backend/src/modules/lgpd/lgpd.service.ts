import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';
import { addAuditLog } from '../traceability/audit.service.js';

export const consentSchema = z.object({
  cliente_id: z.string().uuid(),
  finalidade: z.string().min(2),
  permitido: z.boolean(),
  observacoes: z.string().optional().nullable()
});

export const lgpdRequestSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  tipo: z.enum(['acesso', 'correcao', 'exclusao', 'anonimizacao', 'revogacao']),
  solicitante_nome: z.string().optional().nullable(),
  solicitante_contato: z.string().optional().nullable(),
  descricao: z.string().optional().nullable()
});

export async function listLgpd() {
  const [consents, requests, policies, anonymizations] = await Promise.all([
    pool.query('SELECT c.*, cl.nome AS cliente_nome FROM consentimentos c JOIN clientes cl ON cl.id = c.cliente_id ORDER BY c.atualizado_em DESC'),
    pool.query(`
      SELECT s.*, c.nome AS cliente_nome, l.nome AS lead_nome
      FROM solicitacoes_lgpd s
      LEFT JOIN clientes c ON c.id = s.cliente_id
      LEFT JOIN leads l ON l.id = s.lead_id
      ORDER BY s.criado_em DESC
    `),
    pool.query('SELECT * FROM politicas_retencao_dados ORDER BY entidade_tipo, finalidade'),
    pool.query('SELECT * FROM anonimizacoes_log ORDER BY executado_em DESC LIMIT 100')
  ]);
  return { consentimentos: consents.rows, solicitacoes: requests.rows, politicas: policies.rows, anonimizacoes: anonymizations.rows };
}

export async function upsertConsent(input: z.infer<typeof consentSchema>, usuarioId: string) {
  const data = consentSchema.parse(input);
  return withTransaction(async (client) => {
    const previous = await client.query('SELECT * FROM consentimentos WHERE cliente_id = $1 AND finalidade = $2', [data.cliente_id, data.finalidade]);
    const result = await client.query<{ id: string }>(
      `
      INSERT INTO consentimentos (cliente_id, finalidade, permitido, origem, observacoes, concedido_em, revogado_em, criado_por_id)
      VALUES ($1,$2,$3,'manual',$4,CASE WHEN $3 THEN now() ELSE NULL END,CASE WHEN $3 THEN NULL ELSE now() END,$5)
      ON CONFLICT (cliente_id, finalidade) DO UPDATE
      SET permitido = EXCLUDED.permitido,
          observacoes = EXCLUDED.observacoes,
          concedido_em = CASE WHEN EXCLUDED.permitido THEN now() ELSE consentimentos.concedido_em END,
          revogado_em = CASE WHEN EXCLUDED.permitido THEN NULL ELSE now() END,
          atualizado_em = now()
      RETURNING id
      `,
      [data.cliente_id, data.finalidade, data.permitido, data.observacoes ?? null, usuarioId]
    );

    if (!data.permitido) {
      await client.query(
        "INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json, idempotency_key) VALUES ('consentimento_revogado', 'cliente', $1, $2, $3) ON CONFLICT DO NOTHING",
        [data.cliente_id, JSON.stringify({ finalidade: data.finalidade }), `consentimento_revogado:${data.cliente_id}:${data.finalidade}`]
      );
    }

    await addAuditLog(client, {
      usuarioId,
      acao: data.permitido ? 'consentimento_concedido' : 'consentimento_revogado',
      entidadeTipo: 'cliente',
      entidadeId: data.cliente_id,
      antes: previous.rows[0] ?? null,
      depois: data,
      motivo: data.observacoes ?? null
    });

    return { id: result.rows[0].id };
  });
}

export async function createLgpdRequest(input: z.infer<typeof lgpdRequestSchema>, usuarioId: string) {
  const data = lgpdRequestSchema.parse(input);
  const result = await pool.query<{ id: string }>(
    `
    INSERT INTO solicitacoes_lgpd (
      cliente_id, lead_id, tipo, solicitante_nome, solicitante_contato, descricao, prazo_resposta_em, responsavel_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,current_date + 15,$7)
    RETURNING id
    `,
    [data.cliente_id ?? null, data.lead_id ?? null, data.tipo, data.solicitante_nome ?? null, data.solicitante_contato ?? null, data.descricao ?? null, usuarioId]
  );
  return { id: result.rows[0].id };
}

export async function anonymizeLead(id: string, motivo: string, usuarioId: string) {
  return withTransaction(async (client) => {
    const before = await client.query('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [id]);
    if (!before.rowCount) throw new Error('Lead não encontrado.');
    await client.query(
      `
      UPDATE leads
      SET nome = 'Lead anonimizado',
          telefone = 'anonimizado',
          email = NULL,
          motivo_perda_observacao = NULL,
          atualizado_em = now()
      WHERE id = $1
      `,
      [id]
    );
    await client.query(
      `
      INSERT INTO anonimizacoes_log (entidade_tipo, entidade_id, campos_anonimizados_json, motivo, executado_por_id)
      VALUES ('lead', $1, '["nome","telefone","email","observacoes"]', $2, $3)
      `,
      [id, motivo, usuarioId]
    );
    await addAuditLog(client, {
      usuarioId,
      acao: 'anonimizacao_lgpd',
      entidadeTipo: 'lead',
      entidadeId: id,
      antes: before.rows[0],
      depois: { anonimizado: true },
      motivo
    });
    return { id, anonimizado: true };
  });
}
