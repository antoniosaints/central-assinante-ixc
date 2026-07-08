<script setup>
import Card from './Card.vue';

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
});
</script>

<template>
  <Card>
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h3 class="text-sm font-bold text-slate-800">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-400">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
    <slot />
  </Card>
</template>
