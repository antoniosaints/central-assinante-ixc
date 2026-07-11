import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar } from '../config/ixc.js';
import { cliente, credenciaisDemo } from '../mocks/data.js';

/** Normaliza datas do IXC ('0000-00-00' -> ''). */
function data(valor) {
  return valor && valor !== '0000-00-00' ? valor : '';
}

/**
 * Converte um registro de cliente do IXC no perfil (seguro) usado pela app.
 * Nunca inclui a senha, que o IXC devolve em texto puro.
 */
function mapPerfilIxc(reg) {
  return {
    id: reg.id,
    nome: reg.razao || reg.fantasia || '',
    cpf: reg.cnpj_cpf || '',
    email: reg.email || reg.hotsite_email || '',
    hotsiteEmail: reg.hotsite_email || '',
    telefone: reg.telefone_celular || reg.whatsapp || reg.fone || '',
    avatar: reg.foto_cartao || '',
    nascimento: data(reg.data_nascimento),
    cadastradoEm: data(reg.data_cadastro),
    endereco: {
      logradouro: reg.endereco || '',
      numero: reg.numero || '',
      complemento: reg.complemento || '',
      bairro: reg.bairro || '',
      cidadeId: reg.cidade || '', // FK no IXC (requer endpoint /cidade p/ o nome)
      ufId: reg.uf || '',
      cep: reg.cep || '',
    },
    contaId: reg.id_conta || '',
    filialId: reg.filial_id || '',
    // Plano/velocidade vêm do endpoint de contratos (/cliente/contratos).
  };
}

/** Usuário "leve" para a store de autenticação/header. */
function mapUsuario(perfil) {
  return { id: perfil.id, nome: perfil.nome, email: perfil.email, avatar: perfil.avatar };
}

/** Token de sessão opaco (a API IXC não emite JWT — validamos por consulta). */
function gerarToken(id) {
  return Buffer.from(`${id}:${Date.now()}`).toString('base64');
}

async function loginIxc({ email, senha }) {
  if (!email || !senha) {
    throw { status: 400, code: 'MISSING_CREDENTIALS', message: 'Informe e-mail e senha.' };
  }

  const body = {
    qtype: 'cliente.hotsite_email',
    query: email,
    oper: '=',
    page: '1',
    // A consulta já filtra e-mail + senha + ativo; basta o registro mais recente.
    // rp baixo deixa a resposta do IXC mais rápida e reduz timeouts no login.
    rp: '1',
    sortname: 'cliente.id',
    sortorder: 'desc',
    // Valida a senha e exige cliente ativo.
    grid_param: JSON.stringify([
      { TB: 'cliente.senha', OP: '=', P: senha },
      { TB: 'cliente.ativo', OP: '=', P: 'S' },
    ]),
  };

  let dados;
  try {
    dados = await ixcListar('cliente', body);
  } catch (err) {
    if (err?.status) throw err;
    throw {
      status: 502,
      code: 'IXC_UNAVAILABLE',
      message: 'Não foi possível comunicar com o provedor. Tente novamente.',
    };
  }

  const total = Number(dados?.total || 0);
  const registros = Array.isArray(dados?.registros) ? dados.registros : [];

  if (total < 1 || registros.length === 0) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' };
  }

  const perfil = mapPerfilIxc(registros[0]);
  return { token: gerarToken(perfil.id), usuario: mapUsuario(perfil), perfil };
}

async function loginMock({ email, senha }) {
  await delay();
  if (!email || !senha || senha !== credenciaisDemo.senha) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' };
  }
  const perfil = { ...cliente };
  return { token: gerarToken(cliente.id), usuario: mapUsuario(perfil), perfil };
}

export const AuthService = {
  login({ email, senha }) {
    return isIxcConfigured() ? loginIxc({ email, senha }) : loginMock({ email, senha });
  },
};
