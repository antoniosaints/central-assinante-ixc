/**
 * Base de dados mockada usada enquanto a API real do provedor não existe.
 * Datas em ISO (yyyy-MM-dd) e valores numéricos — a formatação é do frontend.
 */

// Credenciais de demonstração (enquanto não há autenticação real).
export const credenciaisDemo = {
  email: 'joao.almeida@email.com',
  senha: '123456',
};

export const cliente = {
  id: 'CLI-000123',
  nome: 'João Pedro Almeida',
  cpf: '123.456.789-09',
  email: 'joao.almeida@email.com',
  telefone: '(11) 98765-4321',
  avatar: '',
  endereco: {
    logradouro: 'Rua das Palmeiras, 250',
    complemento: 'Apto 42',
    bairro: 'Jardim América',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01415-002',
  },
  cadastradoEm: '2022-03-18',
  plano: {
    nome: 'Fibra 600 Mega',
    velocidade: '600 Mbps',
    download: '600 Mbps',
    upload: '300 Mbps',
    valor: 129.9,
    status: 'ativo',
    renovacao: '2026-08-05',
  },
};

export const faturas = [
  {
    id: 'FAT-2026-07',
    competencia: '2026-07',
    descricao: 'Mensalidade Fibra 600 Mega',
    valor: 129.9,
    vencimento: '2026-07-10',
    status: 'pendente',
    tipoRecebimento: 'Pix',
    temPix: true,
    podeBaixarBoleto: false,
    linhaDigitavel: '34191.79001 01043.510047 91020.150008 8 98760000012990',
    pixCopiaCola:
      '00020126580014br.gov.bcb.pix0136a1b2c3d4-0007-1234-5678-abcdef1234565204000053039865802BR5920PROVEDOR NET LTDA6009SAO PAULO62070503***6304A1B2',
  },
  {
    id: 'FAT-2026-06',
    competencia: '2026-06',
    descricao: 'Mensalidade Fibra 600 Mega',
    valor: 129.9,
    vencimento: '2026-06-10',
    status: 'pendente',
    tipoRecebimento: 'Boleto',
    temPix: true,
    podeBaixarBoleto: true,
    linhaDigitavel: '34191.79001 01043.510047 91020.150008 8 98750000012990',
    pixCopiaCola:
      '00020126580014br.gov.bcb.pix0136a1b2c3d4-0006-1234-5678-abcdef1234565204000053039865802BR5920PROVEDOR NET LTDA6009SAO PAULO62070503***6304C3D4',
  },
  {
    id: 'FAT-2026-05',
    competencia: '2026-05',
    descricao: 'Mensalidade Fibra 600 Mega',
    valor: 129.9,
    vencimento: '2026-05-10',
    status: 'pago',
    pagoEm: '2026-05-08',
    linhaDigitavel: '34191.79001 01043.510047 91020.150008 8 98740000012990',
    pixCopiaCola: '',
  },
  {
    id: 'FAT-2026-04',
    competencia: '2026-04',
    descricao: 'Mensalidade Fibra 600 Mega',
    valor: 129.9,
    vencimento: '2026-04-10',
    status: 'pago',
    pagoEm: '2026-04-09',
    linhaDigitavel: '34191.79001 01043.510047 91020.150008 8 98730000012990',
    pixCopiaCola: '',
  },
];

export const assinaturas = [
  {
    id: 'ASS-001',
    nome: 'Fibra 600 Mega',
    descricao: 'Internet banda larga fibra óptica',
    valor: 129.9,
    status: 'ativo',
    renovacao: '2026-08-05',
    contratadoEm: '2022-03-18',
  },
  {
    id: 'ASS-002',
    nome: 'Ponto adicional Wi-Fi',
    descricao: 'Roteador mesh extra',
    valor: 19.9,
    status: 'ativo',
    renovacao: '2026-08-05',
    contratadoEm: '2024-01-10',
  },
];

