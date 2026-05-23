import { CalendarX, Clock, Plus, Store, UserCog } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Employee = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cargo: string;
  is_atendente: boolean;
  ativo: boolean;
  capacidade_atendimento: number;
};

export function EmployeesPage({ mode }: { mode: 'employees' | 'schedules' | 'attendantBlocks' | 'storeBlocks' }) {
  if (mode === 'employees') return <Employees />;
  if (mode === 'schedules') return <Schedules />;
  if (mode === 'attendantBlocks') return <AttendantBlocks />;
  return <StoreBlocks />;
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  async function load() {
    setEmployees(await api<Employee[]>('/employees'));
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/employees', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.get('nome'),
        telefone: form.get('telefone') || null,
        email: form.get('email') || null,
        cargo: form.get('cargo') || null,
        is_atendente: form.get('is_atendente') === 'on',
        is_financeiro: form.get('is_financeiro') === 'on',
        is_operacional: form.get('is_operacional') === 'on',
        ativo: true,
        capacidade_atendimento: Number(form.get('capacidade_atendimento') || 1),
        horario_inicio_trabalho: form.get('horario_inicio_trabalho') || null,
        horario_fim_trabalho: form.get('horario_fim_trabalho') || null
      })
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>Funcionários</h2>
            <p>Cadastre a equipe e marque quem pode receber atendimentos.</p>
          </div>
          <UserCog size={22} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Atendente</th>
              <th>Capacidade</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.nome}</td>
                <td>{employee.cargo}</td>
                <td>{employee.is_atendente ? 'Sim' : 'Não'}</td>
                <td>{employee.capacidade_atendimento}</td>
                <td><span className={employee.ativo ? 'badge success' : 'badge muted'}>{employee.ativo ? 'Sim' : 'Não'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="panel" onSubmit={submit}>
        <h2>Novo funcionário</h2>
        <label>Nome<input name="nome" required /></label>
        <label>Telefone<input name="telefone" /></label>
        <label>E-mail<input name="email" type="email" /></label>
        <label>Cargo<input name="cargo" /></label>
        <label>Capacidade<input name="capacidade_atendimento" type="number" min="1" defaultValue="1" /></label>
        <div className="check-row"><label><input name="is_atendente" type="checkbox" /> Atendente</label></div>
        <div className="check-row"><label><input name="is_financeiro" type="checkbox" /> Financeiro</label></div>
        <div className="check-row"><label><input name="is_operacional" type="checkbox" /> Operacional</label></div>
        <label>Início do trabalho<input name="horario_inicio_trabalho" type="time" /></label>
        <label>Fim do trabalho<input name="horario_fim_trabalho" type="time" /></label>
        <button className="primary"><Plus size={18} /> Cadastrar</button>
      </form>
    </section>
  );
}

function Schedules() {
  const [rows, setRows] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  async function load() {
    const [scheduleRows, employeeRows] = await Promise.all([api<any[]>('/employees/schedules'), api<Employee[]>('/employees')]);
    setRows(scheduleRows);
    setEmployees(employeeRows.filter((employee) => employee.is_atendente));
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/employees/schedules', {
      method: 'POST',
      body: JSON.stringify({
        funcionario_id: form.get('funcionario_id'),
        dia_semana: Number(form.get('dia_semana')),
        hora_inicio: form.get('hora_inicio'),
        hora_fim: form.get('hora_fim'),
        ativo: true
      })
    });
    event.currentTarget.reset();
    load();
  }

  return <SimpleListWithForm
    title="Horários do atendente"
    subtitle="Defina quando cada atendente pode receber provas e atendimentos."
    icon={<Clock size={22} />}
    rows={rows}
    columns={['funcionario_nome', 'dia_semana', 'hora_inicio', 'hora_fim', 'ativo']}
    onSubmit={submit}
  >
    <label>Atendente<select name="funcionario_id" required>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.nome}</option>)}</select></label>
    <label>Dia da semana<select name="dia_semana" required><option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option><option value="0">Domingo</option></select></label>
    <label>Início<input name="hora_inicio" type="time" required /></label>
    <label>Fim<input name="hora_fim" type="time" required /></label>
  </SimpleListWithForm>;
}

function AttendantBlocks() {
  return <Blocks kind="attendant" />;
}

function StoreBlocks() {
  return <Blocks kind="store" />;
}

function Blocks({ kind }: { kind: 'attendant' | 'store' }) {
  const isAttendant = kind === 'attendant';
  const [rows, setRows] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  async function load() {
    const path = isAttendant ? '/employees/attendant-blocks' : '/employees/store-blocks';
    const [blockRows, employeeRows] = await Promise.all([api<any[]>(path), api<Employee[]>('/employees')]);
    setRows(blockRows);
    setEmployees(employeeRows.filter((employee) => employee.is_atendente));
  }

  useEffect(() => {
    load().catch(console.error);
  }, [kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const path = isAttendant ? '/employees/attendant-blocks' : '/employees/store-blocks';
    await api(path, {
      method: 'POST',
      body: JSON.stringify({
        ...(isAttendant ? { funcionario_id: form.get('funcionario_id') } : {}),
        data_inicio: new Date(String(form.get('data_inicio'))).toISOString(),
        data_fim: new Date(String(form.get('data_fim'))).toISOString(),
        tipo_bloqueio: form.get('tipo_bloqueio'),
        motivo: form.get('motivo'),
        afeta_agenda: form.get('afeta_agenda') !== 'off',
        observacoes: form.get('observacoes') || null
      })
    });
    event.currentTarget.reset();
    load();
  }

  return <SimpleListWithForm
    title={isAttendant ? 'Bloqueios do atendente' : 'Bloqueios da loja'}
    subtitle={isAttendant ? 'Férias, folgas e ausências impedem a atendente de receber agenda.' : 'Bloqueios da loja impedem agendamento quando afetam a agenda.'}
    icon={isAttendant ? <CalendarX size={22} /> : <Store size={22} />}
    rows={rows}
    columns={isAttendant ? ['funcionario_nome', 'data_inicio', 'data_fim', 'tipo_bloqueio', 'motivo'] : ['data_inicio', 'data_fim', 'tipo_bloqueio', 'motivo', 'afeta_agenda']}
    onSubmit={submit}
  >
    {isAttendant && <label>Atendente<select name="funcionario_id" required>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.nome}</option>)}</select></label>}
    <label>Início<input name="data_inicio" type="datetime-local" required /></label>
    <label>Fim<input name="data_fim" type="datetime-local" required /></label>
    <label>Tipo<input name="tipo_bloqueio" placeholder="Férias, manutenção, feriado..." required /></label>
    <label>Motivo<input name="motivo" required /></label>
    {!isAttendant && <div className="check-row"><label><input name="afeta_agenda" type="checkbox" defaultChecked /> Afeta agenda</label></div>}
    {isAttendant && <label>Observações<textarea name="observacoes" /></label>}
  </SimpleListWithForm>;
}

function SimpleListWithForm({
  title,
  subtitle,
  icon,
  rows,
  columns,
  onSubmit,
  children
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  rows: any[];
  columns: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {icon}
        </div>
        {rows.length === 0 ? <div className="empty">Nenhum registro cadastrado ainda.</div> : (
          <table>
            <thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>{columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <form className="panel" onSubmit={onSubmit}>
        <h2>Novo registro</h2>
        {children}
        <button className="primary"><Plus size={18} /> Salvar</button>
      </form>
    </section>
  );
}
