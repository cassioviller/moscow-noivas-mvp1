ALTER TABLE eventos_outbox
  ADD COLUMN idempotency_key text,
  ADD COLUMN locked_at timestamptz;

CREATE UNIQUE INDEX eventos_outbox_idempotency_key_unique
ON eventos_outbox (idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE TABLE auditoria_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id),
  acao text NOT NULL,
  entidade_tipo text NOT NULL,
  entidade_id uuid,
  antes_json jsonb,
  depois_json jsonb,
  motivo text,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE glossario_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  status_tecnico text NOT NULL,
  nome_exibicao text NOT NULL,
  descricao_para_equipe text,
  cor text NOT NULL DEFAULT 'cinza',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  UNIQUE (entidade_tipo, status_tecnico)
);

CREATE TABLE webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  evento text NOT NULL,
  url text NOT NULL,
  ativo boolean NOT NULL DEFAULT false,
  segredo_hash text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE webhooks_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_outbox_id uuid REFERENCES eventos_outbox(id),
  webhook_endpoint_id uuid REFERENCES webhook_endpoints(id),
  status text NOT NULL DEFAULT 'pendente',
  request_payload_json jsonb NOT NULL DEFAULT '{}',
  response_status integer,
  response_body text,
  erro text,
  tentativa integer NOT NULL DEFAULT 1,
  criado_em timestamptz NOT NULL DEFAULT now(),
  processado_em timestamptz
);

CREATE TABLE consentimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  finalidade text NOT NULL,
  permitido boolean NOT NULL DEFAULT true,
  origem text NOT NULL DEFAULT 'manual',
  observacoes text,
  concedido_em timestamptz,
  revogado_em timestamptz,
  criado_por_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, finalidade)
);

CREATE TABLE solicitacoes_lgpd (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id),
  lead_id uuid REFERENCES leads(id),
  tipo text NOT NULL CHECK (tipo IN ('acesso', 'correcao', 'exclusao', 'anonimizacao', 'revogacao')),
  status text NOT NULL DEFAULT 'aberta',
  solicitante_nome text,
  solicitante_contato text,
  descricao text,
  prazo_resposta_em date,
  resolvido_em timestamptz,
  responsavel_id uuid REFERENCES usuarios(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE politicas_retencao_dados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  finalidade text NOT NULL,
  prazo_retencao_dias integer NOT NULL CHECK (prazo_retencao_dias >= 0),
  acao_pos_prazo text NOT NULL CHECK (acao_pos_prazo IN ('manter', 'anonimizar', 'excluir', 'revisar')),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entidade_tipo, finalidade)
);

CREATE TABLE anonimizacoes_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo text NOT NULL,
  entidade_id uuid NOT NULL,
  campos_anonimizados_json jsonb NOT NULL DEFAULT '[]',
  motivo text NOT NULL,
  executado_por_id uuid REFERENCES usuarios(id),
  executado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_logs_entidade ON auditoria_logs (entidade_tipo, entidade_id, criado_em DESC);
CREATE INDEX idx_auditoria_logs_acao ON auditoria_logs (acao, criado_em DESC);
CREATE INDEX idx_historico_entidade ON historico_atendimentos (entidade_tipo, entidade_id, criado_em DESC);
CREATE INDEX idx_eventos_outbox_status ON eventos_outbox (status, criado_em);
CREATE INDEX idx_consentimentos_cliente ON consentimentos (cliente_id, finalidade);
CREATE INDEX idx_solicitacoes_lgpd_status ON solicitacoes_lgpd (status, prazo_resposta_em);
