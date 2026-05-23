import { History, RotateCcw, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type Rule = {
  id: string;
  chave: string;
  nome: string;
  descricao: string;
  tipo_valor: string;
  valor: string;
  valor_padrao: string;
  valor_minimo: string | null;
  valor_maximo: string | null;
  unidade: string | null;
  grupo: string | null;
  sensivel: boolean;
};

type RuleModule = {
  id: string;
  chave: string;
  nome: string;
  descricao: string;
  regras: Rule[];
};

export function RulesPage() {
  const [modules, setModules] = useState<RuleModule[]>([]);
  const [activeModule, setActiveModule] = useState<string>('');

  async function load() {
    const data = await api<RuleModule[]>('/rules');
    setModules(data);
    setActiveModule((current) => current || data[0]?.id || '');
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const current = modules.find((module) => module.id === activeModule);

  return (
    <section className="rules-layout">
      <aside className="inner-menu">
        {modules.map((module) => (
          <button key={module.id} className={module.id === activeModule ? 'active' : ''} onClick={() => setActiveModule(module.id)}>
            {module.nome}
          </button>
        ))}
      </aside>

      <div className="rules-list">
        <div className="section-title">
          <div>
            <h2>{current?.nome ?? 'Regras da loja'}</h2>
            <p>{current?.descricao ?? 'Configure políticas da loja sem alterar código.'}</p>
          </div>
        </div>
        {current?.regras.length === 0 && <div className="empty">Nenhuma regra cadastrada neste módulo.</div>}
        {current?.regras.map((rule) => <RuleCard key={rule.id} rule={rule} onSaved={load} />)}
      </div>
    </section>
  );
}

function RuleCard({ rule, onSaved }: { rule: Rule; onSaved: () => void }) {
  const [valor, setValor] = useState(rule.valor);
  const [motivo, setMotivo] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    await api(`/rules/${rule.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ valor, motivo })
    });
    setMessage('Regra salva com histórico.');
    onSaved();
  }

  return (
    <form className="rule-card" onSubmit={submit}>
      <div>
        <h3>{rule.nome}</h3>
        <p>{rule.descricao}</p>
        <small>
          Padrão: {rule.valor_padrao}
          {rule.unidade ? ` ${rule.unidade}` : ''}
          {rule.sensivel ? ' · regra sensível' : ''}
        </small>
      </div>
      <div className="rule-controls">
        {rule.tipo_valor === 'boolean' ? (
          <select value={valor} onChange={(event) => setValor(event.target.value)}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        ) : (
          <input
            value={valor}
            min={rule.valor_minimo ?? undefined}
            max={rule.valor_maximo ?? undefined}
            onChange={(event) => setValor(event.target.value)}
          />
        )}
        {rule.sensivel && <input value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Motivo da alteração" />}
        <div className="actions">
          <button type="button" className="secondary" title="Restaurar padrão" onClick={() => setValor(rule.valor_padrao)}>
            <RotateCcw size={16} />
          </button>
          <button type="button" className="secondary" title="Ver histórico">
            <History size={16} />
          </button>
          <button className="primary" title="Salvar alterações">
            <Save size={16} />
          </button>
        </div>
        {message && <span className="inline-success">{message}</span>}
      </div>
    </form>
  );
}
