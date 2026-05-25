# CODEX_PROMPTS.md — Prompts prontos para usar no Codex

## 1. Prompt inicial do projeto

```text
Leia AGENTS.md, PRODUCT.md, DESIGN.md, README.md, package.json, frontend/src/App.tsx e frontend/src/styles/app.css.

Depois me entregue:
1. resumo do produto;
2. diagnóstico da UI atual;
3. plano de refatoração em etapas pequenas;
4. riscos de quebrar funcionalidades;
5. primeiro conjunto de arquivos que você pretende alterar.

Não altere código ainda.
```

## 2. Instalar e usar Impeccable

```text
Verifique se a skill Impeccable está disponível.

Se estiver disponível, use /impeccable teach para validar o contexto do projeto com base em PRODUCT.md e DESIGN.md.

Se não estiver disponível, siga manualmente os princípios descritos em AGENTS.md, PRODUCT.md e DESIGN.md.
```

## 3. Teach do Impeccable

```text
/impeccable teach

Este projeto é o Moscow Noivas, um painel web para gestão de loja de venda e aluguel de vestidos de noiva e acessórios.

É uma product UI, não uma landing page.

A interface deve parecer um atelier premium: elegante, organizada, clara, humana e operacional.

Usuários: vendedoras, gerente, financeiro e administrador.

Prioridades: atendimento rápido, agenda, noivas/leads, vestidos, locações, financeiro, caução, retirada/devolução, regras e auditoria.

Anti-referências: SaaS genérico, gradiente roxo/azul, dashboard frio, ERP antigo, excesso de cards, UI infantil, romantização exagerada.

Não quebre backend, API, autenticação, banco, migrations, seeds ou testes.
```

## 4. Documentar design

```text
/impeccable document

Leia o código real e atualize DESIGN.md mantendo a direção visual: atelier premium com rotina operacional clara.
Não substitua a identidade por um template genérico.
```

## 5. Auditar UI

```text
/impeccable critique the current Moscow Noivas UI

Avalie:
- app shell;
- sidebar;
- topbar;
- dashboard;
- CRM/noivas;
- atendimento rápido;
- produtos/vestidos;
- agenda/reservas;
- locações;
- financeiro;
- gestão/admin;
- loading;
- empty states;
- error states;
- responsividade;
- acessibilidade.

Classifique problemas em P0, P1 e P2.
Não altere código ainda.
```

## 6. Refatorar tokens

```text
Refatore apenas o design system/tokens do front-end.

Objetivo:
- centralizar cores, raios, sombras, espaçamentos e tipografia;
- reduzir cores hardcoded;
- preparar base para polish visual;
- preservar aparência funcional atual;
- não alterar regras de negócio.

Arquivos prováveis:
- frontend/src/styles/app.css
- opcionalmente novos arquivos CSS em frontend/src/styles/

Depois rode npm run build.
```

## 7. Refatorar shell

```text
/impeccable polish the app shell, sidebar and topbar

Objetivo:
melhorar layout principal, menu lateral, estado colapsado, topbar, hierarquia dos módulos e responsividade.

Preserve a navegação existente e todas as páginas.
Não remova itens do menu.
```

## 8. Refatorar dashboard

```text
/impeccable polish the dashboard as a daily operations center for the bridal shop

Objetivo:
transformar o dashboard em uma central do dia para gerente e equipe.

Priorize:
1. agenda de hoje;
2. pendências críticas;
3. noivas em andamento;
4. dinheiro a receber;
5. retiradas/devoluções próximas;
6. métricas secundárias.

Preserve os dados vindos da API.
```

## 9. Refatorar CRM e Noivas

```text
/impeccable polish the CRM, noivas, atendimento rápido, clientes and tasks pages

Objetivo:
melhorar clareza dos leads/noivas, funil, tarefas e cadastro rápido.

Mostre bem:
- nome;
- telefone;
- status;
- data do evento;
- interesse;
- próxima ação;
- prioridade;
- responsável.
```

## 10. Refatorar Produtos e Agenda

```text
/impeccable polish the products, vestidos, agenda and reservations pages

Objetivo:
melhorar cards de vestidos, agenda de provas, reservas e estados de disponibilidade.

A agenda deve deixar horário, cliente, atendente, sala, vestido e status muito claros.
```

## 11. Refatorar Locações e Financeiro

```text
/impeccable polish the rentals and receivables pages

Objetivo:
melhorar confiança e clareza em locações, parcelas, pagamentos, caução, retirada e devolução.

Não altere cálculos ou contratos de API.
```

## 12. Harden final

```text
/impeccable harden the Moscow Noivas UI

Verifique:
- responsividade;
- acessibilidade;
- foco por teclado;
- labels;
- aria-labels;
- loading states;
- empty states;
- error states;
- sucesso;
- tabelas largas;
- textos longos;
- menu colapsado;
- mobile;
- build;
- testes.
```

## 13. Prompt caso a skill falhe

```text
A skill Impeccable não está funcionando neste ambiente.

Siga manualmente:
- AGENTS.md;
- PRODUCT.md;
- DESIGN.md;
- UI_UX_AUDIT_TEMPLATE.md;
- UI_UX_REFACTOR_PLAN.md;
- QA_CHECKLIST.md.

Faça primeiro a auditoria, depois implemente em etapas pequenas.
Não quebre funcionalidades existentes.
```

## 14. Prompt para resumo final

```text
Entregue o resumo final em português com:

1. arquivos alterados;
2. principais melhorias visuais;
3. melhorias de UX;
4. melhorias de acessibilidade;
5. validações executadas;
6. erros ou limitações;
7. próximos passos recomendados.
```
