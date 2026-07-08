import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar } from '../config/ixc.js';
import { SessionStore } from '../store/sessions.js';
import { contratos as contratosMock } from '../mocks/data.js';

/** Normaliza datas do IXC ('0000-00-00' -> ''). */
function data(valor) {
  return valor && valor !== '0000-00-00' ? valor : '';
}

/** Mapeia o status do contrato do IXC para os rótulos do StatusBadge. */
function mapStatus(status) {
  return (
    {
      A: 'ativo',
      I: 'inativo',
      D: 'cancelado', // desistência
      N: 'inativo', // pré-contrato / negativado
      C: 'cancelado',
    }[status] || 'inativo'
  );
}

/** Converte um registro de cliente_contrato do IXC no formato da aplicação. */
function mapContrato(reg) {
  return {
    id: reg.id,
    nome: reg.contrato || `Contrato ${reg.id}`,
    descricao: reg.descricao_aux_plano_venda || '',
    status: mapStatus(reg.status),
    statusInternet: reg.status_internet || '',
    ativadoEm: data(reg.data_ativacao),
    renovacao: data(reg.data_renovacao),
    expiracao: data(reg.data_expiracao),
    pagoAte: data(reg.pago_ate_data),
    fidelidadeMeses: Number(reg.fidelidade) || 0,
    filialId: reg.id_filial || '',
  };
}

async function listarIxc(idCliente) {
  const body = {
    qtype: 'cliente_contrato.id_cliente',
    query: String(idCliente),
    oper: '=',
    page: '1',
    rp: '20',
    sortname: 'cliente_contrato.id',
    sortorder: 'desc',
  };
  const dados = await ixcListar('cliente_contrato', body, 'get');
  const registros = Array.isArray(dados?.registros) ? dados.registros : [];
  return registros.map(mapContrato);
}

export const ContratosService = {
  /** Lista os contratos do cliente logado (identificado pela sessão). */
  async listar(token) {
    if (isIxcConfigured()) {
      const sessao = SessionStore.obter(token);
      if (!sessao) {
        throw {
          status: 401,
          code: 'SESSION_EXPIRED',
          message: 'Sua sessão expirou. Faça login novamente.',
        };
      }
      return listarIxc(sessao.perfil.id);
    }
    await delay();
    return contratosMock;
  },
};
