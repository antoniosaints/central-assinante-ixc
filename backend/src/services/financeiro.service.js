import { delay } from './_helpers.js';
import { isIxcConfigured, ixcListar, ixcDownload } from '../config/ixc.js';
import { SessionStore } from '../store/sessions.js';
import { faturas as faturasMock } from '../mocks/data.js';

function num(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
function data(v) {
  return v && v !== '0000-00-00' ? v : '';
}
function ddmmyyyy(d) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

/** Janela de vencimento: de ~1 ano atrás (pega atrasados) a ~1 ano à frente. */
function periodoVencimento() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setFullYear(hoje.getFullYear() - 1);
  const fim = new Date(hoje);
  fim.setFullYear(hoje.getFullYear() + 1);
  return { inicio: ddmmyyyy(inicio), fim: ddmmyyyy(fim) };
}

/** Boleto vencido quando o vencimento já passou. */
function statusFatura(vencimento) {
  if (!vencimento) return 'pendente';
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${vencimento}T00:00:00`) < hoje ? 'vencido' : 'pendente';
}

/** Converte um registro fn_areceber (aberto) no formato de fatura da app. */
function mapFatura(reg) {
  const vencimento = data(reg.data_vencimento);
  const tipo = reg.tipo_recebimento || '';
  return {
    id: reg.id,
    competencia: vencimento.slice(0, 7), // yyyy-MM
    descricao: reg.obs || `Documento ${reg.documento || reg.id}`,
    valor: num(reg.valor_aberto || reg.valor),
    vencimento,
    status: statusFatura(vencimento),
    tipoRecebimento: tipo,
    linhaDigitavel: reg.linha_digitavel || '',
    temPix: Boolean(reg.pix_txid),
    podeBaixarBoleto: tipo.toLowerCase() === 'boleto',
    idContrato: reg.id_contrato || '',
    documento: reg.documento || '',
  };
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

async function listarAbertosIxc(idCliente) {
  const { inicio, fim } = periodoVencimento();
  const body = {
    qtype: 'fn_areceber.id_cliente',
    query: String(idCliente),
    oper: '=',
    page: '1',
    rp: '200000',
    sortname: 'fn_areceber.data_vencimento',
    sortorder: 'asc',
    grid_param: JSON.stringify([
      { TB: 'fn_areceber.liberado', OP: '=', P: 'S' },
      { TB: 'fn_areceber.status', OP: '!=', P: 'R', P2: 'C' },
      { TB: 'fn_areceber.data_vencimento', OP: 'BE', P: inicio, P2: fim },
    ]),
  };
  const dados = await ixcListar('fn_areceber', body, 'get');
  const registros = Array.isArray(dados?.registros) ? dados.registros : [];
  // Apenas os que têm valor realmente em aberto.
  return registros.filter((r) => num(r.valor_aberto) > 0).map(mapFatura);
}

export const FinanceiroService = {
  async listarPendencias(token) {
    if (isIxcConfigured()) return listarAbertosIxc(clienteIdDaSessao(token));
    await delay();
    return faturasMock.filter((f) => f.status === 'pendente');
  },

  async listarFaturas(token) {
    // Em aberto = pendências; histórico completo virá de outro endpoint futuramente.
    return this.listarPendencias(token);
  },

  async proximaFatura(token) {
    const lista = await this.listarPendencias(token);
    return lista[0] || null; // já ordenado por vencimento asc
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
