<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  Zap,
  CalendarClock,
  CalendarCheck,
  FileText,
  Download,
  Copy,
  Check,
  QrCode,
  Barcode,
  ChevronsUpDown,
  RefreshCw,
  FileWarning,
} from 'lucide-vue-next';

import PageContainer from '@/components/PageContainer.vue';
import Card from '@/components/Card.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';
import Skeleton from '@/components/Skeleton.vue';
import Loading from '@/components/Loading.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import Money from '@/components/Money.vue';
import DateText from '@/components/DateText.vue';
import PrimaryButton from '@/components/PrimaryButton.vue';
import SecondaryButton from '@/components/SecondaryButton.vue';
import FaturaCard from '@/components/FaturaCard.vue';
import BottomSheet from '@/components/BottomSheet.vue';

import { useAsync } from '@/composables/useAsync';
import { useContratoStore } from '@/stores/contrato';
import { FinanceiroService } from '@/services/financeiro.service';

// ---- Contratos / plano ----
const contratoStore = useContratoStore();
const {
  selecionado,
  contratos,
  temMultiplos,
  loading: contratosLoading,
  error: contratosError,
} = storeToRefs(contratoStore);
const temContratoAtivo = computed(() => contratos.value.some((c) => c.status === 'ativo'));

onMounted(() => contratoStore.carregar());

const contratoSheet = ref(false);
function escolherContrato(id) {
  contratoStore.selecionar(id);
  contratoSheet.value = false;
}

// ---- Faturas (boletos em aberto) ----
const {
  data: faturas,
  loading: faturasLoading,
  error: faturasError,
  run: recarregarFaturas,
} = useAsync(async () => {
  const [proxima, pendencias] = await Promise.all([
    FinanceiroService.proximaFatura(),
    FinanceiroService.listarPendencias(),
  ]);
  return { proxima, pendencias };
});

// ---- Bottom sheet de boleto ----
const sheetOpen = ref(false);
const faturaSel = ref(null);
const copied = ref('');
const pix = ref({ loading: false, data: null, error: '' });
const baixando = ref(false);
const baixarErro = ref('');
const copiandoPixHome = ref(false);

async function abrirBoleto(fatura) {
  faturaSel.value = fatura;
  sheetOpen.value = true;
  copied.value = '';
  baixarErro.value = '';
  pix.value = { loading: false, data: null, error: '' };
  if (fatura.temPix) await carregarPix(fatura.id);
}

async function carregarPix(id) {
  pix.value = { loading: true, data: null, error: '' };
  try {
    pix.value = { loading: false, data: await FinanceiroService.buscarPix(id), error: '' };
  } catch (e) {
    pix.value = { loading: false, data: null, error: e?.message || 'Pix indisponível.' };
  }
}

async function copiar(texto, tipo) {
  try {
    await navigator.clipboard.writeText(texto || '');
    copied.value = tipo;
    setTimeout(() => (copied.value = ''), 1800);
  } catch {
    copied.value = '';
  }
}

// Copiar Pix direto do card de próxima fatura (busca sob demanda).
async function copiarPixHome(fatura) {
  copiandoPixHome.value = true;
  try {
    const p = await FinanceiroService.buscarPix(fatura.id);
    await navigator.clipboard.writeText(p.pixCopiaCola || '');
    copied.value = 'pix-home';
    setTimeout(() => (copied.value = ''), 1800);
  } catch {
    copied.value = '';
  } finally {
    copiandoPixHome.value = false;
  }
}

async function baixarBoleto(fatura) {
  baixando.value = true;
  baixarErro.value = '';
  try {
    await FinanceiroService.baixarBoleto(fatura.id);
  } catch (e) {
    baixarErro.value = e?.message || 'Não foi possível baixar o boleto.';
  } finally {
    baixando.value = false;
  }
}
</script>

