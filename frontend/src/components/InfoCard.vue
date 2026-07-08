<script setup>
import Card from './Card.vue';

defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
  tone: { type: String, default: 'primary' }, // primary | slate | emerald
});

const tones = {
  primary: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-500',
  amber: 'bg-amber-50 text-amber-600',
};
</script>

<template>
  <Card interactive class="!p-4">
    <div class="flex items-center gap-3">
      <div
        v-if="icon"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        :class="tones[tone]"
      >
        <component :is="icon" class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium leading-tight text-slate-400">{{ label }}</p>
        <p class="truncate text-lg font-bold text-slate-800">
          <slot>{{ value }}</slot>
        </p>
      </div>
    </div>
  </Card>
</template>
