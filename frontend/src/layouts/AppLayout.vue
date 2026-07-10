<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import BottomBar from '@/components/BottomBar.vue';
import DesktopSidebar from '@/components/DesktopSidebar.vue';
import DesktopTopbar from '@/components/DesktopTopbar.vue';
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
  <div class="desktop-shell min-h-screen md:flex">
    <DesktopSidebar @navigate="iniciarLoadingNavegacao" />

    <!-- No celular, conserva a moldura original. A partir de md, torna-se a área de trabalho ampla. -->
    <div class="app-shell relative mx-auto flex h-screen max-h-screen max-w-app flex-1 flex-col overflow-hidden bg-slate-100 shadow-2xl shadow-slate-300/40 dark:shadow-black/40 md:mx-0 md:h-screen md:max-h-none md:max-w-none md:rounded-none md:shadow-none">
      <DesktopTopbar :perfil="perfil" :loading="loading" />
      <AppHeader class="md:hidden" :perfil="perfil" :loading="loading" />

      <main class="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain md:pb-0">
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

      <BottomBar class="md:hidden" @navigate="iniciarLoadingNavegacao" />
    </div>
  </div>
</template>
