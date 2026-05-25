import { Banknote, CheckCircle2, FileSignature, PackageCheck, Plus, Receipt, Repeat2, RotateCcw } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Rental = {
  id: string;
  cliente_nome: string;
  status: string;
  valor_total: string;
  valor_sinal: string;
  valor_caucao: string;
  data_evento: string;
  data_retirada_prevista?: string;
  data_devolucao_prevista?: string;
  total_itens: number;
};

export function RentalsPage({ mode }: { mode: 'rentals' | 'receivables' }) {
  return mode === 'rentals' ? <Rentals /> : <Receivables />;
}

function Rentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setRentals(await api<Rental[]>('/rentals'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar locacoes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  return (
    <section className="rental-layout">
      <div className="panel">
        <div className="section-title">
          <div>
            <h2>Locações</h2>
            <p>Controle contratos, itens, datas, financeiro, caução, retirada e devolução.</p>
          </div>
          <Receipt size={22} />
        </div>
        {error ? <div className="alert error">Nao foi possivel carregar locações. {error}</div> : loading ? <div className="loading-state">Carregando locações, contratos e datas...</div> : rentals.length === 0 ? <div className="empty">Nenhuma locação criada ainda. Crie a primeira locação para controlar contrato, reservas e parcelas.</div> : (
          <table>
            <thead><tr><th>Cliente</th><th>Evento</th><th>Itens</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td>{rental.cliente_nome}</td>
                  <td>{formatDate(rental.data_evento)}</td>
                  <td>{rental.total_itens}</td>
                  <td>R$ {money(rental.valor_total)}</td>
                  <td><span className={`badge ${statusTone(rental.status)}`}>{label(rental.status)}</span></td>
                  <td><button className="secondary text-button" onClick={() => setSelected(rental.id)}>Ver detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selected ? <RentalDetail id={selected} onChanged={load} /> : <NewRentalWizard onCreated={load} />}
    </section>
  );
}

function NewRentalWizard({ onCreated }: { onCreated: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api<any[]>('/crm/clients'), api<any[]>('/products')]).then(([c, p]) => {
      setClients(c);
      setProducts(p);
    }).catch((err) => setError(err instanceof Error ? err.message : 'Nao foi possivel preparar a locacao.')).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setConflicts([]);
    const form = new FormData(event.currentTarget);
    const productId = String(form.get('produto_id') || '');
    const value = Number(form.get('valor_unitario') || 0);
    const result = await api<{ criado: boolean; id?: string; conflitos: any[] }>('/rentals', {
      method: 'POST',
      body: JSON.stringify({
        cliente_id: form.get('cliente_id'),
        data_evento: form.get('data_evento'),
        data_retirada_prevista: form.get('data_retirada_prevista') || null,
        data_devolucao_prevista: form.get('data_devolucao_prevista') || null,
        valor_sinal: Number(form.get('valor_sinal') || 0),
        valor_caucao: Number(form.get('valor_caucao') || 0),
        quantidade_parcelas: Number(form.get('quantidade_parcelas') || 1),
        contrato_assinado: form.get('contrato_assinado') === 'on',
        itens: [{
          produto_id: productId || null,
          tipo_item: form.get('tipo_item') || 'vestido',
          descricao: form.get('descricao') || null,
          quantidade: 1,
          valor_unitario: value,
          valor_caucao_item: Number(form.get('valor_caucao_item') || 0)
        }]
      })
    });

    if (!result.criado) {
      setConflicts(result.conflitos);
      return;
    }
    event.currentTarget.reset();
    setMessage('Locação criada com reservas e parcelas.');
    onCreated();
  }

  return (
    <form className="panel rental-wizard" onSubmit={submit}>
      <h2>Nova locação</h2>
      <div className="wizard-steps">
        <span>1 Cliente</span><span>2 Itens</span><span>3 Datas</span><span>4 Valores</span><span>5 Contrato</span><span>6 Confirmação</span>
      </div>
      {error && <div className="alert error">Nao foi possivel carregar clientes e vestidos. {error}</div>}
      {loading && <div className="loading-state">Preparando clientes e vestidos disponíveis...</div>}
      <label>Cliente<select name="cliente_id" required><option value="">Selecione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}</select></label>
      <label>Data do evento<input name="data_evento" type="date" required /></label>
      <label>Vestido/item<select name="produto_id"><option value="">Item sem produto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}</select></label>
      <label>Tipo do item<select name="tipo_item"><option value="vestido">Vestido</option><option value="veu">Véu</option><option value="acessorio">Acessório</option><option value="servico">Serviço</option><option value="ajuste">Ajuste</option><option value="outro">Outro</option></select></label>
      <label>Descrição<input name="descricao" /></label>
      <label>Retirada prevista<input name="data_retirada_prevista" type="date" /></label>
      <label>Devolução prevista<input name="data_devolucao_prevista" type="date" /></label>
      <label>Valor do item<input name="valor_unitario" type="number" min="0" step="0.01" required /></label>
      <label>Sinal<input name="valor_sinal" type="number" min="0" step="0.01" /></label>
      <label>Caução<input name="valor_caucao" type="number" min="0" step="0.01" /></label>
      <label>Parcelas<input name="quantidade_parcelas" type="number" min="1" defaultValue="1" /></label>
      <div className="check-row"><label><input name="contrato_assinado" type="checkbox" /> Contrato assinado</label></div>
      {conflicts.length > 0 && <div className="alert warning">{conflicts.map((conflict, index) => <span key={index}>{conflict.mensagem}</span>)}</div>}
      {message && <div className="alert success-box">{message}</div>}
      <button className="primary"><Plus size={18} /> Confirmar locação</button>
    </form>
  );
}

function RentalDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('Resumo');
  const tabs = ['Resumo', 'Itens', 'Datas e reservas', 'Financeiro', 'Caução', 'Contrato', 'Retirada', 'Devolução', 'Histórico'];

  async function load() {
    setData(await api(`/rentals/${id}`));
  }

  useEffect(() => {
    load().catch(console.error);
  }, [id]);

  if (!data?.locacao) return <div className="panel">Carregando locação...</div>;

  return (
    <aside className="panel rental-detail">
      <div className="section-title">
        <div>
          <h2>{data.locacao.cliente_nome}</h2>
          <p>Evento em {data.locacao.data_evento} · R$ {money(data.locacao.valor_total)}</p>
        </div>
        <span className={`badge ${statusTone(data.locacao.status)}`}>{label(data.locacao.status)}</span>
      </div>
      <div className="tabs">{tabs.map((name) => <button key={name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>{name}</button>)}</div>
      {tab === 'Resumo' && <Summary data={data} />}
      {tab === 'Itens' && <Items data={data} id={id} reload={load} />}
      {tab === 'Datas e reservas' && <Reservations data={data} />}
      {tab === 'Financeiro' && <Finance data={data} />}
      {tab === 'Caução' && <Bail id={id} data={data} reload={load} />}
      {tab === 'Contrato' && <Contract id={id} data={data} reload={load} />}
      {tab === 'Retirada' && <Delivery id={id} reload={() => { load(); onChanged(); }} />}
      {tab === 'Devolução' && <ReturnFlow id={id} reload={() => { load(); onChanged(); }} />}
      {tab === 'Histórico' && <History data={data} />}
    </aside>
  );
}

function Summary({ data }: { data: any }) {
  return <div className="detail-grid">
    <Metric label="Valor total" value={`R$ ${money(data.locacao.valor_total)}`} />
    <Metric label="Sinal" value={`R$ ${money(data.locacao.valor_sinal)}`} />
    <Metric label="Caução" value={`R$ ${money(data.locacao.valor_caucao)}`} />
    <Metric label="Itens" value={String(data.itens.length)} />
  </div>;
}

function Items({ data, id, reload }: { data: any; id: string; reload: () => void }) {
  const [newProduct, setNewProduct] = useState('');
  const [reason, setReason] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => { api<any[]>('/products').then(setProducts).catch(console.error); }, []);

  async function swap(itemId: string) {
    await api(`/rentals/${id}/swap-item`, {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, novo_produto_id: newProduct, motivo: reason })
    });
    setReason('');
    setNewProduct('');
    reload();
  }

  return <div className="stack">
    {data.itens.map((item: any) => <article className="mini-card" key={item.id}>
      <strong>{item.produto_nome || item.descricao || item.tipo_item}</strong>
      <span>{item.tipo_item} · R$ {money(item.valor_total)} · {item.status}</span>
      <div className="inline-form">
        <select value={newProduct} onChange={(event) => setNewProduct(event.target.value)}>
          <option value="">Novo item</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}
        </select>
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo" />
        <button className="secondary" onClick={() => swap(item.id)} title="Trocar item"><Repeat2 size={16} /></button>
      </div>
    </article>)}
  </div>;
}

