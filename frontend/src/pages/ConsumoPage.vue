<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useIntervalFn, useDocumentVisibility } from '@vueuse/core';
import {
  Download,
  Upload,
  Clock,
  Wifi,
  WifiOff,
  Gauge,
  Activity,
  ChevronDown,
  UserRound,
} from 'lucide-vue-next';

import PageContainer from '@/components/PageContainer.vue';
import Card from '@/components/Card.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import InfoCard from '@/components/InfoCard.vue';
import ChartCard from '@/components/ChartCard.vue';
import BarChart from '@/components/BarChart.vue';
import Skeleton from '@/components/Skeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { useContratoStore } from '@/stores/contrato';
import { ConsumoService } from '@/services/consumo.service';
import { formatBytes, formatDuration, shortTime, shortMonth } from '@/utils/format';

const contratoStore = useContratoStore();
const { selecionado, loading: contratosLoading } = storeToRefs(contratoStore);

// ---- Logins ----
const logins = ref([]);
const loginSelId = ref('');
const loginsLoading = ref(false);
const loginsError = ref(null);

const loginSel = computed(
  () => logins.value.find((l) => l.id === loginSelId.value) || logins.value[0] || null,
);
const temMultiplosLogins = computed(() => logins.value.length > 1);

// ---- Tempo real ----
const tempoReal = ref([]);
const tempoRealLoading = ref(false);
const tempoRealError = ref(null);
const atualizadoEm = ref('');

const ultimoRegistro = computed(() => tempoReal.value[0] || null);
const rtChart = computed(() =>
  [...tempoReal.value].reverse().map((r) => ({
    label: shortTime(r.data),
    value: r.download,
    value2: r.upload,
  })),
);

// ---- Mensal ----
const mensal = ref([]);
const mensalLoading = ref(false);
const mensalError = ref(null);

const mesAtual = computed(() => mensal.value[0] || null);

// Filtro por ano (limita a exibição a, no máximo, 12 meses por ano).
const anoMensal = ref(null);
const anosMensal = computed(() => {
  const anos = new Set();
  mensal.value.forEach((r) => {
    const y = String(r.data).slice(0, 4);
    if (y) anos.add(y);
  });
  return [...anos].sort((a, b) => Number(b) - Number(a)); // mais recente primeiro
});

// Seleciona o ano mais recente quando os dados chegam / trocam.
watch(
  anosMensal,
  (anos) => {
    if (anos.length && !anos.includes(anoMensal.value)) anoMensal.value = anos[0];
  },
  { immediate: true },
);

const mensalChart = computed(() =>
  mensal.value
    .filter((r) => String(r.data).slice(0, 4) === anoMensal.value)
    .sort((a, b) => new Date(a.data) - new Date(b.data)) // jan -> dez
    .slice(-12)
    .map((r) => ({ label: shortMonth(r.data), value: r.download, value2: r.upload })),
);

async function carregarLogins() {
  if (!selecionado.value) return;
  loginsLoading.value = true;
  loginsError.value = null;
  try {
    logins.value = await ConsumoService.listarLogins(selecionado.value.id);
    if (!logins.value.some((l) => l.id === loginSelId.value)) {
      loginSelId.value = logins.value[0]?.id || '';
    }
  } catch (e) {
    loginsError.value = e;
    logins.value = [];
  } finally {
    loginsLoading.value = false;
  }
}

async function carregarTempoReal({ silent = false } = {}) {
  if (!loginSel.value) {
    tempoReal.value = [];
    return;
  }
  if (!silent) {
    tempoRealLoading.value = true;
    tempoRealError.value = null;
  }
  try {
    tempoReal.value = await ConsumoService.tempoReal(loginSel.value.id);
    atualizadoEm.value = new Date().toLocaleTimeString('pt-BR');
  } catch (e) {
    if (!silent) tempoRealError.value = e;
  } finally {
    tempoRealLoading.value = false;
  }
}

async function carregarMensal() {
  if (!loginSel.value) {
    mensal.value = [];
    return;
  }
  mensalLoading.value = true;
  mensalError.value = null;
  try {
    mensal.value = await ConsumoService.mensal(loginSel.value.id);
  } catch (e) {
    mensalError.value = e;
  } finally {
    mensalLoading.value = false;
  }
}

// Polling a cada 5s — só com a aba visível e enquanto o componente existe.
const visibility = useDocumentVisibility();
const { pause, resume } = useIntervalFn(
  () => carregarTempoReal({ silent: true }),
  5000,
  { immediate: false },
);
watch(visibility, (v) => (v === 'visible' && loginSel.value ? resume() : pause()));

function selecionarLogin(id) {
  loginSelId.value = id;
}

onMounted(async () => {
  await contratoStore.carregar();
  await carregarLogins();
});

watch(() => selecionado.value?.id, carregarLogins);

watch(loginSelId, async () => {
  pause();
  await Promise.all([carregarTempoReal(), carregarMensal()]);
  if (loginSel.value) resume();
});
</script>

