import { http } from '@/config/api';

export const FinanceiroService = {
  async listarPendencias() {
    const { data } = await http.get('/financeiro/pendencias');
    return data;
  },

  async proximaFatura() {
    const { data } = await http.get('/financeiro/proxima-fatura');
    return data;
  },

  /** Pix (copia e cola + QR base64) de um boleto. */
  async buscarPix(id) {
    const { data } = await http.get(`/financeiro/faturas/${id}/pix`);
    return data;
  },

  /** Baixa o PDF do boleto e dispara o download no navegador. */
  async baixarBoleto(id) {
    const resp = await http.get(`/financeiro/faturas/${id}/boleto`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boleto-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
