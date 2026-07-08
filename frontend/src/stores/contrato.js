import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ContratoService } from '@/services/contrato.service';

const SELECAO_KEY = 'cas.contrato';

/**
 * Contratos do cliente logado + contrato selecionado.
 * O plano exibido no app depende do contrato escolhido (quando há mais de um).
 * Global para ser reaproveitado em consumo/faturas por contrato no futuro.
 */
export const useContratoStore = defineStore('contrato', () => {
  const contratos = ref([]);
  const selecionadoId = ref(localStorage.getItem(SELECAO_KEY) || '');
  const loading = ref(false);
  const error = ref(null);

  const selecionado = computed(
    () =>
      contratos.value.find((c) => c.id === selecionadoId.value) ||
      contratos.value[0] ||
      null,
  );
  const temMultiplos = computed(() => contratos.value.length > 1);

  async function carregar(force = false) {
    if (contratos.value.length && !force) return;
    loading.value = true;
    error.value = null;
    try {
      contratos.value = await ContratoService.listar();
      // Garante uma seleção válida.
      const existe = contratos.value.some((c) => c.id === selecionadoId.value);
      if (!existe) selecionar(contratos.value[0]?.id || '');
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  function selecionar(id) {
    selecionadoId.value = id;
    if (id) localStorage.setItem(SELECAO_KEY, id);
    else localStorage.removeItem(SELECAO_KEY);
  }

  function reset() {
    contratos.value = [];
    selecionar('');
    error.value = null;
  }

  return {
    contratos,
    selecionadoId,
    selecionado,
    temMultiplos,
    loading,
    error,
    carregar,
    selecionar,
    reset,
  };
});
