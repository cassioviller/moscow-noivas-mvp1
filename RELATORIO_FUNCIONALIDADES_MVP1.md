# Relatorio de funcionalidades implementadas - Moscow Noivas MVP 1

## Visao geral

O projeto implementa a base operacional do MVP 1 da Moscow Noivas, cobrindo autenticacao, usuarios, regras da loja, CRM, agenda, vestidos, reservas, locacoes, financeiro, caucao, contrato minimo, retirada/devolucao, rastreabilidade, LGPD e dashboard.

Stack atual:

- Backend: Node.js, TypeScript, Express.
- Frontend: React, Vite, TypeScript.
- Banco: PostgreSQL 15+.
- Autenticacao: bcrypt + JWT.
- Migrations/seeds: scripts proprios em TypeScript.

## 1. Base, usuarios e permissoes

Implementado:

- Login com e-mail e senha.
- Hash de senha com bcrypt.
- Sessoes com refresh token salvo como hash.
- Auditoria de tentativas de login.
- Usuarios ativos/inativos.
- Perfis iniciais: Admin, Gerente, Vendedora, Financeiro e Operacional.
- Permissoes por modulo e acao.
- Matriz de permissoes no frontend.
- Validacao de permissoes no backend.

Telas:

- Login.
- Usuarios.
- Perfis e permissoes.

## 2. Regras configuraveis da loja

Implementado:

- Modulos de regras: agenda, atendentes, loja, salas, CRM, clientes, produtos, estoque, vendas, financeiro, caucao/multas, contratos, LGPD, seguranca, arquivos e permissoes.
- Regras com tipo, valor, valor padrao, minimo, maximo, unidade, grupo, sensibilidade e editabilidade.
- Historico de alteracoes de regras.
- Auditoria para alteracao de regras.
- Validacao backend para tipo, intervalo, JSON e motivo em regra sensivel.

Tela:

- Regras da Loja por modulo.

## 3. Funcionarios, atendentes e bloqueios

Implementado:

- Cadastro de funcionarios.
- Marcacao de funcionario como atendente, financeiro ou operacional.
- Capacidade de atendimento.
- Horarios do atendente.
- Bloqueios de atendente.
- Bloqueios da loja que podem afetar agenda.

Telas:

- Funcionarios.
- Horarios do atendente.
- Bloqueios do atendente.
- Bloqueios da loja.

## 4. CRM, noivas, clientes e tarefas

Implementado:

- Atendimento Rapido com nome, telefone, data do evento e interesse.
- Criacao de lead/noiva com nome + telefone.
- Deteccao de duplicidade por telefone.
- Tarefa automatica no Atendimento Rapido.
- Historico e evento outbox ao criar lead.
- Kanban de Noivas.
- Lista de Noivas.
- Clientes.
- Conversao de lead em cliente.
- Tarefas com prazo, prioridade e status.

Telas:

- Atendimento Rapido.
- Kanban de Noivas.
- Lista de Noivas.
- Clientes.
- Tarefas.

## 5. Vestidos, produtos e arquivos

Implementado:

- Categorias de produto.
- Cadastro de vestidos/produtos.
- Grid e tabela de vestidos.
- Produto sem `foto_principal_id`; foto principal via `produto_fotos.is_principal`.
- Constraint para apenas uma foto principal por produto.
- Arquivos com classificacao de dados.
- Bloqueio de extensoes perigosas.
- Validacao de PDF, JPG, PNG e WebP.
- Log de acesso a arquivos.
- Auditoria em acesso/download de arquivo.

Telas:

- Vestidos em grid.
- Tabela alternativa de vestidos.

## 6. Salas, agenda, disponibilidade e reservas

Implementado:

- Salas/cabines com capacidade.
- Agendamentos com `inicio_at` e `fim_at`.
- Validacao `fim_at > inicio_at`.
- Agendamento com lead ou cliente.
- Atendente, sala e vestido vinculados.
- Servico de disponibilidade.
- Endpoint `POST /api/disponibilidade/validar`.
- Verificacao de:
  - periodo valido;
  - bloqueio da loja;
  - sala ativa e capacidade;
  - atendente ativa e sem bloqueio;
  - produto disponivel;
  - reserva conflitante.
- Reservas de estoque com `tstzrange`.
- Constraint PostgreSQL `EXCLUDE USING gist` para impedir reserva sobreposta do mesmo vestido.
- Cancelamento de agendamento liberando reservas.

Telas:

- Agenda.
- Reservas.

## 7. Locacoes

Implementado:

