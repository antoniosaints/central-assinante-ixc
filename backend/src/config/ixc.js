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
  timeout: Number(process.env.IXC_API_TIMEOUT) || 20000,
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

/**
 * Executa uma consulta padrão do IXC (header `ixcsoft: listar`).
 * O IXC aceita o corpo de consulta tanto em POST quanto em GET.
 *
 * @param {string} recurso  ex.: 'cliente'
 * @param {object} body     payload de consulta do IXC
 * @param {'post'|'get'} metodo  método HTTP (default: post)
 */
export async function ixcListar(recurso, body, metodo = 'post') {
  const { data } = await ixcClient.request({
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
  const resp = await ixcClient.request({
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
