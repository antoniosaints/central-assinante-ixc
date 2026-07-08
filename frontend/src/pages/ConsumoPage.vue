<script setup>
import { ref, computed } from 'vue';
import { Download, Upload, Gauge, Clock } from 'lucide-vue-next';

import PageContainer from '@/components/PageContainer.vue';
import SectionTitle from '@/components/SectionTitle.vue';
import InfoCard from '@/components/InfoCard.vue';
import ChartCard from '@/components/ChartCard.vue';
import BarChart from '@/components/BarChart.vue';
import Skeleton from '@/components/Skeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import { useAsync } from '@/composables/useAsync';
import { ConsumoService } from '@/services/consumo.service';
import { formatCompetencia } from '@/utils/format';

const periodo = ref('diario'); // 'diario' | 'mensal'

const { data, loading, error, run } = useAsync(async () => {
  const [resumo, historico] = await Promise.all([
    ConsumoService.buscarResumo(),
    ConsumoService.buscarHistorico(periodo.value),
  ]);
  return { resumo, historico };
});

async function trocarPeriodo(p) {
  if (p === periodo.value) return;
  periodo.value = p;
  await run();
}

const gb = (v) => `${Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} GB`;
const horas = (h) => `${Number(h || 0).toLocaleString('pt-BR')} h`;

const chartItems = computed(() => {
  const hist = data.value?.historico || [];
  return hist.map((item) => ({
    label:
      periodo.value === 'mensal'
        ? formatCompetencia(item.competencia).slice(0, 2)
        : item.data.slice(8, 10),
    value: item.download,
    value2: item.upload,
  }));
});
</script>

<template>
  <PageContainer>
    <div class="mb-2 px-1">
      <h1 class="text-xl font-extrabold text-slate-800">Consumo</h1>
      <p class="text-sm text-slate-400">Acompanhe seu uso de internet</p>
    </div>

    <ErrorState v-if="error" :error="error" @retry="run" />

    <template v-else>
      <!-- Cards de resumo -->
      <div class="grid grid-cols-2 gap-3">
        <template v-if="loading">
          <Skeleton v-for="n in 4" :key="n" rounded="rounded-3xl" class="h-[76px]" />
        </template>
        <template v-else>
          <InfoCard label="Download" :value="gb(data.resumo.download)" :icon="Download" tone="primary" />
          <InfoCard label="Upload" :value="gb(data.resumo.upload)" :icon="Upload" tone="emerald" />
          <InfoCard label="Consumo total" :value="gb(data.resumo.total)" :icon="Gauge" tone="amber" />
          <InfoCard label="Conectado" :value="horas(data.resumo.tempoConectadoHoras)" :icon="Clock" tone="slate" />
        </template>
      </div>

      <!-- Gráfico -->
      <SectionTitle title="Histórico de consumo" />
      <div v-if="loading" class="rounded-3xl bg-white p-5 shadow-card">
        <Skeleton class="mb-4 h-4 w-1/3" />
        <Skeleton rounded="rounded-2xl" class="h-40 w-full" />
      </div>
      <ChartCard
        v-else
        title="Download e Upload"
        :subtitle="periodo === 'mensal' ? 'Últimos meses (GB)' : 'Últimos dias (GB)'"
      >
        <template #action>
          <div class="flex rounded-full bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              class="rounded-full px-3 py-1 transition"
              :class="periodo === 'diario' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'"
              @click="trocarPeriodo('diario')"
            >
              Diário
            </button>
            <button
              class="rounded-full px-3 py-1 transition"
              :class="periodo === 'mensal' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'"
              @click="trocarPeriodo('mensal')"
            >
              Mensal
            </button>
          </div>
        </template>

        <BarChart :items="chartItems" stacked unit="GB" />
      </ChartCard>
    </template>
  </PageContainer>
</template>
