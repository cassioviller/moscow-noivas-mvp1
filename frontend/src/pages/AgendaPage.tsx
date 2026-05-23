import { Calendar, CalendarCheck, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Appointment = {
  id: string;
  inicio_at: string;
  fim_at: string;
  tipo: string;
  status: string;
  lead_nome?: string;
  cliente_nome?: string;
  atendente_nome?: string;
  sala_nome?: string;
  vestidos: string[];
};

export function AgendaPage({ mode }: { mode: 'agenda' | 'reservations' }) {
  return mode === 'agenda' ? <Agenda /> : <Reservations />;
}

function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('dia');

  async function load() {
    const [appointmentRows, leadRows, clientRows, roomRows, employeeRows, productRows] = await Promise.all([
      api<Appointment[]>('/agenda/appointments'),
      api<any[]>('/crm/leads'),
      api<any[]>('/crm/clients'),
      api<any[]>('/agenda/rooms'),
      api<any[]>('/employees'),
      api<any[]>('/products')
    ]);
    setAppointments(appointmentRows);
    setLeads(leadRows);
    setClients(clientRows);
    setRooms(roomRows);
    setEmployees(employeeRows.filter((employee) => employee.is_atendente));
    setProducts(productRows);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConflicts([]);
    const form = new FormData(event.currentTarget);
    const produtoId = String(form.get('produto_id') || '');
    const result = await api<{ criado: boolean; conflitos: any[] }>('/agenda/appointments', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: form.get('lead_id') || null,
        cliente_id: form.get('cliente_id') || null,
        atendente_id: form.get('atendente_id') || null,
        sala_prova_id: form.get('sala_prova_id') || null,
        produto_ids: produtoId ? [produtoId] : [],
        inicio_at: new Date(String(form.get('inicio_at'))).toISOString(),
        fim_at: new Date(String(form.get('fim_at'))).toISOString(),
        tipo: form.get('tipo') || 'prova',
        status: 'confirmado',
        origem: 'manual'
      })
    });
    if (!result.criado) {
      setConflicts(result.conflitos);
      return;
    }
    event.currentTarget.reset();
    setMessage('Atendimento marcado com sucesso.');
    load();
  }

  async function updateStatus(id: string, status: string) {
    await api(`/agenda/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    setMessage(`Agendamento atualizado para ${status}.`);
    load();
  }

  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>Agenda</h2>
            <p>Veja e organize atendimentos, provas, retiradas e devoluções.</p>
          </div>
          <div className="segmented">
            {['dia', 'semana', 'mês', 'lista'].map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item}</button>)}
          </div>
        </div>
        {appointments.length === 0 ? <div className="empty">Nenhum atendimento marcado para hoje.</div> : (
          <div className="agenda-list">
            {appointments.map((appointment) => (
              <article className="agenda-card" key={appointment.id}>
                <CalendarCheck size={20} />
                <div>
                  <strong>{new Date(appointment.inicio_at).toLocaleString('pt-BR')} - {new Date(appointment.fim_at).toLocaleTimeString('pt-BR')}</strong>
                  <p>{appointment.cliente_nome || appointment.lead_nome} · {appointment.tipo} · {appointment.sala_nome || 'Sem cabine'} · {appointment.atendente_nome || 'Sem atendente'}</p>
                  <small>{appointment.vestidos?.join(', ')}</small>
                </div>
                <span className="badge success">{appointment.status}</span>
                <div className="actions">
                  <button className="secondary text-button" onClick={() => updateStatus(appointment.id, 'confirmado')}>Confirmar</button>
                  <button className="secondary text-button" onClick={() => updateStatus(appointment.id, 'compareceu')}>Compareceu</button>
                  <button className="secondary text-button" onClick={() => updateStatus(appointment.id, 'cancelado')}>Cancelar</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="panel" onSubmit={submit}>
        <h2>Marcar prova</h2>
        <label>Noiva<select name="lead_id"><option value="">Selecione</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.nome}</option>)}</select></label>
        <label>Cliente<select name="cliente_id"><option value="">Selecione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}</select></label>
        <label>Tipo<select name="tipo"><option value="primeiro_atendimento">Primeiro atendimento</option><option value="prova">Prova</option><option value="ajuste">Ajuste</option><option value="retirada">Retirada</option><option value="devolucao">Devolução</option></select></label>
        <label>Início<input name="inicio_at" type="datetime-local" required /></label>
        <label>Fim<input name="fim_at" type="datetime-local" required /></label>
        <label>Cabine<select name="sala_prova_id"><option value="">Selecione</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.nome}</option>)}</select></label>
        <label>Atendente<select name="atendente_id"><option value="">Selecione</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.nome}</option>)}</select></label>
        <label>Vestido<select name="produto_id"><option value="">Sem vestido definido</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}</select></label>
        {conflicts.length > 0 && <div className="alert warning">{conflicts.map((conflict, index) => <span key={index}>{conflict.mensagem}</span>)}</div>}
        {message && <div className="alert success-box">{message}</div>}
        <button className="primary"><Plus size={18} /> Marcar prova</button>
      </form>
    </section>
  );
}

function Reservations() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>('/agenda/reservations').then(setRows).catch(console.error);
  }, []);

  return (
    <section className="panel wide">
      <div className="section-title">
        <div>
          <h2>Reservas de vestidos</h2>
          <p>Reservas ativas e convertidas bloqueiam conflitos no banco.</p>
        </div>
        <Calendar size={22} />
      </div>
      {rows.length === 0 ? <div className="empty">Nenhuma reserva cadastrada.</div> : (
        <table>
          <thead><tr><th>Vestido</th><th>Cliente</th><th>Início</th><th>Fim</th><th>Tipo</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.produto_nome}</td>
                <td>{row.cliente_nome}</td>
                <td>{new Date(row.inicio_at).toLocaleString('pt-BR')}</td>
                <td>{new Date(row.fim_at).toLocaleString('pt-BR')}</td>
                <td>{row.tipo_bloqueio}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
