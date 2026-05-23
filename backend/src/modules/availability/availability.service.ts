import { z } from 'zod';
import { pool, type DbClient } from '../../config/db.js';

export const availabilitySchema = z.object({
  inicio_at: z.string().datetime(),
  fim_at: z.string().datetime(),
  sala_prova_id: z.string().uuid().optional().nullable(),
  atendente_id: z.string().uuid().optional().nullable(),
  produto_ids: z.array(z.string().uuid()).default([]),
  ignorar_agendamento_id: z.string().uuid().optional().nullable(),
  tipo: z.string().optional()
});

export type AvailabilityConflict = {
  campo: string;
  mensagem: string;
};

export async function validateAvailability(
  input: z.infer<typeof availabilitySchema>,
  client: DbClient = pool
): Promise<{ disponivel: boolean; conflitos: AvailabilityConflict[] }> {
  const data = availabilitySchema.parse(input);
  const conflitos: AvailabilityConflict[] = [];
  const inicio = new Date(data.inicio_at);
  const fim = new Date(data.fim_at);

  if (!(fim > inicio)) {
    conflitos.push({ campo: 'periodo', mensagem: 'O horário final precisa ser depois do horário inicial.' });
    return { disponivel: false, conflitos };
  }

  const lojaBloqueada = await client.query(
    `
    SELECT motivo FROM loja_bloqueios
    WHERE deleted_at IS NULL
      AND afeta_agenda = true
      AND data_inicio < $2
      AND data_fim > $1
    LIMIT 1
    `,
    [data.inicio_at, data.fim_at]
  );

  if (lojaBloqueada.rowCount) {
    conflitos.push({ campo: 'loja', mensagem: `A loja está bloqueada neste horário: ${lojaBloqueada.rows[0].motivo}.` });
  }

  if (data.sala_prova_id) {
    const sala = await client.query<{ capacidade: number; ativo: boolean; nome: string }>(
      'SELECT nome, capacidade, ativo FROM salas_prova WHERE id = $1 AND deleted_at IS NULL',
      [data.sala_prova_id]
    );

    if (!sala.rowCount || !sala.rows[0].ativo) {
      conflitos.push({ campo: 'sala', mensagem: 'Essa cabine não está ativa para agendamento.' });
    } else {
      const ocupacao = await client.query<{ total: string }>(
        `
        SELECT count(*)::text AS total
        FROM agendamentos
        WHERE sala_prova_id = $1
          AND deleted_at IS NULL
          AND cancelado_em IS NULL
          AND status NOT IN ('cancelado')
          AND inicio_at < $3
          AND fim_at > $2
          AND ($4::uuid IS NULL OR id <> $4)
        `,
        [data.sala_prova_id, data.inicio_at, data.fim_at, data.ignorar_agendamento_id ?? null]
      );
      if (Number(ocupacao.rows[0].total) >= sala.rows[0].capacidade) {
        conflitos.push({ campo: 'sala', mensagem: `${sala.rows[0].nome} já está ocupada nesse horário.` });
      }
    }
  }

  if (data.atendente_id) {
    const atendente = await client.query<{ ativo: boolean; is_atendente: boolean; nome: string }>(
      'SELECT nome, ativo, is_atendente FROM funcionarios WHERE id = $1 AND deleted_at IS NULL',
      [data.atendente_id]
    );

    if (!atendente.rowCount || !atendente.rows[0].ativo || !atendente.rows[0].is_atendente) {
      conflitos.push({ campo: 'atendente', mensagem: 'Essa atendente não está ativa para receber agenda.' });
    } else {
      const bloqueio = await client.query(
        `
        SELECT motivo FROM atendente_bloqueios
        WHERE funcionario_id = $1
          AND deleted_at IS NULL
          AND data_inicio < $3
          AND data_fim > $2
        LIMIT 1
        `,
        [data.atendente_id, data.inicio_at, data.fim_at]
      );
      if (bloqueio.rowCount) {
        conflitos.push({ campo: 'atendente', mensagem: `Essa atendente está bloqueada: ${bloqueio.rows[0].motivo}.` });
      }

      const ocupacao = await client.query<{ total: string }>(
        `
        SELECT count(*)::text AS total
        FROM agendamentos
        WHERE atendente_id = $1
          AND deleted_at IS NULL
          AND cancelado_em IS NULL
          AND status NOT IN ('cancelado')
          AND inicio_at < $3
          AND fim_at > $2
          AND ($4::uuid IS NULL OR id <> $4)
        `,
        [data.atendente_id, data.inicio_at, data.fim_at, data.ignorar_agendamento_id ?? null]
      );
      if (Number(ocupacao.rows[0].total) > 0) {
        conflitos.push({ campo: 'atendente', mensagem: 'Essa atendente já tem outro atendimento neste horário.' });
      }
    }
  }

  for (const produtoId of data.produto_ids) {
    const produto = await client.query<{ nome: string; status_geral: string }>(
      'SELECT nome, status_geral FROM produtos WHERE id = $1 AND deleted_at IS NULL',
      [produtoId]
    );

    if (!produto.rowCount || produto.rows[0].status_geral !== 'disponivel') {
      conflitos.push({ campo: 'vestido', mensagem: 'Este vestido não está disponível para reserva.' });
      continue;
    }

    const reserva = await client.query(
      `
      SELECT id FROM reservas_estoque
      WHERE produto_id = $1
        AND deleted_at IS NULL
        AND status IN ('ativa', 'convertida')
        AND tstzrange(inicio_at, fim_at, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')
      LIMIT 1
      `,
      [produtoId, data.inicio_at, data.fim_at]
    );
    if (reserva.rowCount) {
      conflitos.push({ campo: 'vestido', mensagem: `${produto.rows[0].nome} não está disponível neste período.` });
    }
  }

  return { disponivel: conflitos.length === 0, conflitos };
}
