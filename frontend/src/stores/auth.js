import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '@/services/auth.service';
import { API_CONFIG } from '@/config/api';
import { useClienteStore } from './cliente';
import { useContratoStore } from './contrato';

const TOKEN_KEY = 'cas.token';
const USER_KEY = 'cas.user';

/** Estado de autenticação, persistido em localStorage. */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '');
  const usuario = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));

  const isAuthenticated = computed(() => Boolean(token.value));

  // Mantém o axios sincronizado com o token atual.
  if (token.value) API_CONFIG.TOKEN = token.value;

  async function login({ email, senha }) {
    const data = await AuthService.login({ email, senha });
    token.value = data.token;
    usuario.value = data.usuario;
    API_CONFIG.TOKEN = data.token;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    return data;
  }

  function logout() {
    // Encerra a sessão no backend antes de descartar o token (best-effort).
    AuthService.logout();
    token.value = '';
    usuario.value = null;
    API_CONFIG.TOKEN = '';
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Limpa dados em cache para não vazar entre sessões.
    useClienteStore().reset();
    useContratoStore().reset();
  }

  return { token, usuario, isAuthenticated, login, logout };
});
