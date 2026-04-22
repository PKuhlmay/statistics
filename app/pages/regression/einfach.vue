<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { olsRegression } from '~/utils/stats'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

definePageMeta({ title: 'Einfache Regression' })

// Draggable points for the sandbox
const points = ref<{ x: number; y: number }[]>([
  { x: 2, y: 3 },
  { x: 4, y: 5 },
  { x: 6, y: 7 },
  { x: 8, y: 8 },
  { x: 10, y: 12 },
  { x: 12, y: 11 },
  { x: 14, y: 15 },
])

const regression = computed(() => {
  const x = points.value.map((p) => p.x)
  const y = points.value.map((p) => p.y)
  return olsRegression(x, y)
})

// Regression line endpoints for chart
const lineData = computed(() => {
  const { beta0, beta1 } = regression.value
  const xs = points.value.map((p) => p.x)
  const xMin = Math.min(...xs) - 1
  const xMax = Math.max(...xs) + 1
  return [
    { x: xMin, y: beta0 + beta1 * xMin },
    { x: xMax, y: beta0 + beta1 * xMax },
  ]
})

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Datenpunkte',
      data: points.value,
      backgroundColor: 'rgba(129, 140, 248, 0.7)',
      pointRadius: 8,
      pointHoverRadius: 10,
      pointStyle: 'circle',
      order: 1,
    },
    {
      label: 'Regressionsgerade',
      data: lineData.value,
      borderColor: '#f87171',
      borderWidth: 2,
      pointRadius: 0,
      type: 'line' as const,
      showLine: true,
      order: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 100 },
  scales: {
    x: {
      type: 'linear' as const,
      title: { display: true, text: 'x (Heizgradtage)', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      type: 'linear' as const,
      title: { display: true, text: 'y (Verbrauch MWh)', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { size: 12 } },
    },
    tooltip: { enabled: true },
  },
}

// Residual chart
const residualChartData = computed(() => ({
  datasets: [
    {
      label: 'Residuen',
      data: regression.value.predicted.map((pred, i) => ({
        x: pred,
        y: regression.value.residuals[i],
      })),
      backgroundColor: 'rgba(165, 180, 252, 0.6)',
      pointRadius: 6,
    },
    {
      label: 'Nulllinie',
      data: [
        { x: Math.min(...regression.value.predicted) - 1, y: 0 },
        { x: Math.max(...regression.value.predicted) + 1, y: 0 },
      ],
      borderColor: 'rgba(248, 113, 113, 0.5)',
      borderWidth: 1,
      borderDash: [6, 4],
      pointRadius: 0,
      type: 'line' as const,
      showLine: true,
    },
  ],
}))

const residualOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 100 },
  scales: {
    x: {
      type: 'linear' as const,
      title: { display: true, text: 'Vorhergesagt (ŷ)', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      type: 'linear' as const,
      title: { display: true, text: 'Residuum (y − ŷ)', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
}

// Edit points
function updatePoint(index: number, axis: 'x' | 'y', value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return
  points.value[index] = { ...points.value[index], [axis]: num }
}

function addPoint() {
  const maxX = Math.max(...points.value.map((p) => p.x))
  points.value.push({ x: maxX + 2, y: maxX + 3 })
}

function removePoint(index: number) {
  if (points.value.length > 2) {
    points.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Einfache lineare Regression</h1>
    <p class="mb-6 text-text-secondary">
      Die einfache lineare Regression modelliert den Zusammenhang zwischen einer
      unabhängigen Variable x und einer abhängigen Variable y als Gerade: ŷ = β₀ + β₁x.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Heizgradtage → Energieverbrauch</p>
      <p>
        Je mehr Heizgradtage ein Monat hat, desto höher der Heizenergieverbrauch.
        Die OLS-Gerade minimiert die Summe der quadrierten Abweichungen (Residuen)
        zwischen den tatsächlichen und vorhergesagten Werten.
      </p>
    </div>

    <!-- Formulas -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Regressionsgleichung</h3>
        <FormulaBlock formula="\hat{y} = \beta_0 + \beta_1 x" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">OLS-Schätzer</h3>
        <FormulaBlock formula="\beta_1 = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sum(x_i - \bar{x})^2} \qquad \beta_0 = \bar{y} - \beta_1\bar{x}" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Bestimmtheitsmaß</h3>
        <FormulaBlock formula="R^2 = 1 - \frac{SS_{res}}{SS_{tot}} = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}" />
      </div>
    </div>

    <!-- Regression Sandbox -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Regression Sandbox</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Bearbeite die Punkte in der Tabelle — die Regressionsgerade und R² aktualisieren sich live.
        </p>

        <div class="mb-4 flex gap-6">
          <!-- Point editor -->
          <div class="w-56 shrink-0">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-semibold text-text-muted">Datenpunkte</span>
              <button
                class="rounded bg-surface-600 px-2 py-0.5 text-xs text-text-secondary hover:bg-surface-500"
                @click="addPoint"
              >
                + Punkt
              </button>
            </div>
            <div class="max-h-64 space-y-1 overflow-y-auto">
              <div
                v-for="(pt, i) in points"
                :key="i"
                class="flex items-center gap-1"
              >
                <input
                  :value="pt.x"
                  type="number"
                  class="w-16 rounded border border-surface-600 bg-surface-900 px-2 py-1 text-center font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                  @change="updatePoint(i, 'x', ($event.target as HTMLInputElement).value)"
                >
                <input
                  :value="pt.y"
                  type="number"
                  class="w-16 rounded border border-surface-600 bg-surface-900 px-2 py-1 text-center font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                  @change="updatePoint(i, 'y', ($event.target as HTMLInputElement).value)"
                >
                <button
                  class="rounded px-1 text-text-muted hover:text-red-400"
                  :disabled="points.length <= 2"
                  @click="removePoint(i)"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div class="h-72 flex-1">
            <Scatter :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">β₀ (Intercept)</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ regression.beta0.toFixed(3) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">β₁ (Steigung)</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ regression.beta1.toFixed(3) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">R²</p>
            <p class="mt-1 font-mono text-lg text-accent-400">{{ regression.r2.toFixed(4) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">n</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ points.length }}</p>
          </div>
        </div>

        <p class="mt-3 text-xs text-text-muted">
          Gleichung: ŷ = {{ regression.beta0.toFixed(2) }} + {{ regression.beta1.toFixed(2) }}x
        </p>
      </div>
    </div>

    <!-- Residual plot -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Residuenplot</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Die Residuen (y − ŷ) sollten zufällig um die Nulllinie streuen.
          Muster deuten auf Probleme hin (Nichtlinearität, Heteroskedastizität).
        </p>
        <div class="h-56">
          <Scatter :data="residualChartData" :options="residualOptions" />
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        OLS minimiert die Summe der quadrierten Residuen. R² gibt an, welcher Anteil
        der Varianz durch das Modell erklärt wird (0 = nichts, 1 = alles).
        Überprüfe immer die Residuen — R² allein reicht nicht.
      </p>
    </div>
  </div>
</template>
