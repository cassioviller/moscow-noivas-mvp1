# UI_UX_REFACTOR_PLAN.md — Plano de refatoração UI/UX

## Objetivo

Refatorar a interface do Moscow Noivas para ficar mais elegante, consistente, responsiva e operacional, sem quebrar funcionalidades existentes.

## Fase 0 — Preparação

- [ ] Ler `AGENTS.md`
- [ ] Ler `PRODUCT.md`
- [ ] Ler `DESIGN.md`
- [ ] Ler `README.md`
- [ ] Ler `package.json`
- [ ] Ler `frontend/src/App.tsx`
- [ ] Ler `frontend/src/styles/app.css`
- [ ] Ler páginas em `frontend/src/pages`
- [ ] Rodar `npm run build`
- [ ] Rodar `npm test`
- [ ] Documentar falhas pré-existentes

## Fase 1 — Auditoria

- [ ] Auditar app shell
- [ ] Auditar sidebar
- [ ] Auditar topbar
- [ ] Auditar dashboard
- [ ] Auditar CRM/noivas
- [ ] Auditar produtos
- [ ] Auditar agenda
- [ ] Auditar locações
- [ ] Auditar financeiro
- [ ] Auditar gestão/admin
- [ ] Auditar estados
- [ ] Auditar responsividade
- [ ] Auditar acessibilidade

Entregável:

```text
UI_UX_AUDIT_REPORT.md
```

## Fase 2 — Design tokens

Objetivo:

- consolidar tokens;
- reduzir hardcoded colors;
- melhorar raios, sombras, espaçamentos;
- preparar base consistente.

Arquivos prováveis:

- `frontend/src/styles/app.css`
- opcionalmente `frontend/src/styles/tokens.css`

Critério de pronto:

- tokens centralizados;
- build funcionando;
- visual atual preservado ou levemente melhorado.

## Fase 3 — App shell

Objetivo:

- melhorar sidebar;
- melhorar agrupamento dos módulos;
- melhorar topbar;
- melhorar estado colapsado;
- melhorar responsividade.

Arquivos prováveis:

- `frontend/src/App.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- nenhum item de menu removido;
- navegação preservada;
- estado colapsado usável;
- foco visível;
- mobile/tablet considerado.

## Fase 4 — Dashboard

Objetivo:

Transformar o dashboard em uma central do dia.

Prioridades:

1. Agenda de hoje
2. Pendências críticas
3. Noivas em andamento
4. Dinheiro a receber
5. Retiradas/devoluções próximas
6. Métricas secundárias

Arquivos prováveis:

- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- dados da API preservados;
- hierarquia melhorada;
- empty/loading/error tratados;
- visual premium e claro.

## Fase 5 — CRM / Noivas / Atendimento

Objetivo:

Melhorar clareza do relacionamento com a noiva.

Arquivos prováveis:

- `frontend/src/pages/CrmPage.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- cards/listas mais escaneáveis;
- status e próxima ação claros;
- atendimento rápido simples;
- tarefas com prioridade visual.

## Fase 6 — Produtos / Vestidos

Objetivo:

Valorizar produtos sem perder operação.

Arquivos prováveis:

- `frontend/src/pages/ProductsPage.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- grid responsivo;
- cards melhores;
- placeholders elegantes;
- status claros.

## Fase 7 — Agenda / Reservas

Objetivo:

Deixar agenda fácil de operar.

Arquivos prováveis:

- `frontend/src/pages/AgendaPage.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- horário, cliente, atendente, sala e vestido claros;
- status e conflitos evidentes;
- layout responsivo.

## Fase 8 — Locações / Financeiro

Objetivo:

Aumentar confiança e reduzir risco de erro.

Arquivos prováveis:

- `frontend/src/pages/RentalsPage.tsx`
- `frontend/src/styles/app.css`

Critério de pronto:

- status da locação claro;
- parcelas e caução claras;
- retirada/devolução evidentes;
- ações críticas bem posicionadas.

## Fase 9 — Gestão / Admin

Objetivo:

Padronizar telas administrativas.

Arquivos prováveis:

- `UsersPage.tsx`
- `RulesPage.tsx`
- `EmployeesPage.tsx`
- `TraceabilityPage.tsx`
- `LgpdPage.tsx`

Critério de pronto:

- tabelas e formulários consistentes;
- badges e estados padronizados;
- telas funcionais e limpas.

## Fase 10 — Harden final

Verificar:

- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] success states
- [ ] responsividade
- [ ] acessibilidade
- [ ] foco por teclado
- [ ] aria-labels
- [ ] textos longos
- [ ] tabelas largas
- [ ] menu colapsado
- [ ] build
- [ ] testes

## Ordem sugerida de commits

1. `docs: add Codex and design context`
2. `style: centralize Moscow Noivas design tokens`
3. `refactor: polish app shell and navigation`
4. `style: improve dashboard hierarchy`
5. `style: standardize CRM and product UI patterns`
6. `style: polish agenda rentals and finance screens`
7. `style: harden responsive states and accessibility`
