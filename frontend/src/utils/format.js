/**
 * Formata um valor numérico como moeda brasileira: R$ 59,90.
 * @param {number|string} value
 */
export function formatCurrency(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 'R$ 0,00';
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata uma data (Date | ISO | yyyy-MM-dd) no padrão dd/MM/yyyy.
 * Nunca exibe horário.
 * @param {string|Date} value
 */
export function formatDate(value) {
  if (!value) return '—';
  // Trata 'yyyy-MM-dd' sem fuso para evitar deslocamento de um dia.
  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = isDateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Formata competência 'yyyy-MM' como 'MM/yyyy'.
 * @param {string} value
 */
export function formatCompetencia(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || '—';
  const [ano, mes] = value.split('-');
  return `${mes}/${ano}`;
}

/** Saudação de acordo com o horário atual. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Iniciais para o avatar (ex.: "João Pedro" -> "JP"). */
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Primeiro nome (para saudações). */
export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || '';
}
