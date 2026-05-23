export function validateRuleValue(rule: {
  tipo_valor: string;
  valor_minimo: string | null;
  valor_maximo: string | null;
  regex_validacao: string | null;
  opcoes_json: unknown;
  sensivel: boolean;
}, valor: string, motivo?: string) {
  if (rule.sensivel && !motivo?.trim()) {
    throw new Error('RULE_REASON_REQUIRED');
  }

  if (rule.tipo_valor === 'boolean' && !['true', 'false'].includes(valor)) {
    throw new Error('RULE_INVALID_BOOLEAN');
  }

  if (rule.tipo_valor === 'integer' && !/^-?\d+$/.test(valor)) {
    throw new Error('RULE_INVALID_INTEGER');
  }

  if (rule.tipo_valor === 'decimal' && Number.isNaN(Number(valor))) {
    throw new Error('RULE_INVALID_DECIMAL');
  }

  if (['integer', 'decimal'].includes(rule.tipo_valor)) {
    const numericValue = Number(valor);
    if (rule.valor_minimo !== null && numericValue < Number(rule.valor_minimo)) throw new Error('RULE_BELOW_MIN');
    if (rule.valor_maximo !== null && numericValue > Number(rule.valor_maximo)) throw new Error('RULE_ABOVE_MAX');
  }

  if (rule.regex_validacao && !new RegExp(rule.regex_validacao).test(valor)) {
    throw new Error('RULE_REGEX_FAILED');
  }

  if (rule.tipo_valor === 'json') {
    try {
      JSON.parse(valor);
    } catch {
      throw new Error('RULE_INVALID_JSON');
    }
  }
}
