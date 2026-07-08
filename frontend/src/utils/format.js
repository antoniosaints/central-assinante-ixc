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

/**
 * Formata bytes em unidade legível pt-BR (ex.: 2,85 GB, 551 MB, 4,3 MB).
 * @param {number|string} bytes
 */
export function formatBytes(bytes) {
  const n = Number(bytes);
  if (!n || Number.isNaN(n)) return '0 B';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: value < 10 ? 2 : 0 })} ${units[i]}`;
}

/**
 * Formata segundos em duração curta (ex.: "9h 53m", "45m", "12s").
 * @param {number|string} seconds
 */
export function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Hora curta (HH:MM) a partir de 'yyyy-MM-dd HH:MM:SS'. */
export function shortTime(datetime = '') {
  const m = String(datetime).match(/\d{2}:\d{2}/);
  return m ? m[0] : '';
}

/** Rótulo de mês curto (ex.: 'jul') a partir de 'yyyy-MM-...'. */
export function shortMonth(datetime = '') {
  const m = String(datetime).match(/^(\d{4})-(\d{2})/);
  if (!m) return '';
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return meses[Number(m[2]) - 1] || '';
}
