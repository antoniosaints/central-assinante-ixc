import { http } from '@/config/api';

export const AuthService = {
  async login({ email, senha }) {
    const { data } = await http.post('/auth/login', { email, senha });
    return data;
  },

  // Best-effort: encerra a sessão no backend. Ignora falhas.
  async logout() {
    try {
      await http.post('/auth/logout');
    } catch {
      /* silencioso */
    }
  },
};
