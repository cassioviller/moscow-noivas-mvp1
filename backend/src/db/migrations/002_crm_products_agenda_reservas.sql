CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE motivos_perda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  data_evento date,
  interesse text,
  origem text NOT NULL DEFAULT 'cadastro_rapido',
  status text NOT NULL DEFAULT 'novo',
  responsavel_id uuid REFERENCES usuarios(id),
  motivo_perda_id uuid REFERENCES motivos_perda(id),
  motivo_perda_observacao text,
  convertido_cliente_id uuid,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  nome text NOT NULL,
  cpf text,
  rg text,
  data_nascimento date,
  telefone text NOT NULL,
  email text,
  endereco text,
  cidade text,
  estado text,
  data_evento date,
  tipo_evento text,
  estilo_notas text,
  chave_pix_caucao text,
  representante_legal text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

ALTER TABLE leads
  ADD CONSTRAINT leads_convertido_cliente_fk
  FOREIGN KEY (convertido_cliente_id) REFERENCES clientes(id);

CREATE TABLE lead_merges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_origem_id uuid NOT NULL REFERENCES leads(id),
  lead_destino_id uuid NOT NULL REFERENCES leads(id),
  campos_mesclados_json jsonb NOT NULL DEFAULT '{}',
  justificativa text NOT NULL,
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'follow_up',
  descricao text,
  responsavel_id uuid REFERENCES usuarios(id),
  prioridade text NOT NULL DEFAULT 'normal',
  data_limite timestamptz,
  lead_id uuid REFERENCES leads(id),
  cliente_id uuid REFERENCES clientes(id),
  status text NOT NULL DEFAULT 'aberta',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz,
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE categorias_produto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo_interno text UNIQUE NOT NULL,
  categoria_id uuid REFERENCES categorias_produto(id),
  marca text,
  modelo text,
  tamanho text,
  cor text,
  valor_venda numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_venda >= 0),
  valor_locacao numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_locacao >= 0),
  custo numeric(12,2) NOT NULL DEFAULT 0 CHECK (custo >= 0),
  status_geral text NOT NULL DEFAULT 'disponivel',
  descricao text,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  lock_version integer NOT NULL DEFAULT 0
);

CREATE TABLE arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  entidade_id uuid NOT NULL,
  tipo_arquivo text NOT NULL,
  classificacao_dado text NOT NULL DEFAULT 'interno',
  nome_original text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  tamanho_bytes bigint NOT NULL CHECK (tamanho_bytes >= 0),
  checksum text,
  uploaded_by_id uuid REFERENCES usuarios(id),
  publico boolean NOT NULL DEFAULT false,
  requer_url_assinada boolean NOT NULL DEFAULT true,
  expira_em timestamptz,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  CHECK (nome_original !~* '\.(exe|bat|cmd|sh|msi|ps1|scr)$')
);

CREATE TABLE produto_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  arquivo_id uuid NOT NULL REFERENCES arquivos(id),
  is_principal boolean NOT NULL DEFAULT false,
  ordem integer NOT NULL DEFAULT 0,
  legenda text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX produto_fotos_uma_principal
ON produto_fotos (produto_id)
WHERE is_principal = true;

CREATE TABLE arquivo_acessos_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arquivo_id uuid NOT NULL REFERENCES arquivos(id),
  usuario_id uuid REFERENCES usuarios(id),
  acao text NOT NULL,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE salas_prova (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  tipo text NOT NULL DEFAULT 'cabine',
  capacidade integer NOT NULL DEFAULT 1 CHECK (capacidade >= 1),
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id)
);

CREATE TABLE motivos_cancelamento_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  cliente_id uuid REFERENCES clientes(id),
  atendente_id uuid REFERENCES funcionarios(id),
  sala_prova_id uuid REFERENCES salas_prova(id),
  produto_id uuid REFERENCES produtos(id),
  venda_locacao_id uuid,
  reagendamento_de_id uuid REFERENCES agendamentos(id),
  data_evento_referencia date,
  inicio_at timestamptz NOT NULL,
  fim_at timestamptz NOT NULL,
  tipo text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho',
  origem text NOT NULL DEFAULT 'manual',
  observacoes text,
  cancelado_em timestamptz,
  cancelado_por_id uuid REFERENCES usuarios(id),
  motivo_cancelamento_id uuid REFERENCES motivos_cancelamento_agenda(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  lock_version integer NOT NULL DEFAULT 0,
  CHECK (fim_at > inicio_at),
  CHECK (lead_id IS NOT NULL OR cliente_id IS NOT NULL)
);

CREATE TABLE agendamento_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES produtos(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agendamento_id, produto_id)
);

CREATE TABLE reservas_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES produtos(id),
  cliente_id uuid REFERENCES clientes(id),
  venda_locacao_id uuid,
  venda_locacao_item_id uuid,
  agendamento_id uuid REFERENCES agendamentos(id),
  data_evento date,
  inicio_at timestamptz NOT NULL,
  fim_at timestamptz NOT NULL,
  periodo tstzrange GENERATED ALWAYS AS (tstzrange(inicio_at, fim_at, '[)')) STORED,
  tipo_bloqueio text NOT NULL,
  motivo_bloqueio text,
  status text NOT NULL DEFAULT 'ativa',
  expiracao_em timestamptz,
  cancelado_em timestamptz,
  cancelado_por_id uuid REFERENCES usuarios(id),
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by_id uuid REFERENCES usuarios(id),
  CHECK (fim_at > inicio_at)
);

ALTER TABLE reservas_estoque
ADD CONSTRAINT reservas_estoque_sem_sobreposicao
EXCLUDE USING gist (
  produto_id WITH =,
  periodo WITH &&
)
WHERE (
  deleted_at IS NULL
  AND status IN ('ativa', 'convertida')
);

CREATE TABLE conflitos_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  entidade_id uuid,
  tipo_conflito text NOT NULL,
  mensagem text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE historico_atendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  entidade_id uuid NOT NULL,
  usuario_id uuid REFERENCES usuarios(id),
  tipo text NOT NULL,
  descricao text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE eventos_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento text NOT NULL,
  entidade_tipo text NOT NULL,
  entidade_id uuid NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pendente',
  tentativas integer NOT NULL DEFAULT 0,
  ultimo_erro text,
  proxima_tentativa_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  processado_em timestamptz
);

CREATE INDEX idx_leads_funil ON leads (status, criado_em) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_telefone ON leads (telefone) WHERE deleted_at IS NULL;
CREATE INDEX idx_clientes_telefone ON clientes (telefone) WHERE deleted_at IS NULL;
CREATE INDEX idx_tarefas_status_limite ON tarefas (status, data_limite) WHERE deleted_at IS NULL;
CREATE INDEX idx_produtos_status ON produtos (status_geral) WHERE deleted_at IS NULL;
CREATE INDEX idx_agendamentos_periodo ON agendamentos (inicio_at, fim_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_agendamentos_sala ON agendamentos (sala_prova_id, inicio_at, fim_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservas_periodo ON reservas_estoque USING gist (periodo);
