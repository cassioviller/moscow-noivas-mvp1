import { z } from 'zod';
import { pool } from '../../config/db.js';

export const employeeSchema = z.object({
  usuario_id: z.string().uuid().nullable().optional(),
  nome: z.string().min(2),
  telefone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  cargo: z.string().nullable().optional(),
  is_atendente: z.boolean().default(false),
  is_financeiro: z.boolean().default(false),
  is_operacional: z.boolean().default(false),
  ativo: z.boolean().default(true),
  capacidade_atendimento: z.number().int().min(1).default(1),
  horario_inicio_trabalho: z.string().nullable().optional(),
  horario_fim_trabalho: z.string().nullable().optional()
});

export const attendantScheduleSchema = z.object({
  funcionario_id: z.string().uuid(),
  dia_semana: z.number().int().min(0).max(6),
  hora_inicio: z.string(),
  hora_fim: z.string(),
  ativo: z.boolean().default(true)
});

export const attendantBlockSchema = z.object({
  funcionario_id: z.string().uuid(),
  data_inicio: z.string().datetime(),
  data_fim: z.string().datetime(),
  tipo_bloqueio: z.string().min(2),
  motivo: z.string().min(2),
  observacoes: z.string().nullable().optional()
});

export const storeBlockSchema = z.object({
  data_inicio: z.string().datetime(),
  data_fim: z.string().datetime(),
  tipo_bloqueio: z.string().min(2),
  motivo: z.string().min(2),
  afeta_agenda: z.boolean().default(true)
});

export async function listEmployees() {
  const result = await pool.query('SELECT * FROM funcionarios WHERE deleted_at IS NULL ORDER BY nome');
  return result.rows;
}

export async function createEmployee(input: z.infer<typeof employeeSchema>) {
  const data = employeeSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO funcionarios (
      usuario_id, nome, telefone, email, cargo, is_atendente, is_financeiro, is_operacional,
      ativo, capacidade_atendimento, horario_inicio_trabalho, horario_fim_trabalho
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      data.usuario_id ?? null,
      data.nome,
      data.telefone ?? null,
      data.email ?? null,
      data.cargo ?? null,
      data.is_atendente,
      data.is_financeiro,
      data.is_operacional,
      data.ativo,
      data.capacidade_atendimento,
      data.horario_inicio_trabalho ?? null,
      data.horario_fim_trabalho ?? null
    ]
  );
  return result.rows[0];
}

export async function listSchedules() {
  const result = await pool.query(`
    SELECT h.*, f.nome AS funcionario_nome
    FROM atendente_horarios h
    JOIN funcionarios f ON f.id = h.funcionario_id
    ORDER BY f.nome, h.dia_semana, h.hora_inicio
  `);
  return result.rows;
}

export async function createSchedule(input: z.infer<typeof attendantScheduleSchema>) {
  const data = attendantScheduleSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO atendente_horarios (funcionario_id, dia_semana, hora_inicio, hora_fim, ativo)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [data.funcionario_id, data.dia_semana, data.hora_inicio, data.hora_fim, data.ativo]
  );
  return result.rows[0];
}

export async function listAttendantBlocks() {
  const result = await pool.query(`
    SELECT b.*, f.nome AS funcionario_nome
    FROM atendente_bloqueios b
    JOIN funcionarios f ON f.id = b.funcionario_id
    WHERE b.deleted_at IS NULL
    ORDER BY b.data_inicio DESC
  `);
  return result.rows;
}

export async function createAttendantBlock(input: z.infer<typeof attendantBlockSchema>, usuarioId: string) {
  const data = attendantBlockSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO atendente_bloqueios (funcionario_id, data_inicio, data_fim, tipo_bloqueio, motivo, criado_por_id, observacoes)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [data.funcionario_id, data.data_inicio, data.data_fim, data.tipo_bloqueio, data.motivo, usuarioId, data.observacoes ?? null]
  );
  return result.rows[0];
}

export async function listStoreBlocks() {
  const result = await pool.query(`
    SELECT * FROM loja_bloqueios
    WHERE deleted_at IS NULL
    ORDER BY data_inicio DESC
  `);
  return result.rows;
}

export async function createStoreBlock(input: z.infer<typeof storeBlockSchema>, usuarioId: string) {
  const data = storeBlockSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO loja_bloqueios (data_inicio, data_fim, tipo_bloqueio, motivo, afeta_agenda, criado_por_id)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [data.data_inicio, data.data_fim, data.tipo_bloqueio, data.motivo, data.afeta_agenda, usuarioId]
  );
  return result.rows[0];
}
