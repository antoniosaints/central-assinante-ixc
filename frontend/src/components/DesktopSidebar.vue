<script setup>
import { LayoutDashboard, Signal, ChartColumn, UserRound } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const emit = defineEmits(['navigate']);
const route = useRoute();

const items = [
  { name: 'inicio', label: 'Visão geral', description: 'Sua conta', icon: LayoutDashboard, to: '/' },
  { name: 'consumo', label: 'Consumo', description: 'Uso em tempo real', icon: Signal, to: '/consumo' },
  { name: 'relatorios', label: 'Faturas e contratos', description: 'Histórico financeiro', icon: ChartColumn, to: '/relatorios' },
];

function isActive(item) {
  return route.meta.tab === item.name;
}

function handleNavigation(item) {
  if (!isActive(item)) emit('navigate');
}
</script>

<template>
  <aside class="desktop-sidebar hidden w-[17.5rem] shrink-0 flex-col p-5 text-white md:flex">
    <RouterLink to="/" class="mb-10 flex items-center gap-3 px-3" aria-label="Central do Assinante - Visão geral">
      <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 p-1.5 ring-1 ring-white/15">
        <img src="/LOGO_CAS.png" class="h-full w-full object-contain" alt="CAS" />
      </span>
      <span class="leading-tight">
        <span class="block text-base font-extrabold tracking-tight">Central</span>
        <span class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">do assinante</span>
      </span>
    </RouterLink>

    <p class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Navegação</p>
    <nav class="space-y-1.5" aria-label="Navegação principal">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="item.to"
        class="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200"
        :class="isActive(item) ? 'bg-white text-primary shadow-lg shadow-slate-950/15' : 'text-white/70 hover:bg-white/10 hover:text-white'"
        @click="handleNavigation(item)"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-xl" :class="isActive(item) ? 'bg-primary/10 text-primary' : 'bg-white/8 text-white/80'">
          <component :is="item.icon" class="h-[18px] w-[18px]" />
        </span>
        <span class="min-w-0 leading-tight">
          <span class="block text-sm font-bold">{{ item.label }}</span>
          <span class="mt-0.5 block truncate text-[11px]" :class="isActive(item) ? 'text-slate-400' : 'text-white/45'">{{ item.description }}</span>
        </span>
      </RouterLink>
    </nav>

    <div class="mt-auto border-t border-white/10 px-3 pt-5">
      <RouterLink
        to="/meus-dados"
        class="flex items-center gap-3 rounded-2xl py-2 text-sm font-semibold text-white/65 transition hover:text-white"
        @click="emit('navigate')"
      >
        <UserRound class="h-5 w-5" />
        Meus dados
      </RouterLink>
      <p class="mt-4 text-[11px] leading-relaxed text-white/35">Tudo o que importa para sua conexão, no mesmo lugar.</p>
    </div>
  </aside>
</template>
