import { describe, expect, it } from 'vitest';
import { validateRuleValue } from '../src/modules/rules/rules.validation.js';

const integerRule = {
  tipo_valor: 'integer',
  valor_minimo: '12',
  valor_maximo: '16',
  regex_validacao: null,
  opcoes_json: null,
  sensivel: false
};

describe('validateRuleValue', () => {
  it('accepts valid integer inside min/max', () => {
    expect(() => validateRuleValue(integerRule, '12')).not.toThrow();
  });

  it('rejects bcrypt cost below minimum', () => {
    expect(() => validateRuleValue(integerRule, '10')).toThrow('RULE_BELOW_MIN');
  });

  it('requires reason for sensitive rules', () => {
    expect(() => validateRuleValue({ ...integerRule, sensivel: true }, '12')).toThrow('RULE_REASON_REQUIRED');
  });
});
