<script setup>
import { CalendarDays, Eye } from 'lucide-vue-next';
import Card from './Card.vue';
import Money from './Money.vue';
import DateText from './DateText.vue';
import StatusBadge from './StatusBadge.vue';
import { formatCompetencia } from '@/utils/format';

defineProps({
  fatura: { type: Object, required: true },
});
defineEmits(['visualizar']);
</script>

<template>
  <Card interactive class="!p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium text-slate-400">
          Competência {{ formatCompetencia(fatura.competencia) }}
        </p>
        <p class="mt-0.5 text-xl font-bold text-slate-800">
          <Money :value="fatura.valor" />
        </p>
        <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays class="h-3.5 w-3.5" />
          Vence em <DateText :value="fatura.vencimento" />
        </p>
      </div>
      <StatusBadge :status="fatura.status" />
    </div>

    <button
      class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-primary transition active:scale-[0.98] md:hover:bg-primary/5"
      @click="$emit('visualizar', fatura)"
    >
      <Eye class="h-4 w-4" /> Visualizar
    </button>
  </Card>
</template>
