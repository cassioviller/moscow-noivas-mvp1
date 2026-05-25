# ORDEM_DE_USO_MOSCOW_NOIVAS.md — Workflow das 5 skills no projeto

## Visão geral

A ordem ideal para o Moscow Noivas é:

```text
1. Grill Me
2. Impeccable
3. MagicPath
4. Make Interfaces Feel Better
5. Goal Skill Loop
```

## Etapa 1 — Descoberta com `$grill-me-moscow`

Objetivo:

- fazer entrevista;
- entender escopo;
- transformar ideia vaga em plano claro;
- definir restrições;
- evitar que o Codex saia alterando tudo.

Prompt:

```text
Use $grill-me-moscow.

Quero refatorar o design/UI/UX do Moscow Noivas.
Faça perguntas uma por vez até entender:
- objetivo visual;
- módulos prioritários;
- usuários principais;
- restrições técnicas;
- riscos;
- o que não pode mudar;
- como validar.

Depois gere um resumo final e um plano de execução.
```

## Etapa 2 — Auditoria e design system com `$impeccable-moscow`

Objetivo:

- criar/validar `PRODUCT.md`;
- criar/validar `DESIGN.md`;
- auditar UI atual;
- identificar anti-padrões;
- definir prioridades.

Prompt:

```text
Use $impeccable-moscow.

Leia README.md, package.json, frontend/src/App.tsx, frontend/src/styles/app.css e frontend/src/pages.

Crie ou atualize PRODUCT.md e DESIGN.md.
Depois audite a UI atual e classifique problemas em P0, P1 e P2.
Não altere código ainda.
```

## Etapa 3 — Exploração visual com `$magicpath-bridge`

Objetivo:

- gerar variações visuais antes de codar;
- comparar alternativas de layout;
- trabalhar com referência visual;
- evitar alteração cega no código.

Prompt:

```text
Use $magicpath-bridge.

Quero explorar 2 ou 3 direções visuais para o dashboard e app shell do Moscow Noivas antes de implementar.

A direção deve ser: atelier premium, elegante, clara e operacional.
Não gere código no repositório ainda.
Primeiro descreva as alternativas e o que cada uma resolve.
```

## Etapa 4 — Polimento com `$make-interfaces-feel-better-moscow`

Objetivo:

- melhorar sensação geral;
- ajustar espaçamentos;
- melhorar hierarquia;
- refinar botões, cards, tabelas, badges e estados;
- deixar a interface mais agradável.

Prompt:

```text
Use $make-interfaces-feel-better-moscow.

Polir a interface atual do Moscow Noivas sem alterar regras de negócio.

Priorize:
- app shell;
- sidebar;
- topbar;
- dashboard;
- cards;
- botões;
- tabelas;
- formulários;
- empty states;
- loading states;
- responsividade.
```

## Etapa 5 — Loop de melhoria com `$goal-skill-loop`

Objetivo:

- definir nota mínima;
- melhorar em ciclos;
- parar apenas quando atingir critério objetivo.

Prompt:

```text
Use $goal-skill-loop.

Meta:
Melhorar a UI/UX do Moscow Noivas até atingir pelo menos 85/100 nos critérios:
- clareza;
- consistência visual;
- acessibilidade;
- responsividade;
- sensação premium;
- preservação funcional.

A cada ciclo:
1. avalie;
2. dê nota;
3. liste problemas;
4. corrija os problemas prioritários;
5. rode build/testes;
6. pare quando atingir a meta ou quando houver risco de quebrar regra de negócio.
```

## Etapa final — Validação

Prompt:

```text
Faça QA final usando SECURITY_CHECKLIST_SKILLS.md e os critérios de AGENTS.md.

Rode:
npm run build
npm test

Depois entregue resumo final.
```
