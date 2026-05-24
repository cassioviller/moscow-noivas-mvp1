# QA_CHECKLIST.md — Checklist de validação

Use antes de entregar alterações feitas pelo Codex.

## 1. Comandos

```bash
npm run build
npm test
```

Opcional, se ambiente estiver pronto:

```bash
npm run test:e2e
```

## 2. Verificação funcional

- [ ] Login continua funcionando.
- [ ] Sessão continua funcionando.
- [ ] Logout continua funcionando.
- [ ] Menu navega entre todas as páginas.
- [ ] Dashboard carrega dados.
- [ ] Atendimento rápido continua funcionando.
- [ ] CRM/noivas continua funcionando.
- [ ] Clientes continuam funcionando.
- [ ] Tarefas continuam funcionando.
- [ ] Produtos continuam funcionando.
- [ ] Agenda continua funcionando.
- [ ] Reservas continuam funcionando.
- [ ] Locações continuam funcionando.
- [ ] Contas a receber continuam funcionando.
- [ ] Usuários/permissões continuam funcionando.
- [ ] Regras da loja continuam funcionando.
- [ ] Funcionários/horários/bloqueios continuam funcionando.
- [ ] Auditoria/histórico/LGPD/outbox continuam funcionando.

## 3. Verificação visual

- [ ] Design parece Moscow Noivas.
- [ ] Não parece SaaS genérico.
- [ ] Paleta está consistente.
- [ ] Cards têm boa hierarquia.
- [ ] Tabelas estão legíveis.
- [ ] Formulários estão claros.
- [ ] Badges comunicam status.
- [ ] Botões principais são claros.
- [ ] Ícones não estão ambíguos.
- [ ] Estados vazios são úteis.
- [ ] Erros são claros.
- [ ] Loading não parece quebrado.

## 4. Responsividade

Testar larguras:

- [ ] 1440px
- [ ] 1366px
- [ ] 1100px
- [ ] 820px
- [ ] 640px
- [ ] 390px

Verificar:

- [ ] sidebar;
- [ ] topbar;
- [ ] cards;
- [ ] tabelas;
- [ ] formulários;
- [ ] modais;
- [ ] dashboard;
- [ ] agenda;
- [ ] grid de produtos.

## 5. Acessibilidade

- [ ] `Tab` navega pelos elementos.
- [ ] Foco visível aparece.
- [ ] Inputs têm label.
- [ ] Botões só com ícone têm `aria-label`.
- [ ] Contraste é suficiente.
- [ ] Status não dependem só de cor.
- [ ] Textos são legíveis.
- [ ] Áreas clicáveis são confortáveis.

## 6. Regressão técnica

- [ ] Sem erros no console.
- [ ] Sem warnings graves.
- [ ] Sem erro TypeScript.
- [ ] Sem build quebrado.
- [ ] Sem rota quebrada.
- [ ] Sem import não usado relevante.
- [ ] Sem dependência nova desnecessária.
- [ ] Sem alteração indevida de backend.

## 7. Entrega final do Codex

O resumo final deve conter:

```text
Arquivos alterados:
Melhorias feitas:
Validações:
Problemas encontrados:
Limitações:
Próximos passos:
```
