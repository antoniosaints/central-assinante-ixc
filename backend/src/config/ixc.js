import axios from 'axios';
import 'dotenv/config';

/**
 * Configuração da API IXCSoft (Basic Auth).
 * Enquanto IXC_API_URL/USER/PASSWORD não estiverem preenchidos, os serviços
 * caem no mock automaticamente.
 */
export const ixcConfig = {
  baseURL: process.env.IXC_API_URL || '',
  user: process.env.IXC_API_USER || '',
  password: process.env.IXC_API_PASSWORD || '',
  // Timeout POR TENTATIVA. Menor que antes porque agora há retry (ver abaixo):
  // é melhor falhar rápido e tentar de novo do que esperar 20s numa tentativa.
  timeout: Number(process.env.IXC_API_TIMEOUT) || 12000,
  // Nº de tentativas EXTRAS em falhas transitórias (timeout/rede/5xx do IXC).
  // Total de tentativas = retries + 1. 0 desliga o retry.
  retries: Number.isFinite(Number(process.env.IXC_API_RETRIES))
    ? Number(process.env.IXC_API_RETRIES)
    : 2,
  // Base do backoff (ms): espera cresce a cada tentativa (base, base*2, ...).
  retryDelay: Number(process.env.IXC_API_RETRY_DELAY) || 300,
};

export const isIxcConfigured = () =>
  Boolean(ixcConfig.baseURL && ixcConfig.user && ixcConfig.password);

/** Cliente Axios pré-configurado para a API IXC. */
export const ixcClient = axios.create({
  baseURL: ixcConfig.baseURL,
  timeout: ixcConfig.timeout,
  headers: { 'Content-Type': 'application/json' },
  // Basic Auth: base64(usuario:senha)
  auth: isIxcConfigured()
    ? { username: ixcConfig.user, password: ixcConfig.password }
    : undefined,
});

/** Pausa por `ms` milissegundos. */
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Classifica uma falha do Axios como transitória (vale a pena tentar de novo):
 * timeout, ausência de resposta (rede/DNS/conexão) ou 5xx do IXC.
 * NÃO trata 4xx nem erros já normalizados (que possuem `status`) como
 * transitórios — evita mascarar credencial inválida ou erro de negócio.
 */
function ehTransitorio(err) {
  if (!err || err.status) return false; // erro já normalizado por nós
  if (err.code === 'ECONNABORTED') return true; // timeout do Axios
  const transientes = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'];
  if (transientes.includes(err.code)) return true;
  if (!err.response) return true; // sem resposta => problema de rede
  return err.response.status >= 500; // 5xx do provedor
}

/**
 * Executa uma request no IXC com retry+backoff em falhas transitórias.
 * As consultas do IXC ("listar") são leituras idempotentes — reenviar é seguro
 * mesmo via POST. Usado por `ixcListar` e `ixcDownload`.
 */
async function requestComRetry(config) {
  let ultimoErro;
  for (let tentativa = 0; tentativa <= ixcConfig.retries; tentativa += 1) {
    try {
      return await ixcClient.request(config);
    } catch (err) {
      ultimoErro = err;
      const podeRepetir = tentativa < ixcConfig.retries && ehTransitorio(err);
      if (!podeRepetir) throw err;
      await esperar(ixcConfig.retryDelay * 2 ** tentativa); // 300, 600, ...
    }
  }
  throw ultimoErro;
}

/**
 * Executa uma consulta padrão do IXC (header `ixcsoft: listar`).
 * O IXC aceita o corpo de consulta tanto em POST quanto em GET.
 *
 * @param {string} recurso  ex.: 'cliente'
 * @param {object} body     payload de consulta do IXC
 * @param {'post'|'get'} metodo  método HTTP (default: post)
 */
export async function ixcListar(recurso, body, metodo = 'post') {
  const { data } = await requestComRetry({
    method: metodo,
    url: `/${recurso}`,
    data: body,
    headers: { ixcsoft: 'listar' },
  });
  // O IXC pode responder erro com HTTP 200 e { type: 'error' }.
  if (data && data.type === 'error') {
    throw {
      status: 502,
      code: 'IXC_ERROR',
      message: data.message || 'Erro retornado pela API do provedor.',
    };
  }
  return data;
}

/**
 * Baixa um recurso binário do IXC (ex.: boleto em PDF).
 * Se o IXC devolver JSON (erro), converte e lança.
 */
export async function ixcDownload(recurso, body, metodo = 'get') {
  const resp = await requestComRetry({
    method: metodo,
    url: `/${recurso}`,
    data: body,
    headers: { ixcsoft: 'listar' },
    responseType: 'arraybuffer',
  });
  const contentType = resp.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    let parsed;
    try {
      parsed = JSON.parse(Buffer.from(resp.data).toString('utf-8'));
    } catch {
      parsed = null;
    }
    throw {
      status: 502,
      code: 'IXC_BOLETO_ERRO',
      message: parsed?.message || 'Não foi possível gerar o boleto.',
    };
  }
  return { data: Buffer.from(resp.data), contentType };
}
