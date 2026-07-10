import { computed, ref } from 'vue';

const STORAGE_KEY = 'cas-theme';
const savedTheme = localStorage.getItem(STORAGE_KEY);
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const theme = ref(savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light');

function applyTheme(value) {
  theme.value = value;
  document.documentElement.classList.toggle('dark', value === 'dark');
  document.documentElement.style.colorScheme = value;
  localStorage.setItem(STORAGE_KEY, value);
}

applyTheme(theme.value);

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark');

  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark');
  }

  return { theme, isDark, toggleTheme, setTheme: applyTheme };
}
