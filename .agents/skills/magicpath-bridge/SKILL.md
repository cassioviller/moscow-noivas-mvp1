---
name: magicpath-bridge
description: Use esta skill quando o usuário quiser explorar visualmente telas, variações de layout, protótipos ou direção visual usando MagicPath ou um canvas externo antes de aplicar código no repositório.
---

# Skill: MagicPath Bridge

## Objetivo

Ajudar o usuário a usar MagicPath ou outro canvas visual para explorar direções de design antes de codar.

Use quando o usuário pedir:

- gerar variações visuais;
- comparar layouts;
- criar referência de UI;
- testar uma direção de design;
- usar MagicPath com Codex;
- transformar protótipo visual em plano de implementação.

## Regras

- Não aplicar código no repositório antes de aprovar a direção.
- Usar dados fictícios.
- Não expor dados reais de clientes.
- Não subir senhas, tokens ou informações sensíveis.
- Sempre transformar o resultado visual em checklist técnico antes de implementar.

## Processo

### 1. Preparar contexto

Leia:

- `PRODUCT.md`
- `DESIGN.md`
- `frontend/src/App.tsx`
- `frontend/src/styles/app.css`
- página alvo

### 2. Definir objetivo visual

Pergunte:

- Qual tela será explorada?
- Qual problema visual queremos resolver?
- Quantas variações deseja?
- Deve manter identidade atual ou propor nova direção?
- Há referência visual?

### 3. Gerar direções

Para Moscow Noivas, usar estas direções base:

1. Atelier Premium Clássico
2. Operação Clara e Moderna
3. Boutique Editorial Discreta

Para cada direção, definir:

- paleta;
- tipografia;
- layout;
- componentes;
- pontos fortes;
- riscos.

### 4. Converter em implementação

Depois da aprovação, gerar:

```text
Arquivos afetados:
Tokens necessários:
Componentes a alterar:
Telas a alterar:
Estados necessários:
Riscos:
Plano em commits:
```

## Prompt para MagicPath

```text
Crie uma proposta visual para o Moscow Noivas, um painel de gestão de loja de venda e aluguel de vestidos de noiva.

Tela alvo: [descrever tela]

Direção: atelier premium, elegante, claro, humano e operacional.

Evite visual genérico de SaaS, gradientes roxos/azuis, ERP antigo, excesso de cards e aparência infantil.

A UI deve priorizar clareza operacional, agenda do dia, noivas em andamento, vestidos, locações e financeiro.
```

## Saída esperada da skill

```text
Direções visuais propostas:
Recomendação:
Como validar:
Plano para implementar no código:
O que não alterar:
```
