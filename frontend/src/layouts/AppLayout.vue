<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import BottomBar from '@/components/BottomBar.vue';
import Loading from '@/components/Loading.vue';
import { useClienteStore } from '@/stores/cliente';

const clienteStore = useClienteStore();
const { perfil, loading } = storeToRefs(clienteStore);
const route = useRoute();
const navegando = ref(false);
let loadingTimer;

onMounted(() => clienteStore.carregarPerfil());

function pararLoading(delay = 450) {
  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(() => {
    navegando.value = false;
  }, delay);
}

function iniciarLoadingNavegacao() {
  clearTimeout(loadingTimer);
  navegando.value = true;
  loadingTimer = setTimeout(() => {
    navegando.value = false;
  }, 3000);
}

watch(
  () => route.fullPath,
  () => {
    if (navegando.value) pararLoading();
  },
);

onBeforeUnmount(() => clearTimeout(loadingTimer));
</script>

<template>
  <!-- Coluna central que simula a moldura de um app (mobile-first, centraliza no desktop) -->
  <div class="relative mx-auto flex h-screen max-h-screen max-w-app flex-col overflow-hidden bg-slate-100 shadow-2xl shadow-slate-300/40 md:my-[4vh] md:h-[92vh] md:max-h-[92vh] md:rounded-[2rem]">
    <AppHeader :perfil="perfil" :loading="loading" />

    <main class="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>

      <Transition name="fade">
        <div
          v-if="navegando"
          class="absolute inset-0 z-20 flex items-center justify-center bg-slate-100/95 px-6 backdrop-blur-[2px]"
        >
          <div class="rounded-3xl bg-white px-7 py-5 shadow-card ring-1 ring-slate-100">
            <Loading size="sm" label="Carregando..." />
          </div>
        </div>
      </Transition>
    </main>

    <BottomBar @navigate="iniciarLoadingNavegacao" />
  </div>
</template>
