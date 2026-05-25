import { Calendar, CalendarCheck, Plus, Search } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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

type Option = {
  id: string;
  nome: string;
  disponivel?: boolean;
  conflitos?: { campo: string; mensagem: string }[];
};

type AvailabilityOptions = {
  salas: Option[];
  atendentes: Option[];
  vestidos: Option[];
};

export function AgendaPage({ mode }: { mode: 'agenda' | 'reservations' }) {
  return mode === 'agenda' ? <Agenda /> : <Reservations />;
}

function toDateInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function toLocalIso(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute + minutes, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function ComboBox({ label, options, value, onChange, placeholder }: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const selected = options.find((option) => option.id === value);
  const [query, setQuery] = useState(selected?.nome ?? '');
  const [open, setOpen] = useState(false);
  const filtered = options.filter((option) => option.nome.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setQuery(selected?.nome ?? '');
  }, [selected?.nome]);

  return (
    <label className="combo-field">{label}
      <div className="combo-box">
        <Search size={16} />
        <input
          value={query}
          placeholder={placeholder ?? 'Buscar'}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!event.target.value) onChange('');
          }}
        />
      </div>
      {open && (
        <div className="combo-results">
          {filtered.length === 0 ? <span>Nenhum resultado</span> : filtered.map((option) => {
            const disabled = option.disponivel === false;
            return (
              <button
                className={disabled ? 'disabled' : value === option.id ? 'active' : ''}
                disabled={disabled}
                key={option.id}
                onMouseDown={(event) => event.preventDefault()}
                title={option.conflitos?.map((conflict) => conflict.mensagem).join(' ')}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                <span>{option.nome}</span>
                {disabled && <small>{option.conflitos?.[0]?.mensagem}</small>}
              </button>
            );
          })}
        </div>
      )}
    </label>
  );
}

function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Option[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [availability, setAvailability] = useState<AvailabilityOptions>({ salas: [], atendentes: [], vestidos: [] });
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('dia');
  const [date, setDate] = useState(toDateInput());
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(90);
  const [leadId, setLeadId] = useState('');
  const [clientId, setClientId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [productIds, setProductIds] = useState<string[]>([]);

  const endTime = useMemo(() => addMinutes(startTime, duration), [startTime, duration]);
  const inicioAt = useMemo(() => toLocalIso(date, startTime), [date, startTime]);
  const fimAt = useMemo(() => toLocalIso(date, endTime), [date, endTime]);

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
    setLeads(leadRows.map((lead) => ({ id: lead.id, nome: lead.nome })));
    setClients(clientRows.map((client) => ({ id: client.id, nome: client.nome })));
    setRooms(roomRows.map((room) => ({ id: room.id, nome: room.nome })));
    setEmployees(employeeRows.filter((employee) => employee.is_atendente).map((employee) => ({ id: employee.id, nome: employee.nome })));
    setProducts(productRows.map((product) => ({ id: product.id, nome: product.nome })));
  }

  async function loadAvailability() {
    const payload = {
      inicio_at: inicioAt,
      fim_at: fimAt,
      sala_prova_id: roomId || null,
      atendente_id: employeeId || null,
      produto_ids: productIds
    };
    const [options, validation] = await Promise.all([
      api<AvailabilityOptions>('/disponibilidade/opcoes', { method: 'POST', body: JSON.stringify(payload) }),
      api<{ disponivel: boolean; conflitos: any[] }>('/disponibilidade/validar', { method: 'POST', body: JSON.stringify(payload) })
    ]);
    setAvailability(options);
    setConflicts(validation.conflitos);
    if (roomId && options.salas.find((room) => room.id === roomId)?.disponivel === false) setRoomId('');
    if (employeeId && options.atendentes.find((employee) => employee.id === employeeId)?.disponivel === false) setEmployeeId('');
    setProductIds((current) => current.filter((id) => options.vestidos.find((product) => product.id === id)?.disponivel !== false));
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  useEffect(() => {
    loadAvailability().catch(console.error);
  }, [inicioAt, fimAt, roomId, employeeId, productIds.join(',')]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    if (conflicts.length > 0) return;
    const result = await api<{ criado: boolean; conflitos: any[] }>('/agenda/appointments', {
      method: 'POST',
      body: JSON.stringify({
        lead_id: leadId || null,
        cliente_id: clientId || null,
        atendente_id: employeeId || null,
        sala_prova_id: roomId || null,
        produto_ids: productIds,
        inicio_at: inicioAt,
        fim_at: fimAt,
        tipo: form.get('tipo') || 'prova',
        status: 'confirmado',
        origem: 'manual'
      })
    });
    if (!result.criado) {
      setConflicts(result.conflitos);
      return;
    }
    setLeadId('');
    setClientId('');
    setRoomId('');
    setEmployeeId('');
    setProductIds([]);
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

  const roomOptions = availability.salas.length ? availability.salas : rooms;
  const employeeOptions = availability.atendentes.length ? availability.atendentes : employees;
  const productOptions = availability.vestidos.length ? availability.vestidos : products;

  return (
    <section className="content-grid agenda-layout">
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
                  <p>{appointment.cliente_nome || appointment.lead_nome} · {appointment.tipo} · {appointment.sala_nome || 'Sem cabine'} · {appointment.atendente_nome || 'Sem vendedora'}</p>
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

      <form className="panel agenda-form" onSubmit={submit}>
        <h2>Marcar prova</h2>
        <div className="date-grid">
          <label>Dia<input value={date} onChange={(event) => setDate(event.target.value)} type="date" required /></label>
          <label>Horário<input value={startTime} onChange={(event) => setStartTime(event.target.value)} type="time" required /></label>
          <label>Duração
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
              <option value={120}>2h</option>
              <option value={180}>3h</option>
            </select>
          </label>
        </div>
        <div className="time-summary">Fim previsto: <strong>{endTime}</strong></div>
        <ComboBox label="Noiva" options={leads} value={leadId} onChange={setLeadId} placeholder="Buscar noiva" />
        <ComboBox label="Cliente" options={clients} value={clientId} onChange={setClientId} placeholder="Buscar cliente" />
        <label>Tipo<select name="tipo"><option value="primeiro_atendimento">Primeiro atendimento</option><option value="prova">Prova</option><option value="ajuste">Ajuste</option><option value="retirada">Retirada</option><option value="devolucao">Devolução</option></select></label>
        <ComboBox label="Cabine" options={roomOptions} value={roomId} onChange={setRoomId} placeholder="Buscar cabine" />
        <ComboBox label="Vendedora" options={employeeOptions} value={employeeId} onChange={setEmployeeId} placeholder="Buscar vendedora" />
        <div className="multi-picker">
          <strong>Vestidos</strong>
          {productOptions.map((product) => {
            const disabled = product.disponivel === false;
            return (
              <label className={disabled ? 'disabled' : ''} key={product.id} title={product.conflitos?.map((conflict) => conflict.mensagem).join(' ')}>
                <input
                  checked={productIds.includes(product.id)}
                  disabled={disabled}
                  type="checkbox"
                  onChange={(event) => {
                    setProductIds((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id));
                  }}
                />
                <span>{product.nome}</span>
                {disabled && <small>{product.conflitos?.[0]?.mensagem}</small>}
              </label>
            );
          })}
        </div>
        {conflicts.length > 0 && <div className="alert warning">{conflicts.map((conflict, index) => <span key={index}>{conflict.mensagem}</span>)}</div>}
        {message && <div className="alert success-box">{message}</div>}
        <button className="primary" disabled={conflicts.length > 0}><Plus size={18} /> Marcar prova</button>
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
