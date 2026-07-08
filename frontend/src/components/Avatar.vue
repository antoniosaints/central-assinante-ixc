<script setup>
import { computed } from 'vue';
import { initials } from '@/utils/format';

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
});

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-24 w-24 text-2xl',
};

const sizeClass = computed(() => sizes[props.size] || sizes.md);
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-white ring-2 ring-white"
    :class="sizeClass"
  >
    <img v-if="src" :src="src" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ initials(name) }}</span>
  </div>
</template>
