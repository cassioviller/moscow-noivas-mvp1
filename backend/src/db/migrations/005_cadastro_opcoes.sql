CREATE TABLE IF NOT EXISTS cadastro_opcoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo text NOT NULL,
  campo text NOT NULL,
  valor text NOT NULL,
  rotulo text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE (modulo, campo, valor)
);

INSERT INTO cadastro_opcoes (modulo, campo, valor, rotulo, ordem) VALUES
  ('crm', 'interesse', 'vestido_noiva', 'Vestido de noiva', 10),
  ('crm', 'interesse', 'vestido_festa', 'Vestido de festa', 20),
  ('crm', 'interesse', 'acessorios', 'Acessórios', 30),
  ('crm', 'interesse', 'ajuste', 'Ajuste', 40),
  ('crm', 'interesse', 'locacao_completa', 'Locação completa', 50)
ON CONFLICT (modulo, campo, valor) DO NOTHING;
