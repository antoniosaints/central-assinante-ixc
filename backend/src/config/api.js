import axios from 'axios';
import 'dotenv/config';

/**
 * Configuração central da API externa do provedor.
 *
 * Enquanto PROVIDER_API_BASE_URL não estiver definido, os serviços
 * continuam retornando dados mockados. Para integrar a API real, basta
 * preencher as variáveis de ambiente — nenhum serviço precisa ser reescrito.
 */
export const apiConfig = {
  baseURL: process.env.PROVIDER_API_BASE_URL || '',
  token: process.env.PROVIDER_API_TOKEN || '',
  timeout: Number(process.env.PROVIDER_API_TIMEOUT) || 15000,
};

/** Indica se a API real já está configurada. */
export const isProviderConfigured = () => Boolean(apiConfig.baseURL);

/** Cliente Axios pré-configurado para a API do provedor. */
export const providerClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    ...(apiConfig.token ? { Authorization: `Bearer ${apiConfig.token}` } : {}),
  },
});

// Interceptor de request — ponto único para injetar tokens/telemetria.
providerClient.interceptors.request.use((config) => config);

// Interceptor de response — normaliza os erros da API externa.
providerClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      status: error.response?.status || 502,
      code: error.code || 'PROVIDER_ERROR',
      message:
        error.response?.data?.message ||
        error.message ||
        'Erro ao comunicar com a API do provedor.',
    };
    return Promise.reject(normalized);
  },
);
