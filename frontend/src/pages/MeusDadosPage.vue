<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  ArrowLeft,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Wifi,
  Cake,
  CalendarCheck,
  Pencil,
  KeyRound,
} from 'lucide-vue-next';
import { formatDate } from '@/utils/format';
import { useRouter } from 'vue-router';

import PageContainer from '@/components/PageContainer.vue';
import Card from '@/components/Card.vue';
import Avatar from '@/components/Avatar.vue';
import Skeleton from '@/components/Skeleton.vue';
import DateText from '@/components/DateText.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import SecondaryButton from '@/components/SecondaryButton.vue';
import { useClienteStore } from '@/stores/cliente';
import { useContratoStore } from '@/stores/contrato';

const router = useRouter();
const clienteStore = useClienteStore();
const { perfil, loading } = storeToRefs(clienteStore);

const contratoStore = useContratoStore();
const { selecionado: contrato } = storeToRefs(contratoStore);
onMounted(() => contratoStore.carregar());

const endereco = computed(() => {
  const e = perfil.value?.endereco;
  if (!e) return '';
  // cidade/uf do IXC são IDs (FK) — exibidos apenas após integrar /cidade.
  const linha1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
  const linha2 = [e.bairro, e.cep ? `CEP ${e.cep}` : ''].filter(Boolean).join(' · ');
  return [linha1, e.complemento, linha2].filter(Boolean).join(' — ');
});

const campos = computed(() =>
  [
    { label: 'CPF', value: perfil.value?.cpf, icon: IdCard },
    { label: 'E-mail', value: perfil.value?.email, icon: Mail },
    { label: 'Telefone', value: perfil.value?.telefone, icon: Phone },
    perfil.value?.nascimento
      ? { label: 'Nascimento', value: formatDate(perfil.value.nascimento), icon: Cake }
      : null,
    { label: 'Endereço', value: endereco.value, icon: MapPin },
    { label: 'Plano', value: contrato.value?.nome, icon: Wifi },
  ].filter(Boolean),
);
</script>

<template>
  <PageContainer>
    <button
      class="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-500 active:opacity-60"
      @click="router.back()"
    >
      <ArrowLeft class="h-4 w-4" /> Voltar
    </button>

    <!-- Cabeçalho do perfil -->
    <Card class="flex flex-col items-center text-center">
      <template v-if="loading">
        <Skeleton rounded="rounded-full" class="h-24 w-24" />
        <Skeleton class="mt-3 h-4 w-40" />
        <Skeleton class="mt-2 h-3 w-24" />
      </template>
      <template v-else>
        <Avatar :name="perfil?.nome" :src="perfil?.avatar" size="lg" />
        <h1 class="mt-3 text-lg font-bold text-slate-800">{{ perfil?.nome }}</h1>
        <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarCheck class="h-3.5 w-3.5" />
          Cliente desde <DateText :value="perfil?.cadastradoEm" />
        </p>
      </template>
    </Card>

    <!-- Dados -->
    <Card class="mt-4 !p-0">
      <template v-if="loading">
        <div class="space-y-4 p-5">
          <Skeleton v-for="n in 5" :key="n" class="h-4 w-full" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="campo in campos"
          :key="campo.label"
          class="flex items-start gap-3 border-b border-slate-100 px-5 py-4 last:border-0"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <component :is="campo.icon" class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-400">{{ campo.label }}</p>
            <p class="text-sm font-semibold text-slate-700">{{ campo.value || '—' }}</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Ações -->
    <div class="mt-5 space-y-3">
      <PrimaryButton :icon="Pencil" @click="() => alert('Editar cadastro (a integrar).')">
        Editar dados
      </PrimaryButton>
      <SecondaryButton :icon="KeyRound" @click="() => alert('Alterar senha (a integrar).')">
        Alterar senha
      </SecondaryButton>
    </div>
  </PageContainer>
</template>
