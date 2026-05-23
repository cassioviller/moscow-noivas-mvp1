import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';
import { hashPassword } from '../auth/auth.service.js';
import { addAuditLog } from '../traceability/audit.service.js';

export const userCreateSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  ativo: z.boolean().default(true),
  funcionario_id: z.string().uuid().nullable().optional(),
  perfil_ids: z.array(z.string().uuid()).default([])
});

export const userUpdateSchema = userCreateSchema.omit({ password: true }).partial().extend({
  password: z.string().min(8).optional()
});

export async function listUsers() {
  const result = await pool.query(`
    SELECT
      u.id, u.nome, u.email, u.ativo, u.funcionario_id, u.criado_em, u.atualizado_em,
      COALESCE(json_agg(json_build_object('id', p.id, 'nome', p.nome)) FILTER (WHERE p.id IS NOT NULL), '[]') AS perfis
    FROM usuarios u
    LEFT JOIN usuario_perfis up ON up.usuario_id = u.id
    LEFT JOIN perfis p ON p.id = up.perfil_id
    WHERE u.deleted_at IS NULL
    GROUP BY u.id
    ORDER BY u.nome
  `);
  return result.rows;
}

export async function createUser(input: z.infer<typeof userCreateSchema>) {
  const data = userCreateSchema.parse(input);
  return withTransaction(async (client) => {
    const passwordHash = await hashPassword(data.password);
    const user = await client.query<{ id: string }>(
      `
      INSERT INTO usuarios (nome, email, password_hash, ativo, funcionario_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [data.nome, data.email.toLowerCase(), passwordHash, data.ativo, data.funcionario_id ?? null]
    );

    for (const perfilId of data.perfil_ids) {
      await client.query('INSERT INTO usuario_perfis (usuario_id, perfil_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
        user.rows[0].id,
        perfilId
      ]);
    }

    return user.rows[0];
  });
}

export async function updateUser(id: string, input: z.infer<typeof userUpdateSchema>) {
  const data = userUpdateSchema.parse(input);
  return withTransaction(async (client) => {
    const passwordHash = data.password ? await hashPassword(data.password) : undefined;
    await client.query(
      `
      UPDATE usuarios
      SET
        nome = COALESCE($2, nome),
        email = COALESCE($3, email),
        ativo = COALESCE($4, ativo),
        funcionario_id = COALESCE($5, funcionario_id),
        password_hash = COALESCE($6, password_hash),
        atualizado_em = now()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id, data.nome, data.email?.toLowerCase(), data.ativo, data.funcionario_id, passwordHash]
    );

    if (data.perfil_ids) {
      await client.query('DELETE FROM usuario_perfis WHERE usuario_id = $1', [id]);
      for (const perfilId of data.perfil_ids) {
        await client.query('INSERT INTO usuario_perfis (usuario_id, perfil_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
          id,
          perfilId
        ]);
      }
    }

    return { id };
  });
}

export async function listProfilesAndPermissions() {
  const [profiles, permissions] = await Promise.all([
    pool.query(`
      SELECT p.*, COALESCE(json_agg(pp.permissao_id) FILTER (WHERE pp.permissao_id IS NOT NULL), '[]') AS permissao_ids
      FROM perfis p
      LEFT JOIN perfil_permissoes pp ON pp.perfil_id = p.id
      GROUP BY p.id
      ORDER BY p.nome
    `),
    pool.query('SELECT * FROM permissoes ORDER BY modulo, acao')
  ]);
  return { profiles: profiles.rows, permissions: permissions.rows };
}

export async function setProfilePermissions(perfilId: string, permissaoIds: string[], usuarioId?: string) {
  return withTransaction(async (client) => {
    const before = await client.query('SELECT permissao_id FROM perfil_permissoes WHERE perfil_id = $1 ORDER BY permissao_id', [perfilId]);
    await client.query('DELETE FROM perfil_permissoes WHERE perfil_id = $1', [perfilId]);
    for (const permissaoId of permissaoIds) {
      await client.query('INSERT INTO perfil_permissoes (perfil_id, permissao_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
        perfilId,
        permissaoId
      ]);
    }
    await addAuditLog(client, {
      usuarioId,
      acao: 'alteracao_permissoes',
      entidadeTipo: 'perfil',
      entidadeId: perfilId,
      antes: before.rows,
      depois: permissaoIds
    });
    return { perfilId, permissaoIds };
  });
}
