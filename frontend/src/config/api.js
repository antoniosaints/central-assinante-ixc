import axios from 'axios';

/**
 * Configuração do cliente HTTP do frontend.
 * O app SEMPRE fala com o backend intermediário — nunca com a API externa.
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  // Restaura o token persistido para as chamadas feitas antes do login store.
  TOKEN: localStorage.getItem('cas.token') || '',
};

export const http = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request — injeta o token quando existir.
http.interceptors.request.use((config) => {
  if (API_CONFIG.TOKEN) {
    config.headers.Authorization = `Bearer ${API_CONFIG.TOKEN}`;
  }
  return config;
});

// Interceptor de response — normaliza os erros para a UI.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    let type = 'api';
    let message = 'Não foi possível completar a solicitação.';

    if (error.code === 'ECONNABORTED') {
      type = 'timeout';
      message = 'A conexão demorou demais para responder.';
    } else if (!error.response) {
      type = 'network';
      message = 'Sem conexão com a internet.';
    } else if (error.response.status === 401) {
      type = 'session';
      message = 'Sua sessão expirou. Faça login novamente.';
      // Sessão inválida: limpa credenciais e volta ao login (exceto no
      // próprio login, cujo 401 é apenas "credenciais inválidas").
      if (!error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('cas.token');
        localStorage.removeItem('cas.user');
        API_CONFIG.TOKEN = '';
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    } else {
      message = error.response.data?.message || message;
    }

    return Promise.reject({ type, message, status: error.response?.status });
  },
);
