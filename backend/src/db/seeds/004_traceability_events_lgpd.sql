INSERT INTO permissoes (modulo, acao, descricao) VALUES
  ('dashboard', 'listar', 'Ver dashboard'),
  ('historico', 'listar', 'Ver histórico'),
  ('auditoria', 'exportar', 'Exportar auditoria'),
  ('lgpd', 'listar', 'Ver solicitações e consentimentos LGPD'),
  ('lgpd', 'editar', 'Gerenciar LGPD'),
  ('eventos', 'listar', 'Ver eventos outbox'),
  ('eventos', 'processar', 'Processar eventos outbox')
ON CONFLICT (modulo, acao) DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p CROSS JOIN permissoes perm
WHERE p.nome = 'Admin'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('dashboard', 'historico', 'auditoria', 'lgpd', 'eventos')
WHERE p.nome = 'Gerente'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('dashboard', 'historico')
WHERE p.nome IN ('Vendedora', 'Financeiro', 'Operacional')
ON CONFLICT DO NOTHING;

INSERT INTO glossario_status (entidade_tipo, status_tecnico, nome_exibicao, descricao_para_equipe, cor, ordem) VALUES
  ('lead', 'novo', 'Novo', 'Nova noiva cadastrada.', 'azul', 1),
  ('lead', 'em_contato', 'Em contato', 'Equipe iniciou contato.', 'lilas', 2),
  ('lead', 'prova_marcada', 'Prova marcada', 'Noiva tem prova agendada.', 'verde', 3),
  ('lead', 'convertido', 'Cliente', 'Noiva convertida em cliente.', 'verde', 4),
  ('lead', 'perdido', 'Perdida', 'Atendimento encerrado sem locação.', 'cinza', 5),
  ('agendamento', 'confirmado', 'Confirmado', 'Atendimento confirmado.', 'verde', 1),
  ('agendamento', 'cancelado', 'Cancelado', 'Atendimento cancelado.', 'vermelho', 9),
  ('locacao', 'rascunho', 'Rascunho', 'Locação ainda não fechada.', 'cinza', 1),
  ('locacao', 'fechada', 'Fechada', 'Locação confirmada.', 'verde', 2),
  ('locacao', 'retirada', 'Vestido entregue', 'Vestido saiu da loja.', 'azul', 3),
  ('locacao', 'devolvida', 'Devolvida', 'Vestido retornou para a loja.', 'verde', 4),
  ('financeiro', 'aberta', 'Em aberto', 'Pagamento pendente.', 'amarelo', 1),
  ('financeiro', 'parcial', 'Parcial', 'Parte do valor foi paga.', 'azul', 2),
  ('financeiro', 'paga', 'Paga', 'Pagamento quitado.', 'verde', 3)
ON CONFLICT (entidade_tipo, status_tecnico) DO NOTHING;

INSERT INTO politicas_retencao_dados (entidade_tipo, finalidade, prazo_retencao_dias, acao_pos_prazo) VALUES
  ('lead', 'atendimento_comercial', 730, 'anonimizar'),
  ('cliente', 'execucao_contrato', 1825, 'revisar'),
  ('contrato', 'obrigacao_legal', 1825, 'manter'),
  ('financeiro', 'obrigacao_legal', 1825, 'manter'),
  ('arquivo', 'documentacao_operacional', 1825, 'revisar'),
  ('auditoria', 'seguranca_e_rastreabilidade', 3650, 'manter')
ON CONFLICT (entidade_tipo, finalidade) DO NOTHING;

INSERT INTO regras_configuraveis (
  modulo_id, chave, nome, descricao, tipo_valor, valor, valor_padrao,
  valor_minimo, valor_maximo, unidade, grupo, sensivel, editavel_pelo_admin
)
SELECT m.id, r.chave, r.nome, r.descricao, r.tipo_valor, r.valor, r.valor_padrao,
  r.valor_minimo, r.valor_maximo, r.unidade, r.grupo, r.sensivel, true
FROM regra_modulos m
JOIN (
  VALUES
    ('lgpd', 'lgpd_bloquear_marketing_sem_consentimento', 'Bloquear marketing sem consentimento', 'Impede automação futura de marketing sem consentimento ativo.', 'boolean', 'true', 'true', NULL::numeric, NULL::numeric, NULL, 'LGPD', true),
    ('lgpd', 'lgpd_bloquear_uso_imagem_sem_consentimento', 'Bloquear uso de imagem sem consentimento', 'Impede uso comercial de fotos sem consentimento.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'LGPD', true),
    ('seguranca', 'auditoria_log_download_sensivel', 'Auditar download sensível', 'Registra auditoria em downloads sensíveis.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Arquivos', true)
) AS r(modulo, chave, nome, descricao, tipo_valor, valor, valor_padrao, valor_minimo, valor_maximo, unidade, grupo, sensivel)
ON m.chave = r.modulo
ON CONFLICT (chave) DO NOTHING;
