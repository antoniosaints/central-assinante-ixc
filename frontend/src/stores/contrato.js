import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ContratoService } from '@/services/contrato.service';

const SELECAO_KEY = 'cas.contrato';

function compararIdDesc(a, b) {
  const idA = Number(a.id);
  const idB = Number(b.id);
  if (!Number.isNaN(idA) && !Number.isNaN(idB)) return idB - idA;
  return String(b.id).localeCompare(String(a.id), 'pt-BR', { numeric: true });
}

function contratoPrioritario(lista) {
  return (
    [...lista].filter((contrato) => contrato.status === 'ativo').sort(compararIdDesc)[0] ||
    [...lista].sort(compararIdDesc)[0] ||
    null
  );
}

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
      selecionar(contratoPrioritario(contratos.value)?.id || '');
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
