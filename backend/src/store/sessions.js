/**
 * Sessões em memória (token -> perfil do cliente).
 *
 * Sem banco de dados: o perfil real é capturado no login (consulta ao IXC) e
 * guardado aqui para servir /cliente/perfil sem reconsultar — e, principalmente,
 * sem devolver ao frontend campos sensíveis (ex.: a senha em texto puro que o
 * IXC retorna). Ao reiniciar o backend as sessões se perdem e o cliente é
 * redirecionado ao login (comportamento esperado de "sessão expirada").
 */
const sessions = new Map();

export const SessionStore = {
  criar(token, perfil) {
    sessions.set(token, { perfil, criadoEm: Date.now() });
    return token;
  },
  obter(token) {
    return token ? sessions.get(token) : undefined;
  },
  remover(token) {
    if (token) sessions.delete(token);
  },
};
