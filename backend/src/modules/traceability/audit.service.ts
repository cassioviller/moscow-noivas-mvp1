import { pool, type DbClient } from '../../config/db.js';

export async function addAuditLog(
  client: DbClient,
  input: {
    usuarioId?: string | null;
    acao: string;
    entidadeTipo: string;
    entidadeId?: string | null;
    antes?: unknown;
    depois?: unknown;
    motivo?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }
) {
  await client.query(
    `
    INSERT INTO auditoria_logs (
      usuario_id, acao, entidade_tipo, entidade_id, antes_json, depois_json, motivo, ip, user_agent
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [
      input.usuarioId ?? null,
      input.acao,
      input.entidadeTipo,
      input.entidadeId ?? null,
      input.antes === undefined ? null : JSON.stringify(input.antes),
      input.depois === undefined ? null : JSON.stringify(input.depois),
      input.motivo ?? null,
      input.ip ?? null,
      input.userAgent ?? null
    ]
  );
}

export async function listHistory() {
  const result = await pool.query(`
    SELECT h.*, u.nome AS usuario_nome
    FROM historico_atendimentos h
    LEFT JOIN usuarios u ON u.id = h.usuario_id
    ORDER BY h.criado_em DESC
    LIMIT 300
  `);
  return result.rows;
}

export async function listAuditLogs() {
  const result = await pool.query(`
    SELECT a.*, u.nome AS usuario_nome
    FROM auditoria_logs a
    LEFT JOIN usuarios u ON u.id = a.usuario_id
    ORDER BY a.criado_em DESC
    LIMIT 300
  `);
  return result.rows;
}

export async function listGlossary() {
  const result = await pool.query('SELECT * FROM glossario_status WHERE ativo = true ORDER BY entidade_tipo, ordem');
  return result.rows;
}
