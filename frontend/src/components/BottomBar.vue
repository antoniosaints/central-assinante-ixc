<script setup>
import { House, Signal, ChartColumn } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { name: 'inicio', label: 'Início', icon: House, to: '/' },
  { name: 'consumo', label: 'Consumo', icon: Signal, to: '/consumo' },
  { name: 'relatorios', label: 'Relatórios', icon: ChartColumn, to: '/relatorios' },
];

const isActive = (tab) => route.meta.tab === tab.name;
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app border-t border-slate-100 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)-0.4rem)] pt-2 shadow-nav backdrop-blur"
  >
    <div class="flex items-stretch justify-around">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="group relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors"
      >
        <span
          class="flex h-9 w-16 items-center justify-center rounded-full transition-all duration-300"
          :class="isActive(tab) ? 'bg-primary/10' : ''"
        >
          <component
            :is="tab.icon"
            class="h-6 w-6 transition-all duration-300"
            :class="isActive(tab) ? 'text-primary scale-110' : 'text-slate-400'"
          />
        </span>
        <span
          class="text-[11px] font-semibold transition-colors"
          :class="isActive(tab) ? 'text-primary' : 'text-slate-400'"
        >
          {{ tab.label }}
        </span>
      </RouterLink>
    </div>
  </nav>
</template>