function Reservations({ data }: { data: any }) {
  return <div className="stack">{data.itens.map((item: any) => <article className="mini-card" key={item.id}>
    <strong>{item.produto_nome || item.tipo_item}</strong>
    <span>{item.reserva_inicio ? `${new Date(item.reserva_inicio).toLocaleString('pt-BR')} até ${new Date(item.reserva_fim).toLocaleString('pt-BR')}` : 'Sem reserva'}</span>
    <small>{item.reserva_status}</small>
  </article>)}</div>;
}

function Finance({ data }: { data: any }) {
  return <table><thead><tr><th>Tipo</th><th>Parcela</th><th>Original</th><th>Pago</th><th>Saldo</th><th>Status</th></tr></thead><tbody>
    {data.financeiro.map((row: any) => <tr key={row.id}><td>{row.tipo}</td><td>{row.parcela_numero}</td><td>R$ {money(row.valor_original)}</td><td>R$ {money(row.valor_pago)}</td><td>R$ {money(row.valor_saldo)}</td><td>{row.status}</td></tr>)}
  </tbody></table>;
}

function Bail({ id, data, reload }: { id: string; data: any; reload: () => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api(`/rentals/${id}/bail`, { method: 'POST', body: JSON.stringify({
      tipo_movimento: form.get('tipo_movimento'),
      valor: Number(form.get('valor') || 0),
      forma_pagamento: form.get('forma_pagamento') || null,
      chave_pix_devolucao: form.get('chave_pix_devolucao') || null,
      motivo: form.get('motivo') || null
    }) });
    event.currentTarget.reset();
    reload();
  }
  return <div className="stack">
    <form className="inline-form" onSubmit={submit}>
      <select name="tipo_movimento"><option value="recebimento">Receber</option><option value="devolucao">Devolver</option><option value="retencao">Reter</option></select>
      <input name="valor" type="number" min="0.01" step="0.01" placeholder="Valor" required />
      <input name="forma_pagamento" placeholder="Forma" />
      <input name="chave_pix_devolucao" placeholder="Pix devolução" />
      <input name="motivo" placeholder="Motivo" />
      <button className="primary"><Banknote size={16} /> Salvar</button>
    </form>
    {data.caucao.map((row: any) => <article className="mini-card" key={row.id}><strong>{row.tipo_movimento}</strong><span>R$ {money(row.valor)} · {row.forma_pagamento}</span></article>)}
  </div>;
}

function Contract({ id, data, reload }: { id: string; data: any; reload: () => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api(`/rentals/${id}/contract`, { method: 'PATCH', body: JSON.stringify({
      contrato_assinado: form.get('contrato_assinado') === 'on',
      contrato_assinado_em: form.get('contrato_assinado_em') ? new Date(String(form.get('contrato_assinado_em'))).toISOString() : null,
      contrato_arquivo_id: form.get('contrato_arquivo_id') || null,
      observacoes: form.get('observacoes') || null
    }) });
    reload();
  }
  return <form className="stack" onSubmit={submit}>
    <div className="check-row"><label><input name="contrato_assinado" type="checkbox" defaultChecked={data.locacao.contrato_assinado} /> Contrato assinado</label></div>
    <label>Data de assinatura<input name="contrato_assinado_em" type="datetime-local" /></label>
    <label>Arquivo do contrato<input name="contrato_arquivo_id" placeholder="UUID do arquivo privado" /></label>
    <label>Observações<textarea name="observacoes" /></label>
    <button className="primary"><FileSignature size={16} /> Atualizar contrato</button>
  </form>;
}

