# DESIGN.md — Design System do Moscow Noivas

> Arquivo visual para Codex, Impeccable e outros agentes.
> Responde: como a interface deve parecer e se comportar.

## 1. Norte visual

Atelier premium com rotina operacional clara.

A UI deve equilibrar:

- elegância de boutique;
- clareza de painel operacional;
- delicadeza de marca bridal;
- confiança financeira;
- velocidade de atendimento.

Não é um dashboard genérico.
Não é um ERP antigo.
Não é uma landing page.

## 2. Direção estética

A aparência deve lembrar:

- papelaria premium;
- tons de blush, champagne, ivory e vinho queimado;
- superfícies claras;
- sombras suaves;
- cantos levemente arredondados;
- composição limpa;
- detalhes delicados, não decorativos demais.

## 3. Tokens recomendados

Centralize tokens em CSS, preferencialmente no início de `frontend/src/styles/app.css` ou em arquivo dedicado.

```css
:root {
  --sidebar-width: 248px;
  --sidebar-collapsed-width: 76px;

  --color-bg: #f7f1ed;
  --color-bg-soft: #fbf7f3;
  --color-surface: #fffdfb;
  --color-surface-elevated: #ffffff;
  --color-line: #eadfd8;
  --color-line-strong: #dccbc3;

  --color-text: #2f2830;
  --color-muted: #746a70;
  --color-muted-soft: #9b8d96;

  --color-primary: #9b435d;
  --color-primary-strong: #7f3249;
  --color-primary-soft: #f4d9df;
  --color-primary-subtle: #fff1f4;

  --color-blush: #e9b8c2;
  --color-champagne: #f4e5d8;
  --color-ivory: #fffaf6;
  --color-sage: #dfeae3;

  --color-success: #1b6b4a;
  --color-success-bg: #e7f6ee;
  --color-warning: #9a6518;
  --color-warning-bg: #fff3d8;
  --color-danger: #a3292d;
  --color-danger-bg: #ffe8e8;
  --color-info: #415b79;
  --color-info-bg: #e7edf5;

  --font-sans: Aptos, "Segoe UI Variable", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
  --font-brand: Georgia, "Times New Roman", serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --text-2xl: 1.75rem;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  --shadow-sm: 0 8px 24px rgba(68, 47, 38, 0.055);
  --shadow-md: 0 16px 42px rgba(68, 47, 38, 0.10);
  --shadow-lg: 0 24px 80px rgba(32, 24, 26, 0.18);

  --transition-fast: 140ms ease;
  --transition-base: 200ms ease;
}
```

## 4. Tipografia

Use fonte sans-serif limpa para tudo que for operacional.

- Labels: 12px a 14px.
- Corpo: 14px a 16px.
- Títulos de seção: 18px a 22px.
- Título principal: 24px a 30px.

Use serifada apenas para:

- logo;
- marca "MN";
- detalhes especiais do dashboard;
- títulos pontuais de maior impacto.

Não use serifada em tabelas, formulários ou texto operacional longo.

## 5. Layout principal

### Sidebar

A sidebar deve:

- organizar módulos por prioridade;
- destacar módulos centrais;
- ter boa leitura no estado aberto;
- manter usabilidade no estado colapsado;
- ter `title` ou `aria-label` quando mostrar só ícone;
- não parecer menu técnico demais.

Módulos prioritários:

1. Início
2. Atendimento Rápido
3. Noivas
4. Agenda
5. Vestidos
6. Locações
7. Dinheiro a receber

### Topbar

A topbar deve:

- mostrar o nome da tela atual;
- ter subtítulo ou contexto quando útil;
- manter usuário e saída discretos;
- não ocupar espaço excessivo.

## 6. Componentes

### Cards

Use cards para informações agrupadas.

Regras:

- borda suave;
- sombra leve;
- título claro;
- conteúdo escaneável;
- ação evidente quando houver.

Evite cards dentro de cards sem necessidade.

### Metric cards

Métricas devem ter:

- label curta;
- número forte;
- ícone discreto;
- variação de status quando necessário;
- comparação ou contexto se disponível.

### Badges

Badges devem comunicar status com texto e cor.

Exemplos:

- novo;
- em atendimento;
- agendado;
- reservado;
- vencido;
- pago;
- cancelado;
- retirado;
- devolvido.

### Botões

Padrões:

