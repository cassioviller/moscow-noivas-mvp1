import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type CadastroOpcao = {
  id: string;
  modulo: string;
  campo: string;
  valor: string;
  rotulo: string;
  ordem: number;
  ativo: boolean;
};

const modules = [
  { key: 'crm', label: 'CRM' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'produtos', label: 'Vestidos' },
  { key: 'locacao', label: 'Locações' }
];

const fieldsByModule: Record<string, string[]> = {
  crm: ['interesse', 'origem', 'status_noiva'],
  agenda: ['tipo_agendamento', 'status_agendamento'],
  produtos: ['categoria', 'status_vestido'],
  locacao: ['forma_pagamento', 'status_locacao']
};

function slug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function SettingsPage() {
  const [moduleKey, setModuleKey] = useState('crm');
  const [field, setField] = useState('interesse');
  const [options, setOptions] = useState<CadastroOpcao[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    setOptions(await api<CadastroOpcao[]>(`/settings/options?modulo=${moduleKey}&campo=${field}`));
  }

  useEffect(() => {
    setField(fieldsByModule[moduleKey][0]);
  }, [moduleKey]);

  useEffect(() => {
    load().catch(console.error);
  }, [moduleKey, field]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rotulo = String(form.get('rotulo') || '');
    await api('/settings/options', {
      method: 'POST',
      body: JSON.stringify({
        modulo: moduleKey,
        campo: field,
        valor: slug(String(form.get('valor') || rotulo)),
        rotulo,
        ordem: Number(form.get('ordem') || options.length * 10 + 10),
        ativo: true
      })
    });
    event.currentTarget.reset();
    setMessage('Opção cadastrada.');
    load();
  }

  async function remove(id: string) {
    await api(`/settings/options/${id}`, { method: 'DELETE' });
    setMessage('Opção removida.');
    load();
  }

  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>Cadastros por módulo</h2>
            <p>Opções usadas nos campos de seleção do sistema.</p>
          </div>
        </div>
        <div className="settings-filters">
          <label>Módulo
            <select value={moduleKey} onChange={(event) => setModuleKey(event.target.value)}>
              {modules.map((module) => <option key={module.key} value={module.key}>{module.label}</option>)}
            </select>
          </label>
          <label>Campo
            <select value={field} onChange={(event) => setField(event.target.value)}>
              {fieldsByModule[moduleKey].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
        </div>
        {message && <div className="alert success-box">{message}</div>}
        {options.length === 0 ? <div className="empty">Nenhuma opção cadastrada.</div> : (
          <table>
            <thead><tr><th>Ordem</th><th>Rótulo</th><th>Valor técnico</th><th>Ativo</th><th>Ações</th></tr></thead>
            <tbody>
              {options.map((option) => (
                <tr key={option.id}>
                  <td>{option.ordem}</td>
                  <td>{option.rotulo}</td>
                  <td>{option.valor}</td>
                  <td>{option.ativo ? 'Sim' : 'Não'}</td>
                  <td><button className="secondary" title="Remover opção" onClick={() => remove(option.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="panel" onSubmit={submit}>
        <h2>Nova opção</h2>
        <label>Rótulo<input name="rotulo" required placeholder="Ex.: Vestido civil" /></label>
        <label>Valor técnico<input name="valor" placeholder="Gerado automaticamente se vazio" /></label>
        <label>Ordem<input name="ordem" type="number" min="0" step="1" /></label>
        <button className="primary"><Plus size={18} /> Adicionar</button>
      </form>
    </section>
  );
}
