import { http } from '@/config/api';

export const RelatorioService = {
  async listar() {
    const { data } = await http.get('/relatorios');
    return data;
  },

  async listarPagamentos() {
    const { data } = await http.get('/relatorios/pagamentos');
    return data;
  },

  async listarChamados() {
    const { data } = await http.get('/relatorios/chamados');
    return data;
  },
};
