<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import AppHeader from '@/components/AppHeader.vue';
import BottomBar from '@/components/BottomBar.vue';
import { useClienteStore } from '@/stores/cliente';

const clienteStore = useClienteStore();
const { perfil, loading } = storeToRefs(clienteStore);

onMounted(() => clienteStore.carregarPerfil());
</script>

<template>
  <!-- Coluna central que simula a moldura de um app (mobile-first, centraliza no desktop) -->
  <div class="relative mx-auto flex min-h-screen max-w-app flex-col bg-slate-100 shadow-2xl shadow-slate-300/40 md:min-h-[92vh] md:my-[4vh] md:rounded-[2rem] md:overflow-hidden">
    <AppHeader :perfil="perfil" :loading="loading" />

    <main class="relative flex-1 overflow-x-hidden">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <BottomBar />
  </div>
</template>
