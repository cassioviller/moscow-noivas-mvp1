CREATE TABLE motivos_cancelamento_venda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE regras_cancelamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  dias_antes_evento integer NOT NULL DEFAULT 0,
  percentual_retencao_sinal numeric(5,2) NOT NULL DEFAULT 0 CHECK (percentual_retencao_sinal >= 0),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vendas_locacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id),
  tipo text NOT NULL DEFAULT 'locacao',
  status text NOT NULL DEFAULT 'rascunho',
  valor_total numeric(12,2) NOT NULL DEFAULT 0,
  valor_sinal numeric(12,2) NOT NULL DEFAULT 0,
  valor_caucao numeric(12,2) NOT NULL DEFAULT 0,
  valor_multa numeric(12,2) NOT NULL DEFAULT 0,
  quantidade_parcelas integer NOT NULL DEFAULT 1 CHECK (quantidade_parcelas >= 0),
  data_evento date NOT NULL,
  data_retirada_prevista date,
  data_devolucao_prevista date,
  data_retirada_real timestamptz,
  data_devolucao_real timestamptz,
  snapshot_regras_json jsonb NOT NULL DEFAULT '{}',
  contrato_manual_obrigatorio boolean NOT NULL DEFAULT true,
  contrato_assinado boolean NOT NULL DEFAULT false,
  contrato_assinado_em timestamptz,
  contrato_arquivo_id uuid REFERENCES arquivos(id),
  aceite_contrato_em timestamptz,
  aceite_contrato_arquivo_id uuid REFERENCES arquivos(id),
  motivo_cancelamento_id uuid REFERENCES motivos_cancelamento_venda(id),
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  lock_version integer NOT NULL DEFAULT 0,
  CONSTRAINT chk_valores_locacao_nao_negativos CHECK (
    valor_total >= 0 AND valor_sinal >= 0 AND valor_caucao >= 0 AND valor_multa >= 0
  )
);

CREATE TABLE venda_locacao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES produtos(id),
  reserva_estoque_id uuid REFERENCES reservas_estoque(id),
  tipo_item text NOT NULL CHECK (tipo_item IN ('vestido', 'veu', 'acessorio', 'servico', 'ajuste', 'outro')),
  descricao text,
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  valor_unitario numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_unitario >= 0),
  valor_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  valor_caucao_item numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_caucao_item >= 0),
  status text NOT NULL DEFAULT 'ativo',
  substituido_por_item_id uuid REFERENCES venda_locacao_itens(id),
  motivo_substituicao text,
  substituido_em timestamptz,
  substituido_por_usuario_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  lock_version integer NOT NULL DEFAULT 0
);

ALTER TABLE reservas_estoque
  ADD CONSTRAINT reservas_estoque_venda_locacao_fk
  FOREIGN KEY (venda_locacao_id) REFERENCES vendas_locacoes(id);

ALTER TABLE reservas_estoque
  ADD CONSTRAINT reservas_estoque_venda_locacao_item_fk
  FOREIGN KEY (venda_locacao_item_id) REFERENCES venda_locacao_itens(id);

CREATE TABLE contas_receber (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES clientes(id),
  tipo text NOT NULL DEFAULT 'parcela',
  parcela_numero integer NOT NULL DEFAULT 1,
  valor_original numeric(12,2) NOT NULL DEFAULT 0,
  valor_pago numeric(12,2) NOT NULL DEFAULT 0,
  valor_saldo numeric(12,2) NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'aberta',
  forma_pagamento_prevista text,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  CONSTRAINT chk_contas_receber_valores CHECK (
    valor_original >= 0 AND valor_pago >= 0 AND valor_saldo >= 0
  )
);

CREATE TABLE pagamentos_recebidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_receber_id uuid NOT NULL REFERENCES contas_receber(id),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id),
  cliente_id uuid NOT NULL REFERENCES clientes(id),
  valor_pago numeric(12,2) NOT NULL CHECK (valor_pago > 0),
  data_pagamento timestamptz NOT NULL DEFAULT now(),
  forma_pagamento text NOT NULL,
  comprovante_arquivo_id uuid REFERENCES arquivos(id),
  observacoes text,
  registrado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE estornos_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagamento_id uuid NOT NULL REFERENCES pagamentos_recebidos(id),
  valor_estornado numeric(12,2) NOT NULL CHECK (valor_estornado > 0),
  motivo text NOT NULL,
  aprovado_por_id uuid REFERENCES usuarios(id),
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE avarias_multas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id),
  tipo text NOT NULL,
  gravidade text,
  descricao text NOT NULL,
  valor_sugerido numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_sugerido >= 0),
  valor_final numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_final >= 0),
  status text NOT NULL DEFAULT 'aberta',
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE caucao_movimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id) ON DELETE CASCADE,
  tipo_movimento text NOT NULL CHECK (tipo_movimento IN ('recebimento', 'devolucao', 'retencao', 'ajuste')),
  valor numeric(12,2) NOT NULL CHECK (valor > 0),
  forma_pagamento text,
  chave_pix_devolucao text,
  data_movimento timestamptz NOT NULL DEFAULT now(),
  responsavel_id uuid REFERENCES usuarios(id),
  motivo text,
  avaria_multa_id uuid REFERENCES avarias_multas(id),
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE financeiro_movimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origem_tipo text NOT NULL,
  origem_id uuid NOT NULL,
  cliente_id uuid REFERENCES clientes(id),
  venda_locacao_id uuid REFERENCES vendas_locacoes(id),
  tipo text NOT NULL,
  natureza text NOT NULL,
  valor numeric(12,2) NOT NULL CHECK (valor >= 0),
  data_movimento timestamptz NOT NULL DEFAULT now(),
  forma_pagamento text,
  status text NOT NULL DEFAULT 'realizado',
  observacoes text,
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE checklists_retirada_devolucao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_locacao_id uuid NOT NULL REFERENCES vendas_locacoes(id),
  tipo text NOT NULL CHECK (tipo IN ('retirada', 'devolucao')),
  status text NOT NULL DEFAULT 'rascunho',
  itens_json jsonb NOT NULL DEFAULT '{}',
  observacoes text,
  atraso_dias integer NOT NULL DEFAULT 0 CHECK (atraso_dias >= 0),
  precisa_lavanderia boolean NOT NULL DEFAULT false,
  possui_problema boolean NOT NULL DEFAULT false,
  confirmado_por_id uuid REFERENCES usuarios(id),
  confirmado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendas_locacoes_cliente ON vendas_locacoes (cliente_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_locacao_itens_locacao ON venda_locacao_itens (venda_locacao_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contas_receber_status ON contas_receber (status, vencimento) WHERE deleted_at IS NULL;
CREATE INDEX idx_pagamentos_conta ON pagamentos_recebidos (conta_receber_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_caucao_locacao ON caucao_movimentos (venda_locacao_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_financeiro_movimentos_locacao ON financeiro_movimentos (venda_locacao_id, data_movimento) WHERE deleted_at IS NULL;
