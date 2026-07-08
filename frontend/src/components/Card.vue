<script setup>
defineProps({
  // Aplica hover apenas em telas com ponteiro fino (desktop).
  interactive: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="rounded-3xl bg-white p-5 shadow-card transition-all duration-300"
    :class="interactive ? 'md:hover:-translate-y-0.5 md:hover:shadow-card-hover' : ''"
  >
    <slot />
  </div>
</template>
