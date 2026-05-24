---
name: goal-skill-loop
description: Use esta skill para criar um ciclo iterativo de melhoria no Codex com meta, nota, validação e condição de parada. Ideal para refinar UI/UX, criar ou melhorar skills e repetir ciclos até atingir um threshold objetivo.
---

# Skill: Goal Skill Loop

## Objetivo

Transformar uma tarefa aberta em um ciclo iterativo com objetivo verificável.

Use quando o usuário pedir:

- melhorar uma skill;
- melhorar uma tela até atingir qualidade mínima;
- refinar UI/UX em ciclos;
- validar uma mudança com nota;
- criar loop de melhoria com critério de parada.

## Relação com Goal

No vídeo, `Goal` é tratado como comando nativo/workflow do Codex, não exatamente como uma skill externa.

Esta skill traduz esse processo para um workflow local:

1. definir objetivo;
2. definir métrica;
3. avaliar estado atual;
4. melhorar;
5. validar;
6. dar nota;
7. repetir até atingir a meta;
8. parar quando atingir meta ou houver risco.

## Processo obrigatório

### 1. Definir meta

Pergunte ou infira:

```text
Meta:
Threshold:
Critérios de avaliação:
Condição de parada:
Riscos:
```

### 2. Avaliar estado atual

Dê nota de 0 a 100 em critérios relevantes.

Para UI/UX do Moscow Noivas, use:

- clareza operacional;
- consistência visual;
- estética premium;
- acessibilidade;
- responsividade;
- preservação funcional;
- manutenção do código.

### 3. Corrigir por prioridade

Corrija primeiro:

- P0: quebra uso ou risco funcional;
- P1: prejudica clareza/UX;
- P2: refinamento visual.

### 4. Validar

Rode quando possível:

```bash
npm run build
npm test
```

### 5. Reavaliar

Dê nova nota.

Se atingir o threshold, pare.

Se não atingir, execute outro ciclo ou explique bloqueio.

## Saída esperada

```text
Objetivo:
Threshold:
Nota inicial:
Problemas encontrados:
Ações feitas:
Validação:
Nova nota:
Decisão:
Próximo ciclo ou conclusão:
```

## Regra de segurança

Não entre em loop infinito.

No máximo 3 ciclos por execução, a menos que o usuário peça mais.
