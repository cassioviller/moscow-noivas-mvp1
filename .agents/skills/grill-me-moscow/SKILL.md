---
name: grill-me-moscow
description: Use esta skill antes de implementar mudanças no Moscow Noivas quando a tarefa estiver vaga. Ela entrevista o usuário uma pergunta por vez para transformar uma ideia de UI/UX, produto ou feature em requisitos claros, plano e critérios de pronto.
---

# Skill: Grill Me Moscow

## Objetivo

Entrevistar o usuário antes de implementar qualquer mudança relevante no Moscow Noivas.

Use esta skill quando o usuário pedir:

- refatoração de UI/UX;
- criação de feature;
- mudança em fluxo;
- melhoria de dashboard;
- redesign;
- alteração grande sem requisitos claros.

## Comportamento

Faça perguntas uma por vez.

Não faça 10 perguntas de uma vez.

Continue até entender:

1. objetivo da mudança;
2. usuário principal;
3. tela ou módulo afetado;
4. problema atual;
5. resultado esperado;
6. restrições técnicas;
7. o que não pode mudar;
8. como validar;
9. prioridade;
10. risco aceitável.

## Regras

- Não altere código durante a entrevista.
- Não presuma requisitos críticos.
- Se o usuário disser "pode seguir", gere resumo e plano.
- Se houver ambiguidade que afeta código, pergunte.
- Se a tarefa for UI/UX, conecte com `PRODUCT.md` e `DESIGN.md`.

## Saída final da entrevista

Entregue:

```text
Resumo da intenção:
Usuário principal:
Telas afetadas:
Problemas atuais:
Resultado esperado:
Restrições:
O que não pode mudar:
Critérios de pronto:
Plano em etapas:
Primeiro passo recomendado:
```

## Aplicação ao Moscow Noivas

Sempre considere que o produto é um painel para loja de venda e aluguel de vestidos de noiva.

A direção visual desejada é:

> Atelier premium com rotina operacional clara.

Evite transformar o app em SaaS genérico, ERP antigo ou landing page.
