INSERT INTO configuracoes_sistema (timezone_padrao, formato_data, formato_moeda)
SELECT 'America/Sao_Paulo', 'dd/MM/yyyy', 'BRL'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_sistema);

INSERT INTO perfis (nome, descricao) VALUES
  ('Admin', 'Acesso total ao sistema'),
  ('Gerente', 'Gestão operacional e regras da loja'),
  ('Vendedora', 'Atendimento, leads e agenda'),
  ('Financeiro', 'Dinheiro a receber, pagamentos e caução'),
  ('Operacional', 'Retirada, devolução e apoio de loja')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO permissoes (modulo, acao, descricao) VALUES
  ('leads', 'criar', 'Criar novas noivas/interessadas'),
  ('leads', 'listar', 'Listar noivas/interessadas'),
  ('leads', 'editar', 'Editar dados de atendimento'),
  ('agenda', 'criar', 'Marcar prova ou atendimento'),
  ('agenda', 'listar', 'Ver agenda'),
  ('agenda', 'editar', 'Remarcar ou editar atendimento'),
  ('agenda', 'bloquear', 'Criar bloqueios de agenda'),
  ('locacao', 'criar', 'Criar locação'),
  ('locacao', 'listar', 'Ver locações'),
  ('locacao', 'editar', 'Editar locação'),
  ('financeiro', 'listar', 'Ver dinheiro a receber'),
  ('financeiro', 'registrar_pagamento', 'Registrar pagamento'),
  ('financeiro', 'estornar', 'Estornar pagamento'),
  ('regras', 'listar', 'Ver regras da loja'),
  ('regras', 'editar', 'Alterar regras da loja'),
  ('auditoria', 'listar', 'Ver histórico e auditoria'),
  ('usuarios', 'listar', 'Ver usuários'),
  ('usuarios', 'criar', 'Criar usuários'),
  ('usuarios', 'editar', 'Editar usuários'),
  ('usuarios', 'permissoes', 'Gerenciar perfis e permissões'),
  ('atendentes', 'listar', 'Ver funcionários e atendentes'),
  ('atendentes', 'editar', 'Editar funcionários e bloqueios')
ON CONFLICT (modulo, acao) DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p CROSS JOIN permissoes perm
WHERE p.nome = 'Admin'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('leads', 'agenda', 'locacao', 'financeiro', 'regras', 'auditoria', 'usuarios', 'atendentes')
WHERE p.nome = 'Gerente'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON (perm.modulo = 'leads' AND perm.acao IN ('criar', 'listar', 'editar'))
  OR (perm.modulo = 'agenda' AND perm.acao IN ('criar', 'listar', 'editar'))
  OR (perm.modulo = 'locacao' AND perm.acao IN ('listar'))
WHERE p.nome = 'Vendedora'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo = 'financeiro' OR (perm.modulo = 'locacao' AND perm.acao = 'listar')
WHERE p.nome = 'Financeiro'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('agenda', 'atendentes') OR (perm.modulo = 'locacao' AND perm.acao IN ('listar', 'editar'))
WHERE p.nome = 'Operacional'
ON CONFLICT DO NOTHING;

INSERT INTO regra_modulos (chave, nome, descricao, ordem) VALUES
  ('agenda', 'Agenda', 'Regras de atendimentos, provas e horários', 1),
  ('atendentes', 'Atendentes', 'Regras de capacidade e disponibilidade de atendentes', 2),
  ('loja', 'Loja', 'Bloqueios e funcionamento da loja', 3),
  ('salas', 'Cabines', 'Regras de salas e cabines de prova', 4),
  ('crm', 'Atendimento', 'Regras do funil de novas noivas', 5),
  ('clientes', 'Clientes', 'Regras de cadastro de clientes', 6),
  ('produtos', 'Vestidos', 'Regras de vestidos e itens', 7),
  ('estoque', 'Estoque', 'Regras de bloqueio e disponibilidade', 8),
  ('vendas', 'Vendas/Locações', 'Regras de locação', 9),
  ('financeiro', 'Financeiro', 'Regras financeiras', 10),
  ('caucao_multas', 'Caução e multas', 'Regras de caução, avarias e multas', 11),
  ('contratos', 'Contratos', 'Regras de contrato mínimo/manual', 12),
  ('lgpd', 'LGPD', 'Regras de privacidade e retenção', 13),
  ('seguranca', 'Segurança', 'Regras de autenticação e acesso', 14),
  ('arquivos', 'Arquivos', 'Regras de upload e links assinados', 15),
  ('permissoes', 'Permissões', 'Regras de perfis e acessos', 16)
