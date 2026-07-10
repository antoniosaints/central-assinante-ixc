<script setup>
import { computed, ref } from 'vue';
import { ChevronDown, Sparkles } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import Avatar from './Avatar.vue';
import Skeleton from './Skeleton.vue';
import ProfileMenu from './ProfileMenu.vue';
import { firstName } from '@/utils/format';

const props = defineProps({
  perfil: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const route = useRoute();
const menuOpen = ref(false);
const nome = computed(() => firstName(props.perfil?.nome || ''));
const subtitulo = computed(() => route.meta.tab === 'inicio' ? 'Acompanhe sua conexão e seus próximos pagamentos.' : 'Central do Assinante');
</script>

<template>
  <header class="desktop-topbar hidden items-center justify-between px-8 py-5 md:flex">
    <div>
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
        <Sparkles class="h-3.5 w-3.5 text-primary" />
        Central do Assinante
      </div>
      <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{{ route.meta.title }}</h1>
      <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500">{{ subtitulo }}</p>
    </div>

    <button
      class="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm transition hover:border-primary/30 hover:shadow-card dark:border-slate-700 dark:bg-slate-900"
      aria-label="Abrir menu de perfil"
      @click="menuOpen = true"
    >
      <template v-if="loading">
        <div class="space-y-1.5 text-right"><Skeleton class="ml-auto h-3 w-20" /><Skeleton class="ml-auto h-2.5 w-14" /></div>
        <Skeleton rounded="rounded-full" class="h-9 w-9" />
      </template>
      <template v-else>
        <span class="hidden text-right leading-tight lg:block">
          <span class="block text-sm font-bold text-slate-700 dark:text-slate-200">{{ nome }}</span>
          <span class="mt-0.5 block text-[11px] font-medium text-slate-400">Minha conta</span>
        </span>
        <Avatar :name="perfil?.nome" :src="perfil?.avatar" size="sm" />
        <ChevronDown class="h-4 w-4 text-slate-400" />
      </template>
    </button>

    <Transition name="fade">
      <ProfileMenu v-if="menuOpen" desktop @close="menuOpen = false" />
    </Transition>
  </header>
</template>
