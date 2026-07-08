import { ref, shallowRef } from 'vue';

/**
 * Padrão único de carregamento assíncrono com estados de loading/erro.
 * Usado por todas as páginas para garantir loading + tratamento de erro
 * consistentes.
 *
 * @param {() => Promise<any>} fetcher
 * @param {{ immediate?: boolean, initialData?: any }} options
 */
export function useAsync(fetcher, options = {}) {
  const { immediate = true, initialData = null } = options;

  const data = shallowRef(initialData);
  const loading = ref(false);
  const refreshing = ref(false);
  const error = ref(null);

  async function run({ silent = false } = {}) {
    if (silent) refreshing.value = true;
    else loading.value = true;
    error.value = null;
    try {
      data.value = await fetcher();
    } catch (err) {
      error.value = err || { type: 'api', message: 'Erro inesperado.' };
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  }

  /** Recarrega sem esconder o conteúdo atual (pull to refresh). */
  const refresh = () => run({ silent: true });

  if (immediate) run();

  return { data, loading, refreshing, error, run, refresh };
}
