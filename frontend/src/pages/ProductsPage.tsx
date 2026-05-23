import { CalendarPlus, Eye, Plus, Shirt, Table2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Product = {
  id: string;
  nome: string;
  codigo_interno: string;
  categoria_id?: string;
  categoria_nome?: string;
  tamanho?: string;
  cor?: string;
  valor_locacao: string;
  status_geral: string;
  foto_principal_url?: string;
};

type Category = {
  id: string;
  nome: string;
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const [productRows, categoryRows] = await Promise.all([api<Product[]>('/products'), api<Category[]>('/products/categories')]);
    setProducts(productRows);
    setCategories(categoryRows);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/products', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.get('nome'),
        codigo_interno: form.get('codigo_interno'),
        categoria_id: form.get('categoria_id') || null,
        tamanho: form.get('tamanho') || null,
        cor: form.get('cor') || null,
        valor_locacao: Number(form.get('valor_locacao') || 0),
        valor_venda: 0,
        custo: 0,
        status_geral: form.get('status_geral') || 'disponivel'
      })
    });
    event.currentTarget.reset();
    setMessage('Vestido cadastrado com sucesso.');
    load();
  }

  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>Vestidos</h2>
            <p>Consulte vestidos, disponibilidade e reservas.</p>
          </div>
          <div className="segmented">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} title="Grid de vestidos"><Shirt size={17} /></button>
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} title="Tabela"><Table2 size={17} /></button>
          </div>
        </div>
        {message && <div className="alert success-box">{message}</div>}
        {view === 'grid'
          ? <ProductGrid products={products} onView={setSelected} onAction={setMessage} />
          : <ProductTable products={products} onView={setSelected} />}
      </div>

      <form className="panel" onSubmit={submit}>
        <h2>Novo vestido</h2>
        <label>Nome<input name="nome" required /></label>
        <label>Codigo interno<input name="codigo_interno" required /></label>
        <label>Categoria<select name="categoria_id"><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select></label>
        <label>Tamanho<input name="tamanho" /></label>
        <label>Cor<input name="cor" /></label>
        <label>Valor de locacao<input name="valor_locacao" type="number" min="0" step="0.01" /></label>
        <label>Status<select name="status_geral"><option value="disponivel">Disponivel</option><option value="manutencao">Manutencao</option><option value="indisponivel">Indisponivel</option></select></label>
        <button className="primary"><Plus size={18} /> Cadastrar vestido</button>
      </form>
      {selected && <ProductDetail productId={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function ProductGrid({ products, onView, onAction }: { products: Product[]; onView: (id: string) => void; onAction: (message: string) => void }) {
  if (products.length === 0) return <div className="empty">Nenhum vestido cadastrado.</div>;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <div className="product-photo">
            {product.foto_principal_url ? <img src={product.foto_principal_url} alt={product.nome} /> : <Shirt size={44} />}
          </div>
          <div>
            <h3>{product.nome}</h3>
            <p>{product.codigo_interno} · {product.tamanho || 'Tamanho nao informado'} · {product.cor || 'Cor nao informada'}</p>
            <strong>R$ {money(product.valor_locacao)}</strong>
          </div>
          <span className="badge success">{product.status_geral}</span>
          <div className="actions">
            <button className="secondary" title="Ver" onClick={() => onView(product.id)}><Eye size={16} /></button>
            <button className="secondary" title="Agendar prova" onClick={() => onAction('Abra a Agenda para marcar uma prova com este vestido.') }><CalendarPlus size={16} /></button>
            <button className="secondary text-button" onClick={() => onAction('Use Nova locacao para criar uma reserva contratual deste vestido.')}>Reservar</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductTable({ products, onView }: { products: Product[]; onView: (id: string) => void }) {
  return (
    <table>
      <thead><tr><th>Nome</th><th>Codigo</th><th>Tamanho</th><th>Cor</th><th>Valor</th><th>Status</th><th>Acoes</th></tr></thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.nome}</td>
            <td>{product.codigo_interno}</td>
            <td>{product.tamanho}</td>
            <td>{product.cor}</td>
            <td>R$ {money(product.valor_locacao)}</td>
            <td>{product.status_geral}</td>
            <td><button className="secondary text-button" onClick={() => onView(product.id)}>Ver detalhes</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductDetail({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api(`/products/${productId}`).then(setData).catch(console.error);
  }, [productId]);

  if (!data?.produto) return <div className="modal-backdrop"><aside className="modal-panel"><p>Carregando vestido...</p></aside></div>;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <aside className="modal-panel">
        <div className="section-title">
          <div>
            <h2>{data.produto.nome}</h2>
            <p>{data.produto.codigo_interno} · {data.produto.tamanho || 'Sem tamanho'} · {data.produto.cor || 'Sem cor'}</p>
          </div>
          <button className="secondary text-button" onClick={onClose}>Fechar</button>
        </div>
        <div className="detail-grid">
          <div className="metric"><span>Status</span><strong>{data.produto.status_geral}</strong></div>
          <div className="metric"><span>Locacao</span><strong>R$ {money(data.produto.valor_locacao)}</strong></div>
          <div className="metric"><span>Reservas</span><strong>{data.reservas.length}</strong></div>
          <div className="metric"><span>Agenda</span><strong>{data.agenda.length}</strong></div>
        </div>
        <h3>Reservas e bloqueios</h3>
        {data.reservas.length === 0 ? <div className="empty compact">Nenhuma reserva para este vestido.</div> : data.reservas.map((row: any) => (
          <article className="mini-card" key={row.id}><strong>{row.tipo_bloqueio}</strong><span>{new Date(row.inicio_at).toLocaleString('pt-BR')} ate {new Date(row.fim_at).toLocaleString('pt-BR')} · {row.status}</span></article>
        ))}
      </aside>
    </div>
  );
}

function money(value: string | number) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
