INSERT INTO permissoes (modulo, acao, descricao) VALUES
  ('locacao', 'substituir_item', 'Trocar item da locação'),
  ('locacao', 'retirada', 'Confirmar entrega do vestido'),
  ('locacao', 'devolucao', 'Confirmar recebimento do vestido'),
  ('contratos', 'editar', 'Atualizar contrato mínimo'),
  ('caucao', 'listar', 'Ver cauções'),
  ('caucao', 'movimentar', 'Registrar recebimento, devolução ou retenção de caução')
ON CONFLICT (modulo, acao) DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p CROSS JOIN permissoes perm
WHERE p.nome = 'Admin'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('locacao', 'financeiro', 'caucao', 'contratos')
WHERE p.nome IN ('Gerente', 'Financeiro')
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON (perm.modulo = 'locacao' AND perm.acao IN ('listar', 'criar', 'editar', 'retirada', 'devolucao'))
WHERE p.nome IN ('Vendedora', 'Operacional')
ON CONFLICT DO NOTHING;

INSERT INTO motivos_cancelamento_venda (nome) VALUES
  ('Cliente solicitou cancelamento'),
  ('Pagamento não realizado'),
  ('Produto indisponível'),
  ('Evento cancelado')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO regras_cancelamento (nome, dias_antes_evento, percentual_retencao_sinal) VALUES
  ('Cancelamento padrão', 30, 50)
ON CONFLICT DO NOTHING;

INSERT INTO regras_configuraveis (
  modulo_id, chave, nome, descricao, tipo_valor, valor, valor_padrao,
  valor_minimo, valor_maximo, unidade, grupo, sensivel, editavel_pelo_admin
)
SELECT m.id, r.chave, r.nome, r.descricao, r.tipo_valor, r.valor, r.valor_padrao,
  r.valor_minimo, r.valor_maximo, r.unidade, r.grupo, r.sensivel, true
FROM regra_modulos m
JOIN (
  VALUES
    ('vendas', 'locacao_sinal_como_parcela_zero', 'Sinal como parcela 0', 'Gera o sinal como parcela 0.', 'boolean', 'true', 'true', NULL::numeric, NULL::numeric, NULL, 'Locação', false),
    ('vendas', 'locacao_troca_item_recalcula_valor', 'Recalcular valor na troca de item', 'Atualiza valores ao trocar item.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Locação', false),
    ('vendas', 'locacao_troca_item_exige_aprovacao', 'Troca de item exige aprovação', 'Exige permissão gerencial para troca.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Locação', true),
    ('financeiro', 'financeiro_pagamento_parcial_permitido', 'Permitir pagamento parcial', 'Pagamento parcial mantém saldo em aberto.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Pagamento', false),
    ('financeiro', 'financeiro_estorno_exige_aprovacao', 'Estorno exige aprovação', 'Estorno precisa de aprovação gerencial.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Pagamento', true),
    ('caucao_multas', 'caucao_exigir_recebimento_retirada', 'Exigir caução para retirada', 'Bloqueia retirada sem caução recebida.', 'boolean', 'false', 'false', NULL, NULL, NULL, 'Caução', true),
    ('produtos', 'produto_criar_bloqueio_lavanderia_devolucao', 'Bloquear lavanderia após devolução', 'Cria bloqueio técnico para lavanderia após devolução.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Devolução', false)
) AS r(modulo, chave, nome, descricao, tipo_valor, valor, valor_padrao, valor_minimo, valor_maximo, unidade, grupo, sensivel)
ON m.chave = r.modulo
ON CONFLICT (chave) DO NOTHING;
