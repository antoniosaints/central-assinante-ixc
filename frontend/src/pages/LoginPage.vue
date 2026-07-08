<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Wifi, Mail, Lock, Eye, EyeOff, LogIn, TriangleAlert } from 'lucide-vue-next';
import PrimaryButton from '@/components/PrimaryButton.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref('');
const senha = ref('');
const mostrarSenha = ref(false);
const loading = ref(false);
const erro = ref('');

async function entrar() {
  erro.value = '';
  if (!email.value || !senha.value) {
    erro.value = 'Informe e-mail e senha.';
    return;
  }
  loading.value = true;
  try {
    await auth.login({ email: email.value.trim(), senha: senha.value });
    const destino = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.replace(destino);
  } catch (e) {
    erro.value = e?.message || 'Não foi possível entrar. Tente novamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-app flex-col bg-slate-100">
    <!-- Cabeçalho / marca -->
    <div
      class="bg-gradient-to-b from-primary to-primary-light px-6 pb-16 pt-[calc(env(safe-area-inset-top)+3.5rem)] text-white"
    >
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <Wifi class="h-7 w-7" />
      </div>
      <h1 class="mt-5 text-2xl font-extrabold">Central do Assinante</h1>
      <p class="mt-1 text-sm text-white/80">Acesse sua conta para continuar</p>
    </div>

    <!-- Formulário -->
    <div class="-mt-8 flex-1 rounded-t-3xl bg-slate-100 px-5 pt-2">
      <form
        class="animate-fade-in space-y-4 rounded-3xl bg-white p-6 shadow-card"
        @submit.prevent="entrar"
      >
        <!-- E-mail -->
        <label class="block">
          <span class="mb-1.5 block text-xs font-semibold text-slate-500">E-mail</span>
          <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary focus-within:bg-white">
            <Mail class="h-5 w-5 text-slate-400" />
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="voce@email.com"
              class="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <!-- Senha -->
        <label class="block">
          <span class="mb-1.5 block text-xs font-semibold text-slate-500">Senha</span>
          <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary focus-within:bg-white">
            <Lock class="h-5 w-5 text-slate-400" />
            <input
              v-model="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••"
              class="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              class="text-slate-400 active:scale-90"
              :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
              @click="mostrarSenha = !mostrarSenha"
            >
              <component :is="mostrarSenha ? EyeOff : Eye" class="h-5 w-5" />
            </button>
          </div>
        </label>

        <!-- Erro -->
        <Transition name="fade">
          <div
            v-if="erro"
            class="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600"
          >
            <TriangleAlert class="h-4 w-4 shrink-0" />
            {{ erro }}
          </div>
        </Transition>

        <div class="flex justify-end">
          <button type="button" class="text-xs font-semibold text-primary active:opacity-60">
            Esqueci minha senha
          </button>
        </div>

        <PrimaryButton type="submit" :loading="loading" :icon="LogIn">
          Entrar
        </PrimaryButton>
      </form>

      <p class="mt-6 text-center text-xs text-slate-400">
        Use seu e-mail e senha cadastrados no provedor.
      </p>
    </div>
  </div>
</template>