ON CONFLICT (chave) DO NOTHING;

INSERT INTO regras_configuraveis (
  modulo_id, chave, nome, descricao, tipo_valor, valor, valor_padrao,
  valor_minimo, valor_maximo, unidade, grupo, sensivel, editavel_pelo_admin
)
SELECT m.id, r.chave, r.nome, r.descricao, r.tipo_valor, r.valor, r.valor_padrao,
  r.valor_minimo, r.valor_maximo, r.unidade, r.grupo, r.sensivel, true
FROM regra_modulos m
JOIN (
  VALUES
    ('agenda', 'agenda_buffer_padrao_minutos', 'Buffer entre atendimentos', 'Tempo mínimo entre atendimentos.', 'integer', '15', '15', 0::numeric, 120::numeric, 'minutos', 'Agenda', false),
    ('agenda', 'agenda_duracao_primeiro_atendimento_minutos', 'Duração do primeiro atendimento', 'Duração padrão para primeira conversa/prova.', 'integer', '90', '90', 15, 240, 'minutos', 'Agenda', false),
    ('agenda', 'agenda_duracao_prova_especifica_minutos', 'Duração de prova específica', 'Duração padrão para prova com vestido definido.', 'integer', '60', '60', 15, 240, 'minutos', 'Agenda', false),
    ('estoque', 'estoque_dias_bloqueio_pre_evento', 'Bloqueio antes do evento', 'Dias antes do evento em que o vestido fica bloqueado.', 'integer', '7', '7', 0, 60, 'dias', 'Estoque', false),
    ('estoque', 'estoque_dias_bloqueio_pos_evento', 'Bloqueio após o evento', 'Dias após o evento para devolução/lavanderia.', 'integer', '3', '3', 0, 60, 'dias', 'Estoque', false),
    ('estoque', 'estoque_duracao_bloqueio_prova_minutos', 'Bloqueio para prova', 'Tempo em que um vestido fica reservado para prova.', 'integer', '120', '120', 15, 480, 'minutos', 'Estoque', false),
    ('financeiro', 'financeiro_bloquear_retirada_inadimplente', 'Bloquear retirada inadimplente', 'Impede retirada quando há parcela vencida.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Retirada', true),
    ('contratos', 'contrato_bloquear_retirada_sem_assinatura', 'Bloquear retirada sem contrato', 'Impede retirada sem contrato assinado.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Contratos', true),
    ('contratos', 'contrato_exigir_upload_mvp1', 'Exigir upload de contrato', 'Exige contrato anexado no MVP 1.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Contratos', true),
    ('arquivos', 'arquivo_url_assinada_expira_minutos', 'Expiração de link privado', 'Tempo de validade da URL assinada.', 'integer', '15', '15', 1, 1440, 'minutos', 'Arquivos', true),
    ('arquivos', 'arquivo_tamanho_max_mb', 'Tamanho máximo de arquivo', 'Tamanho máximo aceito em uploads.', 'integer', '15', '15', 1, 100, 'MB', 'Arquivos', false),
    ('seguranca', 'auth_bcrypt_custo', 'Custo do bcrypt', 'Custo mínimo para hash de senha.', 'integer', '12', '12', 12, 16, NULL, 'Autenticação', true)
) AS r(modulo, chave, nome, descricao, tipo_valor, valor, valor_padrao, valor_minimo, valor_maximo, unidade, grupo, sensivel)
ON m.chave = r.modulo
ON CONFLICT (chave) DO NOTHING;

INSERT INTO usuarios (nome, email, password_hash, ativo)
VALUES (
  'Admin Moscow Noivas',
  'admin@moscownoivas.local',
  crypt('Admin@123456', gen_salt('bf', 12)),
  true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuario_perfis (usuario_id, perfil_id)
SELECT u.id, p.id
FROM usuarios u
JOIN perfis p ON p.nome = 'Admin'
WHERE u.email = 'admin@moscownoivas.local'
ON CONFLICT DO NOTHING;
