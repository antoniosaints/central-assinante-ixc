import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ClientesService } from '../services/clientes.service.js';
import { ContratosService } from '../services/contratos.service.js';
import { FinanceiroService } from '../services/financeiro.service.js';
import { ConsumoService } from '../services/consumo.service.js';
import { DispositivosService } from '../services/dispositivos.service.js';
import { RelatoriosService } from '../services/relatorios.service.js';
import { SessionStore } from '../store/sessions.js';

const router = Router();

/** Envolve um handler async e encaminha erros ao middleware central. */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Extrai o token do header Authorization: Bearer <token>. */
const getToken = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
};

// ---------- Autenticação ----------
router.post('/auth/login', wrap(async (req, res) => {
  const { email, senha } = req.body || {};
  const { token, usuario, perfil } = await AuthService.login({ email, senha });
  // Guarda o perfil real na sessão; devolve ao frontend só token + usuário.
  SessionStore.criar(token, perfil);
  res.json({ token, usuario });
}));

router.post('/auth/logout', wrap(async (req, res) => {
  SessionStore.remover(getToken(req));
  res.json({ ok: true });
}));

// ---------- Cliente ----------
router.get('/cliente/perfil', wrap(async (req, res) => {
  res.json(await ClientesService.buscarPerfil(getToken(req)));
}));

router.get('/cliente/contratos', wrap(async (req, res) => {
  res.json(await ContratosService.listar(getToken(req)));
}));

// ---------- Financeiro (boletos em aberto) ----------
router.get('/financeiro/faturas', wrap(async (req, res) => {
  res.json(await FinanceiroService.listarFaturas(getToken(req)));
}));

router.get('/financeiro/pendencias', wrap(async (req, res) => {
  res.json(await FinanceiroService.listarPendencias(getToken(req)));
}));

router.get('/financeiro/proxima-fatura', wrap(async (req, res) => {
  res.json(await FinanceiroService.proximaFatura(getToken(req)));
}));

// Pix (copia e cola + QR) de um boleto.
router.get('/financeiro/faturas/:id/pix', wrap(async (req, res) => {
  res.json(await FinanceiroService.buscarPix(getToken(req), req.params.id));
}));

// Download do boleto em PDF.
router.get('/financeiro/faturas/:id/boleto', wrap(async (req, res) => {
  const { buffer, contentType, filename } = await FinanceiroService.baixarBoleto(
    getToken(req),
    req.params.id,
  );
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}));

// ---------- Consumo (radusuarios) ----------
router.get('/consumo/logins', wrap(async (req, res) => {
  res.json(await ConsumoService.listarLogins(getToken(req), req.query.contrato));
}));

router.get('/consumo/tempo-real', wrap(async (req, res) => {
  res.json(await ConsumoService.tempoReal(getToken(req), req.query.login));
}));

router.get('/consumo/mensal', wrap(async (req, res) => {
  res.json(await ConsumoService.mensal(getToken(req), req.query.login));
}));

// ---------- Dispositivos (ACS) ----------
router.get('/dispositivos', wrap(async (req, res) => {
  res.json(await DispositivosService.listar(getToken(req), req.query.login));
}));

// ---------- Relatórios ----------
router.get('/relatorios', wrap(async (req, res) => {
  res.json(await RelatoriosService.listar());
}));

router.get('/relatorios/pagamentos', wrap(async (req, res) => {
  res.json(await RelatoriosService.listarPagamentos());
}));

router.get('/relatorios/chamados', wrap(async (req, res) => {
  res.json(await RelatoriosService.listarChamados());
}));

export default router;
