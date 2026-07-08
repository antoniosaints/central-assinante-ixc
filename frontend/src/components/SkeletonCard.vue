<script setup>
import Skeleton from './Skeleton.vue';

defineProps({
  lines: { type: Number, default: 3 },
});
</script>

<template>
  <div class="rounded-3xl bg-white p-5 shadow-card">
    <div class="flex items-center gap-3">
      <Skeleton rounded="rounded-2xl" class="h-11 w-11" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3 w-2/3" />
        <Skeleton class="h-3 w-1/3" />
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <Skeleton v-for="n in lines" :key="n" class="h-3" :class="n === lines ? 'w-1/2' : 'w-full'" />
    </div>
  </div>
</template>
