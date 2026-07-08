<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import Avatar from './Avatar.vue';
import Skeleton from './Skeleton.vue';
import ProfileMenu from './ProfileMenu.vue';
import { greeting, firstName } from '@/utils/format';

const props = defineProps({
  perfil: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const menuOpen = ref(false);
const saudacao = computed(() => greeting());
const nome = computed(() => firstName(props.perfil?.nome || ''));
</script>

<template>
  <header
    class="sticky top-0 z-30 bg-gradient-to-b from-primary to-primary-light px-4 pb-5 pt-[calc(env(safe-area-inset-top)+0.9rem)] text-white shadow-lg shadow-primary/20"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <template v-if="loading">
          <Skeleton rounded="rounded-full" class="h-11 w-11 !bg-white/20" />
          <div class="space-y-2">
            <Skeleton class="h-3 w-20 !bg-white/20" />
            <Skeleton class="h-4 w-28 !bg-white/20" />
          </div>
        </template>
        <template v-else>
          <Avatar :name="perfil?.nome" :src="perfil?.avatar" />
          <div class="leading-tight">
            <p class="text-xs font-medium text-white/80">{{ saudacao }},</p>
            <p class="text-lg font-bold">{{ nome }}</p>
          </div>
        </template>
      </div>

      <button
        class="flex items-center gap-1 rounded-full bg-white/15 py-1.5 pl-1.5 pr-2.5 backdrop-blur transition active:scale-95 md:hover:bg-white/25"
        aria-label="Abrir menu de perfil"
        @click="menuOpen = true"
      >
        <Avatar :name="perfil?.nome" :src="perfil?.avatar" size="sm" />
        <ChevronDown class="h-4 w-4" />
      </button>
    </div>

    <Transition name="fade">
      <ProfileMenu v-if="menuOpen" @close="menuOpen = false" />
    </Transition>
  </header>
</template>
