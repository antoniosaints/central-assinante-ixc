import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  normalizarFaturasPendentesIxc,
  normalizarFaturasRelatorioIxc,
  ordenarFaturasMaisRecentes,
} from './financeiro.service.js';

test('ordena faturas em aberto da mais recente para a mais antiga', () => {
  const faturas = [
    { id: 'marco', vencimento: '2026-03-18' },
    { id: 'sem-data', vencimento: '' },
    { id: 'maio', vencimento: '2026-05-18' },
    { id: 'abril', vencimento: '2026-04-20' },
  ];

  const ordenadas = ordenarFaturasMaisRecentes(faturas);

  assert.deepEqual(
    ordenadas.map((fatura) => fatura.id),
    ['maio', 'abril', 'marco', 'sem-data'],
  );
  assert.deepEqual(
    faturas.map((fatura) => fatura.id),
    ['marco', 'sem-data', 'maio', 'abril'],
  );
});

test('relatorio inclui faturas recebidas e oculta canceladas', () => {
  const registros = [
    {
      id: 'recebida',
      data_vencimento: '2026-05-18',
      status: 'R',
      valor: '89.90',
      valor_aberto: '0.00',
      data_recebimento: '2026-05-16',
    },
    {
      id: 'cancelada',
      data_vencimento: '2026-04-18',
      status: 'C',
      valor: '89.90',
      valor_aberto: '0.00',
    },
    {
      id: 'aberta',
      data_vencimento: '2026-08-18',
      status: 'A',
      valor: '89.90',
      valor_aberto: '89.90',
    },
  ];

  const faturas = normalizarFaturasRelatorioIxc(registros);

  assert.deepEqual(
    faturas.map((fatura) => [fatura.id, fatura.status]),
    [
      ['aberta', 'pendente'],
      ['recebida', 'pago'],
    ],
  );
  assert.equal(faturas.find((fatura) => fatura.id === 'recebida').pagoEm, '2026-05-16');
});

test('fatura recebida usa valor pago quando valor aberto vem zerado', () => {
  const faturas = normalizarFaturasRelatorioIxc([
    {
      id: 'recebida',
      data_vencimento: '2026-05-18',
      status: 'R',
      valor_aberto: '0.00',
      valor_recebido: '89.90',
    },
  ]);

  assert.equal(faturas[0].valor, 89.9);
});

test('fatura recebida sem valor util retorna valor nulo para a interface ocultar', () => {
  const faturas = normalizarFaturasRelatorioIxc([
    {
      id: 'recebida',
      data_vencimento: '2026-05-18',
      status: 'R',
      valor_aberto: '0.00',
    },
  ]);

  assert.equal(faturas[0].valor, null);
});

test('pendencias mantem apenas faturas em aberto para a tela inicial', () => {
  const registros = [
    { id: 'recebida', data_vencimento: '2026-05-18', status: 'R', valor: '89.90', valor_aberto: '0.00' },
    { id: 'cancelada', data_vencimento: '2026-04-18', status: 'C', valor: '89.90', valor_aberto: '0.00' },
    { id: 'aberta', data_vencimento: '2026-08-18', status: 'A', valor: '89.90', valor_aberto: '89.90' },
  ];

  const faturas = normalizarFaturasPendentesIxc(registros);

  assert.deepEqual(
    faturas.map((fatura) => fatura.id),
    ['aberta'],
  );
});
