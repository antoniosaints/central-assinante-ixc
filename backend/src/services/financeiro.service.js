import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar, ixcDownload } from '../config/ixc.js';
import { SessionStore } from '../store/sessions.js';
import { faturas as faturasMock } from '../mocks/data.js';

function num(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
function numOuNull(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function data(v) {
  return v && v !== '0000-00-00' ? v : '';
}
function ddmmyyyy(d) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

function timestampVencimento(fatura) {
  if (!fatura?.vencimento) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(`${fatura.vencimento}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

export function ordenarFaturasMaisRecentes(faturas) {
  return [...faturas].sort((a, b) => timestampVencimento(b) - timestampVencimento(a));
}

// /** Janela de vencimento: de ~1 ano atrás (pega atrasados) a ~1 ano à frente. */
// function periodoVencimento() {
//   const hoje = new Date();
//   const inicio = new Date(hoje);
//   inicio.setFullYear(hoje.getFullYear() - 1);
//   const fim = new Date(hoje);
//   fim.setFullYear(hoje.getFullYear() + 1);
//   return { inicio: ddmmyyyy(inicio), fim: ddmmyyyy(fim) };
// }

function periodoVencimento() {
  const hoje = new Date();

  // Primeiro dia do mês anterior
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

  // Último dia do mês atual
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  return {
    inicio: ddmmyyyy(inicio),
    fim: ddmmyyyy(fim),
  };
}

/** Boleto vencido quando o vencimento já passou. */
function statusFatura(reg, vencimento) {
  if (reg.status === 'R') return 'pago';
  if (!vencimento) return 'pendente';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${vencimento}T00:00:00`) < hoje ? 'vencido' : 'pendente';
}

function valorFatura(reg) {
  const candidatos = reg.status === 'R'
    ? [
        reg.valor_recebido,
        reg.valor_pago,
        reg.valor_total_recebido,
        reg.valor_liquido,
        reg.valor,
      ]
    : [reg.valor_aberto, reg.valor];

  for (const candidato of candidatos) {
    const valor = numOuNull(candidato);
    if (valor && valor > 0) return valor;
  }

  return reg.status === 'R' ? null : 0;
}

/** Converte um registro fn_areceber (aberto) no formato de fatura da app. */
function mapFatura(reg) {
  const vencimento = data(reg.data_vencimento);
  const tipo = reg.tipo_recebimento || '';
  return {
    id: reg.id,
    competencia: vencimento.slice(0, 7), // yyyy-MM
    descricao: reg.obs || `Documento ${reg.documento || reg.id}`,
    valor: valorFatura(reg),
    vencimento,
    status: statusFatura(reg, vencimento),
    pagoEm: data(reg.data_recebimento || reg.data_credito),
    tipoRecebimento: tipo,
    linhaDigitavel: reg.linha_digitavel || '',
    temPix: Boolean(reg.pix_txid),
    podeBaixarBoleto: tipo.toLowerCase() === 'boleto',
    idContrato: reg.id_contrato || '',
    documento: reg.documento || '',
  };
}

export function normalizarFaturasPendentesIxc(registros) {
  return ordenarFaturasMaisRecentes(
    registros
      .filter((r) => r.status !== 'R' && r.status !== 'C')
      .filter((r) => num(r.valor_aberto) > 0)
      .map(mapFatura),
  );
}

export function normalizarFaturasRelatorioIxc(registros) {
  return ordenarFaturasMaisRecentes(
    registros
      .filter((r) => r.status !== 'C')
      .map(mapFatura),
  );
}

function clienteIdDaSessao(token) {
  const sessao = SessionStore.obter(token);
  if (!sessao) {
    throw {
      status: 401,
      code: 'SESSION_EXPIRED',
      message: 'Sua sessão expirou. Faça login novamente.',
    };
  }
  return sessao.perfil.id;
}

async function listarFaturasIxc(idCliente, { somentePendentes = false } = {}) {
  const { fim } = periodoVencimento();
  const body = {
    qtype: 'fn_areceber.id_cliente',
    query: String(idCliente),
    oper: '=',
    page: '1',
    rp: '200000',
    sortname: 'fn_areceber.data_vencimento',
    sortorder: 'desc',
    grid_param: JSON.stringify([
      { TB: 'fn_areceber.liberado', OP: '=', P: 'S' },
      somentePendentes
        ? { TB: 'fn_areceber.status', OP: '!=', P: 'R', P2: 'C' }
        : { TB: 'fn_areceber.status', OP: '!=', P: 'C' },
      { TB: 'fn_areceber.data_vencimento', OP: '<', P: fim },
    ]),
  };
  const dados = await ixcListar('fn_areceber', body, 'get');
  const registros = Array.isArray(dados?.registros) ? dados.registros : [];
  return somentePendentes
    ? normalizarFaturasPendentesIxc(registros)
    : normalizarFaturasRelatorioIxc(registros);
}

export const FinanceiroService = {
  async listarPendencias(token) {
    if (isIxcConfigured()) return listarFaturasIxc(clienteIdDaSessao(token), { somentePendentes: true });
    await delay();
    return ordenarFaturasMaisRecentes(faturasMock.filter((f) => f.status === 'pendente'));
  },

  async listarFaturas(token) {
    if (isIxcConfigured()) return listarFaturasIxc(clienteIdDaSessao(token));
    await delay();
    return ordenarFaturasMaisRecentes(faturasMock.filter((f) => f.status !== 'cancelado'));
  },

  async proximaFatura(token) {
    const lista = await this.listarPendencias(token);
    return lista[0] || null;
  },

  /** Pix (copia e cola + QR) de um boleto via /get_pix. */
  async buscarPix(token, id) {
    if (isIxcConfigured()) {
      clienteIdDaSessao(token); // valida sessão
      const dados = await ixcListar('get_pix', { id_areceber: String(id) }, 'get');
      const pix = dados?.pix;
      if (!pix) {
        throw {
          status: 404,
          code: 'PIX_INDISPONIVEL',
          message: 'Pix não disponível para esta fatura.',
        };
      }
      return {
        pixCopiaCola: pix.qrCode?.qrcode || pix.dadosPix?.pixCopiaECola || '',
        qrCodeBase64: pix.qrCode?.imagemQrcode || '',
        txid: pix.dadosPix?.txid || '',
        vencimento: pix.dadosPix?.calendario?.dataDeVencimento || '',
        valor: num(pix.dadosPix?.valor?.original),
      };
    }
    await delay();
    const f = faturasMock.find((x) => x.id === id);
    return { pixCopiaCola: f?.pixCopiaCola || '', qrCodeBase64: '', txid: '' };
  },

  /** PDF do boleto via /get_boleto (tipo "arquivo"). Só p/ tipo "Boleto". */
  async baixarBoleto(token, id) {
    if (isIxcConfigured()) {
      clienteIdDaSessao(token);
      const { data: buffer, contentType } = await ixcDownload(
        'get_boleto',
        {
          boletos: String(id),
          juro: 'S',
          multa: 'S',
          atualiza_boleto: 'S',
          tipo_boleto: 'arquivo', // "arquivo" => PDF; "dados" => JSON
          base64: 'N',
        },
        'get',
      );
      return {
        buffer,
        contentType: contentType.includes('pdf') ? contentType : 'application/pdf',
        filename: `boleto-${id}.pdf`,
      };
    }
    await delay();
    return {
      buffer: Buffer.from(`Boleto ${id} (mock)`, 'utf-8'),
      contentType: 'text/plain',
      filename: `boleto-${id}.txt`,
    };
  },
};