- `.primary`: ação principal;
- `.secondary`: ação secundária;
- `.ghost`: ação leve;
- `.danger`: ação destrutiva;
- `.icon-button`: apenas quando o ícone for óbvio ou tiver `aria-label`.

### Formulários

Formulários devem:

- ter labels visíveis;
- agrupar campos relacionados;
- evitar campos longos sem necessidade;
- exibir erros perto do campo;
- ter estado disabled/loading;
- ter botões claros no final.

### Tabelas

Use tabelas para dados densos.

Regras:

- cabeçalho bem destacado;
- linhas com bom espaçamento;
- status em badge;
- ações claras;
- scroll horizontal controlado;
- não esconder dados essenciais.

## 7. Páginas principais

### Dashboard

Deve parecer uma central do dia.

Ordem recomendada:

1. Resumo da rotina de hoje.
2. Agenda de hoje.
3. Pendências críticas.
4. Noivas em andamento.
5. Dinheiro a receber.
6. Retiradas/devoluções próximas.
7. Métricas secundárias.

A primeira dobra deve responder:
"O que eu preciso olhar agora?"

### Atendimento rápido

Deve ser simples e rápido.

Priorize:

- nome;
- telefone;
- data do evento;
- interesse;
- origem;
- próxima ação.

### Noivas / CRM

Cards de noiva devem mostrar:

- nome;
- telefone;
- status;
- data do evento;
- interesse;
- próxima tarefa;
- responsável.

### Produtos / Vestidos

Cards de vestido devem mostrar:

- foto;
- nome;
- categoria;
- status;
- preço;
- ações principais.

### Agenda

Cards de agenda devem mostrar:

- horário;
- cliente/noiva;
- tipo de atendimento;
- atendente;
- sala/cabine;
- vestido;
- status;
- alerta de conflito se houver.

### Locações

Locação deve transmitir segurança.

Mostrar:

- cliente;
- status;
- data do evento;
- retirada;
- devolução;
- valor total;
- parcelas;
- caução;
- checklist.

## 8. Estados obrigatórios

### Loading

Evite apenas "Carregando...".

Prefira:

- skeleton;
- card placeholder;
- texto humano.

Exemplo:
"Carregando a rotina da loja..."

### Empty state

Todo estado vazio deve explicar:

1. o que está vazio;
2. por que importa;
3. qual ação fazer.

Exemplo:
"Nenhuma noiva cadastrada ainda. Comece pelo Atendimento Rápido para registrar o primeiro contato."

### Erro

Erro deve ter:

- mensagem clara;
- possível causa;
- ação de recuperação.

Exemplo:
"Não foi possível carregar a agenda. Tente novamente ou renove o acesso."

### Sucesso

Sucesso deve ser discreto e objetivo.

Exemplo:
"Reserva criada com sucesso."

## 9. Acessibilidade

Obrigatório:

- contraste adequado;
- foco visível;
- navegação por teclado;
- labels em inputs;
- aria-label em botões só com ícone;
- não depender só de cor;
- textos legíveis;
- áreas clicáveis confortáveis.

CSS obrigatório:

```css
:focus-visible {
  outline: 3px solid rgba(155, 67, 93, 0.32);
  outline-offset: 3px;
}
```

## 10. Responsividade

Breakpoints recomendados:

```css
@media (max-width: 1100px) {}
@media (max-width: 820px) {}
@media (max-width: 640px) {}
```

Comportamentos esperados:

- grids viram uma coluna;
- sidebar vira drawer ou colapsa;
- topbar reorganiza;
- tabelas têm scroll;
- formulários ficam em uma coluna;
- modais ocupam largura segura.

## 11. Do / Don’t

### Do

- Use tokens.
- Crie hierarquia.
- Dê contexto aos números.
- Mostre ações principais.
- Crie estados reais.
- Faça responsivo.
- Preserve dados operacionais.

### Don’t

- Não use gradiente roxo/azul genérico.
- Não crie cards infinitos.
- Não use tabela para tudo.
- Não esconda ações importantes.
- Não use ícone sem texto em ação ambígua.
- Não reinvente a identidade a cada tela.
- Não sacrifique clareza por estética.

## 12. Critério final

A interface deve parecer:

> Moscow Noivas: uma loja de noivas elegante, organizada e pronta para operar.

Não deve parecer:

> Template SaaS genérico gerado por IA.
