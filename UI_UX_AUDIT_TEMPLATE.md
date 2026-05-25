# UI_UX_AUDIT_TEMPLATE.md — Auditoria de UI/UX

Use este checklist antes de refatorar.

## 1. App shell

- [ ] A sidebar tem boa hierarquia?
- [ ] Os módulos principais estão fáceis de encontrar?
- [ ] O estado colapsado continua usável?
- [ ] A topbar ajuda ou só ocupa espaço?
- [ ] O usuário sabe em qual tela está?
- [ ] A navegação funciona por teclado?
- [ ] Há `aria-label` em botões apenas com ícone?

## 2. Design visual

- [ ] A UI parece Moscow Noivas ou SaaS genérico?
- [ ] As cores seguem um sistema?
- [ ] Há cores hardcoded demais?
- [ ] O contraste é suficiente?
- [ ] Os cards têm hierarquia clara?
- [ ] Há excesso de cards dentro de cards?
- [ ] A interface parece premium sem exagero?

## 3. Dashboard

- [ ] A primeira dobra responde o que precisa de atenção hoje?
- [ ] Agenda de hoje é clara?
- [ ] Pendências críticas aparecem com prioridade?
- [ ] Métricas têm contexto?
- [ ] Listas são escaneáveis?
- [ ] Estados vazios são úteis?
- [ ] Há excesso de informação secundária?

## 4. CRM / Noivas

- [ ] Status da noiva é claro?
- [ ] Próxima ação é visível?
- [ ] Data do evento aparece?
- [ ] Interesse aparece?
- [ ] Responsável aparece quando relevante?
- [ ] Tarefas têm prioridade?
- [ ] Funil é fácil de ler?

## 5. Produtos / Vestidos

- [ ] Imagem/foto é valorizada?
- [ ] Status do vestido é claro?
- [ ] Categoria é clara?
- [ ] Ações principais são visíveis?
- [ ] Cards funcionam sem imagem real?
- [ ] Grid é responsivo?

## 6. Agenda / Reservas

- [ ] Horário é destaque?
- [ ] Cliente/noiva é destaque?
- [ ] Atendente aparece?
- [ ] Sala/cabine aparece?
- [ ] Vestido relacionado aparece?
- [ ] Status é claro?
- [ ] Conflitos são evidentes?

## 7. Locações / Financeiro

- [ ] Status da locação é claro?
- [ ] Datas de retirada/devolução são claras?
- [ ] Valor total aparece com destaque adequado?
- [ ] Parcelas vencidas são evidentes?
- [ ] Caução está clara?
- [ ] Ações críticas têm confirmação?

## 8. Formulários

- [ ] Labels são visíveis?
- [ ] Erros aparecem perto do campo?
- [ ] Campos obrigatórios são claros?
- [ ] Layout funciona em mobile?
- [ ] Botão principal é evidente?
- [ ] Há feedback após salvar?

## 9. Tabelas

- [ ] Cabeçalhos são claros?
- [ ] Linhas têm espaçamento adequado?
- [ ] Status usa texto e cor?
- [ ] Ações são compreensíveis?
- [ ] Scroll horizontal está controlado?
- [ ] Tabelas não estão sendo usadas onde cards seriam melhores?

## 10. Estados

- [ ] Loading existe?
- [ ] Loading é elegante?
- [ ] Empty state explica o que fazer?
- [ ] Erro tem ação de recuperação?
- [ ] Sucesso confirma sem poluir?
- [ ] Textos longos não quebram layout?

## 11. Responsividade

- [ ] Funciona em 1366px?
- [ ] Funciona em 1100px?
- [ ] Funciona em 820px?
- [ ] Funciona em 640px?
- [ ] Sidebar não trava o uso?
- [ ] Modais cabem na tela?
- [ ] Formulários viram uma coluna?
- [ ] Tabelas têm scroll?

## 12. Acessibilidade

- [ ] Foco visível existe?
- [ ] Botões têm nome acessível?
- [ ] Inputs têm labels?
- [ ] Contraste é adequado?
- [ ] Não depende só de cor?
- [ ] Tamanho de clique é confortável?
- [ ] Ícones não são ambíguos?

## 13. Priorização de problemas

Classifique cada problema:

- P0: quebra uso, acessibilidade grave ou risco de erro operacional.
- P1: prejudica clareza, velocidade ou confiança.
- P2: melhoria estética ou refinamento.

## 14. Saída esperada da auditoria

O Codex deve responder com:

```text
Resumo geral:
P0:
P1:
P2:
Arquivos prováveis:
Plano de correção:
Riscos:
Validação:
```
