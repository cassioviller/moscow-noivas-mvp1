# README_CODEX_MOSCOW_NOIVAS.md — Como usar este pacote

## 1. O que é este pacote

Este pacote contém os documentos necessários para orientar o Codex a refatorar a UI/UX do repositório Moscow Noivas seguindo a lógica da skill Impeccable.

## 2. Arquivos incluídos

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

## 3. Onde copiar

Copie todos para a raiz do projeto:

```text
moscow-noivas-mvp1/
```

A raiz é onde está o arquivo:

```text
package.json
```

## 4. Ordem de uso

1. Copie os arquivos.
2. Abra o projeto no Codex.
3. Instale a skill Impeccable, se possível.
4. Rode o prompt inicial de `CODEX_PROMPTS.md`.
5. Faça auditoria antes de alterar código.
6. Refatore em etapas pequenas.
7. Rode build e testes.
8. Revise visualmente no navegador.

## 5. Se você quiser usar a skill Impeccable

Rode:

```bash
npx skills add pbakaus/impeccable
```

Depois tente no Codex:

```text
/impeccable teach
```

ou:

```text
$impeccable
```

Depende de como o seu Codex estiver reconhecendo skills.

## 6. Se a skill não aparecer

Não tem problema.

Use os documentos deste pacote como substituto manual:

- `AGENTS.md` = regras do projeto;
- `PRODUCT.md` = estratégia do produto;
- `DESIGN.md` = direção visual;
- `CODEX_PROMPTS.md` = comandos prontos;
- `UI_UX_REFACTOR_PLAN.md` = ordem de implementação;
- `QA_CHECKLIST.md` = validação final.

## 7. Prompt mais importante

Use este primeiro:

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
