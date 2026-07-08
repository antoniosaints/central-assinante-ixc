import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar } from '../config/ixc.js';
import { SessionStore } from '../store/sessions.js';
import {
  radLoginsMock,
  radTempoRealMock,
  radMensalMock,
} from '../mocks/data.js';

function num(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function sessaoOuErro(token) {
  const sessao = SessionStore.obter(token);
  if (!sessao) {
    throw {
      status: 401,
      code: 'SESSION_EXPIRED',
      message: 'Sua sessão expirou. Faça login novamente.',
    };
  }
  return sessao;
}

/** Mapeia um radusuarios (login) no formato da aplicação. */
function mapLogin(r) {
  return {
    id: r.id,
    login: r.login || `Login ${r.id}`,
    ativo: r.ativo === 'S',
    online: r.online === 'S',
    ip: r.ip || '',
    mac: r.mac || '',
    downloadAtual: num(r.download_atual),
    uploadAtual: num(r.upload_atual),
    tempoConectado: num(r.tempo_conectado),
    ultimaConexao: r.ultima_conexao_inicial || '',
    idContrato: r.id_contrato || '',
  };
}

/** Mapeia um registro de consumo (bytes por intervalo). */
function mapConsumo(r) {
  return {
    id: r.id,
    data: r.data || '',
    download: num(r.consumo),
    upload: num(r.consumo_upload),
  };
}

export const ConsumoService = {
  /** Logins do contrato, restritos ao cliente logado (anti-IDOR). */
  async listarLogins(token, idContrato) {
    if (isIxcConfigured()) {
      const sessao = sessaoOuErro(token);
      const body = {
        qtype: 'radusuarios.id_contrato',
        query: String(idContrato),
        oper: '=',
        page: '1',
        rp: '20',
        sortname: 'radusuarios.id',
        sortorder: 'desc',
      };
      const dados = await ixcListar('radusuarios', body, 'get');
      const registros = (dados?.registros || []).filter(
        (r) => String(r.id_cliente) === String(sessao.perfil.id),
      );
      const logins = registros.map(mapLogin);
      SessionStore.addLoginIds(token, logins.map((l) => l.id));
      return logins;
    }
    await delay();
    return radLoginsMock;
  },

  /** Últimos 10 registros de consumo (tempo real) de um login. */
  async tempoReal(token, idLogin) {
    if (isIxcConfigured()) {
      sessaoOuErro(token);
      if (!SessionStore.temLogin(token, idLogin)) {
        throw {
          status: 403,
          code: 'LOGIN_NAO_AUTORIZADO',
          message: 'Este login não pertence à sua conta.',
        };
      }
      const body = {
        qtype: 'radusuarios_consumo.id_login',
        query: String(idLogin),
        oper: '=',
        page: '1',
        rp: '10',
        sortname: 'radusuarios_consumo.id',
        sortorder: 'desc',
      };
      const dados = await ixcListar('radusuarios_consumo', body, 'get');
      return (dados?.registros || []).map(mapConsumo);
    }
    await delay(200);
    return radTempoRealMock;
  },

  /** Consumo mensal (histórico) de um login. */
  async mensal(token, idLogin) {
    if (isIxcConfigured()) {
      sessaoOuErro(token);
      if (!SessionStore.temLogin(token, idLogin)) {
        throw {
          status: 403,
          code: 'LOGIN_NAO_AUTORIZADO',
          message: 'Este login não pertence à sua conta.',
        };
      }
      const body = {
        qtype: 'radusuarios_consumo_m.id_login',
        query: String(idLogin),
        oper: '=',
        page: '1',
        rp: '1000',
        sortname: 'radusuarios_consumo_m.id',
        sortorder: 'desc',
      };
      const dados = await ixcListar('radusuarios_consumo_m', body, 'get');
      return (dados?.registros || []).map(mapConsumo);
    }
    await delay();
    return radMensalMock;
  },
};
