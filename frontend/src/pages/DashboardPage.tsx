import { AlertTriangle, Banknote, CalendarDays, CheckCircle2, HeartHandshake, Receipt, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { api } from '../api';

type DashboardPageKey = 'quick' | 'agenda' | 'receivables';

export function DashboardPage({ onNavigate }: { onNavigate?: (page: DashboardPageKey) => void }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard').then(setData).catch((err) => {
      console.error(err);
      setError(err.message || 'Nao foi possivel carregar o dashboard.');
    });
  }, []);

  if (error) {
    return (
      <section className="panel empty-state">
        <AlertTriangle size={28} />
        <h2>Sessao precisa ser renovada</h2>
        <p>{error}. Entre novamente para atualizar as permissoes da demo.</p>
        <button
          className="primary"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Renovar acesso
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="dashboard">
        <section className="dashboard-hero">
          <div>
            <span className="eyebrow">Preparando a rotina</span>
            <h2>Carregando a central do dia</h2>
            <p>Buscando agenda, pendências, noivas em andamento e financeiro.</p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card"><span>Agenda</span><strong>...</strong></div>
            <div className="metric-card"><span>Noivas</span><strong>...</strong></div>
            <div className="metric-card"><span>Financeiro</span><strong>...</strong></div>
          </div>
        </section>
      </section>
    );
  }

  const critical = data.gerente.pendencias_criticas + data.financeiro.caucoes_em_aberto;

  return (
    <section className="dashboard">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Moscow Noivas MVP 1</span>
          <h2>Rotina da loja organizada para hoje</h2>
          <p>Atendimentos, provas, locações, dinheiro a receber e pendências críticas em uma visão única para demonstração.</p>
          <div className="dashboard-actions">
            <button className="primary" onClick={() => onNavigate?.('agenda')}><CalendarDays size={16} /> Abrir agenda</button>
            <button className="secondary text-button" onClick={() => onNavigate?.('quick')}><HeartHandshake size={16} /> Novo atendimento</button>
            <button className="secondary text-button" onClick={() => onNavigate?.('receivables')}><Banknote size={16} /> Ver financeiro</button>
          </div>
        </div>
        <div className="hero-metrics">
          <MetricCard label="Agenda hoje" value={data.gerente.agendamentos_hoje} icon={CalendarDays} tone="primary" />
          <MetricCard label="Locações mês" value={data.gerente.locacoes_mes} icon={Receipt} tone="soft" />
          <MetricCard label="Pendências" value={critical} icon={AlertTriangle} tone={critical > 0 ? 'warn' : 'ok'} />
        </div>
      </section>

      <section className="operations-strip" aria-label="Indicadores operacionais">
        <CompactSignal label="Leads novos" value={data.gerente.leads_novos} icon={<HeartHandshake size={18} />} />
        <CompactSignal label="Próximas provas" value={data.vendedora.proximas_provas} icon={<CheckCircle2 size={18} />} />
        <CompactSignal label="Parcelas vencidas" value={data.financeiro.parcelas_vencidas} icon={<Banknote size={18} />} tone={data.financeiro.parcelas_vencidas > 0 ? 'warn' : 'ok'} />
        <CompactSignal label="Cauções abertas" value={data.financeiro.caucoes_em_aberto} icon={<Banknote size={18} />} tone={data.financeiro.caucoes_em_aberto > 0 ? 'warn' : 'ok'} />
        <CompactSignal label="Retiradas próximas" value={data.financeiro.retiradas_proximas} icon={<Receipt size={18} />} />
        <CompactSignal label="Conflitos evitados" value={data.gerente.conflitos_evitados} icon={<Sparkles size={18} />} />
      </section>

      <section className="dashboard-columns">
        <DashboardList
          title="Agenda de hoje"
          subtitle="Provas e atendimentos do dia"
          empty="Nenhum atendimento marcado para hoje."
          rows={data.listas.agenda_hoje}
          render={(row) => (
            <>
              <strong>{time(row.inicio_at)} · {row.pessoa_nome}</strong>
              <span>{label(row.tipo)} com {row.atendente_nome || 'atendente a definir'} · {row.sala_nome || 'sem cabine'}</span>
              <small>{row.vestido_nome || 'Sem vestido definido'} · {label(row.status)}</small>
            </>
          )}
        />
        <DashboardList
          title="Pendências comerciais"
          subtitle="Tarefas e retornos importantes"
          empty="Nenhuma tarefa pendente."
          rows={data.listas.tarefas}
          render={(row) => (
            <>
              <strong>{row.titulo}</strong>
              <span>{row.pessoa_nome || 'Sem vínculo'} · prioridade {label(row.prioridade)}</span>
              <small>{row.data_limite ? dateTime(row.data_limite) : 'Sem prazo'}</small>
            </>
          )}
        />
      </section>

      <section className="dashboard-columns">
        <DashboardList
          title="Noivas em andamento"
          subtitle="Leads para demonstrar o funil"
          empty="Nenhuma noiva cadastrada ainda. Comece pelo Atendimento Rápido."
          rows={data.listas.noivas}
          render={(row) => (
            <>
              <strong>{row.nome}</strong>
              <span>{row.telefone} · {label(row.status)}</span>
              <small>{row.interesse || 'Interesse não informado'} · evento {date(row.data_evento)}</small>
            </>
          )}
        />
        <DashboardList
          title="Dinheiro a receber"
          subtitle="Parcelas abertas e vencidas"
          empty="Tudo em dia por aqui."
          rows={data.listas.financeiro}
          render={(row) => (
            <>
              <strong>{row.cliente_nome} · R$ {money(row.valor_saldo)}</strong>
              <span>{label(row.tipo)} {row.parcela_numero} · {label(row.status)}</span>
              <small>Vencimento {date(row.vencimento)}</small>
            </>
          )}
        />
      </section>

      <section className="dashboard-columns">
        <DashboardList
          title="Retiradas e devoluções próximas"
          subtitle="Operação dos próximos dias"
          empty="Nenhuma retirada ou devolução próxima."
          rows={data.listas.proximas_entregas}
          render={(row) => (
            <>
              <strong>{row.cliente_nome}</strong>
              <span>{label(row.status)} · R$ {money(row.valor_total)}</span>
              <small>Retirada {date(row.data_retirada_prevista)} · Devolução {date(row.data_devolucao_prevista)}</small>
            </>
          )}
        />
        <DashboardList
          title="Locações recentes"
          subtitle="Contratos para apresentar no protótipo"
          empty="Nenhuma locação criada ainda."
          rows={data.listas.locacoes}
          render={(row) => (
            <>
              <strong>{row.cliente_nome}</strong>
              <span>{label(row.status)} · R$ {money(row.valor_total)}</span>
              <small>Evento {date(row.data_evento)} · Caução R$ {money(row.valor_caucao)}</small>
            </>
          )}
        />
      </section>
    </section>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone?: 'primary' | 'soft' | 'warn' | 'ok' }) {
  return (
    <article className={`metric-card ${tone ? `metric-${tone}` : ''}`}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function CompactSignal({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone?: 'warn' | 'ok' }) {
  return (
    <article className={`compact-signal ${tone ? `compact-${tone}` : ''}`}>
      <span className="compact-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DashboardList({ title, subtitle, rows, render, empty }: { title: string; subtitle: string; rows: any[]; render: (row: any) => ReactNode; empty: string }) {
  return (
    <section className="panel dashboard-list">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {rows.length === 0 ? <div className="empty compact">{empty}</div> : (
        <div className="stack">
          {rows.map((row) => <article className="mini-card dashboard-row" key={row.id}>{render(row)}</article>)}
        </div>
      )}
    </section>
  );
}

function label(value: string) {
  return String(value || '').replaceAll('_', ' ');
}

function money(value: string | number) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function date(value?: string) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '-';
}

function dateTime(value?: string) {
  return value ? new Date(value).toLocaleString('pt-BR') : '-';
}

function time(value?: string) {
  return value ? new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
}
