import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';
import { addAuditLog } from '../traceability/audit.service.js';
import { validateRuleValue } from './rules.validation.js';

export const ruleUpdateSchema = z.object({
  valor: z.string().min(1),
  motivo: z.string().optional()
});

export async function listRuleModules() {
  const result = await pool.query(`
    SELECT
      m.id, m.chave, m.nome, m.descricao,
      COALESCE(json_agg(r ORDER BY r.grupo, r.nome) FILTER (WHERE r.id IS NOT NULL), '[]') AS regras
    FROM regra_modulos m
    LEFT JOIN regras_configuraveis r ON r.modulo_id = m.id
    WHERE m.ativo = true
    GROUP BY m.id
    ORDER BY m.ordem, m.nome
  `);
  return result.rows;
}

export async function updateRule(id: string, input: z.infer<typeof ruleUpdateSchema>, usuarioId: string) {
  const data = ruleUpdateSchema.parse(input);

  return withTransaction(async (client) => {
    const currentResult = await client.query<{
      id: string;
      valor: string;
      tipo_valor: string;
      valor_minimo: string | null;
      valor_maximo: string | null;
      regex_validacao: string | null;
      opcoes_json: unknown;
      sensivel: boolean;
      editavel_pelo_admin: boolean;
    }>('SELECT * FROM regras_configuraveis WHERE id = $1 FOR UPDATE', [id]);

    const current = currentResult.rows[0];
    if (!current) throw new Error('RULE_NOT_FOUND');
    if (!current.editavel_pelo_admin) throw new Error('RULE_NOT_EDITABLE');

    validateRuleValue(current, data.valor, data.motivo);

    await client.query(
      `
      UPDATE regras_configuraveis
      SET valor = $2, atualizado_em = now()
      WHERE id = $1
      `,
      [id, data.valor]
    );

    await client.query(
      `
      INSERT INTO regras_configuraveis_historico (regra_id, valor_anterior, valor_novo, alterado_por_id, motivo)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [id, current.valor, data.valor, usuarioId, data.motivo ?? null]
    );

    await addAuditLog(client, {
      usuarioId,
      acao: 'alteracao_regra',
      entidadeTipo: 'regra_configuravel',
      entidadeId: id,
      antes: { valor: current.valor },
      depois: { valor: data.valor },
      motivo: data.motivo ?? null
    });

    return { id, valor: data.valor };
  });
}

export async function getRuleHistory(id: string) {
  const result = await pool.query(
    `
    SELECT h.*, u.nome AS alterado_por_nome
    FROM regras_configuraveis_historico h
    LEFT JOIN usuarios u ON u.id = h.alterado_por_id
    WHERE h.regra_id = $1
    ORDER BY h.criado_em DESC
    `,
    [id]
  );
  return result.rows;
}