// Contratos já no formato da aplicação (dois para exercitar o seletor).
export const contratos = [
  {
    id: '11984',
    nome: '2026-C/P-200+800M-ELITE',
    descricao: 'Fibra 800 Mega Download / 200 Mega Upload',
    status: 'ativo',
    statusInternet: 'AA',
    ativadoEm: '2023-05-10',
    renovacao: '2026-08-05',
    expiracao: '2027-06-03',
    pagoAte: '2026-05-06',
    fidelidadeMeses: 12,
    filialId: '2',
  },
  {
    id: '11985',
    nome: '2025-C/P-100+400M-START',
    descricao: 'Fibra 400 Mega Download / 100 Mega Upload',
    status: 'ativo',
    statusInternet: 'AA',
    ativadoEm: '2024-01-10',
    renovacao: '2026-08-05',
    expiracao: '2027-01-09',
    pagoAte: '2026-05-06',
    fidelidadeMeses: 12,
    filialId: '2',
  },
];

export const consumoResumo = {
  mes: '2026-07',
  download: 842.5, // GB
  upload: 118.3, // GB
  total: 960.8, // GB
  tempoConectadoHoras: 512,
  franquia: null, // sem franquia
};

export const consumoHistoricoDiario = [
  { data: '2026-07-01', download: 28.4, upload: 4.1 },
  { data: '2026-07-02', download: 31.2, upload: 5.6 },
  { data: '2026-07-03', download: 22.8, upload: 3.2 },
  { data: '2026-07-04', download: 40.1, upload: 6.9 },
  { data: '2026-07-05', download: 35.7, upload: 5.0 },
  { data: '2026-07-06', download: 44.3, upload: 7.8 },
  { data: '2026-07-07', download: 26.9, upload: 3.9 },
];

export const consumoHistoricoMensal = [
  { competencia: '2026-02', download: 690.2, upload: 92.1 },
  { competencia: '2026-03', download: 745.8, upload: 101.4 },
  { competencia: '2026-04', download: 812.3, upload: 110.7 },
  { competencia: '2026-05', download: 788.5, upload: 105.2 },
  { competencia: '2026-06', download: 901.0, upload: 124.6 },
  { competencia: '2026-07', download: 842.5, upload: 118.3 },
];

export const pagamentos = [
  { id: 'PAG-201', referencia: 'Mensalidade 05/2026', valor: 129.9, data: '2026-05-08', metodo: 'Pix', status: 'confirmado' },
  { id: 'PAG-200', referencia: 'Mensalidade 04/2026', valor: 129.9, data: '2026-04-09', metodo: 'Cartão de crédito', status: 'confirmado' },
  { id: 'PAG-199', referencia: 'Mensalidade 03/2026', valor: 129.9, data: '2026-03-10', metodo: 'Boleto', status: 'confirmado' },
  { id: 'PAG-198', referencia: 'Mensalidade 02/2026', valor: 129.9, data: '2026-02-09', metodo: 'Pix', status: 'confirmado' },
];

export const chamados = [
  {
    id: 'CHM-4521',
    protocolo: '2026070512345',
    assunto: 'Lentidão na conexão',
    abertoEm: '2026-07-05',
    status: 'resolvido',
    prioridade: 'alta',
    descricao: 'Cliente relatou lentidão no período noturno. Reset de OLT aplicado.',
  },
  {
    id: 'CHM-4498',
    protocolo: '2026061098765',
    assunto: 'Troca de senha do Wi-Fi',
    abertoEm: '2026-06-10',
    status: 'resolvido',
    prioridade: 'baixa',
    descricao: 'Alteração de senha realizada remotamente.',
  },
  {
    id: 'CHM-4470',
    protocolo: '2026070755443',
    assunto: 'Solicitação de segundo ponto',
    abertoEm: '2026-07-07',
    status: 'em_andamento',
    prioridade: 'media',
    descricao: 'Visita técnica agendada para instalação de ponto adicional.',
  },
];
