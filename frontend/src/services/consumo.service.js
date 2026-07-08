import { http } from '@/config/api';

export const ConsumoService = {
  async buscarResumo() {
    const { data } = await http.get('/consumo/resumo');
    return data;
  },

  async buscarHistorico(periodo = 'diario') {
    const { data } = await http.get('/consumo/historico', { params: { periodo } });
    return data;
  },
};
