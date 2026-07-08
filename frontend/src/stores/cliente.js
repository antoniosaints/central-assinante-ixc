import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ClienteService } from '@/services/cliente.service';

/**
 * Estado global do cliente logado. O perfil é usado no header em todas as
 * páginas, então é carregado uma única vez e compartilhado.
 */
export const useClienteStore = defineStore('cliente', () => {
  const perfil = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function carregarPerfil(force = false) {
    if (perfil.value && !force) return perfil.value;
    loading.value = true;
    error.value = null;
    try {
      perfil.value = await ClienteService.buscarPerfil();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
    return perfil.value;
  }

  function reset() {
    perfil.value = null;
    error.value = null;
  }

  return { perfil, loading, error, carregarPerfil, reset };
});
