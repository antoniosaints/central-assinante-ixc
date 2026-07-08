import { resolveData } from './_helpers.js';
import { pagamentos, faturas, assinaturas, chamados } from '../mocks/data.js';

export const RelatoriosService = {
  listarPagamentos() {
    return resolveData('/relatorios/pagamentos', () => pagamentos);
  },

  listarFaturas() {
    return resolveData('/relatorios/faturas', () => faturas);
  },

  listarAssinaturas() {
    return resolveData('/relatorios/assinaturas', () => assinaturas);
  },

  listarChamados() {
    return resolveData('/relatorios/chamados', () => chamados);
  },

  /** Consolida os relatórios em um único payload de resumo. */
  listar() {
    return resolveData('/relatorios', () => ({
      pagamentos,
      faturas,
      assinaturas,
      chamados,
    }));
  },
};
