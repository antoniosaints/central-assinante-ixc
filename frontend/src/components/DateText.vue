<script setup>
import { computed } from 'vue';
import { formatDate } from '@/utils/format';

const props = defineProps({
  value: { type: [String, Date], default: '' },
});
const formatted = computed(() => formatDate(props.value));
</script>

<template>
  <span>{{ formatted }}</span>
</template>
