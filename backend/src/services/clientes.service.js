import { SessionStore } from '../store/sessions.js';
import { isIxcConfigured } from '../config/ixc.js';
import { cliente } from '../mocks/data.js';

export const ClientesService = {
  /**
   * Retorna o perfil do cliente logado.
   * Com IXC ativo, usa o perfil real capturado no login (via sessão).
   */
  buscarPerfil(token) {
    if (isIxcConfigured()) {
      const sessao = SessionStore.obter(token);
      if (!sessao) {
        throw {
          status: 401,
          code: 'SESSION_EXPIRED',
          message: 'Sua sessão expirou. Faça login novamente.',
        };
      }
      return sessao.perfil;
    }
    // Modo mock: usa a sessão se existir, senão o cliente de exemplo.
    return SessionStore.obter(token)?.perfil || cliente;
  },
};
