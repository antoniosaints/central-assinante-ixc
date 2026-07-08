<script setup>
import { UserRound, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['close']);
const router = useRouter();
const auth = useAuthStore();

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
  <!-- Overlay -->
  <div class="fixed inset-0 z-40 bg-slate-900/20" @click="$emit('close')" />

  <!-- Menu -->
  <div
    class="absolute right-4 top-16 z-50 w-56 origin-top-right overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-slate-100 animate-fade-in"
  >
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
</template>
