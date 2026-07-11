<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  Router,
  Wifi,
  WifiOff,
  Globe,
  Barcode,
  Factory,
  Clock,
  RefreshCw,
  ChevronsUpDown,
  UserRound,
  RadioTower,
} from 'lucide-vue-next';

import PageContainer from '@/components/PageContainer.vue';
import Card from '@/components/Card.vue';
import Skeleton from '@/components/Skeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import BottomSheet from '@/components/BottomSheet.vue';
import DateText from '@/components/DateText.vue';
import { useContratoStore } from '@/stores/contrato';
import { ConsumoService } from '@/services/consumo.service';
import { DispositivoService } from '@/services/dispositivo.service';
import { formatDateTime } from '@/utils/format';

const contratoStore = useContratoStore();
const {
  selecionado,
  contratos,
  temMultiplos,
  loading: contratosLoading,
} = storeToRefs(contratoStore);
const contratoSheet = ref(false);

function escolherContrato(id) {
  contratoStore.selecionar(id);
  contratoSheet.value = false;
}

// ---- Logins (dispositivo é por login) ----
const logins = ref([]);
const loginSelId = ref('');
const loginsLoading = ref(false);
const loginsError = ref(null);

const loginSel = computed(
  () => logins.value.find((l) => l.id === loginSelId.value) || logins.value[0] || null,
);
const temMultiplosLogins = computed(() => logins.value.length > 1);

// ---- Dispositivos ----
const dispositivos = ref([]);
const dispositivosLoading = ref(false);
const dispositivosError = ref(null);
const atualizadoEm = ref('');

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

async function carregarDispositivos() {
  if (!loginSel.value) {
    dispositivos.value = [];
    return;
  }
  dispositivosLoading.value = true;
  dispositivosError.value = null;
  try {
    dispositivos.value = await DispositivoService.listar(loginSel.value.id);
    atualizadoEm.value = new Date().toLocaleTimeString('pt-BR');
  } catch (e) {
    dispositivosError.value = e;
  } finally {
    dispositivosLoading.value = false;
  }
}

function selecionarLogin(id) {
  loginSelId.value = id;
}

onMounted(async () => {
  await contratoStore.carregar();
  await carregarLogins();
});

watch(() => selecionado.value?.id, carregarLogins);
// Ao definir/trocar o login (inclusive a 1ª vez, '' -> id) recarrega os aparelhos.
watch(loginSelId, carregarDispositivos);
</script>

