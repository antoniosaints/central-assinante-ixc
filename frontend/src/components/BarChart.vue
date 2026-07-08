<script setup>
import { ref, computed, watch } from 'vue';

/**
 * Gráfico de barras simples baseado em CSS (sem dependências externas).
 * Ao tocar numa coluna, exibe um indicador com os valores daquela coluna.
 *
 * items: [{ label: string, value: number, value2?: number }]
 * format: função para formatar os valores no indicador (ex.: formatBytes)
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  unit: { type: String, default: '' },
  stacked: { type: Boolean, default: false }, // exibe value2 empilhado
  format: { type: Function, default: (v) => String(v) },
});

const max = computed(() => {
  const values = props.items.map((i) =>
    props.stacked ? (i.value || 0) + (i.value2 || 0) : i.value || 0,
  );
  return Math.max(1, ...values);
});

const heightPct = (v) => `${Math.max(3, Math.round(((v || 0) / max.value) * 100))}%`;

// ---- Seleção / indicador ----
const selected = ref(null);
function toggle(idx) {
  selected.value = selected.value === idx ? null : idx;
}

const n = computed(() => props.items.length || 1);
const selectedItem = computed(() =>
  selected.value !== null ? props.items[selected.value] : null,
);
// Mantém o indicador dentro dos limites do card.
const tooltipLeft = computed(() => {
  const center = ((selected.value + 0.5) / n.value) * 100;
  return Math.min(85, Math.max(15, center));
});

// Se o número de colunas mudar, evita seleção fora do intervalo.
watch(
  () => props.items.length,
  (len) => {
    if (selected.value !== null && selected.value >= len) selected.value = null;
  },
);
</script>

<template>
  <div class="relative">
    <!-- Faixa reservada para o indicador -->
    <div class="relative mb-1 h-12">
      <div
        v-if="selectedItem"
        class="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-800 px-3 py-1.5 text-center shadow-lg"
        :style="{ left: `${tooltipLeft}%` }"
      >
        <p class="text-[11px] font-semibold text-white">{{ selectedItem.label }}</p>
        <p class="text-[11px] font-medium text-sky-300">↓ {{ format(selectedItem.value) }}</p>
        <p v-if="stacked" class="text-[11px] font-medium text-emerald-300">
          ↑ {{ format(selectedItem.value2) }}
        </p>
        <span
          class="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-800"
        />
      </div>
    </div>

    <!-- Área das barras -->
    <div class="flex h-40 items-stretch gap-2">
      <button
        v-for="(item, idx) in items"
        :key="idx"
        type="button"
        class="flex flex-1 cursor-pointer flex-col justify-end overflow-hidden rounded-t-lg transition-opacity"
        :class="selected !== null && selected !== idx ? 'opacity-40' : ''"
        @click="toggle(idx)"
      >
        <div
          v-if="stacked && item.value2"
          class="w-full rounded-t-lg bg-primary-light/50 transition-[height] duration-500 ease-out"
          :style="{ height: heightPct(item.value2) }"
        />
        <div
          class="w-full bg-primary transition-[height] duration-500 ease-out"
          :class="[
            stacked && item.value2 ? '' : 'rounded-t-lg',
            selected === idx ? 'ring-2 ring-primary ring-offset-1' : '',
          ]"
          :style="{ height: heightPct(item.value) }"
        />
      </button>
    </div>

    <!-- Rótulos do eixo X -->
    <div class="mt-2 flex gap-2">
      <span
        v-for="(item, idx) in items"
        :key="`l-${idx}`"
        class="flex-1 text-center text-[10px] font-medium"
        :class="selected === idx ? 'text-primary' : 'text-slate-400'"
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

    <p class="mt-3 text-center text-[11px] text-slate-400">
      Toque nas barras para ver o consumo
    </p>
  </div>
</template>
