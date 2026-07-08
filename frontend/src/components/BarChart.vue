<script setup>
import { computed } from 'vue';

/**
 * Gráfico de barras simples baseado em CSS (sem dependências externas).
 * Estrutura preparada para ser trocada por uma lib de gráficos futuramente.
 *
 * items: [{ label: string, value: number, value2?: number }]
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  unit: { type: String, default: '' },
  stacked: { type: Boolean, default: false }, // exibe value2 empilhado
});

const max = computed(() => {
  const values = props.items.map((i) =>
    props.stacked ? (i.value || 0) + (i.value2 || 0) : i.value || 0,
  );
  return Math.max(1, ...values);
});

const heightPct = (v) => `${Math.max(3, Math.round(((v || 0) / max.value) * 100))}%`;
</script>

<template>
  <div>
    <!-- Área das barras (altura fixa, colunas esticadas) -->
    <div class="flex h-40 items-stretch gap-2">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="flex flex-1 flex-col justify-end overflow-hidden rounded-t-lg"
      >
        <div
          v-if="stacked && item.value2"
          class="w-full rounded-t-lg bg-primary-light/50 transition-[height] duration-500 ease-out"
          :style="{ height: heightPct(item.value2) }"
        />
        <div
          class="w-full bg-primary transition-[height] duration-500 ease-out"
          :class="stacked && item.value2 ? '' : 'rounded-t-lg'"
          :style="{ height: heightPct(item.value) }"
        />
      </div>
    </div>

    <!-- Rótulos do eixo X -->
    <div class="mt-2 flex gap-2">
      <span
        v-for="(item, idx) in items"
        :key="`l-${idx}`"
        class="flex-1 text-center text-[10px] font-medium text-slate-400"
      >
        {{ item.label }}
      </span>
    </div>

    <div v-if="stacked" class="mt-4 flex items-center justify-center gap-4">
      <span class="flex items-center gap-1.5 text-xs text-slate-500">
        <span class="h-2.5 w-2.5 rounded-full bg-primary" /> Download
      </span>
      <span class="flex items-center gap-1.5 text-xs text-slate-500">
        <span class="h-2.5 w-2.5 rounded-full bg-primary-light/50" /> Upload
      </span>
    </div>
  </div>
</template>
