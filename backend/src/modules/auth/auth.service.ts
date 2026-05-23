import bcrypt from 'bcrypt';
import { pool, withTransaction } from '../../config/db.js';
import { env } from '../../config/env.js';
import { createRefreshToken, hashToken, signAccessToken } from './token.js';

export async function getUserPermissions(usuarioId: string) {
  const result = await pool.query<{ permission: string }>(
    `
    SELECT DISTINCT permissoes.modulo || ':' || permissoes.acao AS permission
    FROM usuario_perfis
    JOIN perfis ON perfis.id = usuario_perfis.perfil_id AND perfis.ativo = true
    JOIN perfil_permissoes ON perfil_permissoes.perfil_id = perfis.id
    JOIN permissoes ON permissoes.id = perfil_permissoes.permissao_id
    WHERE usuario_perfis.usuario_id = $1
    ORDER BY permission
    `,
    [usuarioId]
  );
  return result.rows.map((row) => row.permission);
}

export async function login(input: {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}) {
  return withTransaction(async (client) => {
    const userResult = await client.query<{
      id: string;
      nome: string;
      email: string;
      password_hash: string;
      ativo: boolean;
    }>(
      `SELECT id, nome, email, password_hash, ativo FROM usuarios WHERE email = $1 AND deleted_at IS NULL`,
      [input.email.toLowerCase()]
    );

    const user = userResult.rows[0];
    const passwordOk = user ? await bcrypt.compare(input.password, user.password_hash) : false;
    const success = Boolean(user && user.ativo && passwordOk);
    const failureReason = !user ? 'credenciais_invalidas' : !user.ativo ? 'usuario_inativo' : !passwordOk ? 'credenciais_invalidas' : null;

    await client.query(
      `
      INSERT INTO login_auditoria (usuario_id, email_tentado, sucesso, motivo_falha, ip, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [user?.id ?? null, input.email, success, failureReason, input.ip ?? null, input.userAgent ?? null]
    );

    if (!success || !user) {
      throw new Error('LOGIN_FAILED');
    }

    const permissions = await getUserPermissions(user.id);
    const accessToken = await signAccessToken({ sub: user.id, email: user.email, permissions });
    const refreshToken = createRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await client.query(
      `
      INSERT INTO sessoes_usuario (usuario_id, refresh_token_hash, ip, user_agent, expira_em)
      VALUES ($1, $2, $3, $4, now() + ($5::text || ' days')::interval)
      `,
      [user.id, refreshTokenHash, input.ip ?? null, input.userAgent ?? null, env.REFRESH_TOKEN_EXPIRES_DAYS]
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        permissions
      }
    };
  });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, Math.max(env.BCRYPT_COST, 12));
}
