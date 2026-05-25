---
name: impeccable-moscow
description: Use esta skill para aplicar princípios do Impeccable ao Moscow Noivas: criar PRODUCT.md e DESIGN.md, auditar UI, detectar anti-padrões de IA, polir telas e endurecer responsividade, estados e acessibilidade.
---

# Skill: Impeccable Moscow

## Objetivo

Aplicar um fluxo de design intencional ao Moscow Noivas.

Esta skill é uma adaptação local dos princípios do Impeccable para o projeto.

Use quando o usuário pedir:

- auditar UI;
- criar design system;
- refatorar visual;
- polir dashboard;
- melhorar UX;
- evitar UI genérica de IA;
- criar `PRODUCT.md`;
- criar `DESIGN.md`;
- endurecer interface.

## Processo

### 1. Teach

Antes de alterar código, entenda:

- produto;
- usuários;
- tarefas principais;
- personalidade da marca;
- anti-referências;
- restrições;
- acessibilidade;
- critérios de pronto.

Crie ou atualize:

```text
PRODUCT.md
```

### 2. Document

Leia tokens, CSS, componentes e telas.

Crie ou atualize:

```text
DESIGN.md
```

Inclua:

- paleta;
- tipografia;
- raios;
- sombras;
- componentes;
- estados;
- responsividade;
- do/don’t.

### 3. Critique

Audite a UI atual.

Classifique problemas em:

- P0: quebra uso ou acessibilidade;
- P1: prejudica clareza, consistência ou operação;
- P2: refinamento visual.

Salve relatório, se pedido, em:

```text
.impeccable/critique/
```

### 4. Polish

Refatore em etapas:

1. design tokens;
2. app shell;
3. dashboard;
4. CRM/noivas;
5. produtos/vestidos;
6. agenda/reservas;
7. locações/financeiro;
8. gestão/admin.

### 5. Harden

Verifique:

- loading states;
- empty states;
- error states;
- success states;
- responsividade;
- acessibilidade;
- foco por teclado;
- aria-labels;
- textos longos;
- tabelas largas;
- menu colapsado.

## Anti-padrões a evitar

- roxo/azul genérico;
- gradiente sem propósito;
- gradient text;
- cards dentro de cards;
- baixa hierarquia;
- baixa contraste;
- Inter + template SaaS sem identidade;
- hero genérico;
- botões pill sem sistema;
- excesso de sombras;
- glassmorphism sem função.

## Direção visual do Moscow Noivas

A interface deve parecer:

> Atelier premium com rotina operacional clara.

Paleta sugerida:

- ivory;
- champagne;
- blush;
- vinho queimado;
- sage discreto;
- tons neutros quentes.

## Prompts equivalentes ao Impeccable oficial

Se a skill oficial estiver instalada, você pode usar:

```text
/impeccable teach
/impeccable document
/impeccable critique the current Moscow Noivas UI
/impeccable polish the dashboard and app shell
/impeccable harden responsive behavior, empty states, loading states, error states and accessibility
```

Se a skill oficial não estiver instalada, execute esse mesmo processo manualmente seguindo esta skill local.

## Validação

Depois de alterações:

```bash
npm run build
npm test
```

## Saída final

```text
PRODUCT.md atualizado:
DESIGN.md atualizado:
Problemas corrigidos:
Arquivos alterados:
Validação:
Próximos passos:
```
