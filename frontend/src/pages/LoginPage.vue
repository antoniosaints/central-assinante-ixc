<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Wifi, Mail, Lock, Eye, EyeOff, LogIn, TriangleAlert, MoonStar, SunMedium, Signal, ShieldCheck, ChartColumn } from 'lucide-vue-next';
import PrimaryButton from '@/components/PrimaryButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();

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
  <!-- ===================== MOBILE ===================== -->
  <div class="app-shell mx-auto flex min-h-screen max-w-app flex-col bg-slate-100 md:hidden">
    <!-- Cabeçalho / marca -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light px-6 pb-16 pt-[calc(env(safe-area-inset-top)+3.5rem)] text-white"
    >
      <div class="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <button
        class="absolute right-5 top-[calc(env(safe-area-inset-top)+1rem)] flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur transition active:scale-95 md:hover:bg-white/25"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        @click="toggleTheme"
      >
        <component :is="isDark ? SunMedium : MoonStar" class="h-5 w-5" />
      </button>
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <Wifi class="h-7 w-7" />
      </div>
      <h1 class="mt-5 text-2xl font-extrabold">Central do Assinante</h1>
      <p class="mt-1 text-sm text-white/80">Acesse sua conta para continuar</p>
    </div>

    <!-- Formulário -->
    <div class="-mt-8 flex-1 rounded-t-[2rem] bg-slate-100 px-5 pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] dark:shadow-black/20">
      <form
        class="animate-fade-in space-y-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100/70"
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

  <!-- ===================== DESKTOP ===================== -->
  <div class="hidden min-h-screen md:flex">
    <!-- Painel de marca -->
    <div class="desktop-sidebar relative hidden w-[46%] max-w-2xl shrink-0 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
      <div class="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

      <RouterLink to="/" class="flex items-center gap-3" aria-label="Central do Assinante">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 p-1.5 ring-1 ring-white/15">
          <img src="/LOGO_CAS.png" class="h-full w-full object-contain" alt="CAS" />
        </span>
        <span class="leading-tight">
          <span class="block text-base font-extrabold tracking-tight">Central</span>
          <span class="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">do assinante</span>
        </span>
      </RouterLink>

      <div class="relative max-w-md">
        <h2 class="text-3xl font-extrabold leading-tight tracking-tight">
          Tudo o que importa para sua conexão, no mesmo lugar.
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-white/70">
          Acompanhe seu consumo em tempo real, gerencie faturas e contratos e mantenha seus dados sempre à mão.
        </p>

        <ul class="mt-8 space-y-4">
          <li class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Signal class="h-5 w-5" />
            </span>
            <span class="text-sm font-semibold text-white/85">Consumo em tempo real</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <ChartColumn class="h-5 w-5" />
            </span>
            <span class="text-sm font-semibold text-white/85">Faturas e contratos organizados</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <ShieldCheck class="h-5 w-5" />
            </span>
            <span class="text-sm font-semibold text-white/85">Acesso seguro à sua conta</span>
          </li>
        </ul>
      </div>

      <p class="relative text-[11px] text-white/40">© {{ new Date().getFullYear() }} Central do Assinante</p>
    </div>

    <!-- Painel do formulário -->
    <div class="relative flex flex-1 items-center justify-center bg-slate-100 px-6 py-10">
      <button
        class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:bg-slate-900"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        @click="toggleTheme"
      >
        <component :is="isDark ? SunMedium : MoonStar" class="h-5 w-5" />
      </button>

      <div class="w-full max-w-md">
        <!-- Marca compacta (aparece quando o painel lateral está oculto) -->
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wifi class="h-6 w-6" />
          </span>
          <span class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Central do Assinante</span>
        </div>

        <div class="mb-8">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Bem-vindo de volta</h1>
          <p class="mt-1 text-sm text-slate-400 dark:text-slate-500">Acesse sua conta para continuar</p>
        </div>

        <form
          class="animate-fade-in space-y-4 rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-100/70"
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
                class="text-slate-400 transition hover:text-slate-600"
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
            <button type="button" class="text-xs font-semibold text-primary transition hover:opacity-70">
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
  </div>
</template>