- Locacao com multiplos itens.
- Tipos de item: vestido, veu, acessorio, servico, ajuste e outro.
- Reserva por item locavel.
- Snapshot de regras ao fechar locacao.
- Wizard de nova locacao.
- Detalhe da locacao com abas.
- Troca de item:
  - valida disponibilidade;
  - cancela reserva antiga;
  - cria nova reserva;
  - registra historico;
  - registra auditoria;
  - gera evento outbox.

Telas:

- Locacoes.
- Wizard Nova Locacao.
- Detalhe da Locacao.

## 8. Financeiro e dinheiro a receber

Implementado:

- Contas a receber.
- Sinal como parcela 0.
- Parcelas.
- Pagamentos recebidos.
- Pagamento parcial mantendo saldo.
- Constraints para valores nao negativos.
- Pagamento com valor maior que zero.
- `financeiro_movimentos` para eventos financeiros relevantes.
- Auditoria em pagamento registrado.

Tela:

- Dinheiro a Receber.

## 9. Caucao

Implementado:

- Movimentos de caucao:
  - recebimento;
  - devolucao;
  - retencao;
  - ajuste.
- Caucao nao entra automaticamente como receita.
- Recebimento gera movimento financeiro natureza `caucao`.
- Devolucao gera saida.
- Retencao gera movimento de retencao.
- Auditoria em movimentos de caucao.

Tela:

- Aba Caucao dentro do detalhe da locacao.

## 10. Contrato minimo/manual

Implementado:

- Campos em locacao:
  - contrato manual obrigatorio;
  - contrato assinado;
  - data de assinatura;
  - arquivo do contrato.
- Atualizacao de contrato.
- Auditoria de contrato atualizado/anexado.
- Evento outbox `contrato_anexado`.
- Regra para bloquear retirada sem contrato.

Tela:

- Aba Contrato dentro da locacao.

## 11. Retirada e devolucao

Implementado:

- Validacao de retirada:
  - contrato assinado/anexado, se regra ativa;
  - parcela vencida, se regra ativa;
  - caucao recebida, se regra ativa.
- Pendencias claras para bloqueio.
- Confirmacao de entrega do vestido.
- Checklist de retirada.
- Confirmacao de devolucao.
- Checklist de devolucao.
- Calculo simples de atraso.
- Marcacao de lavanderia e problema/avaria.
- Atualizacao de status da locacao.
- Eventos outbox para retirada e devolucao.

Telas:

- Aba Retirada.
- Aba Devolucao.

## 12. Historico, auditoria e eventos

Implementado:

- Historico de atendimentos.
- Auditoria de acoes criticas.
- Glossario de status.
- Eventos outbox com status, tentativas, idempotencia e lock.
- Webhook endpoints e logs preparados para MVP 2.
- Processamento MVP 1 de outbox sem envio externo.

Telas:

- Historico.
- Auditoria.
- Eventos.

## 13. LGPD

Implementado:

- Consentimentos por finalidade.
- Revogacao de consentimento.
- Evento `consentimento_revogado`.
- Solicitacoes LGPD.
- Politicas de retencao.
- Anonimizacao de lead preservando metricas.
- Log de anonimizacao.
- Auditoria de anonimizacao e consentimentos.

Tela:

- LGPD.

## 14. Dashboard e UI final

Implementado:

- Dashboard por perfil/area:
  - Vendedora;
  - Financeiro;
  - Gerente/Admin.
- Indicadores:
  - agenda de hoje;
  - tarefas atrasadas;
  - leads novos/sem retorno;
  - proximas provas;
  - parcelas vencidas;
  - caucoes em aberto;
  - retiradas/devolucoes proximas;
  - locacoes do mes;
  - conflitos evitados.
- Menu final reorganizado.
- Menu responsivo:
  - recolhido por padrao no desktop;
  - expansivel;
  - tooltips por icone;
  - barra horizontal no mobile.
- Tabelas com rolagem horizontal.
- Layout mais compacto e com maior area util.

## 15. Testes e validacoes

Implementado:

- Testes de regras configuraveis.
- Testes do servico de disponibilidade.
- Testes de validacao de arquivos.
- Typecheck backend e frontend.
- Build frontend.
- Build completo.

Comandos ja validados:

```bash
npm run build
```

```bash
npm test
```

## 16. Observacoes importantes

- O app esta pronto para homologacao funcional do MVP 1.
- As integracoes reais com WhatsApp, n8n e IA ainda nao foram implementadas; o MVP 1 apenas gera eventos outbox para preparar esse futuro.
- Upload real de arquivo para S3/R2/MinIO ainda precisa ser conectado a um storage externo.
- O controle de disponibilidade ja possui validacao backend e constraint forte no banco para reservas de vestido.
- A UI esta funcional, mas pode evoluir com componentes mais ricos, filtros avancados e fluxos multi-etapa mais completos.
