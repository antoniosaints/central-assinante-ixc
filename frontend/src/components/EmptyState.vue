<script setup>
import { Inbox } from 'lucide-vue-next';

defineProps({
  title: { type: String, default: 'Nada por aqui' },
  message: { type: String, default: 'Não encontramos informações para exibir.' },
  icon: { type: [Object, Function], default: () => Inbox },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow-card">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <component :is="icon" class="h-7 w-7" />
    </div>
    <div>
      <p class="text-sm font-bold text-slate-700">{{ title }}</p>
      <p class="mt-1 text-xs text-slate-400">{{ message }}</p>
    </div>
    <slot />
  </div>
</template>