function Delivery({ id, reload }: { id: string; reload: () => void }) {
  const [result, setResult] = useState<any>(null);
  async function validate() { setResult(await api(`/rentals/${id}/delivery/validate`)); }
  async function confirm() { setResult(await api(`/rentals/${id}/delivery`, { method: 'POST' })); reload(); }
  return <div className="stack">
    <button className="secondary text-button" onClick={validate}>Verificar pendências</button>
    {result && !result.liberado && <div className="alert warning">Não é possível entregar ainda.{result.pendencias.map((p: string) => <span key={p}>{p}</span>)}</div>}
    {result?.liberado && <div className="alert success-box">Retirada liberada.</div>}
    <button className="primary" onClick={confirm}><PackageCheck size={16} /> Entregar vestido</button>
  </div>;
}

function ReturnFlow({ id, reload }: { id: string; reload: () => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api(`/rentals/${id}/return`, { method: 'POST', body: JSON.stringify({
      itens_devolvidos: form.get('itens_devolvidos') === 'on',
      precisa_lavanderia: form.get('precisa_lavanderia') === 'on',
      possui_problema: form.get('possui_problema') === 'on',
      observacoes: form.get('observacoes') || null
    }) });
    reload();
  }
  return <form className="stack" onSubmit={submit}>
    <div className="check-row"><label><input name="itens_devolvidos" type="checkbox" defaultChecked /> Itens devolvidos</label></div>
    <div className="check-row"><label><input name="precisa_lavanderia" type="checkbox" /> Precisa lavanderia</label></div>
    <div className="check-row"><label><input name="possui_problema" type="checkbox" /> Possui problema/avaria</label></div>
    <label>Observações<textarea name="observacoes" /></label>
    <button className="primary"><RotateCcw size={16} /> Confirmar devolução</button>
  </form>;
}

function History({ data }: { data: any }) {
  return <div className="stack">{data.historico.map((row: any) => <article className="mini-card" key={row.id}><strong>{row.tipo}</strong><span>{row.descricao}</span><small>{new Date(row.criado_em).toLocaleString('pt-BR')}</small></article>)}</div>;
}

function Receivables() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try {
      setRows(await api<any[]>('/rentals/receivables'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel carregar contas a receber.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load().catch(console.error); }, []);
  async function pay(row: any) {
    const value = Number(prompt('Valor pago', row.valor_saldo));
    if (!value) return;
    await api('/rentals/payments', { method: 'POST', body: JSON.stringify({ conta_receber_id: row.id, valor_pago: value, forma_pagamento: 'manual' }) });
    load();
  }
  return <section className="panel wide">
    <div className="section-title"><div><h2>Dinheiro a receber</h2><p>Parcelas, sinal, pagamentos parciais e saldos.</p></div><Banknote size={22} /></div>
    {error ? <div className="alert error">Nao foi possivel carregar contas a receber. {error}</div> : loading ? <div className="loading-state">Carregando parcelas, saldos e vencimentos...</div> : rows.length === 0 ? <div className="empty">Nenhuma conta a receber. Quando uma locação for criada, as parcelas aparecerão aqui.</div> : <table><thead><tr><th>Cliente</th><th>Locação</th><th>Tipo</th><th>Parcela</th><th>Original</th><th>Pago</th><th>Saldo</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.id}><td>{row.cliente_nome}</td><td>{row.venda_locacao_id.slice(0, 8)}</td><td>{label(row.tipo)}</td><td>{row.parcela_numero}</td><td>R$ {money(row.valor_original)}</td><td>R$ {money(row.valor_pago)}</td><td>R$ {money(row.valor_saldo)}</td><td>{formatDate(row.vencimento)}</td><td><span className={`badge ${statusTone(row.status)}`}>{label(row.status)}</span></td><td><button aria-label={`Registrar pagamento de ${row.cliente_nome}`} className="secondary" title="Registrar pagamento" onClick={() => pay(row)}><CheckCircle2 size={16} /></button></td></tr>)}
    </tbody></table>}
  </section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function money(value: string | number) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function label(value: string) {
  return String(value || '').replaceAll('_', ' ');
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '-';
}

function statusTone(status: string) {
  if (['ativa', 'ativo', 'pago', 'confirmado', 'retirado', 'devolvido'].includes(status)) return 'success';
  if (['vencido', 'atrasado', 'pendente'].includes(status)) return 'warning-badge';
  if (['cancelado'].includes(status)) return 'danger-badge';
  return 'muted';
}
