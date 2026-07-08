<script setup>
import { Wifi, RefreshCw } from 'lucide-vue-next';
import Card from './Card.vue';
import Money from './Money.vue';
import DateText from './DateText.vue';
import StatusBadge from './StatusBadge.vue';

defineProps({
  assinatura: { type: Object, required: true },
});
</script>

<template>
  <Card interactive class="!p-4">
    <div class="flex items-center gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Wifi class="h-5 w-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-slate-800">{{ assinatura.nome }}</p>
        <p class="truncate text-xs text-slate-400">{{ assinatura.descricao }}</p>
      </div>
      <StatusBadge :status="assinatura.status" />
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
      <div>
        <p class="text-xs text-slate-400">Valor mensal</p>
        <p class="text-base font-bold text-slate-800"><Money :value="assinatura.valor" /></p>
      </div>
      <div class="text-right">
        <p class="flex items-center justify-end gap-1 text-xs text-slate-400">
          <RefreshCw class="h-3.5 w-3.5" /> Renovação
        </p>
        <p class="text-sm font-semibold text-slate-700"><DateText :value="assinatura.renovacao" /></p>
      </div>
    </div>
  </Card>
</template>
