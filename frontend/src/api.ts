const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nome: string;
    email: string;
    permissions: string[];
  };
};

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(error.message ?? 'Erro inesperado.');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  return api<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}
