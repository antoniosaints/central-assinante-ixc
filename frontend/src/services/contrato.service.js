import { http } from '@/config/api';

export const ContratoService = {
  async listar() {
    const { data } = await http.get('/cliente/contratos');
    return data;
  },
};
