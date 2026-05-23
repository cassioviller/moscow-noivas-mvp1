# Moscow Noivas - MVP 1 Base

Fundacao do app Moscow Noivas conforme os Prompts 01 e 02 e o Plano V11.

## O que este projeto entrega

- Backend Express/TypeScript com config, banco, migrations, seeds, services, controllers, middlewares e testes.
- PostgreSQL 15+ com `timestamptz`, soft delete, auditoria de login, perfis, permissoes e regras configuraveis.
- Autenticacao com bcrypt custo minimo 12, JWT de acesso e refresh token salvo como hash.
- Validacao de permissoes no backend.
- Painel de regras com historico de alteracoes.
- Funcionarios, atendentes, horarios, bloqueios de atendente e bloqueios da loja.
- CRM inicial com Atendimento Rapido, Noivas/Leads, Clientes e Tarefas.
- Vestidos/produtos com categorias, fotos por `produto_fotos.is_principal`, arquivos privados e log de acesso.
- Salas/cabines, Agenda com `inicio_at`/`fim_at`, servico de disponibilidade e reservas de estoque com `EXCLUDE USING gist`.
- Locacoes com multiplos itens, parcelas, pagamentos, caucao, contrato minimo, retirada, devolucao e troca de item.
- Dashboard, historico, auditoria, glossario de status, eventos outbox, LGPD minima e telas finais de entrega.
- UI inicial para Login, Usuarios, Perfis e permissoes, Regras da Loja, Funcionarios, Horarios, Bloqueios, Atendimento Rapido, Noivas, Clientes, Tarefas, Vestidos, Agenda e Reservas.

## Requisitos

- Node.js 20+
- PostgreSQL 15+

## Como rodar

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Backend: `http://localhost:3333`
Frontend: `http://localhost:5173`

## Admin inicial

- E-mail: `admin@moscownoivas.local`
- Senha: `Admin@123456`

Troque a senha antes de usar com dados reais.

## Banco

As migrations ficam em `backend/src/db/migrations`.
Os seeds ficam em `backend/src/db/seeds`.

Prompt 01 cria:

- `usuarios`, `sessoes_usuario`, `login_auditoria`
- `perfis`, `permissoes`, `perfil_permissoes`, `usuario_perfis`
- `regra_modulos`, `regras_configuraveis`, `regras_configuraveis_historico`, `configuracoes_sistema`
- `funcionarios`, `atendente_horarios`, `atendente_bloqueios`, `loja_bloqueios`

Prompt 02 cria:

- `leads`, `lead_merges`, `motivos_perda`, `clientes`, `tarefas`
- `categorias_produto`, `produtos`, `produto_fotos`, `arquivos`, `arquivo_acessos_log`
- `salas_prova`, `agendamentos`, `agendamento_produtos`, `motivos_cancelamento_agenda`, `conflitos_log`
- `reservas_estoque`, `historico_atendimentos`, `eventos_outbox`

Prompt 03 cria:

- `vendas_locacoes`, `venda_locacao_itens`, `motivos_cancelamento_venda`, `regras_cancelamento`
- `contas_receber`, `pagamentos_recebidos`, `estornos_pagamento`, `financeiro_movimentos`
- `caucao_movimentos`, `avarias_multas`, `checklists_retirada_devolucao`

Prompt 04 cria:

- `auditoria_logs`, `glossario_status`, `webhook_endpoints`, `webhooks_logs`
- `consentimentos`, `solicitacoes_lgpd`, `politicas_retencao_dados`, `anonimizacoes_log`
- colunas de idempotencia e lock em `eventos_outbox`

## Endpoints principais do Prompt 02

- `POST /crm/quick-leads`
- `GET /crm/leads`
- `GET /crm/clients`
- `GET /crm/tasks`
- `GET /products`
- `POST /products`
- `GET /agenda/appointments`
- `POST /agenda/appointments`
- `GET /agenda/reservations`
- `POST /api/disponibilidade/validar`
- `GET /rentals`
- `POST /rentals`
- `GET /rentals/:id`
- `POST /rentals/:id/swap-item`
- `GET /rentals/receivables`
- `POST /rentals/payments`
- `POST /rentals/:id/bail`
- `PATCH /rentals/:id/contract`
- `GET /rentals/:id/delivery/validate`
- `POST /rentals/:id/delivery`
- `POST /rentals/:id/return`
- `GET /dashboard`
- `GET /traceability/history`
- `GET /traceability/audit`
- `GET /traceability/glossary`
- `GET /lgpd`
- `POST /lgpd/consents`
- `POST /lgpd/requests`
- `POST /lgpd/leads/:id/anonymize`
- `GET /outbox`
- `POST /outbox/process`

## Reserva de estoque

A tabela `reservas_estoque` usa `periodo tstzrange` gerado com `tstzrange(inicio_at, fim_at, '[)')` e constraint:

```sql
EXCLUDE USING gist (
  produto_id WITH =,
  periodo WITH &&
)
WHERE (
  deleted_at IS NULL
  AND status IN ('ativa', 'convertida')
);
```

Assim, reserva sobreposta falha no banco, reserva adjacente passa e reservas canceladas/expiradas nao bloqueiam.

## Seguranca e regras

- Usuario inativo nao acessa.
- Senha usa bcrypt com custo minimo 12.
- Permissoes sao verificadas no backend.
- Alteracoes em regras geram historico e exigem motivo quando a regra e sensivel.
- Datas operacionais usam `timestamptz`.
- Arquivos perigosos sao bloqueados por extensao.
- Download de arquivo sensivel pode gerar log em `arquivo_acessos_log`.
- Este bloco nao implementa WhatsApp, IA ou n8n real.
