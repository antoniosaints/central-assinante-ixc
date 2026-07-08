<script setup>
defineProps({
  label: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-6 text-slate-400">
    <svg
      class="animate-spin text-primary"
      :class="size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span v-if="label" class="text-xs font-medium">{{ label }}</span>
  </div>
</template>
