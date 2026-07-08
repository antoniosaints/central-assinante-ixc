<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { FileText, ScrollText, ChevronRight, Hash } from 'lucide-vue-next';

import PageContainer from '@/components/PageContainer.vue';
import Card from '@/components/Card.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Money from '@/components/Money.vue';
import DateText from '@/components/DateText.vue';
import BottomSheet from '@/components/BottomSheet.vue';
import { useAsync } from '@/composables/useAsync';
import { useContratoStore } from '@/stores/contrato';
import { FinanceiroService } from '@/services/financeiro.service';
import { formatCompetencia } from '@/utils/format';

const abas = [
  { key: 'faturas', label: 'Faturas', icon: FileText },
  { key: 'contratos', label: 'Contratos', icon: ScrollText },
];
const abaAtiva = ref('faturas');

const contratoStore = useContratoStore();
const { contratos, loading: contratosLoading } = storeToRefs(contratoStore);
onMounted(() => contratoStore.carregar());

const { data: faturas, loading, error, run } = useAsync(() =>
  FinanceiroService.listarPendencias(),
);

const carregando = computed(() =>
  abaAtiva.value === 'contratos' ? contratosLoading.value : loading.value,
);
const lista = computed(() =>
  abaAtiva.value === 'contratos' ? contratos.value : faturas.value || [],
);

// ---- Detalhe ----
const sheetOpen = ref(false);
const itemSel = ref(null);
function abrirDetalhe(item) {
  itemSel.value = item;
  sheetOpen.value = true;
}

const detalheCampos = computed(() => {
  const i = itemSel.value;
  if (!i) return [];
  if (abaAtiva.value === 'faturas') {
    return [
      { label: 'Competência', value: formatCompetencia(i.competencia) },
      { label: 'Descrição', value: i.descricao },
      { label: 'Recebimento', value: i.tipoRecebimento },
      { label: 'Vencimento', date: i.vencimento },
      { label: 'Valor', money: i.valor },
    ];
  }
  return [
    { label: 'Contrato', value: `#${i.id}` },
    { label: 'Descrição', value: i.descricao },
    { label: 'Ativado em', date: i.ativadoEm },
    { label: 'Renovação', date: i.renovacao },
    { label: 'Expiração', date: i.expiracao },
    { label: 'Fidelidade', value: i.fidelidadeMeses ? `${i.fidelidadeMeses} meses` : '—' },
  ];
});
</script>

<template>
  <PageContainer>
    <div class="mb-3 px-1">
      <h1 class="text-xl font-extrabold text-slate-800">Relatórios</h1>
      <p class="text-sm text-slate-400">Suas faturas e contratos</p>
    </div>

    <!-- Abas -->
    <div class="flex gap-2 pb-1">
      <button
        v-for="aba in abas"
        :key="aba.key"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition"
        :class="abaAtiva === aba.key ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-white text-slate-500 shadow-card'"
        @click="abaAtiva = aba.key"
      >
        <component :is="aba.icon" class="h-4 w-4" />
        {{ aba.label }}
      </button>
    </div>

    <div class="mt-4">
      <ErrorState v-if="error && abaAtiva === 'faturas'" :error="error" @retry="run" />

      <div v-else-if="carregando" class="space-y-3">
        <SkeletonCard v-for="n in 3" :key="n" :lines="1" />
      </div>

      <div v-else-if="lista.length" class="space-y-3">
        <Card
          v-for="item in lista"
          :key="item.id"
          interactive
          class="!p-4 cursor-pointer"
          @click="abrirDetalhe(item)"
        >
          <div class="flex items-center gap-3">
            <div class="min-w-0 flex-1">
              <!-- Faturas -->
              <template v-if="abaAtiva === 'faturas'">
                <p class="truncate text-sm font-bold text-slate-800">
                  Competência {{ formatCompetencia(item.competencia) }}
                </p>
                <p class="text-xs text-slate-400">Vence <DateText :value="item.vencimento" /></p>
              </template>
              <!-- Contratos -->
              <template v-else>
                <p class="truncate text-sm font-bold text-slate-800">{{ item.nome }}</p>
                <p class="flex items-center gap-1 text-xs text-slate-400">
                  <Hash class="h-3 w-3" />{{ item.id }} · Renova <DateText :value="item.renovacao" />
                </p>
              </template>
            </div>

            <div class="flex items-center gap-2">
              <StatusBadge v-if="item.status" :status="item.status" />
              <span v-if="item.valor" class="text-sm font-bold text-slate-800"><Money :value="item.valor" /></span>
              <ChevronRight class="h-4 w-4 text-slate-300" />
            </div>
          </div>
        </Card>
      </div>

      <EmptyState v-else title="Nada por aqui" message="Não há registros nesta categoria." />
    </div>

    <!-- Detalhe -->
    <BottomSheet :open="sheetOpen" title="Detalhes" @close="sheetOpen = false">
      <div v-if="itemSel" class="space-y-1">
        <div
          v-for="campo in detalheCampos"
          :key="campo.label"
          class="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
        >
          <span class="text-sm text-slate-400">{{ campo.label }}</span>
          <span class="text-right text-sm font-semibold text-slate-700">
            <Money v-if="campo.money !== undefined" :value="campo.money" />
            <DateText v-else-if="campo.date" :value="campo.date" />
            <template v-else>{{ campo.value || '—' }}</template>
          </span>
        </div>
        <div v-if="itemSel.status" class="flex items-center justify-between pt-3">
          <span class="text-sm text-slate-400">Status</span>
          <StatusBadge :status="itemSel.status" />
        </div>
      </div>
    </BottomSheet>
  </PageContainer>
</template>
