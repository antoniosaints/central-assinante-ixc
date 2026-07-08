<script setup>
defineProps({
  title: { type: String, required: true },
  action: { type: String, default: '' },
});
defineEmits(['action']);
</script>

<template>
  <div class="mb-3 mt-6 flex items-center justify-between px-1">
    <h2 class="text-base font-bold text-slate-800">{{ title }}</h2>
    <button
      v-if="action"
      class="text-sm font-semibold text-primary active:opacity-60"
      @click="$emit('action')"
    >
      {{ action }}
    </button>
  </div>
</template>
