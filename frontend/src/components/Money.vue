<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';

const props = defineProps({
  value: { type: [Number, String], default: 0 },
});
const formatted = computed(() => formatCurrency(props.value));
</script>

<template>
  <span>{{ formatted }}</span>
</template>
