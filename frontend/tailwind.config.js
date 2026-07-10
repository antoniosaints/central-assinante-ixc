import { loadEnv } from 'vite';

// Cor primária configurável via .env do frontend (VITE_PRIMARY_COLOR).
// Os tons light/dark são derivados automaticamente do valor principal.
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'VITE_');
// Normaliza: aceita "#00aeef" ou "00aeef"; cai no default se vazio.
let PRIMARY = (env.VITE_PRIMARY_COLOR || '').trim().replace(/^["']|["']$/g, '');
if (PRIMARY && !PRIMARY.startsWith('#')) PRIMARY = `#${PRIMARY}`;
if (!PRIMARY) PRIMARY = '#00aeef';

/** Clareia (amount > 0) ou escurece (amount < 0) uma cor hex. */
function shade(hex, amount) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  const target = amount >= 0 ? 255 : 0;
  const p = Math.abs(amount);
  const mix = (c) => Math.round(c + (target - c) * p);
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: PRIMARY,
          light: shade(PRIMARY, 0.18),
          dark: shade(PRIMARY, -0.18),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 8px 30px -6px rgba(37, 99, 235, 0.18)',
        nav: '0 -4px 24px -8px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        app: '480px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.4' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
};
