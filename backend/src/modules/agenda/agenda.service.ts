import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';
import { validateAvailability } from '../availability/availability.service.js';

export const appointmentSchema = z.object({
  lead_id: z.string().uuid().optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable(),
  atendente_id: z.string().uuid().optional().nullable(),
  sala_prova_id: z.string().uuid().optional().nullable(),
  produto_ids: z.array(z.string().uuid()).default([]),
  inicio_at: z.string().datetime(),
  fim_at: z.string().datetime(),
  tipo: z.string().min(2),
  status: z.string().default('confirmado'),
  origem: z.string().default('manual'),
  observacoes: z.string().optional().nullable()
});

export async function listRooms() {
  const result = await pool.query('SELECT * FROM salas_prova WHERE deleted_at IS NULL ORDER BY nome');
  return result.rows;
}

export async function listAppointments() {
  const result = await pool.query(`
    SELECT
      a.*,
      l.nome AS lead_nome,
      c.nome AS cliente_nome,
      f.nome AS atendente_nome,
      s.nome AS sala_nome,
      COALESCE(json_agg(p.nome) FILTER (WHERE p.id IS NOT NULL), '[]') AS vestidos
    FROM agendamentos a
    LEFT JOIN leads l ON l.id = a.lead_id
    LEFT JOIN clientes c ON c.id = a.cliente_id
    LEFT JOIN funcionarios f ON f.id = a.atendente_id
    LEFT JOIN salas_prova s ON s.id = a.sala_prova_id
    LEFT JOIN agendamento_produtos ap ON ap.agendamento_id = a.id
    LEFT JOIN produtos p ON p.id = ap.produto_id
    WHERE a.deleted_at IS NULL
    GROUP BY a.id, l.nome, c.nome, f.nome, s.nome
    ORDER BY a.inicio_at DESC
  `);
  return result.rows;
}

export async function createAppointment(input: z.infer<typeof appointmentSchema>, usuarioId: string) {
  const data = appointmentSchema.parse(input);

  return withTransaction(async (client) => {
    const availability = await validateAvailability({
      inicio_at: data.inicio_at,
      fim_at: data.fim_at,
      sala_prova_id: data.sala_prova_id,
      atendente_id: data.atendente_id,
      produto_ids: data.produto_ids
    }, client);

    if (!availability.disponivel) {
      await client.query(
        `
        INSERT INTO conflitos_log (entidade_tipo, tipo_conflito, mensagem, payload_json, criado_por_id)
        VALUES ('agendamento', 'disponibilidade', $1, $2, $3)
        `,
        ['Não foi possível confirmar este horário.', JSON.stringify({ conflitos: availability.conflitos, input: data }), usuarioId]
      );
      return { criado: false, conflitos: availability.conflitos };
    }

    const appointment = await client.query<{ id: string }>(
      `
      INSERT INTO agendamentos (
        lead_id, cliente_id, atendente_id, sala_prova_id, produto_id,
        data_evento_referencia, inicio_at, fim_at, tipo, status, origem, observacoes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
      `,
      [
        data.lead_id ?? null,
        data.cliente_id ?? null,
        data.atendente_id ?? null,
        data.sala_prova_id ?? null,
        data.produto_ids[0] ?? null,
        data.inicio_at.slice(0, 10),
        data.inicio_at,
        data.fim_at,
        data.tipo,
        data.status,
        data.origem,
        data.observacoes ?? null
      ]
    );

    for (const produtoId of data.produto_ids) {
      await client.query('INSERT INTO agendamento_produtos (agendamento_id, produto_id) VALUES ($1, $2)', [appointment.rows[0].id, produtoId]);
      await client.query(
        `
        INSERT INTO reservas_estoque (produto_id, cliente_id, agendamento_id, data_evento, inicio_at, fim_at, tipo_bloqueio, motivo_bloqueio, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'prova', 'Reserva criada ao marcar prova.', 'ativa')
        `,
        [produtoId, data.cliente_id ?? null, appointment.rows[0].id, data.inicio_at.slice(0, 10), data.inicio_at, data.fim_at]
      );
    }

    await client.query(
      `
      INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
      VALUES ('agendamento', $1, $2, 'agendamento_criado', 'Prova/atendimento marcado.')
      `,
      [appointment.rows[0].id, usuarioId]
    );

    await client.query(
      `
      INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json)
      VALUES ('agendamento_criado', 'agendamento', $1, $2)
      `,
      [appointment.rows[0].id, JSON.stringify({ tipo: data.tipo, produto_ids: data.produto_ids })]
    );

    return { criado: true, id: appointment.rows[0].id, conflitos: [] };
  });
}

export async function cancelAppointment(id: string, usuarioId: string) {
  await pool.query(
    `
    UPDATE agendamentos
    SET status = 'cancelado', cancelado_em = now(), cancelado_por_id = $2, atualizado_em = now()
    WHERE id = $1
    `,
    [id, usuarioId]
  );
  await pool.query(
    `
    UPDATE reservas_estoque
    SET status = 'cancelada', cancelado_em = now(), cancelado_por_id = $2, atualizado_em = now()
    WHERE agendamento_id = $1 AND deleted_at IS NULL
    `,
    [id, usuarioId]
  );
  return { id, status: 'cancelado' };
}

export async function updateAppointmentStatus(id: string, status: string, usuarioId: string) {
  const result = await pool.query(
    `
    UPDATE agendamentos
    SET status = $2,
        cancelado_em = CASE WHEN $2 = 'cancelado' THEN now() ELSE cancelado_em END,
        cancelado_por_id = CASE WHEN $2 = 'cancelado' THEN $3 ELSE cancelado_por_id END,
        atualizado_em = now()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id, status
    `,
    [id, status, usuarioId]
  );
  if (!result.rowCount) throw new Error('Agendamento nao encontrado.');

  if (status === 'cancelado') {
    await pool.query(
      `
      UPDATE reservas_estoque
      SET status = 'cancelada', cancelado_em = now(), cancelado_por_id = $2, atualizado_em = now()
      WHERE agendamento_id = $1 AND deleted_at IS NULL
      `,
      [id, usuarioId]
    );
  }

  await pool.query(
    `
    INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao)
    VALUES ('agendamento', $1, $2, 'status_alterado', $3)
    `,
    [id, usuarioId, `Status do agendamento alterado para ${status}.`]
  );

  return result.rows[0];
}

export async function listReservations() {
  const result = await pool.query(`
    SELECT r.*, p.nome AS produto_nome, c.nome AS cliente_nome
    FROM reservas_estoque r
    JOIN produtos p ON p.id = r.produto_id
    LEFT JOIN clientes c ON c.id = r.cliente_id
    WHERE r.deleted_at IS NULL
    ORDER BY r.inicio_at DESC
  `);
  return result.rows;
}
