# INSTALL_5_SKILLS_CODEX.md — Passo a passo para instalar e usar as 5 skills no Codex

## 1. Instalação local recomendada

Este pacote já contém 5 skills locais no formato do Codex.

Copie a pasta abaixo para a raiz do projeto:

```text
.agents/skills/
```

A estrutura final deve ficar assim:

```text
moscow-noivas-mvp1/
  package.json
  AGENTS.md
  INSTALL_5_SKILLS_CODEX.md
  ORDEM_DE_USO_MOSCOW_NOIVAS.md
  PROMPTS_5_SKILLS.md
  SECURITY_CHECKLIST_SKILLS.md
  .agents/
    skills/
      grill-me-moscow/
        SKILL.md
      goal-skill-loop/
        SKILL.md
      magicpath-bridge/
        SKILL.md
      make-interfaces-feel-better-moscow/
        SKILL.md
      impeccable-moscow/
        SKILL.md
```

## 2. Reinicie o Codex

Depois de copiar os arquivos:

1. feche a thread atual;
2. recarregue o projeto;
3. se necessário, reinicie o Codex.

## 3. Verifique se as skills aparecem

No Codex, digite:

```text
/skills
```

ou digite:

```text
$
```

e procure:

```text
grill-me-moscow
goal-skill-loop
magicpath-bridge
make-interfaces-feel-better-moscow
impeccable-moscow
```

## 4. Instalar a skill oficial Impeccable

Além da skill local `impeccable-moscow`, você pode instalar a skill oficial Impeccable.

No terminal, dentro do projeto, rode:

```bash
npx skills add pbakaus/impeccable
```

Depois reinicie o Codex e teste:

```text
/impeccable
```

ou:

```text
$impeccable
```

## 5. Instalar skills externas pelo Codex

Se quiser procurar skills externas/curadas, use:

```text
$skill-installer
```

ou:

```text
$skill-installer nome-da-skill
```

Para criar uma skill nova com ajuda do Codex, use:

```text
$skill-creator
```

## 6. Cuidado com skills externas

Antes de instalar qualquer skill de terceiros:

- leia o `SKILL.md`;
- veja se há scripts;
- veja se pede acesso externo;
- evite rodar scripts desconhecidos;
- prefira instalar primeiro em um projeto de teste;
- não exponha tokens, senhas ou dados de cliente.

## 7. Primeiro teste das skills locais

Cole no Codex:

```text
Use $grill-me-moscow para me entrevistar antes de refatorar a UI do Moscow Noivas.

Objetivo: melhorar design, UX e experiência visual do app sem quebrar funcionalidades.
```

Depois:

```text
Use $impeccable-moscow para auditar a UI atual e propor uma ordem de refatoração.
Não altere código ainda.
```

## 8. Quando usar cada skill

### `$grill-me-moscow`

Use antes de começar, para levantar requisitos e eliminar ambiguidade.

### `$impeccable-moscow`

Use para design system, auditoria, PRODUCT.md, DESIGN.md, polish e hardening.

### `$magicpath-bridge`

Use quando quiser gerar ou comparar propostas visuais em um canvas/protótipo externo antes de codar.

### `$make-interfaces-feel-better-moscow`

Use para polir microinterações, espaçamento, tipografia, botões, cards e sensação geral da interface.

### `$goal-skill-loop`

Use para melhoria iterativa com nota, meta e condição de parada verificável.
