import { z } from 'zod';
import { pool } from '../../config/db.js';

export const optionSchema = z.object({
  modulo: z.string().min(2),
  campo: z.string().min(2),
  valor: z.string().min(2),
  rotulo: z.string().min(2),
  ordem: z.number().int().default(0),
  ativo: z.boolean().default(true)
});

export async function listOptions(modulo?: string, campo?: string) {
  const result = await pool.query(
    `
    SELECT *
    FROM cadastro_opcoes
    WHERE deleted_at IS NULL
      AND ($1::text IS NULL OR modulo = $1)
      AND ($2::text IS NULL OR campo = $2)
    ORDER BY modulo, campo, ordem, rotulo
    `,
    [modulo || null, campo || null]
  );
  return result.rows;
}

export async function createOption(input: z.infer<typeof optionSchema>) {
  const data = optionSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO cadastro_opcoes (modulo, campo, valor, rotulo, ordem, ativo)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [data.modulo, data.campo, data.valor, data.rotulo, data.ordem, data.ativo]
  );
  return result.rows[0];
}

export async function updateOption(id: string, input: z.infer<typeof optionSchema>) {
  const data = optionSchema.parse(input);
  const result = await pool.query(
    `
    UPDATE cadastro_opcoes
    SET modulo = $2, campo = $3, valor = $4, rotulo = $5, ordem = $6, ativo = $7, atualizado_em = now()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
    `,
    [id, data.modulo, data.campo, data.valor, data.rotulo, data.ordem, data.ativo]
  );
  if (!result.rowCount) throw new Error('Opcao nao encontrada.');
  return result.rows[0];
}

export async function deleteOption(id: string) {
  const result = await pool.query(
    'UPDATE cadastro_opcoes SET deleted_at = now(), atualizado_em = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  if (!result.rowCount) throw new Error('Opcao nao encontrada.');
  return { id };
}
