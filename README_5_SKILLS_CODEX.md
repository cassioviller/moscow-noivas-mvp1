# README — Pacote de 5 Skills para Codex no Moscow Noivas

Este pacote prepara o repositório `moscow-noivas-mvp1` para usar um fluxo de design engineering inspirado nas 5 skills/workflows citados no vídeo:

1. `grill-me-moscow`
2. `goal-skill-loop`
3. `magicpath-bridge`
4. `make-interfaces-feel-better-moscow`
5. `impeccable-moscow`

## Observação importante

No vídeo, `Goal` aparece como comando nativo/workflow do Codex, não exatamente como uma skill externa. Por isso, neste pacote ele foi transformado em uma skill local chamada `goal-skill-loop`, que orienta o Codex a usar um ciclo de objetivo, validação, nota e melhoria.

## Como instalar no projeto

Copie todos os arquivos deste pacote para a raiz do repositório:

```text
moscow-noivas-mvp1/
```

A raiz é a pasta onde fica o `package.json`.

Depois abra o projeto no Codex e verifique se as skills aparecem digitando:

```text
/skills
```

ou digitando `$` e procurando pelos nomes das skills.

## Por que este pacote usa `.agents/skills`

O Codex reconhece skills locais dentro da pasta:

```text
.agents/skills/
```

Cada skill é uma pasta com um arquivo obrigatório:

```text
SKILL.md
```

Este pacote já cria as 5 skills locais nesse formato.

## Arquivos incluídos

```text
AGENTS.md
INSTALL_5_SKILLS_CODEX.md
ORDEM_DE_USO_MOSCOW_NOIVAS.md
PROMPTS_5_SKILLS.md
SECURITY_CHECKLIST_SKILLS.md
.agents/skills/grill-me-moscow/SKILL.md
.agents/skills/goal-skill-loop/SKILL.md
.agents/skills/magicpath-bridge/SKILL.md
.agents/skills/make-interfaces-feel-better-moscow/SKILL.md
.agents/skills/impeccable-moscow/SKILL.md
```

## Primeiro prompt para usar no Codex

Cole este prompt no Codex depois de copiar os arquivos:

```text
Leia AGENTS.md, INSTALL_5_SKILLS_CODEX.md, ORDEM_DE_USO_MOSCOW_NOIVAS.md e as 5 skills em .agents/skills.

Depois confirme:
1. quais skills locais você encontrou;
2. como você vai usar cada uma no projeto Moscow Noivas;
3. qual será a ordem de trabalho;
4. quais arquivos você precisa ler antes de alterar qualquer código.

Não altere código ainda.
```
