<script setup>
import { UserRound, LogOut, MoonStar, SunMedium } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';

defineProps({ desktop: { type: Boolean, default: false } });
const emit = defineEmits(['close']);
const router = useRouter();
const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();

function sair() {
  auth.logout();
  router.replace({ name: 'login' });
}

const items = [
  { label: 'Meus Dados', icon: UserRound, action: () => router.push('/meus-dados') },
  { label: 'Sair', icon: LogOut, danger: true, action: sair },
];

function handle(item) {
  emit('close');
  item.action();
}
</script>

<template>
  <!-- Renderizado fora do header para não ser recortado pelo overflow dele. -->
  <Teleport to="body">
    <div class="fixed inset-0 z-40 bg-slate-900/30" @click="$emit('close')" />

    <div class="profile-menu fixed z-50 w-60 origin-top-right overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-slate-100 animate-fade-in" :class="{ 'desktop-profile-menu': desktop }">
      <button
        class="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors active:bg-slate-100 md:hover:bg-slate-50"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        @click="toggleTheme"
      >
        <span class="flex items-center gap-3">
          <component :is="isDark ? SunMedium : MoonStar" class="h-5 w-5 text-primary" />
          {{ isDark ? 'Tema claro' : 'Tema escuro' }}
        </span>
        <span class="relative h-6 w-11 rounded-full bg-slate-200 p-1 transition-colors" :class="isDark ? '!bg-primary' : ''">
          <span class="block h-4 w-4 rounded-full bg-white shadow-sm transition-transform" :class="isDark ? 'translate-x-5' : ''" />
        </span>
      </button>
      <button
        v-for="item in items"
        :key="item.label"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors active:bg-slate-100 md:hover:bg-slate-50"
        :class="item.danger ? 'text-rose-500' : 'text-slate-700'"
        @click="handle(item)"
      >
        <component :is="item.icon" class="h-5 w-5" :class="item.danger ? 'text-rose-500' : 'text-slate-400'" />
        {{ item.label }}
      </button>
    </div>
  </Teleport>
</template>
