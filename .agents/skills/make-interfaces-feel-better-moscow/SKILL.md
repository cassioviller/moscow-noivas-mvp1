---
name: make-interfaces-feel-better-moscow
description: Use esta skill para polir a sensação visual e interativa das interfaces do Moscow Noivas: espaçamento, tipografia, ritmo, botões, cards, microinterações, estados e responsividade, sem redesenhar tudo do zero.
---

# Skill: Make Interfaces Feel Better Moscow

## Objetivo

Melhorar a sensação de uso da interface sem quebrar funcionalidades.

Use quando a interface estiver:

- correta, mas sem refinamento;
- visualmente dura;
- com espaçamento ruim;
- com hierarquia fraca;
- com cards/tabelas genéricos;
- com botões pouco claros;
- com estados vazios pobres;
- com pouca responsividade.

## Princípio

Não redesenhe tudo.

Polir significa melhorar o que já existe:

- ritmo;
- respiro;
- hierarquia;
- legibilidade;
- clareza;
- microfeedback;
- consistência.

## Checklist de polimento

### Espaçamento

- [ ] Há respiro suficiente?
- [ ] Os grupos têm proximidade lógica?
- [ ] Cards não estão colados?
- [ ] Formulários têm ritmo?

### Tipografia

- [ ] Títulos têm hierarquia?
- [ ] Labels são legíveis?
- [ ] Metadados não competem com conteúdo principal?
- [ ] Textos longos não quebram layout?

### Botões

- [ ] Ação principal é clara?
- [ ] Ação secundária não compete?
- [ ] Botão destrutivo é visualmente diferente?
- [ ] Foco e hover existem?

### Cards

- [ ] Card tem título claro?
- [ ] Conteúdo é escaneável?
- [ ] Há excesso de borda/sombra?
- [ ] Status é visível?

### Tabelas

- [ ] Cabeçalho é claro?
- [ ] Scroll horizontal é controlado?
- [ ] Ações não são ambíguas?
- [ ] Status usa badge com texto?

### Estados

- [ ] Loading é elegante?
- [ ] Empty state orienta próxima ação?
- [ ] Erro explica recuperação?
- [ ] Sucesso é discreto?

### Responsividade

- [ ] Funciona em 1366px?
- [ ] Funciona em 820px?
- [ ] Funciona em 640px?
- [ ] Modais cabem na tela?

## Aplicação ao Moscow Noivas

Foco de melhoria:

1. app shell;
2. sidebar;
3. topbar;
4. dashboard;
5. CRM/noivas;
6. produtos/vestidos;
7. agenda;
8. locações;
9. financeiro;
10. gestão/admin.

## Antes de alterar

Leia:

- `DESIGN.md`
- `PRODUCT.md`
- `frontend/src/styles/app.css`
- arquivo da página alvo

## Saída esperada

```text
Problemas de sensação encontrados:
Melhorias propostas:
Arquivos a alterar:
Riscos:
Plano em pequenos passos:
```

## Depois de alterar

Rode:

```bash
npm run build
npm test
```

E entregue resumo.
