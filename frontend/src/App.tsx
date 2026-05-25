import { Banknote, CalendarDays, CalendarX, ChevronsLeft, ChevronsRight, Clock, Database, HeartHandshake, Home, LayoutGrid, ListChecks, LogOut, Receipt, ScrollText, Settings, ShieldAlert, ShieldCheck, Shirt, Store, UserCog, UserRoundPlus, Users, Workflow } from 'lucide-react';
import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import type { Session } from './api';
import { AgendaPage } from './pages/AgendaPage';
import { CrmPage } from './pages/CrmPage';
import { DashboardPage } from './pages/DashboardPage';
import { LgpdPage } from './pages/LgpdPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { RentalsPage } from './pages/RentalsPage';
import { RulesPage } from './pages/RulesPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { UsersPage } from './pages/UsersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { SettingsPage } from './pages/SettingsPage';

type PageKey =
  | 'quick'
  | 'dashboard'
  | 'kanban'
  | 'leads'
  | 'clients'
  | 'tasks'
  | 'products'
  | 'agenda'
  | 'reservations'
  | 'rentals'
  | 'receivables'
  | 'history'
  | 'audit'
  | 'lgpd'
  | 'outbox'
  | 'usuarios'
  | 'permissoes'
  | 'regras'
  | 'cadastros'
  | 'funcionarios'
  | 'horarios'
  | 'bloqueios-atendente'
  | 'bloqueios-loja';

const navItems: Array<{ key: PageKey; label: string; icon: ElementType; group: string }> = [
  { key: 'dashboard', label: 'Início', icon: Home, group: 'Rotina' },
  { key: 'quick', label: 'Atendimento Rápido', icon: HeartHandshake, group: 'Rotina' },
  { key: 'kanban', label: 'Noivas', icon: LayoutGrid, group: 'Rotina' },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays, group: 'Rotina' },
  { key: 'products', label: 'Vestidos', icon: Shirt, group: 'Operação' },
  { key: 'rentals', label: 'Locações', icon: Receipt, group: 'Operação' },
  { key: 'receivables', label: 'Dinheiro a receber', icon: Banknote, group: 'Operação' },
  { key: 'tasks', label: 'Tarefas', icon: ListChecks, group: 'Operação' },
  { key: 'clients', label: 'Clientes', icon: Users, group: 'Operação' },
  { key: 'regras', label: 'Regras da loja', icon: Settings, group: 'Gestão' },
  { key: 'cadastros', label: 'Cadastros', icon: Database, group: 'Gestão' },
  { key: 'usuarios', label: 'Usuários', icon: UserRoundPlus, group: 'Gestão' },
  { key: 'history', label: 'Histórico', icon: ScrollText, group: 'Gestão' },
  { key: 'audit', label: 'Auditoria', icon: ShieldAlert, group: 'Gestão' },
  { key: 'lgpd', label: 'LGPD', icon: ShieldCheck, group: 'Gestão' },
  { key: 'outbox', label: 'Eventos', icon: Workflow, group: 'Gestão' },
  { key: 'leads', label: 'Lista de Noivas', icon: UserRoundPlus, group: 'Apoio' },
  { key: 'reservations', label: 'Reservas', icon: CalendarX, group: 'Apoio' },
  { key: 'permissoes', label: 'Perfis e permissões', icon: ShieldCheck, group: 'Apoio' },
  { key: 'funcionarios', label: 'Funcionários', icon: UserCog, group: 'Apoio' },
  { key: 'horarios', label: 'Horários do atendente', icon: Clock, group: 'Apoio' },
  { key: 'bloqueios-atendente', label: 'Bloqueios do atendente', icon: CalendarX, group: 'Apoio' },
  { key: 'bloqueios-loja', label: 'Bloqueios da loja', icon: Store, group: 'Apoio' }
];

