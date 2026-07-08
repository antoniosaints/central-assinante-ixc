<script setup>
import { useRipple } from '@/composables/useRipple';

defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: true },
  icon: { type: [Object, Function], default: null },
});

const { ripple } = useRipple();
</script>

<template>
  <button
    class="ripple-host inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 md:hover:bg-primary-dark"
    :class="block ? 'w-full' : ''"
    :disabled="disabled || loading"
    @pointerdown="ripple"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <component :is="icon" v-else-if="icon" class="h-4 w-4" />
    <slot />
  </button>
</template>