<template>
  <PageContainer>
    <div class="mb-2 px-1">
      <h1 class="text-xl font-extrabold text-slate-800">Consumo</h1>
      <p class="text-sm text-slate-400">Monitore seu login em tempo real</p>
    </div>

    <!-- Seleção / status do login -->
    <div v-if="contratosLoading || loginsLoading">
      <Skeleton rounded="rounded-3xl" class="h-28 w-full" />
    </div>

    <ErrorState v-else-if="loginsError" :error="loginsError" @retry="carregarLogins" />

    <EmptyState
      v-else-if="!loginSel"
      title="Nenhum login"
      message="Não há logins de acesso vinculados a este contrato."
      :icon="UserRound"
    />

    <template v-else>
      <!-- Troca rápida de login -->
      <div
        v-if="temMultiplosLogins"
        class="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4"
      >
        <button
          v-for="l in logins"
          :key="l.id"
          class="flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95"
          :class="l.id === loginSel?.id ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-white text-slate-500 shadow-card'"
          @click="selecionarLogin(l.id)"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :class="l.online ? 'bg-emerald-400' : 'bg-slate-300'"
          />
          {{ l.login }}
        </button>
      </div>

      <Card>
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            :class="loginSel.online ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'"
          >
            <component :is="loginSel.online ? Wifi : WifiOff" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-800">{{ loginSel.login }}</p>
            <p class="text-xs text-slate-400">
              {{ loginSel.online ? 'Conectado' : 'Desconectado' }}
              <template v-if="loginSel.online"> · {{ formatDuration(loginSel.tempoConectado) }}</template>
            </p>
          </div>
          <StatusBadge :status="loginSel.online ? 'ativo' : 'inativo'" />
        </div>

        <div v-if="loginSel.online" class="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div>
            <p class="text-[11px] text-slate-400">IP</p>
            <p class="text-sm font-semibold text-slate-700">{{ loginSel.ip || '—' }}</p>
          </div>
          <div class="text-right">
            <p class="text-[11px] text-slate-400">Sessão (down/up)</p>
            <p class="text-sm font-semibold text-slate-700">
              {{ formatBytes(loginSel.downloadAtual) }} / {{ formatBytes(loginSel.uploadAtual) }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Consumo em tempo real -->
      <div class="mb-3 mt-6 flex items-center justify-between px-1">
        <h2 class="flex items-center gap-2 text-base font-bold text-slate-800">
          Tempo real
          <span class="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            ao vivo
          </span>
        </h2>
        <span v-if="atualizadoEm" class="text-[11px] text-slate-400">{{ atualizadoEm }}</span>
      </div>

      <div v-if="tempoRealLoading" class="rounded-3xl bg-white p-5 shadow-card">
        <Skeleton class="mb-4 h-4 w-1/3" />
        <Skeleton rounded="rounded-2xl" class="h-40 w-full" />
      </div>

      <ErrorState v-else-if="tempoRealError" :error="tempoRealError" @retry="() => carregarTempoReal()" />

      <template v-else-if="ultimoRegistro">
        <div class="grid grid-cols-2 gap-3">
          <InfoCard label="Download (último)" :value="formatBytes(ultimoRegistro.download)" :icon="Download" tone="primary" />
          <InfoCard label="Upload (último)" :value="formatBytes(ultimoRegistro.upload)" :icon="Upload" tone="emerald" />
        </div>
        <ChartCard title="Últimos registros" subtitle="Download e upload por intervalo" class="mt-3">
          <BarChart :items="rtChart" stacked :format="formatBytes" />
        </ChartCard>
      </template>

      <EmptyState
        v-else
        title="Sem dados agora"
        message="Não há registros de consumo em tempo real para este login."
        :icon="Activity"
      />

      <!-- Consumo mensal -->
      <SectionTitle title="Consumo mensal" />
      <div v-if="mensalLoading" class="rounded-3xl bg-white p-5 shadow-card">
        <Skeleton class="mb-4 h-4 w-1/3" />
        <Skeleton rounded="rounded-2xl" class="h-40 w-full" />
      </div>
      <ErrorState v-else-if="mensalError" :error="mensalError" @retry="carregarMensal" />
      <template v-else-if="mesAtual">
        <div class="grid grid-cols-2 gap-3">
          <InfoCard label="Download no mês" :value="formatBytes(mesAtual.download)" :icon="Download" tone="primary" />
          <InfoCard label="Upload no mês" :value="formatBytes(mesAtual.upload)" :icon="Gauge" tone="amber" />
        </div>
        <ChartCard
          v-if="mensalChart.length"
          title="Histórico mensal"
          :subtitle="anoMensal ? `Ano de ${anoMensal}` : 'Por mês (download/upload)'"
          class="mt-3"
        >
          <template #action>
            <div v-if="anosMensal.length > 1" class="relative">
              <select
                v-model="anoMensal"
                class="appearance-none rounded-full bg-slate-100 py-1.5 pl-3 pr-8 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option v-for="ano in anosMensal" :key="ano" :value="ano">{{ ano }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
            </div>
            <span
              v-else-if="anoMensal"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
            >
              {{ anoMensal }}
            </span>
          </template>
          <BarChart :items="mensalChart" stacked :format="formatBytes" />
        </ChartCard>
      </template>
      <EmptyState
        v-else
        title="Sem consumo mensal"
        message="Ainda não há histórico de consumo mensal para este login."
        :icon="Gauge"
      />
    </template>
  </PageContainer>
</template>