const pageContext: Record<PageKey, string> = {
  quick: 'Entrada rápida para novos contatos e próximas ações.',
  dashboard: 'Central do dia com agenda, pendências e financeiro.',
  kanban: 'Funil comercial das noivas em atendimento.',
  leads: 'Lista completa de interessadas antes da conversão.',
  clients: 'Clientes convertidas para locações e acompanhamento.',
  tasks: 'Retornos, prioridades e prazos da equipe.',
  products: 'Vestidos, categorias, status e ações principais.',
  agenda: 'Provas, cabines, vendedoras e vestidos por horário.',
  reservations: 'Reservas que bloqueiam disponibilidade de vestidos.',
  rentals: 'Contratos, itens, retirada, devolução e caução.',
  receivables: 'Parcelas, vencimentos, saldos e pagamentos.',
  history: 'Histórico operacional dos atendimentos e locações.',
  audit: 'Rastreabilidade de ações sensíveis no sistema.',
  lgpd: 'Consentimentos, solicitações e retenção de dados.',
  outbox: 'Eventos internos aguardando processamento.',
  usuarios: 'Acessos, usuários ativos e segurança da loja.',
  permissoes: 'Perfis e permissões por módulo.',
  regras: 'Configurações e regras operacionais da loja.',
  cadastros: 'Opções editáveis usadas em campos de dropdown.',
  funcionarios: 'Equipe, atendentes e papéis operacionais.',
  horarios: 'Janelas de atendimento por vendedora.',
  'bloqueios-atendente': 'Indisponibilidades específicas da equipe.',
  'bloqueios-loja': 'Bloqueios gerais da loja e agenda.'
};

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [page, setPage] = useState<PageKey>('dashboard');
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) setSession(JSON.parse(stored));
  }, []);

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  const groups = Array.from(new Set(navItems.map((item) => item.group)));

  return (
    <div className={`shell ${menuCollapsed ? 'nav-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">MN</span>
          <div>
            <strong>Moscow Noivas</strong>
            <small>Gestão da loja</small>
          </div>
          <button
            className="collapse-button"
            aria-label={menuCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={menuCollapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={() => {
              const next = !menuCollapsed;
              setMenuCollapsed(next);
              localStorage.setItem('menuCollapsed', String(next));
            }}
          >
            {menuCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>
        </div>

        <nav aria-label="Navegação principal">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <span className="nav-group-title">{group}</span>
              {navItems.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={page === item.key ? 'active' : ''}
                    key={item.key}
                    aria-current={page === item.key ? 'page' : undefined}
                    title={item.label}
                    onClick={() => setPage(item.key)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">Base MVP 1</span>
            <h1>{navItems.find((item) => item.key === page)?.label}</h1>
            <p>{pageContext[page]}</p>
          </div>
          <div className="user-box">
            <span>{session.user.nome}</span>
            <button
              className="icon-button"
              aria-label="Sair"
              title="Sair"
              onClick={() => {
                localStorage.clear();
                setSession(null);
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        {page === 'quick' && <CrmPage mode="quick" />}
        {page === 'kanban' && <CrmPage mode="kanban" />}
        {page === 'leads' && <CrmPage mode="leads" />}
        {page === 'clients' && <CrmPage mode="clients" />}
        {page === 'tasks' && <CrmPage mode="tasks" />}
        {page === 'products' && <ProductsPage />}
        {page === 'agenda' && <AgendaPage mode="agenda" />}
        {page === 'reservations' && <AgendaPage mode="reservations" />}
        {page === 'rentals' && <RentalsPage mode="rentals" />}
        {page === 'receivables' && <RentalsPage mode="receivables" />}
        {page === 'history' && <TraceabilityPage mode="history" />}
        {page === 'audit' && <TraceabilityPage mode="audit" />}
        {page === 'lgpd' && <LgpdPage />}
        {page === 'outbox' && <TraceabilityPage mode="outbox" />}
        {page === 'usuarios' && <UsersPage mode="users" />}
        {page === 'permissoes' && <UsersPage mode="permissions" />}
        {page === 'regras' && <RulesPage />}
        {page === 'cadastros' && <SettingsPage />}
        {page === 'funcionarios' && <EmployeesPage mode="employees" />}
        {page === 'horarios' && <EmployeesPage mode="schedules" />}
        {page === 'bloqueios-atendente' && <EmployeesPage mode="attendantBlocks" />}
        {page === 'bloqueios-loja' && <EmployeesPage mode="storeBlocks" />}
      </main>
    </div>
  );
}
