import { expect, test, type Page } from '@playwright/test';

const admin = {
  email: 'admin@moscownoivas.local',
  password: 'Admin@123456'
};

const modules = [
  { nav: 'Inicio', heading: 'Inicio' },
  { nav: 'Atendimento Rapido', heading: 'Atendimento Rapido' },
  { nav: 'Noivas', heading: 'Noivas' },
  { nav: 'Agenda', heading: 'Agenda' },
  { nav: 'Vestidos', heading: 'Vestidos' },
  { nav: 'Locacoes', heading: 'Locacoes' },
  { nav: 'Dinheiro a receber', heading: 'Dinheiro a receber' },
  { nav: 'Tarefas', heading: 'Tarefas' },
  { nav: 'Clientes', heading: 'Clientes' },
  { nav: 'Regras da loja', heading: 'Regras da loja' },
  { nav: 'Usuarios', heading: 'Usuarios' },
  { nav: 'Historico', heading: 'Historico' },
  { nav: 'Auditoria', heading: 'Auditoria' },
  { nav: 'LGPD', heading: 'LGPD' },
  { nav: 'Eventos', heading: 'Eventos' },
  { nav: 'Lista de Noivas', heading: 'Lista de Noivas' },
  { nav: 'Reservas', heading: 'Reservas' },
  { nav: 'Perfis e permissoes', heading: 'Perfis e permissoes' },
  { nav: 'Funcionarios', heading: 'Funcionarios' },
  { nav: 'Horarios do atendente', heading: 'Horarios do atendente' },
  { nav: 'Bloqueios do atendente', heading: 'Bloqueios do atendente' },
  { nav: 'Bloqueios da loja', heading: 'Bloqueios da loja' }
];

test.describe('Moscow Noivas demo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('faz login e mostra o dashboard com dados de apresentacao', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Inicio|Início/ })).toBeVisible();
    await expect(page.getByText('Rotina da loja organizada para hoje')).toBeVisible();
    await expect(page.getByText('Agenda hoje')).toBeVisible();
    await expect(page.getByText('Locacoes mes').or(page.getByText('Locações mês'))).toBeVisible();
    await expect(page.getByText('Ana Paula Martins').first()).toBeVisible();
    await expect(page.getByText('Bruna Ribeiro').first()).toBeVisible();
    await expect(page.getByText('Livia Campos').or(page.getByText('Lívia Campos')).first()).toBeVisible();
    await expect(page.getByText('Marina Lopes').first()).toBeVisible();
  });

  test('abre detalhes da noiva e altera status do funil', async ({ page }) => {
    await openModule(page, 'Lista de Noivas');
    await page.getByRole('row', { name: /Ana Paula Martins/ }).getByRole('button', { name: 'Ver detalhes' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ana Paula Martins' })).toBeVisible();
    await page.getByLabel('Status do funil').selectOption('em_contato');
    await expect(page.getByText('Status alterado para em contato')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('move uma noiva no kanban por drag and drop', async ({ page }) => {
    await openModule(page, 'Noivas');
    const source = page.locator('.lead-card').filter({ hasText: 'Bruna Ribeiro' }).first();
    const target = page.locator('.kanban-column').filter({ hasText: 'em negociacao' }).first();
    await expect(source).toBeVisible();
    await source.dragTo(target);
    await expect(page.getByText('Noiva movida para em negociacao')).toBeVisible();
    await expect(target.getByText('Bruna Ribeiro')).toBeVisible();
  });

  test('abre detalhes de um vestido', async ({ page }) => {
    await openModule(page, 'Vestidos');
    await page.locator('.product-card').first().getByTitle('Ver').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Reservas e bloqueios')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar' }).click();
  });

  test('confirma comparecimento na agenda', async ({ page }) => {
    await openModule(page, 'Agenda');
    const card = page.locator('.agenda-card').filter({ hasText: 'Ana Paula Martins' }).first();
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Compareceu' }).click();
    await expect(page.getByText('Agendamento atualizado para compareceu.')).toBeVisible();
    await expect(card.locator('.badge', { hasText: 'compareceu' })).toBeVisible();
  });

  for (const module of modules) {
    test(`abre o modulo ${module.nav}`, async ({ page }) => {
      await openModule(page, module.nav);
      await expect(page.getByRole('heading', { name: accentInsensitive(module.heading), level: 1 })).toBeVisible();
      await expect(page.locator('main').getByText(/Sessao precisa ser renovada|Sessão precisa ser renovada/)).toHaveCount(0);
      await expect(page.locator('main').getByText(/Nao conseguimos|Não conseguimos|Erro inesperado/)).toHaveCount(0);
    });
  }
});

async function login(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel('E-mail').fill(admin.email);
  await page.getByLabel('Senha').fill(admin.password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Admin Moscow Noivas')).toBeVisible();
  await expect(page.getByRole('button', { name: /Sair/ })).toBeVisible();
}

async function openModule(page: Page, name: string) {
  const navButton = page.getByRole('button', { name: accentInsensitive(name) }).first();
  await expect(navButton).toBeVisible();
  await navButton.click();
}

function accentInsensitive(text: string) {
  const chars: Record<string, string> = {
    a: '[aáàâã]',
    A: '[AÁÀÂÃ]',
    e: '[eéê]',
    E: '[EÉÊ]',
    i: '[ií]',
    I: '[IÍ]',
    o: '[oóôõ]',
    O: '[OÓÔÕ]',
    u: '[uú]',
    U: '[UÚ]',
    c: '[cç]',
    C: '[CÇ]'
  };

  const pattern = text
    .split('')
    .map((char) => chars[char] ?? escapeRegExp(char))
    .join('');

  return new RegExp(`^${pattern}$`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
