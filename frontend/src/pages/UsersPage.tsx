import { Save, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

type User = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfis: Array<{ id: string; nome: string }>;
};

type Profile = {
  id: string;
  nome: string;
  descricao: string;
  permissao_ids: string[];
};

type Permission = {
  id: string;
  modulo: string;
  acao: string;
  descricao: string;
};

export function UsersPage({ mode }: { mode: 'users' | 'permissions' }) {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  async function load() {
    if (mode === 'users') setUsers(await api<User[]>('/users'));
    const data = await api<{ profiles: Profile[]; permissions: Permission[] }>('/users/profiles');
    setProfiles(data.profiles);
    setPermissions(data.permissions);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [mode]);

  if (mode === 'permissions') {
    return <PermissionsMatrix profiles={profiles} permissions={permissions} onSaved={load} />;
  }

  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="section-title">
          <div>
            <h2>Usuários</h2>
            <p>Gerencie quem entra no sistema e quais perfis cada pessoa usa.</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.perfis.map((profile) => profile.nome).join(', ')}</td>
                <td><span className={user.ativo ? 'badge success' : 'badge muted'}>{user.ativo ? 'Sim' : 'Não'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NewUserForm profiles={profiles} onCreated={load} />
    </section>
  );
}

function NewUserForm({ profiles, onCreated }: { profiles: Profile[]; onCreated: () => void }) {
  const [perfilId, setPerfilId] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/users', {
      method: 'POST',
      body: JSON.stringify({
        nome: form.get('nome'),
        email: form.get('email'),
        password: form.get('password'),
        ativo: true,
        perfil_ids: perfilId ? [perfilId] : []
      })
    });
    event.currentTarget.reset();
    onCreated();
  }

  return (
    <form className="panel" onSubmit={submit}>
      <div className="section-title">
        <h2>Novo usuário</h2>
      </div>
      <label>Nome<input name="nome" required /></label>
      <label>E-mail<input name="email" type="email" required /></label>
      <label>Senha inicial<input name="password" type="password" minLength={8} required /></label>
      <label>
        Perfil
        <select value={perfilId} onChange={(event) => setPerfilId(event.target.value)}>
          <option value="">Selecione</option>
          {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.nome}</option>)}
        </select>
      </label>
      <button className="primary"><UserPlus size={18} /> Criar usuário</button>
    </form>
  );
}

function PermissionsMatrix({
  profiles,
  permissions,
  onSaved
}: {
  profiles: Profile[];
  permissions: Permission[];
  onSaved: () => void;
}) {
  async function toggle(profile: Profile, permissionId: string) {
    const hasPermission = profile.permissao_ids.includes(permissionId);
    const next = hasPermission
      ? profile.permissao_ids.filter((id) => id !== permissionId)
      : [...profile.permissao_ids, permissionId];

    await api(`/users/profiles/${profile.id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissao_ids: next })
    });
    onSaved();
  }

  return (
    <section className="panel wide">
      <div className="section-title">
        <div>
          <h2>Matriz de permissões</h2>
          <p>As permissões abaixo são validadas no backend antes de cada ação.</p>
        </div>
        <Save size={20} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Ação</th>
            {profiles.map((profile) => <th key={profile.id}>{profile.nome}</th>)}
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.modulo}</td>
              <td>{permission.acao}</td>
              {profiles.map((profile) => (
                <td key={profile.id}>
                  <input
                    aria-label={`${profile.nome} ${permission.modulo}:${permission.acao}`}
                    checked={profile.permissao_ids.includes(permission.id)}
                    onChange={() => toggle(profile, permission.id)}
                    type="checkbox"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
