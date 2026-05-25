import { CheckCircle2, ListChecks, Plus, Search, UserRoundPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  data_evento?: string;
  interesse?: string;
  status: string;
  responsavel_nome?: string;
};

type Client = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  data_evento?: string;
};

type Task = {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  data_limite?: string;
  lead_nome?: string;
  cliente_nome?: string;
};

type CadastroOpcao = {
  id: string;
  modulo: string;
  campo: string;
  valor: string;
  rotulo: string;
  ordem: number;
  ativo: boolean;
};

const funnelStatuses = ['novo', 'em_contato', 'prova_marcada', 'compareceu', 'em_negociacao', 'sem_retorno', 'fechado', 'perdido'];

export function CrmPage({ mode }: { mode: 'quick' | 'kanban' | 'leads' | 'clients' | 'tasks' }) {
  if (mode === 'quick') return <QuickLead />;
  if (mode === 'kanban') return <LeadKanban />;
  if (mode === 'clients') return <Clients />;
  if (mode === 'tasks') return <Tasks />;
  return <LeadList />;
}

function QuickLead() {
  const [message, setMessage] = useState('');
  const [duplicates, setDuplicates] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [interestOptions, setInterestOptions] = useState<CadastroOpcao[]>([]);

  useEffect(() => {
    api<CadastroOpcao[]>('/settings/options?modulo=crm&campo=interesse').then(setInterestOptions).catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const marcarProva = submitter?.value === 'marcar_prova';
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ id: string; duplicados: Lead[] }>('/crm/quick-leads', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.get('nome'),
          telefone: form.get('telefone'),
          data_evento: form.get('data_evento') || null,
          interesse: form.get('interesse') || null,
          criar_tarefa: true
        })
      });
      setDuplicates(result.duplicados);
      setMessage(marcarProva ? 'Noiva cadastrada. Abra a Agenda para marcar a prova.' : 'Noiva cadastrada com sucesso.');
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel salvar.');
    }
  }

  return (
    <section className="quick-layout">
      <form className="panel quick-card" onSubmit={submit}>
        <div className="section-title">
          <div>
            <h2>Atendimento Rapido</h2>
            <p>Cadastre uma nova noiva em poucos segundos.</p>
          </div>
          <UserRoundPlus size={24} />
        </div>
        <label>Nome<input name="nome" required /></label>
        <label>Telefone<input name="telefone" required /></label>
        <label>Data do casamento/evento<input name="data_evento" type="date" /></label>
        <label>Interesse
          <select name="interesse">
            <option value="">Selecione</option>
            {interestOptions.filter((option) => option.ativo).map((option) => (
              <option key={option.id} value={option.rotulo}>{option.rotulo}</option>
            ))}
          </select>
        </label>
        {error && <div className="alert warning">{error}</div>}
        {message && <div className="alert success-box">{message}</div>}
        {duplicates.length > 0 && (
          <div className="alert warning">
            Ja encontramos uma noiva com este telefone.
            {duplicates.map((lead) => <strong key={lead.id}>{lead.nome} · {lead.status}</strong>)}
          </div>
        )}
        <div className="actions split">
          <button className="primary" type="submit" name="acao" value="voltar"><CheckCircle2 size={18} /> Salvar e voltar</button>
          <button className="secondary text-button" type="submit" name="acao" value="marcar_prova">Salvar e marcar prova</button>
        </div>
      </form>
    </section>
  );
}

function LeadKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setLeads(await api<Lead[]>('/crm/leads'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar as noivas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function moveLead(id: string, status: string) {
    const previous = leads;
    setMessage('');
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
    try {
      await api(`/crm/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setMessage(`Noiva movida para ${status.replaceAll('_', ' ')}.`);
      load();
    } catch (err) {
      setLeads(previous);
      setMessage(err instanceof Error ? err.message : 'Nao foi possivel mover a noiva.');
    }
  }

  return (
    <>
      {message && <div className="alert success-box">{message}</div>}
      {error && <div className="alert error">Nao foi possivel carregar o funil. {error}</div>}
      {loading && <div className="panel loading-state">Carregando noivas e etapas do funil...</div>}
      <section className="kanban">
        {funnelStatuses.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column);
          return (
            <div
              className="kanban-column"
              key={column}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData('text/plain');
                if (id) moveLead(id, column);
              }}
            >
              <h2>{column.replaceAll('_', ' ')}</h2>
              {columnLeads.map((lead) => (
                <article
                  className="lead-card"
                  draggable
                  key={lead.id}
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', lead.id)}
                >
                  <strong>{lead.nome}</strong>
                  <span>{lead.telefone}</span>
                  <small>{lead.interesse || 'Sem interesse informado'} · evento {formatDate(lead.data_evento)}</small>
                  <span className="badge muted">{labelText(lead.status)}</span>
                  <div className="actions">
                    <button className="secondary text-button" onClick={() => setSelected(lead.id)}>Ver detalhes</button>
                  </div>
                </article>
              ))}
              {columnLeads.length === 0 && <div className="empty compact">Solte uma noiva aqui.</div>}
            </div>
          );
        })}
      </section>
      {selected && <LeadDetail leadId={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </>
  );
}

function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setLeads(await api<Lead[]>('/crm/leads'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar noivas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return <>
    <DataPanel
      title="Noivas / Leads"
      subtitle="Acompanhe interessadas antes da locacao."
      icon={<Search size={22} />}
      rows={leads}
      columns={['nome', 'telefone', 'interesse', 'data_evento', 'status', 'responsavel_nome']}
      loading={loading}
      error={error}
      onView={(row) => setSelected(row.id)}
    />
    {selected && <LeadDetail leadId={selected} onClose={() => setSelected(null)} onChanged={load} />}
  </>;
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Client[]>('/crm/clients')
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Nao foi possivel carregar clientes.'))
      .finally(() => setLoading(false));
  }, []);

  return <DataPanel
    title="Clientes"
    subtitle="Noivas com cadastro convertido para acompanhamento completo."
    icon={<UserRoundPlus size={22} />}
    rows={clients}
    columns={['nome', 'telefone', 'email', 'data_evento']}
    loading={loading}
    error={error}
  />;
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setTasks(await api<Task[]>('/crm/tasks'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar tarefas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/crm/tasks', {
      method: 'POST',
      body: JSON.stringify({
        titulo: form.get('titulo'),
        tipo: form.get('tipo') || 'follow_up',
        prioridade: form.get('prioridade') || 'normal',
        data_limite: form.get('data_limite') ? new Date(String(form.get('data_limite'))).toISOString() : null
      })
    });
    event.currentTarget.reset();
    setMessage('Tarefa criada com sucesso.');
    load();
  }

  return (
    <section className="content-grid">
      <DataPanel
        title="Tarefas"
        subtitle="Controle retornos e pendencias do atendimento."
        icon={<ListChecks size={22} />}
        rows={tasks}
        columns={['status', 'titulo', 'prioridade', 'data_limite', 'lead_nome', 'cliente_nome']}
        loading={loading}
        error={error}
      />
      <form className="panel" onSubmit={submit}>
        <h2>Nova tarefa</h2>
        <label>Titulo<input name="titulo" required /></label>
        <label>Tipo<input name="tipo" defaultValue="follow_up" /></label>
        <label>Prioridade<select name="prioridade"><option value="normal">Normal</option><option value="alta">Alta</option><option value="baixa">Baixa</option></select></label>
        <label>Prazo<input name="data_limite" type="datetime-local" /></label>
        {message && <div className="alert success-box">{message}</div>}
        <button className="primary"><Plus size={18} /> Criar tarefa</button>
      </form>
    </section>
  );
}

function LeadDetail({ leadId, onClose, onChanged }: { leadId: string; onClose: () => void; onChanged: () => void }) {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');

  async function load() {
    setData(await api(`/crm/leads/${leadId}`));
  }

  useEffect(() => {
    load().catch(console.error);
  }, [leadId]);

  async function updateStatus(status: string) {
    await api(`/crm/leads/${leadId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setMessage(`Status alterado para ${status.replaceAll('_', ' ')}.`);
    await load();
    onChanged();
  }

  async function convert() {
    await api(`/crm/leads/${leadId}/convert`, { method: 'POST' });
    setMessage('Noiva convertida em cliente.');
    await load();
    onChanged();
  }

  if (!data?.lead) return <div className="modal-backdrop"><aside className="modal-panel"><p>Carregando detalhes...</p></aside></div>;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <aside className="modal-panel">
        <div className="section-title">
          <div>
            <h2>{data.lead.nome}</h2>
            <p>{data.lead.telefone} · {data.lead.interesse || 'Sem interesse informado'}</p>
          </div>
          <button className="secondary text-button" onClick={onClose}>Fechar</button>
        </div>
        {message && <div className="alert success-box">{message}</div>}
        <div className="detail-grid">
          <div className="metric"><span>Status</span><strong>{labelText(data.lead.status)}</strong></div>
          <div className="metric"><span>Evento</span><strong>{formatDate(data.lead.data_evento)}</strong></div>
        </div>
        <label>Status do funil
          <select value={data.lead.status} onChange={(event) => updateStatus(event.target.value)}>
            {funnelStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <div className="actions split">
          <button className="primary" onClick={convert}>Converter em cliente</button>
          <button className="secondary text-button" onClick={() => updateStatus('prova_marcada')}>Marcar como prova marcada</button>
        </div>
        <h3>Tarefas vinculadas</h3>
        {data.tarefas.length === 0 ? <div className="empty compact">Nenhuma tarefa vinculada.</div> : data.tarefas.map((task: any) => (
          <article className="mini-card" key={task.id}><strong>{task.titulo}</strong><span>{labelText(task.status)} · {labelText(task.prioridade)}</span></article>
        ))}
      </aside>
    </div>
  );
}

function DataPanel({ title, subtitle, icon, rows, columns, loading, error, onView }: { title: string; subtitle: string; icon: ReactNode; rows: any[]; columns: string[]; loading?: boolean; error?: string; onView?: (row: any) => void }) {
  return (
    <section className="panel wide">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {icon}
      </div>
      {error ? <div className="alert error">Nao foi possivel carregar esta lista. {error}</div> : loading ? <div className="loading-state">Carregando registros...</div> : rows.length === 0 ? <div className="empty">Nenhum registro encontrado. Use os atalhos da rotina para criar o primeiro cadastro.</div> : (
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}{onView && <th>Acoes</th>}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{formatCell(column, row[column])}</td>)}{onView && <td><button className="secondary text-button" onClick={() => onView(row)}>Ver detalhes</button></td>}</tr>)}</tbody>
        </table>
      )}
    </section>
  );
}

function formatCell(column: string, value: unknown) {
  if (value == null || value === '') return <span className="muted-text">Nao informado</span>;
  if (column.includes('status') || column.includes('prioridade')) return <span className="badge muted">{labelText(String(value))}</span>;
  if (column.includes('data')) return formatDate(String(value));
  return String(value);
}

function labelText(value: string) {
  return String(value || '').replaceAll('_', ' ');
}

function formatDate(value?: string) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR');
}
