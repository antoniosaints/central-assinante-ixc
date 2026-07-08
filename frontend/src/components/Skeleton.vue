<script setup>
defineProps({
  // Formato pré-definido; ou use classes livres via `class`.
  rounded: { type: String, default: 'rounded-xl' },
});
</script>

<template>
  <div
    class="relative overflow-hidden bg-slate-200/70"
    :class="rounded"
  >
    <div
      class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"
    />
  </div>
</template>
