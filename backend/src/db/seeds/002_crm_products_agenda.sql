INSERT INTO permissoes (modulo, acao, descricao) VALUES
  ('clientes', 'listar', 'Ver clientes'),
  ('clientes', 'criar', 'Criar clientes'),
  ('clientes', 'editar', 'Editar clientes'),
  ('tarefas', 'listar', 'Ver tarefas'),
  ('tarefas', 'criar', 'Criar tarefas'),
  ('tarefas', 'editar', 'Editar tarefas'),
  ('produtos', 'listar', 'Ver vestidos'),
  ('produtos', 'criar', 'Cadastrar vestidos'),
  ('produtos', 'editar', 'Editar vestidos'),
  ('arquivos', 'criar', 'Cadastrar arquivos'),
  ('arquivos', 'baixar', 'Baixar arquivos permitidos'),
  ('salas', 'listar', 'Ver cabines'),
  ('salas', 'criar', 'Cadastrar cabines'),
  ('salas', 'editar', 'Editar cabines'),
  ('disponibilidade', 'validar', 'Validar disponibilidade de agenda e vestido'),
  ('reservas', 'criar', 'Criar reservas de estoque'),
  ('reservas', 'listar', 'Ver reservas de estoque'),
  ('reservas', 'cancelar', 'Cancelar reservas de estoque')
ON CONFLICT (modulo, acao) DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p CROSS JOIN permissoes perm
WHERE p.nome = 'Admin'
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('leads', 'clientes', 'tarefas', 'agenda', 'produtos', 'salas', 'disponibilidade', 'reservas')
WHERE p.nome IN ('Gerente', 'Vendedora')
ON CONFLICT DO NOTHING;

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, perm.id FROM perfis p JOIN permissoes perm
  ON perm.modulo IN ('agenda', 'produtos', 'salas', 'disponibilidade', 'reservas')
WHERE p.nome = 'Operacional'
ON CONFLICT DO NOTHING;

INSERT INTO motivos_perda (nome) VALUES
  ('Sem retorno'),
  ('Escolheu outra loja'),
  ('Preço fora do esperado'),
  ('Data indisponível'),
  ('Cancelou o evento')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO motivos_cancelamento_agenda (nome) VALUES
  ('Cliente solicitou'),
  ('Atendente indisponível'),
  ('Loja fechada'),
  ('Conflito de horário'),
  ('Outro motivo')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categorias_produto (nome, descricao) VALUES
  ('Vestidos de noiva', 'Vestidos principais para locação'),
  ('Acessórios', 'Véus, tiaras e acessórios'),
  ('Vestidos de festa', 'Vestidos para eventos')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO salas_prova (nome, tipo, capacidade, ativo) VALUES
  ('Cabine 1', 'cabine', 1, true),
  ('Cabine 2', 'cabine', 1, true),
  ('Sala VIP', 'sala', 2, true)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO produtos (nome, codigo_interno, categoria_id, tamanho, cor, valor_locacao, status_geral)
SELECT 'Vestido Rendado Clássico', 'VR-102', c.id, 'M', 'Off-white', 1800.00, 'disponivel'
FROM categorias_produto c
WHERE c.nome = 'Vestidos de noiva'
ON CONFLICT (codigo_interno) DO NOTHING;

INSERT INTO produtos (nome, codigo_interno, categoria_id, tamanho, cor, valor_locacao, status_geral)
SELECT 'Vestido Minimalista Cetim', 'VC-210', c.id, 'P', 'Branco', 2200.00, 'disponivel'
FROM categorias_produto c
WHERE c.nome = 'Vestidos de noiva'
ON CONFLICT (codigo_interno) DO NOTHING;

INSERT INTO regras_configuraveis (
  modulo_id, chave, nome, descricao, tipo_valor, valor, valor_padrao,
  valor_minimo, valor_maximo, unidade, grupo, sensivel, editavel_pelo_admin
)
SELECT m.id, r.chave, r.nome, r.descricao, r.tipo_valor, r.valor, r.valor_padrao,
  r.valor_minimo, r.valor_maximo, r.unidade, r.grupo, r.sensivel, true
FROM regra_modulos m
JOIN (
  VALUES
    ('crm', 'crm_criar_tarefa_automatica_lead', 'Criar tarefa para nova noiva', 'Cria follow-up automaticamente no atendimento rápido.', 'boolean', 'true', 'true', NULL::numeric, NULL::numeric, NULL, 'Atendimento', false),
    ('crm', 'crm_lead_convertido_sai_funil', 'Noiva convertida sai do funil', 'Remove a noiva convertida do kanban ativo.', 'boolean', 'true', 'true', NULL, NULL, NULL, 'Atendimento', false),
    ('produtos', 'produto_status_permitidos_reserva', 'Status que permite reserva', 'Status de vestido que pode entrar em prova/reserva.', 'json', '["disponivel"]', '["disponivel"]', NULL, NULL, NULL, 'Vestidos', false)
) AS r(modulo, chave, nome, descricao, tipo_valor, valor, valor_padrao, valor_minimo, valor_maximo, unidade, grupo, sensivel)
ON m.chave = r.modulo
ON CONFLICT (chave) DO NOTHING;
