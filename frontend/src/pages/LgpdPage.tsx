import { EyeOff, FileClock, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

export function LgpdPage() {
  const [data, setData] = useState<any>({ consentimentos: [], solicitacoes: [], politicas: [], anonimizacoes: [] });
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  async function load() {
    const [lgpd, clientRows, leadRows] = await Promise.all([api<any>('/lgpd'), api<any[]>('/crm/clients'), api<any[]>('/crm/leads')]);
    setData(lgpd);
    setClients(clientRows);
    setLeads(leadRows);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function consent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/lgpd/consents', { method: 'POST', body: JSON.stringify({
      cliente_id: form.get('cliente_id'),
      finalidade: form.get('finalidade'),
      permitido: form.get('permitido') === 'true',
      observacoes: form.get('observacoes') || null
    }) });
    event.currentTarget.reset();
    load();
  }

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/lgpd/requests', { method: 'POST', body: JSON.stringify({
      cliente_id: form.get('cliente_id') || null,
      lead_id: form.get('lead_id') || null,
      tipo: form.get('tipo'),
      solicitante_nome: form.get('solicitante_nome') || null,
      solicitante_contato: form.get('solicitante_contato') || null,
      descricao: form.get('descricao') || null
    }) });
    event.currentTarget.reset();
    load();
  }

  return (
    <section className="content-grid">
      <div className="stack">
        <section className="panel wide">
          <div className="section-title"><div><h2>Consentimentos</h2><p>Marketing, fotos e finalidades permitidas por cliente.</p></div><ShieldCheck size={22} /></div>
          <TraceTable rows={data.consentimentos} columns={['cliente_nome', 'finalidade', 'permitido', 'concedido_em', 'revogado_em']} />
        </section>
        <section className="panel wide">
          <div className="section-title"><div><h2>Solicitações LGPD</h2><p>Pedidos de acesso, exclusão, revogação e anonimização.</p></div><FileClock size={22} /></div>
          <TraceTable rows={data.solicitacoes} columns={['criado_em', 'tipo', 'status', 'cliente_nome', 'lead_nome', 'prazo_resposta_em']} />
        </section>
        <section className="panel wide">
          <div className="section-title"><div><h2>Políticas de retenção</h2><p>Dados financeiros e contratos podem ter retenção legal.</p></div><EyeOff size={22} /></div>
          <TraceTable rows={data.politicas} columns={['entidade_tipo', 'finalidade', 'prazo_retencao_dias', 'acao_pos_prazo']} />
        </section>
      </div>
      <div className="stack">
        <form className="panel" onSubmit={consent}>
          <h2>Novo consentimento</h2>
          <label>Cliente<select name="cliente_id" required><option value="">Selecione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}</select></label>
          <label>Finalidade<select name="finalidade"><option value="marketing">Marketing</option><option value="uso_imagem">Uso de imagem</option><option value="contato_operacional">Contato operacional</option></select></label>
          <label>Permissão<select name="permitido"><option value="true">Permitido</option><option value="false">Revogado</option></select></label>
          <label>Observações<textarea name="observacoes" /></label>
          <button className="primary">Salvar consentimento</button>
        </form>
        <form className="panel" onSubmit={request}>
          <h2>Nova solicitação</h2>
          <label>Cliente<select name="cliente_id"><option value="">Selecione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}</select></label>
          <label>Lead<select name="lead_id"><option value="">Selecione</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.nome}</option>)}</select></label>
          <label>Tipo<select name="tipo"><option value="acesso">Acesso</option><option value="correcao">Correção</option><option value="exclusao">Exclusão</option><option value="anonimizacao">Anonimização</option><option value="revogacao">Revogação</option></select></label>
          <label>Solicitante<input name="solicitante_nome" /></label>
          <label>Contato<input name="solicitante_contato" /></label>
          <label>Descrição<textarea name="descricao" /></label>
          <button className="primary">Criar solicitação</button>
        </form>
      </div>
    </section>
  );
}

function TraceTable({ rows, columns }: { rows: any[]; columns: string[] }) {
  if (!rows?.length) return <div className="empty">Nenhum registro encontrado.</div>;
  return <table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{formatValue(row[column])}</td>)}</tr>)}
  </tbody></table>;
}

function formatValue(value: unknown) {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleString('pt-BR');
  return String(value);
}
