/**
 * Sessões em memória (token -> perfil do cliente).
 *
 * Sem banco de dados: o perfil real é capturado no login (consulta ao IXC) e
 * guardado aqui para servir /cliente/perfil sem reconsultar — e, principalmente,
 * sem devolver ao frontend campos sensíveis (ex.: a senha em texto puro que o
 * IXC retorna). Ao reiniciar o backend as sessões se perdem e o cliente é
 * redirecionado ao login (comportamento esperado de "sessão expirada").
 *
 * Também guarda o conjunto de logins (radusuarios) que pertencem ao cliente,
 * populado ao listar os logins — usado para impedir que um cliente consulte o
 * consumo de um login que não é seu (IDOR).
 */
const sessions = new Map();

export const SessionStore = {
  criar(token, perfil) {
    sessions.set(token, { perfil, criadoEm: Date.now(), loginIds: new Set() });
    return token;
  },
  obter(token) {
    return token ? sessions.get(token) : undefined;
  },
  remover(token) {
    if (token) sessions.delete(token);
  },
  /** Acumula os ids de login autorizados para a sessão. */
  addLoginIds(token, ids) {
    const s = sessions.get(token);
    if (!s) return;
    ids.forEach((id) => s.loginIds.add(String(id)));
  },
  /** Verifica se um id de login pertence ao cliente da sessão. */
  temLogin(token, id) {
    const s = sessions.get(token);
    return s ? s.loginIds.has(String(id)) : false;
  },
};