<template>
  <PageContainer>
    <!-- Card de boas-vindas / plano (contrato selecionado) -->
    <Card class="!bg-gradient-to-br !from-primary !to-primary-light !text-white">
      <div v-if="contratosLoading" class="space-y-3">
        <Skeleton class="h-3 w-20 !bg-white/25" />
        <Skeleton class="h-5 w-2/3 !bg-white/25" />
        <Skeleton rounded="rounded-2xl" class="h-12 w-full !bg-white/15" />
      </div>

      <div v-else-if="contratosError" class="flex items-center justify-between gap-3">
        <p class="text-sm text-white/90">Não foi possível carregar seu plano.</p>
        <button
          class="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold active:scale-95"
          @click="contratoStore.carregar(true)"
        >
          Tentar de novo
        </button>
      </div>

      <div v-else-if="!selecionado">
        <p class="text-xs font-medium text-white/70">Seu plano</p>
        <p class="mt-0.5 text-lg font-bold">Nenhum contrato ativo</p>
      </div>

      <template v-else>
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs font-medium text-white/70">Seu plano</p>
            <p class="mt-0.5 truncate text-xl font-bold">{{ selecionado.nome }}</p>
            <p v-if="selecionado.descricao" class="truncate text-xs text-white/70">
              {{ selecionado.descricao }}
            </p>
          </div>
          <span class="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold capitalize backdrop-blur">
            {{ selecionado.status }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
            <Zap class="h-5 w-5 shrink-0 text-white" />
            <div class="min-w-0">
              <p class="text-[11px] text-white/70">Ativado em</p>
              <p class="text-sm font-bold"><DateText :value="selecionado.ativadoEm" /></p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
            <CalendarCheck class="h-5 w-5 shrink-0 text-white" />
            <div class="min-w-0">
              <p class="text-[11px] text-white/70">Renovação</p>
              <p class="text-sm font-bold"><DateText :value="selecionado.renovacao" /></p>
            </div>
          </div>
        </div>

        <button
          v-if="temMultiplos"
          class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-2.5 text-sm font-semibold backdrop-blur transition active:scale-[0.98] md:hover:bg-white/25"
          @click="contratoSheet = true"
        >
          <ChevronsUpDown class="h-4 w-4" />
          Trocar contrato ({{ contratos.length }})
        </button>
      </template>
    </Card>

    <!-- Faturas: exibidas apenas com contrato ativo -->
    <div v-if="contratosLoading">
      <SectionTitle title="Próxima fatura" />
      <SkeletonCard :lines="2" />
    </div>

    <template v-else-if="!contratosError">
      <!-- Sem contrato ativo => sem faturas -->
      <template v-if="!temContratoAtivo">
        <SectionTitle title="Faturas" />
        <EmptyState
          title="Sem contrato ativo"
          message="Você não possui contratos ativos, portanto não há faturas a exibir."
          :icon="FileWarning"
        />
      </template>

      <template v-else>
        <ErrorState v-if="faturasError" :error="faturasError" class="mt-6" @retry="recarregarFaturas" />

        <template v-else>
          <!-- Próxima fatura -->
          <SectionTitle title="Próxima fatura" />
          <SkeletonCard v-if="faturasLoading" :lines="2" />
          <Card v-else-if="faturas?.proxima" interactive>
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-slate-400">Valor a pagar</p>
                <p class="text-3xl font-extrabold text-slate-800">
                  <Money :value="faturas.proxima.valor" />
                </p>
                <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarClock class="h-4 w-4" />
                  Vence em <DateText :value="faturas.proxima.vencimento" />
                </p>
              </div>
              <StatusBadge :status="faturas.proxima.status" />
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <PrimaryButton :icon="FileText" @click="abrirBoleto(faturas.proxima)">
                Ver fatura
              </PrimaryButton>
              <SecondaryButton
                v-if="faturas.proxima.temPix"
                :loading="copiandoPixHome"
                :icon="copied === 'pix-home' ? Check : Copy"
                @click="copiarPixHome(faturas.proxima)"
              >
                {{ copied === 'pix-home' ? 'Copiado!' : 'Copiar Pix' }}
              </SecondaryButton>
            </div>
          </Card>
          <EmptyState
            v-else
            title="Tudo em dia!"
            message="Você não tem faturas em aberto no momento."
            :icon="Check"
          />

          <!-- Faturas pendentes -->
          <template v-if="faturas?.pendencias?.length">
            <SectionTitle title="Faturas em aberto" />
            <div class="space-y-3">
              <FaturaCard
                v-for="fatura in faturas.pendencias"
                :key="fatura.id"
                :fatura="fatura"
                @visualizar="abrirBoleto"
              />
            </div>
          </template>
        </template>
      </template>
    </template>

    <!-- Sheet: fatura (Pix + boleto) -->
    <BottomSheet :open="sheetOpen" title="Fatura" @close="sheetOpen = false">
      <template v-if="faturaSel">
        <div class="rounded-2xl bg-slate-50 p-4 text-center">
          <p class="text-xs text-slate-400">Valor</p>
          <p class="text-2xl font-extrabold text-slate-800"><Money :value="faturaSel.valor" /></p>
          <p class="mt-1 text-xs text-slate-400">
            Vencimento <DateText :value="faturaSel.vencimento" />
          </p>
        </div>

        <div class="mt-4 space-y-4">
          <!-- Pix -->
          <div v-if="faturaSel.temPix">
            <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <QrCode class="h-4 w-4" /> Pagar com Pix
            </p>

            <Loading v-if="pix.loading" size="sm" label="Gerando Pix…" />

            <p v-else-if="pix.error" class="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
              {{ pix.error }}
            </p>

            <div v-else-if="pix.data">
              <img
                v-if="pix.data.qrCodeBase64"
                :src="`data:image/png;base64,${pix.data.qrCodeBase64}`"
                alt="QR Code Pix"
                class="mx-auto h-44 w-44 rounded-xl border border-slate-100 bg-white p-2"
              />
              <p class="mt-3 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                {{ pix.data.pixCopiaCola }}
              </p>
              <PrimaryButton
                class="mt-2"
                :icon="copied === 'pix' ? Check : Copy"
                @click="copiar(pix.data.pixCopiaCola, 'pix')"
              >
                {{ copied === 'pix' ? 'Código Pix copiado!' : 'Copiar código Pix' }}
              </PrimaryButton>
            </div>
          </div>

          <!-- Linha digitável / código de barras -->
          <div v-if="faturaSel.linhaDigitavel">
            <p class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Barcode class="h-4 w-4" /> Código de barras
            </p>
            <p class="break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              {{ faturaSel.linhaDigitavel }}
            </p>
            <SecondaryButton
              class="mt-2"
              :icon="copied === 'linha' ? Check : Copy"
              @click="copiar(faturaSel.linhaDigitavel, 'linha')"
            >
              {{ copied === 'linha' ? 'Copiado!' : 'Copiar código de barras' }}
            </SecondaryButton>
          </div>

          <!-- Download do boleto (só tipo Boleto) -->
          <div v-if="faturaSel.podeBaixarBoleto">
            <PrimaryButton :icon="Download" :loading="baixando" @click="baixarBoleto(faturaSel)">
              Baixar boleto (PDF)
            </PrimaryButton>
            <p v-if="baixarErro" class="mt-2 text-center text-xs text-rose-600">{{ baixarErro }}</p>
          </div>
        </div>
      </template>
    </BottomSheet>

    <!-- Sheet: seleção de contrato -->
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
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RefreshCw class="h-5 w-5" />
          </div>
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
