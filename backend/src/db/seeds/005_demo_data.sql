DO $$
DECLARE
  admin_id uuid;
  gerente_id uuid;
  atendente_id uuid;
  sala_1_id uuid;
  sala_vip_id uuid;
  cat_id uuid;
  produto_1_id uuid;
  produto_2_id uuid;
  produto_3_id uuid;
  lead_ana_id uuid;
  lead_bruna_id uuid;
  lead_clara_id uuid;
  cliente_livia_id uuid;
  cliente_marina_id uuid;
  locacao_livia_id uuid;
  locacao_marina_id uuid;
  item_id uuid;
  reserva_id uuid;
  conta_id uuid;
  arquivo_id uuid;
BEGIN
  SELECT id INTO admin_id FROM usuarios WHERE email = 'admin@moscownoivas.local';
  SELECT id INTO cat_id FROM categorias_produto WHERE nome = 'Vestidos de noiva' LIMIT 1;
  SELECT id INTO sala_1_id FROM salas_prova WHERE nome = 'Cabine 1' LIMIT 1;
  SELECT id INTO sala_vip_id FROM salas_prova WHERE nome = 'Sala VIP' LIMIT 1;

  INSERT INTO funcionarios (nome, telefone, email, cargo, is_atendente, ativo, capacidade_atendimento, horario_inicio_trabalho, horario_fim_trabalho)
  SELECT 'Marina Souza', '(11) 98888-1001', 'marina@moscownoivas.local', 'Consultora de noivas', true, true, 1, '09:00', '18:00'
  WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'marina@moscownoivas.local')
  RETURNING id INTO atendente_id;
  IF atendente_id IS NULL THEN
    SELECT id INTO atendente_id FROM funcionarios WHERE email = 'marina@moscownoivas.local';
  END IF;

  INSERT INTO funcionarios (nome, telefone, email, cargo, is_atendente, is_financeiro, ativo, capacidade_atendimento, horario_inicio_trabalho, horario_fim_trabalho)
  SELECT 'Carolina Alves', '(11) 97777-1002', 'carolina@moscownoivas.local', 'Gerente', true, true, true, 1, '09:00', '18:00'
  WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'carolina@moscownoivas.local')
  RETURNING id INTO gerente_id;

  INSERT INTO atendente_horarios (funcionario_id, dia_semana, hora_inicio, hora_fim, ativo)
  SELECT atendente_id, d, '09:00', '18:00', true
  FROM generate_series(1, 6) d
  WHERE NOT EXISTS (
    SELECT 1 FROM atendente_horarios WHERE funcionario_id = atendente_id AND dia_semana = d
  );

  INSERT INTO produtos (nome, codigo_interno, categoria_id, marca, modelo, tamanho, cor, valor_locacao, status_geral, descricao)
  VALUES
    ('Vestido Aurora Rendado', 'DEMO-AURORA', cat_id, 'Moscow', 'Princesa', 'M', 'Off-white', 2400.00, 'disponivel', 'Vestido rendado com saia ampla para prova destaque.'),
    ('Vestido Helena Minimalista', 'DEMO-HELENA', cat_id, 'Moscow', 'Minimalista', 'P', 'Branco', 2100.00, 'disponivel', 'Modelo em cetim para noivas clássicas.'),
    ('Vestido Serena Boho', 'DEMO-SERENA', cat_id, 'Moscow', 'Boho', 'G', 'Champagne', 1900.00, 'disponivel', 'Vestido leve para cerimônias ao ar livre.')
  ON CONFLICT (codigo_interno) DO NOTHING;

  SELECT id INTO produto_1_id FROM produtos WHERE codigo_interno = 'DEMO-AURORA';
  SELECT id INTO produto_2_id FROM produtos WHERE codigo_interno = 'DEMO-HELENA';
  SELECT id INTO produto_3_id FROM produtos WHERE codigo_interno = 'DEMO-SERENA';

  INSERT INTO arquivos (entidade_tipo, entidade_id, tipo_arquivo, classificacao_dado, nome_original, storage_path, mime_type, tamanho_bytes, uploaded_by_id, publico, requer_url_assinada)
  SELECT 'produto', produto_1_id, 'foto', 'publico', 'aurora.webp', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80', 'image/webp', 1000, admin_id, true, false
  WHERE NOT EXISTS (SELECT 1 FROM arquivos WHERE storage_path LIKE '%1594552072238%')
  RETURNING id INTO arquivo_id;
  IF arquivo_id IS NOT NULL THEN
    INSERT INTO produto_fotos (produto_id, arquivo_id, is_principal) VALUES (produto_1_id, arquivo_id, true) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO arquivos (entidade_tipo, entidade_id, tipo_arquivo, classificacao_dado, nome_original, storage_path, mime_type, tamanho_bytes, uploaded_by_id, publico, requer_url_assinada)
  SELECT 'produto', produto_2_id, 'foto', 'publico', 'helena.webp', 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80', 'image/webp', 1000, admin_id, true, false
  WHERE NOT EXISTS (SELECT 1 FROM arquivos WHERE storage_path LIKE '%1523438885200%')
  RETURNING id INTO arquivo_id;
  IF arquivo_id IS NOT NULL THEN
    INSERT INTO produto_fotos (produto_id, arquivo_id, is_principal) VALUES (produto_2_id, arquivo_id, true) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO leads (nome, telefone, email, data_evento, interesse, origem, status, responsavel_id, criado_em)
  SELECT 'Ana Paula Martins', '(11) 99910-2020', 'ana.paula@email.com', current_date + 120, 'Vestido princesa com renda', 'instagram', 'novo', admin_id, now() - interval '2 hours'
  WHERE NOT EXISTS (SELECT 1 FROM leads WHERE telefone = '(11) 99910-2020')
  RETURNING id INTO lead_ana_id;
  IF lead_ana_id IS NULL THEN SELECT id INTO lead_ana_id FROM leads WHERE telefone = '(11) 99910-2020'; END IF;

  INSERT INTO leads (nome, telefone, email, data_evento, interesse, origem, status, responsavel_id, criado_em)
  SELECT 'Bruna Ribeiro', '(11) 99920-3030', 'bruna@email.com', current_date + 80, 'Vestido minimalista', 'indicacao', 'prova_marcada', admin_id, now() - interval '1 day'
  WHERE NOT EXISTS (SELECT 1 FROM leads WHERE telefone = '(11) 99920-3030')
  RETURNING id INTO lead_bruna_id;
  IF lead_bruna_id IS NULL THEN SELECT id INTO lead_bruna_id FROM leads WHERE telefone = '(11) 99920-3030'; END IF;

  INSERT INTO leads (nome, telefone, email, data_evento, interesse, origem, status, responsavel_id, criado_em)
  SELECT 'Clara Nogueira', '(11) 99930-4040', 'clara@email.com', current_date + 200, 'Boho para campo', 'site', 'sem_retorno', admin_id, now() - interval '8 days'
  WHERE NOT EXISTS (SELECT 1 FROM leads WHERE telefone = '(11) 99930-4040')
  RETURNING id INTO lead_clara_id;
  IF lead_clara_id IS NULL THEN SELECT id INTO lead_clara_id FROM leads WHERE telefone = '(11) 99930-4040'; END IF;

  INSERT INTO clientes (nome, telefone, email, data_evento, tipo_evento, estilo_notas, cidade, estado)
  SELECT 'Lívia Campos', '(11) 98810-1111', 'livia@email.com', current_date + 45, 'Casamento', 'Clássico, renda delicada', 'São Paulo', 'SP'
  WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE telefone = '(11) 98810-1111')
  RETURNING id INTO cliente_livia_id;
  IF cliente_livia_id IS NULL THEN SELECT id INTO cliente_livia_id FROM clientes WHERE telefone = '(11) 98810-1111'; END IF;

  INSERT INTO clientes (nome, telefone, email, data_evento, tipo_evento, estilo_notas, cidade, estado)
  SELECT 'Marina Lopes', '(11) 98820-2222', 'marina.lopes@email.com', current_date + 18, 'Casamento civil', 'Minimalista em cetim', 'Santo André', 'SP'
  WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE telefone = '(11) 98820-2222')
  RETURNING id INTO cliente_marina_id;
  IF cliente_marina_id IS NULL THEN SELECT id INTO cliente_marina_id FROM clientes WHERE telefone = '(11) 98820-2222'; END IF;

  INSERT INTO tarefas (titulo, tipo, descricao, responsavel_id, prioridade, data_limite, lead_id, status)
  SELECT 'Retornar contato da Clara', 'follow_up', 'Lead sem retorno há alguns dias.', admin_id, 'alta', now() - interval '1 day', lead_clara_id, 'aberta'
  WHERE NOT EXISTS (SELECT 1 FROM tarefas WHERE titulo = 'Retornar contato da Clara');

  INSERT INTO tarefas (titulo, tipo, descricao, responsavel_id, prioridade, data_limite, lead_id, status)
  SELECT 'Enviar opções para Ana Paula', 'whatsapp', 'Separar vestidos princesa para primeira prova.', admin_id, 'normal', now() + interval '4 hours', lead_ana_id, 'aberta'
  WHERE NOT EXISTS (SELECT 1 FROM tarefas WHERE titulo = 'Enviar opções para Ana Paula');

  INSERT INTO agendamentos (lead_id, atendente_id, sala_prova_id, produto_id, data_evento_referencia, inicio_at, fim_at, tipo, status, origem, observacoes)
  SELECT lead_ana_id, atendente_id, sala_1_id, produto_1_id, current_date + 120, current_date + time '10:00', current_date + time '11:30', 'primeiro_atendimento', 'confirmado', 'demo', 'Primeira visita da Ana Paula.'
  WHERE NOT EXISTS (SELECT 1 FROM agendamentos WHERE lead_id = lead_ana_id AND inicio_at::date = current_date);

  INSERT INTO agendamentos (lead_id, atendente_id, sala_prova_id, produto_id, data_evento_referencia, inicio_at, fim_at, tipo, status, origem, observacoes)
  SELECT lead_bruna_id, atendente_id, sala_vip_id, produto_2_id, current_date + 80, current_date + time '15:00', current_date + time '16:00', 'prova', 'confirmado', 'demo', 'Prova do vestido minimalista.'
  WHERE NOT EXISTS (SELECT 1 FROM agendamentos WHERE lead_id = lead_bruna_id AND inicio_at::date = current_date);

  INSERT INTO loja_bloqueios (data_inicio, data_fim, tipo_bloqueio, motivo, afeta_agenda, criado_por_id)
  SELECT current_date + time '12:30', current_date + time '13:30', 'reuniao_interna', 'Alinhamento da equipe', true, admin_id
  WHERE NOT EXISTS (SELECT 1 FROM loja_bloqueios WHERE motivo = 'Alinhamento da equipe' AND data_inicio::date = current_date);

  INSERT INTO vendas_locacoes (cliente_id, status, valor_total, valor_sinal, valor_caucao, quantidade_parcelas, data_evento, data_retirada_prevista, data_devolucao_prevista, snapshot_regras_json, contrato_assinado, contrato_assinado_em, contrato_arquivo_id, observacoes, criado_em)
  SELECT cliente_livia_id, 'fechada', 2400.00, 600.00, 800.00, 3, current_date + 45, current_date + 40, current_date + 47, '{"demo":true}', true, now() - interval '3 days', NULL, 'Locação demo com caução em aberto.', now() - interval '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM vendas_locacoes WHERE cliente_id = cliente_livia_id)
  RETURNING id INTO locacao_livia_id;
  IF locacao_livia_id IS NULL THEN SELECT id INTO locacao_livia_id FROM vendas_locacoes WHERE cliente_id = cliente_livia_id LIMIT 1; END IF;

  INSERT INTO venda_locacao_itens (venda_locacao_id, produto_id, tipo_item, descricao, quantidade, valor_unitario, valor_total, valor_caucao_item)
  SELECT locacao_livia_id, produto_1_id, 'vestido', 'Vestido principal da cerimônia', 1, 2400.00, 2400.00, 800.00
  WHERE NOT EXISTS (SELECT 1 FROM venda_locacao_itens WHERE venda_locacao_id = locacao_livia_id AND produto_id = produto_1_id)
  RETURNING id INTO item_id;

  IF item_id IS NOT NULL THEN
    INSERT INTO reservas_estoque (produto_id, cliente_id, venda_locacao_id, venda_locacao_item_id, data_evento, inicio_at, fim_at, tipo_bloqueio, motivo_bloqueio, status)
    VALUES (produto_1_id, cliente_livia_id, locacao_livia_id, item_id, current_date + 45, current_date + 40 + time '09:00', current_date + 47 + time '18:00', 'locacao', 'Reserva demo de locação.', 'convertida')
    RETURNING id INTO reserva_id;
    UPDATE venda_locacao_itens SET reserva_estoque_id = reserva_id WHERE id = item_id;
  END IF;

  INSERT INTO contas_receber (venda_locacao_id, cliente_id, tipo, parcela_numero, valor_original, valor_pago, valor_saldo, vencimento, status)
  SELECT locacao_livia_id, cliente_livia_id, 'sinal', 0, 600.00, 600.00, 0, current_date - 5, 'paga'
  WHERE NOT EXISTS (SELECT 1 FROM contas_receber WHERE venda_locacao_id = locacao_livia_id AND parcela_numero = 0);

  INSERT INTO contas_receber (venda_locacao_id, cliente_id, tipo, parcela_numero, valor_original, valor_pago, valor_saldo, vencimento, status)
  SELECT locacao_livia_id, cliente_livia_id, 'parcela', 1, 600.00, 250.00, 350.00, current_date - 2, 'parcial'
  WHERE NOT EXISTS (SELECT 1 FROM contas_receber WHERE venda_locacao_id = locacao_livia_id AND parcela_numero = 1)
  RETURNING id INTO conta_id;

  IF conta_id IS NOT NULL THEN
    INSERT INTO pagamentos_recebidos (conta_receber_id, venda_locacao_id, cliente_id, valor_pago, forma_pagamento, registrado_por_id, observacoes)
    VALUES (conta_id, locacao_livia_id, cliente_livia_id, 250.00, 'Pix', admin_id, 'Pagamento parcial demo.');
  END IF;

  INSERT INTO vendas_locacoes (cliente_id, status, valor_total, valor_sinal, valor_caucao, quantidade_parcelas, data_evento, data_retirada_prevista, data_devolucao_prevista, snapshot_regras_json, contrato_assinado, observacoes, criado_em)
  SELECT cliente_marina_id, 'retirada', 2100.00, 700.00, 500.00, 2, current_date + 18, current_date + 3, current_date + 20, '{"demo":true}', true, 'Locação demo pronta para devolução futura.', now() - interval '15 days'
  WHERE NOT EXISTS (SELECT 1 FROM vendas_locacoes WHERE cliente_id = cliente_marina_id)
  RETURNING id INTO locacao_marina_id;
  IF locacao_marina_id IS NULL THEN SELECT id INTO locacao_marina_id FROM vendas_locacoes WHERE cliente_id = cliente_marina_id LIMIT 1; END IF;

  INSERT INTO venda_locacao_itens (venda_locacao_id, produto_id, tipo_item, descricao, quantidade, valor_unitario, valor_total, valor_caucao_item)
  SELECT locacao_marina_id, produto_2_id, 'vestido', 'Vestido civil minimalista', 1, 2100.00, 2100.00, 500.00
  WHERE NOT EXISTS (SELECT 1 FROM venda_locacao_itens WHERE venda_locacao_id = locacao_marina_id AND produto_id = produto_2_id);

  INSERT INTO caucao_movimentos (venda_locacao_id, tipo_movimento, valor, forma_pagamento, responsavel_id, motivo, observacoes)
  SELECT locacao_marina_id, 'recebimento', 500.00, 'Pix', admin_id, 'Caução recebida na retirada', 'Demo'
  WHERE NOT EXISTS (SELECT 1 FROM caucao_movimentos WHERE venda_locacao_id = locacao_marina_id AND tipo_movimento = 'recebimento');

  INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao, criado_em)
  SELECT 'lead', lead_ana_id, admin_id, 'lead_criado', 'Ana Paula cadastrada pelo Atendimento Rápido.', now() - interval '2 hours'
  WHERE NOT EXISTS (SELECT 1 FROM historico_atendimentos WHERE entidade_id = lead_ana_id AND tipo = 'lead_criado');

  INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao, criado_em)
  SELECT 'locacao', locacao_livia_id, admin_id, 'locacao_fechada', 'Locação da Lívia fechada com vestido Aurora.', now() - interval '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM historico_atendimentos WHERE entidade_id = locacao_livia_id AND tipo = 'locacao_fechada');

  INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json, idempotency_key)
  SELECT 'lead_criado', 'lead', lead_ana_id, '{"demo":true}', 'demo:lead_criado:ana'
  WHERE NOT EXISTS (SELECT 1 FROM eventos_outbox WHERE idempotency_key = 'demo:lead_criado:ana');

  INSERT INTO auditoria_logs (usuario_id, acao, entidade_tipo, entidade_id, depois_json, motivo)
  SELECT admin_id, 'demo_preparada', 'sistema', admin_id, '{"status":"ok"}', 'Carga de dados para apresentação'
  WHERE NOT EXISTS (SELECT 1 FROM auditoria_logs WHERE acao = 'demo_preparada');
END $$;
