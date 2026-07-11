import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar } from '../config/ixc.js';
import { SessionStore } from '../store/sessions.js';
import { acsDevicesMock } from '../mocks/data.js';

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

/**
 * Mapeia um registro de acs_device (ACS/TR-069) no formato da aplicação.
 * A SENHA do Wi-Fi (senha_router_wifi*) é omitida de propósito — não deve
 * trafegar para o frontend. Exibimos apenas o nome da rede (SSID).
 */
function mapDispositivo(r) {
  return {
    id: r.id,
    principal: r.device_primary === 'S',
    status: String(r.status || '').toLowerCase() === 'online' ? 'online' : 'offline',
    modelo: r.model || '',
    fabricante: r.manufacturer || '',
    serial: r.serial_number || '',
    ipv4: r.ipv4 || '',
    wifi24: r.ssid_router_wifi || '',
    wifi5: r.ssid_router_wifi_2 || '',
    ultimoContato: r.last_inform || '',
    atualizadoEm: r.last_update || '',
    idLogin: r.id_login || '',
  };
}

export const DispositivosService = {
  /** Dispositivos (ACS) de um login, restritos ao cliente logado (anti-IDOR). */
  async listar(token, idLogin) {
    if (isIxcConfigured()) {
      sessaoOuErro(token);
      // Só permite consultar um login que já foi listado como do cliente.
      if (!SessionStore.temLogin(token, idLogin)) {
        throw {
          status: 403,
          code: 'LOGIN_NAO_AUTORIZADO',
          message: 'Este login não pertence à sua conta.',
        };
      }
      const body = {
        qtype: 'acs_device.id_login',
        query: String(idLogin),
        oper: '=',
        page: '1',
        rp: '20',
        sortname: 'acs_device.id',
        sortorder: 'desc',
      };
      const dados = await ixcListar('acs_device_grid', body, 'get');
      return (dados?.registros || []).map(mapDispositivo);
    }
    await delay();
    return acsDevicesMock;
  },
};
