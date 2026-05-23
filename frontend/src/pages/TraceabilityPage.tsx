import { FileClock, Play, ScrollText, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { api } from '../api';

export function TraceabilityPage({ mode }: { mode: 'history' | 'audit' | 'outbox' }) {
  if (mode === 'history') return <HistoryPage />;
  if (mode === 'audit') return <AuditPage />;
  return <OutboxPage />;
}

function HistoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/traceability/history').then(setRows).catch(console.error); }, []);
  return <TracePanel title="Histórico" subtitle="Linha do tempo de atendimentos, agenda, locações e financeiro." icon={<ScrollText size={22} />} rows={rows} columns={['criado_em', 'usuario_nome', 'tipo', 'descricao', 'entidade_tipo']} />;
}

function AuditPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/traceability/audit').then(setRows).catch(console.error); }, []);
  return <TracePanel title="Auditoria" subtitle="Alterações críticas e ações sensíveis." icon={<ShieldAlert size={22} />} rows={rows} columns={['criado_em', 'usuario_nome', 'acao', 'entidade_tipo', 'motivo']} />;
}

function OutboxPage() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() { setRows(await api<any[]>('/outbox')); }
  async function process() { await api('/outbox/process', { method: 'POST' }); load(); }
  useEffect(() => { load().catch(console.error); }, []);
  return (
    <section className="panel wide">
      <div className="section-title">
        <div>
          <h2>Eventos outbox</h2>
          <p>Eventos prontos para futuras automações com WhatsApp, n8n e IA.</p>
        </div>
        <button className="primary" onClick={process}><Play size={16} /> Processar</button>
      </div>
      <TraceTable rows={rows} columns={['criado_em', 'evento', 'entidade_tipo', 'status', 'tentativas', 'processado_em']} />
    </section>
  );
}

function TracePanel({ title, subtitle, icon, rows, columns }: { title: string; subtitle: string; icon: ReactNode; rows: any[]; columns: string[] }) {
  return (
    <section className="panel wide">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {icon}
      </div>
      <TraceTable rows={rows} columns={columns} />
    </section>
  );
}

function TraceTable({ rows, columns }: { rows: any[]; columns: string[] }) {
  if (rows.length === 0) return <div className="empty">Nenhum registro encontrado.</div>;
  return <table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}
  </tbody></table>;
}

function formatValue(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleString('pt-BR');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
