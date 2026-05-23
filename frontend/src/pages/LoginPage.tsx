import { LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { login, type Session } from '../api';

export function LoginPage({ onLogin }: { onLogin: (session: Session) => void }) {
  const [email, setEmail] = useState('admin@moscownoivas.local');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const session = await login(email, password);
      localStorage.setItem('accessToken', session.accessToken);
      localStorage.setItem('session', JSON.stringify(session));
      onLogin(session);
    } catch {
      setError('Não conseguimos entrar com esses dados. Verifique e tente novamente.');
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">Moscow Noivas</div>
        <p>Entre para organizar atendimentos, usuários e regras da loja.</p>
        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Senha
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="primary" type="submit">
          <LockKeyhole size={18} />
          Entrar
        </button>
        <button className="link-button" type="button">Esqueci minha senha</button>
      </form>
    </div>
  );
}
