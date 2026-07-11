import { http } from '@/config/api';

export const DispositivoService = {
  /** Dispositivos (ACS) vinculados a um login do cliente logado. */
  async listar(idLogin) {
    const { data } = await http.get('/dispositivos', {
      params: { login: idLogin },
    });
    return data;
  },
};
