# CODEX_IMPECCABLE_SETUP.md — Como aplicar no Codex

## 1. Objetivo

Aplicar a lógica da skill Impeccable no repositório Moscow Noivas usando o Codex.

A skill Impeccable trabalha com design intencional, cria contexto do produto em `PRODUCT.md`, documenta o visual em `DESIGN.md` e depois usa comandos para auditar, polir, criticar e criar interfaces.

## 2. Onde colocar estes arquivos

Copie para a raiz do repositório:

```text
AGENTS.md
PRODUCT.md
DESIGN.md
CODEX_IMPECCABLE_SETUP.md
CODEX_PROMPTS.md
UI_UX_AUDIT_TEMPLATE.md
UI_UX_REFACTOR_PLAN.md
QA_CHECKLIST.md
.impeccable/ignore.md
```

A raiz é a mesma pasta onde está o `package.json`.

## 3. Instalar Impeccable

Dentro da pasta do projeto, rode:

```bash
npx skills add pbakaus/impeccable
```

Depois reinicie/recarregue o Codex.

## 4. Verificar se a skill apareceu

No Codex, tente:

```text
/skills
```

Procure por `impeccable`.

Também teste:

```text
/impeccable
```

ou, se seu Codex estiver usando chamada por skill:

```text
$impeccable
```

## 5. Primeiro comando recomendado

Rode:

```text
/impeccable teach
```

E use este contexto:

```text
Este projeto é o Moscow Noivas, um painel web para gestão de uma loja de venda e aluguel de vestidos de noiva e acessórios.

É uma product UI, não uma landing page.

O design deve parecer um atelier premium de noivas: elegante, claro, organizado, humano e operacional.

Os usuários principais são vendedoras, gerente da loja, financeiro e administrador.

A interface precisa ajudar a loja a acompanhar atendimento rápido, noivas/leads, clientes, tarefas, vestidos, agenda, reservas, locações, contas a receber, caução, retirada, devolução, usuários, permissões, regras, funcionários, auditoria, LGPD e eventos.

Evite visual genérico de SaaS, gradiente roxo/azul, excesso de cards, dashboard frio, ERP antigo, UI infantil e romantização exagerada.

Preserve funcionalidades existentes, backend, contratos de API, autenticação, banco, migrations, seeds e testes.
```

## 6. Documentar design

Depois rode:

```text
/impeccable document
```

Esse comando deve ler o código e atualizar/criar `DESIGN.md`.

Se ele quiser sobrescrever o `DESIGN.md`, peça para preservar a direção deste arquivo e apenas melhorar com base no código real.

## 7. Auditar a UI atual

Rode:

```text
/impeccable critique the current app shell, dashboard, sidebar, topbar and main pages
```

ou:

```text
/impeccable audit the current Moscow Noivas product UI
```

Peça para ele salvar a crítica em:

```text
.impeccable/critique/
```

## 8. Refatorar em etapas

Não mande refatorar tudo de uma vez.

Use sequência:

```text
/impeccable polish the app shell, sidebar and topbar
```

Depois:

```text
/impeccable polish the dashboard as a daily operations center for the bridal shop
```

Depois:

```text
/impeccable polish the CRM, noivas, atendimento rápido and tasks pages
```

Depois:

```text
/impeccable polish the products, agenda, reservations, rentals and receivables pages
```

Depois:

```text
/impeccable harden the responsive behavior, empty states, loading states, error states and accessibility
```

## 9. Se a skill não funcionar

Use o Codex manualmente com este prompt:

```text
A skill Impeccable não está disponível neste ambiente. Siga manualmente os princípios de AGENTS.md, PRODUCT.md e DESIGN.md.

Primeiro audite a UI atual.
Depois refatore em etapas pequenas:
1. design tokens;
2. app shell;
3. dashboard;
4. CRM/noivas;
5. produtos;
6. agenda/reservas;
7. locações/financeiro;
8. gestão/admin;
9. responsividade, acessibilidade e estados.

Não quebre funcionalidades existentes.
Rode npm run build e npm test ao final.
```

## 10. Comandos de validação

Antes e depois:

```bash
npm run build
npm test
```

Se tiver ambiente para E2E:

```bash
npm run test:e2e
```

## 11. Fluxo recomendado de threads no Codex

Use threads separadas:

1. Thread 1: instalar Impeccable e criar contexto.
2. Thread 2: auditar UI.
3. Thread 3: refatorar shell e tokens.
4. Thread 4: refatorar dashboard.
5. Thread 5: refatorar páginas principais.
6. Thread 6: QA final.

Isso evita estourar contexto.

## 12. Uso do compact

Quando a conversa ficar longa:

```text
/compact
```

Depois continue com:

```text
Leia AGENTS.md, PRODUCT.md e DESIGN.md novamente antes de continuar.
```