<template>
  <PageContainer>
    <div class="mb-2 flex items-start justify-between gap-3 px-1">
      <div>
        <h1 class="text-xl font-extrabold text-slate-800">Dispositivos</h1>
        <p class="text-sm text-slate-400">Equipamentos vinculados ao seu login</p>
      </div>
      <button
        v-if="loginSel"
        class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-card transition active:scale-95 disabled:opacity-50"
        :disabled="dispositivosLoading"
        aria-label="Atualizar dispositivos"
        @click="carregarDispositivos"
      >
        <RefreshCw class="h-4 w-4" :class="dispositivosLoading ? 'animate-spin' : ''" />
      </button>
    </div>

    <!-- Seleção de contrato -->
    <button
      v-if="temMultiplos && selecionado"
      class="mb-3 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-card transition active:scale-[0.99]"
      @click="contratoSheet = true"
    >
      <div class="min-w-0">
        <p class="text-xs font-semibold text-slate-400">Contrato</p>
        <p class="truncate text-sm font-bold text-slate-800">{{ selecionado.nome }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <StatusBadge :status="selecionado.status" />
        <ChevronsUpDown class="h-4 w-4 text-primary" />
      </div>
    </button>

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

      <div class="mb-3 flex items-center justify-between px-1">
        <p class="text-xs font-semibold text-slate-400">
          Login: <span class="text-slate-600">{{ loginSel.login }}</span>
        </p>
        <span v-if="atualizadoEm && !dispositivosLoading" class="text-[11px] text-slate-400">
          Atualizado {{ atualizadoEm }}
        </span>
      </div>

      <!-- Carregando dispositivos -->
      <div v-if="dispositivosLoading" class="space-y-3">
        <div v-for="n in 1" :key="n" class="rounded-3xl bg-white p-5 shadow-card">
          <Skeleton class="mb-3 h-5 w-1/2" />
          <Skeleton rounded="rounded-2xl" class="h-24 w-full" />
        </div>
      </div>

      <ErrorState
        v-else-if="dispositivosError"
        :error="dispositivosError"
        @retry="carregarDispositivos"
      />

      <template v-else-if="dispositivos.length">
        <div class="space-y-3">
          <Card v-for="d in dispositivos" :key="d.id" interactive>
            <!-- Cabeçalho: ícone + modelo + status -->
            <div class="flex items-center gap-3">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                :class="d.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'"
              >
                <component :is="d.status === 'online' ? Router : WifiOff" class="h-6 w-6" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-bold text-slate-800">
                    {{ d.modelo || 'Dispositivo' }}
                  </p>
                  <span
                    v-if="d.principal"
                    class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                  >
                    Principal
                  </span>
                </div>
                <p class="truncate text-xs text-slate-400">{{ d.fabricante || '—' }}</p>
              </div>
              <StatusBadge :status="d.status === 'online' ? 'ativo' : 'inativo'" />
            </div>

            <!-- Detalhes -->
            <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
              <div class="col-span-2 flex items-start gap-2">
                <Barcode class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Número de série</dt>
                  <dd class="truncate font-mono text-sm font-semibold text-slate-700">
                    {{ d.serial || '—' }}
                  </dd>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <Globe class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Endereço IP</dt>
                  <dd class="truncate text-sm font-semibold text-slate-700">{{ d.ipv4 || '—' }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-2">
                <Factory class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Fabricante</dt>
                  <dd class="truncate text-sm font-semibold text-slate-700">
                    {{ d.fabricante || '—' }}
                  </dd>
                </div>
              </div>

              <div v-if="d.wifi24" class="flex items-start gap-2">
                <Wifi class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Rede Wi-Fi (2.4G)</dt>
                  <dd class="truncate text-sm font-semibold text-slate-700">{{ d.wifi24 }}</dd>
                </div>
              </div>

              <div v-if="d.wifi5" class="flex items-start gap-2">
                <Wifi class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Rede Wi-Fi (5G)</dt>
                  <dd class="truncate text-sm font-semibold text-slate-700">{{ d.wifi5 }}</dd>
                </div>
              </div>

              <div class="col-span-2 flex items-start gap-2">
                <Clock class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div class="min-w-0">
                  <dt class="text-[11px] text-slate-400">Último contato</dt>
                  <dd class="text-sm font-semibold text-slate-700">
                    {{ formatDateTime(d.ultimoContato) }}
                  </dd>
                </div>
              </div>
            </dl>
          </Card>
        </div>
      </template>

      <EmptyState
        v-else
        title="Nenhum dispositivo"
        message="Não há equipamentos vinculados a este login no momento."
        :icon="RadioTower"
      />
    </template>

    <BottomSheet :open="contratoSheet" title="Escolha o contrato" @close="contratoSheet = false">
      <div class="space-y-2">
        <button
          v-for="contrato in contratos"
          :key="contrato.id"
          class="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99]"
          :class="
            contrato.id === selecionado?.id
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 md:hover:bg-slate-50'
          "
          @click="escolherContrato(contrato.id)"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-800">{{ contrato.nome }}</p>
            <p class="truncate text-xs text-slate-400">
              Contrato #{{ contrato.id }} · Renova <DateText :value="contrato.renovacao" />
            </p>
          </div>
          <StatusBadge :status="contrato.status" />
        </button>
      </div>
    </BottomSheet>
  </PageContainer>
</template>
