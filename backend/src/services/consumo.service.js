import { resolveData } from './_helpers.js';
import {
  consumoResumo,
  consumoHistoricoDiario,
  consumoHistoricoMensal,
} from '../mocks/data.js';

export const ConsumoService = {
  buscarResumo() {
    return resolveData('/consumo/resumo', () => consumoResumo);
  },

  buscarHistorico(periodo = 'diario') {
    return resolveData(`/consumo/historico?periodo=${periodo}`, () =>
      periodo === 'mensal' ? consumoHistoricoMensal : consumoHistoricoDiario,
    );
  },
};
