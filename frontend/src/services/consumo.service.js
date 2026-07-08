import { http } from '@/config/api';

export const ConsumoService = {
  /** Logins de um contrato (do cliente logado). */
  async listarLogins(idContrato) {
    const { data } = await http.get('/consumo/logins', {
      params: { contrato: idContrato },
    });
    return data;
  },

  /** Últimos 10 registros de consumo (tempo real) de um login. */
  async tempoReal(idLogin) {
    const { data } = await http.get('/consumo/tempo-real', {
      params: { login: idLogin },
    });
    return data;
  },

  /** Consumo mensal (histórico) de um login. */
  async mensal(idLogin) {
    const { data } = await http.get('/consumo/mensal', {
      params: { login: idLogin },
    });
    return data;
  },
};
