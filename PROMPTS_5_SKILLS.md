# PROMPTS_5_SKILLS.md — Prompts prontos para usar no Codex

## 1. Verificar instalação

```text
Leia a pasta .agents/skills e confirme quais skills locais estão disponíveis.
Depois explique como devo chamar cada uma usando `$`.
Não altere código.
```

## 2. Grill Me — entrevista inicial

```text
Use $grill-me-moscow.

Quero melhorar o design/UI/UX do Moscow Noivas.
Me entreviste uma pergunta por vez.
Pare quando tiver entendimento suficiente.
Depois gere:
1. resumo dos requisitos;
2. riscos;
3. restrições;
4. plano de execução;
5. critérios de pronto.
```

## 3. Impeccable — contexto e auditoria

```text
Use $impeccable-moscow.

Leia o repositório e crie/atualize PRODUCT.md e DESIGN.md.
Depois audite:
- app shell;
- dashboard;
- CRM;
- produtos;
- agenda;
- locações;
- financeiro;
- gestão;
- responsividade;
- acessibilidade.

Classifique em P0, P1 e P2.
Não altere código ainda.
```

## 4. MagicPath — exploração visual

```text
Use $magicpath-bridge.

Quero explorar propostas visuais para o Moscow Noivas antes de alterar código.

Gere 3 direções:
1. Atelier Premium Clássico;
2. Operação Clara e Moderna;
3. Boutique Editorial Discreta.

Para cada direção, explique:
- paleta;
- tipografia;
- layout;
- pontos fortes;
- riscos;
- onde aplicar no app.
```

## 5. Make Interfaces Feel Better — polimento

```text
Use $make-interfaces-feel-better-moscow.

Polir a UI atual do Moscow Noivas.

Foque em:
- espaçamento;
- hierarquia;
- tipografia;
- botões;
- cards;
- tabelas;
- badges;
- foco visual;
- microinterações;
- empty states;
- loading states;
- responsividade.

Preserve funcionalidades.
```

## 6. Goal Skill Loop — melhoria iterativa

```text
Use $goal-skill-loop.

Crie um ciclo de melhoria com meta mínima de 85/100 para:
- clareza operacional;
- consistência visual;
- estética premium;
- acessibilidade;
- responsividade;
- preservação funcional.

Não avance para o próximo ciclo sem avaliar e justificar a nota.
```

## 7. Impeccable oficial, se instalado

```text
/impeccable teach

Este projeto é o Moscow Noivas, um painel de gestão para loja de venda e aluguel de vestidos de noiva.

É product UI, não landing page.

Direção visual: atelier premium, elegante, claro, humano e operacional.

Anti-referências: SaaS roxo genérico, ERP antigo, excesso de cards, dashboard frio, glassmorphism exagerado e romantização infantil.

Preserve backend, API, autenticação, banco, migrations, seeds e testes.
```

```text
/impeccable critique the current Moscow Noivas UI
```

```text
/impeccable polish the dashboard and app shell
```

```text
/impeccable harden responsive behavior, empty states, loading states, error states and accessibility
```

## 8. Finalização

```text
Entregue o resumo final com:

1. Skills usadas;
2. Arquivos alterados;
3. Melhorias visuais;
4. Melhorias de UX;
5. Validações executadas;
6. Resultado do build;
7. Resultado dos testes;
8. Riscos restantes;
9. Próximos passos.
```
