<script setup>
import { computed } from 'vue';
import { WifiOff, ServerCrash, Clock, LockKeyhole, RotateCw } from 'lucide-vue-next';
import PrimaryButton from './PrimaryButton.vue';

const props = defineProps({
  // Objeto de erro normalizado pelo interceptor: { type, message }
  error: { type: Object, default: () => ({ type: 'api', message: '' }) },
});
defineEmits(['retry']);

// Configuração amigável por tipo de erro.
const presets = {
  network: {
    icon: WifiOff,
    title: 'Sem internet',
    message: 'Verifique sua conexão e tente novamente.',
  },
  timeout: {
    icon: Clock,
    title: 'Demorou demais',
    message: 'O servidor não respondeu a tempo. Tente novamente.',
  },
  session: {
    icon: LockKeyhole,
    title: 'Sessão expirada',
    message: 'Sua sessão expirou. Entre novamente para continuar.',
  },
  api: {
    icon: ServerCrash,
    title: 'Algo deu errado',
    message: 'Não conseguimos carregar as informações agora.',
  },
};

const preset = computed(() => presets[props.error?.type] || presets.api);
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white px-6 py-12 text-center shadow-card">
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
      <component :is="preset.icon" class="h-8 w-8" />
    </div>
    <div>
      <p class="text-base font-bold text-slate-800">{{ preset.title }}</p>
      <p class="mt-1 text-sm text-slate-400">
        {{ error?.message || preset.message }}
      </p>
    </div>
    <PrimaryButton :block="false" :icon="RotateCw" @click="$emit('retry')">
      Tentar novamente
    </PrimaryButton>
  </div>
</template>
