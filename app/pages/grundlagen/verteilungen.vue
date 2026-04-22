<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js'
import { normalCurvePoints } from '~/utils/stats'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

definePageMeta({ title: 'Verteilungen' })

const mu = ref(0)
const sigma = ref(1)

const chartData = computed(() => {
  const { x, y } = normalCurvePoints(mu.value, Math.max(sigma.value, 0.1), 200, 4)
  return {
    labels: x.map((v) => v.toFixed(2)),
    datasets: [
      {
        label: 'f(x)',
        data: y,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 150 },
  scales: {
    x: {
      type: 'category' as const,
      ticks: {
        color: '#64748b',
        maxTicksLimit: 9,
        font: { family: 'monospace', size: 11 },
      },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: {
        color: '#64748b',
        font: { family: 'monospace', size: 11 },
      },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    tooltip: { enabled: false },
  },
}))
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Verteilungen</h1>
    <p class="mb-6 text-text-secondary">
      Die Normalverteilung ist die wichtigste Verteilung der Statistik.
      Sie wird vollständig durch zwei Parameter beschrieben: Mittelwert (μ) und Standardabweichung (σ).
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energieverbrauch</p>
      <p>
        Wenn du den monatlichen Energieverbrauch vieler vergleichbarer Gebäude misst,
        folgen die Werte oft annähernd einer Normalverteilung.
        μ ist der typische Verbrauch, σ beschreibt die Schwankungsbreite.
      </p>
    </div>

    <!-- Formula -->
    <div class="mb-8">
      <h3 class="mb-1 text-sm font-semibold text-text-secondary">Dichtefunktion der Normalverteilung</h3>
      <FormulaBlock formula="f(x) = \frac{1}{\sigma \sqrt{2\pi}} \, e^{-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2}" />
    </div>

    <!-- Interactive Distribution Explorer -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Distribution Explorer</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <div class="mb-6 grid grid-cols-2 gap-6">
          <SliderInput
            v-model="mu"
            :min="-5"
            :max="5"
            :step="0.1"
            label="Mittelwert (μ)"
          />
          <SliderInput
            v-model="sigma"
            :min="0.2"
            :max="4"
            :step="0.1"
            label="Standardabweichung (σ)"
          />
        </div>

        <div class="h-72">
          <Line :data="chartData" :options="chartOptions" />
        </div>

        <div class="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div class="rounded-lg bg-surface-700 px-3 py-2">
            <span class="text-text-muted">μ − σ bis μ + σ</span>
            <p class="font-mono text-accent-400">≈ 68 % der Daten</p>
          </div>
          <div class="rounded-lg bg-surface-700 px-3 py-2">
            <span class="text-text-muted">μ − 2σ bis μ + 2σ</span>
            <p class="font-mono text-accent-400">≈ 95 % der Daten</p>
          </div>
          <div class="rounded-lg bg-surface-700 px-3 py-2">
            <span class="text-text-muted">μ − 3σ bis μ + 3σ</span>
            <p class="font-mono text-accent-400">≈ 99.7 % der Daten</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Die Normalverteilung folgt der 68-95-99.7-Regel: Fast alle Daten liegen
        innerhalb von 3 Standardabweichungen vom Mittelwert.
      </p>
    </div>
  </div>
</template>
