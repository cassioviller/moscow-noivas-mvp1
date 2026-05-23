CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email citext UNIQUE NOT NULL,
  password_hash text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  funcionario_id uuid NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  deleted_by_id uuid NULL
);

CREATE TABLE sessoes_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  refresh_token_hash text NOT NULL,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL,
  revogado_em timestamptz NULL
);

CREATE TABLE login_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NULL REFERENCES usuarios(id),
  email_tentado text NOT NULL,
  sucesso boolean NOT NULL,
  motivo_falha text,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo text NOT NULL,
  acao text NOT NULL,
  descricao text,
  UNIQUE (modulo, acao)
);

CREATE TABLE perfil_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  permissao_id uuid NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
  UNIQUE (perfil_id, permissao_id)
);

CREATE TABLE usuario_perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  perfil_id uuid NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, perfil_id)
);

CREATE TABLE regra_modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE regras_configuraveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES regra_modulos(id),
  chave text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  tipo_valor text NOT NULL CHECK (tipo_valor IN ('boolean', 'integer', 'decimal', 'string', 'json', 'select')),
  valor text NOT NULL,
  valor_padrao text NOT NULL,
  opcoes_json jsonb,
  valor_minimo numeric,
  valor_maximo numeric,
  regex_validacao text,
  unidade text,
  grupo text,
  sensivel boolean NOT NULL DEFAULT false,
  editavel_pelo_admin boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE regras_configuraveis_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regra_id uuid NOT NULL REFERENCES regras_configuraveis(id),
  valor_anterior text NOT NULL,
  valor_novo text NOT NULL,
  alterado_por_id uuid REFERENCES usuarios(id),
  motivo text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE configuracoes_sistema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timezone_padrao text NOT NULL DEFAULT 'America/Sao_Paulo',
  formato_data text NOT NULL DEFAULT 'dd/MM/yyyy',
  formato_moeda text NOT NULL DEFAULT 'BRL',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NULL REFERENCES usuarios(id),
  nome text NOT NULL,
  telefone text,
  email text,
  cargo text,
  is_atendente boolean NOT NULL DEFAULT false,
  is_financeiro boolean NOT NULL DEFAULT false,
  is_operacional boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  capacidade_atendimento integer NOT NULL DEFAULT 1 CHECK (capacidade_atendimento >= 1),
  horario_inicio_trabalho time,
  horario_fim_trabalho time,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  deleted_by_id uuid NULL REFERENCES usuarios(id)
);

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_funcionario_fk
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id);

CREATE TABLE atendente_horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES funcionarios(id),
  dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  CHECK (hora_fim > hora_inicio)
);

CREATE TABLE atendente_bloqueios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES funcionarios(id),
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz NOT NULL,
  tipo_bloqueio text NOT NULL,
  motivo text NOT NULL,
  criado_por_id uuid REFERENCES usuarios(id),
  observacoes text,
  deleted_at timestamptz NULL,
  CHECK (data_fim > data_inicio)
);

CREATE TABLE loja_bloqueios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz NOT NULL,
  tipo_bloqueio text NOT NULL,
  motivo text NOT NULL,
  afeta_agenda boolean NOT NULL DEFAULT true,
  criado_por_id uuid REFERENCES usuarios(id),
  deleted_at timestamptz NULL,
  CHECK (data_fim > data_inicio)
);

CREATE INDEX idx_usuarios_ativos ON usuarios (ativo) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessoes_usuario_usuario ON sessoes_usuario (usuario_id, expira_em);
CREATE INDEX idx_permissoes_modulo_acao ON permissoes (modulo, acao);
CREATE INDEX idx_regras_modulo ON regras_configuraveis (modulo_id);
CREATE INDEX idx_funcionarios_atendentes ON funcionarios (is_atendente, ativo) WHERE deleted_at IS NULL;
CREATE INDEX idx_atendente_bloqueios_periodo ON atendente_bloqueios (funcionario_id, data_inicio, data_fim) WHERE deleted_at IS NULL;
CREATE INDEX idx_loja_bloqueios_periodo ON loja_bloqueios (data_inicio, data_fim) WHERE deleted_at IS NULL;
