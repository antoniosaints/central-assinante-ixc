<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
});
defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')" />
        <Transition name="sheet" appear>
          <div
            v-if="open"
            class="relative z-10 w-full max-w-app rounded-t-3xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl ring-1 ring-slate-100"
          >
            <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90"
                @click="$emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
