import { isProviderConfigured, providerClient } from '../config/api.js';

/** Simula a latência de rede para tornar os loadings do app realistas. */
export const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executa a chamada real quando a API estiver configurada; caso contrário,
 * devolve o mock. Centraliza o padrão usado por todos os serviços — ao ligar
 * a API real, basta que PROVIDER_API_BASE_URL esteja preenchido.
 *
 * @param {string} path      caminho na API real (ex.: '/clientes/perfil')
 * @param {() => any} mockFn  função que devolve o dado mockado
 */
export async function resolveData(path, mockFn) {
  if (isProviderConfigured()) {
    const { data } = await providerClient.get(path);
    return data;
  }
  await delay();
  return mockFn();
}
