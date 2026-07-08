<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
});

// Mapeia status técnicos para rótulo + cor amigáveis.
const map = {
  ativo: { label: 'Ativo', tone: 'green' },
  pago: { label: 'Pago', tone: 'green' },
  confirmado: { label: 'Confirmado', tone: 'green' },
  resolvido: { label: 'Resolvido', tone: 'green' },
  pendente: { label: 'Pendente', tone: 'amber' },
  em_andamento: { label: 'Em andamento', tone: 'blue' },
  aberto: { label: 'Aberto', tone: 'blue' },
  vencido: { label: 'Vencido', tone: 'red' },
  cancelado: { label: 'Cancelado', tone: 'red' },
  inativo: { label: 'Inativo', tone: 'slate' },
};

const tones = {
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-500',
};

const config = computed(() => map[props.status] || { label: props.status, tone: 'slate' });
const toneClass = computed(() => tones[config.value.tone]);
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="toneClass"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {{ config.label }}
  </span>
</template>
