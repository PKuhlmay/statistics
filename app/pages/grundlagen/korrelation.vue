<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { generateCorrelatedData, pearsonR } from '~/utils/stats'

ChartJS.register(LinearScale, PointElement, Tooltip)

definePageMeta({ title: 'Korrelation' })

const targetR = ref(0.8)
const seed = ref(42)

const generated = computed(() => generateCorrelatedData(60, targetR.value, seed.value))
const actualR = computed(() => pearsonR(generated.value.x, generated.value.y))

const chartData = computed(() => {
  const { x, y } = generated.value
  return {
    datasets: [
      {
        label: 'Daten',
        data: x.map((xi, i) => ({ x: xi, y: y[i] })),
        backgroundColor: 'rgba(129, 140, 248, 0.6)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 200 },
  scales: {
    x: {
      title: { display: true, text: 'x', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      title: { display: true, text: 'y', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    tooltip: { enabled: false },
  },
}

function reshuffle() {
  seed.value = Math.floor(Math.random() * 10000)
}

function rLabel(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.9) return 'sehr stark'
  if (abs >= 0.7) return 'stark'
  if (abs >= 0.4) return 'mittel'
  if (abs >= 0.2) return 'schwach'
  return 'keine'
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Korrelation</h1>
    <p class="mb-6 text-text-secondary">
      Korrelation misst die Stärke und Richtung eines linearen Zusammenhangs
      zwischen zwei Variablen. Der Pearson-Korrelationskoeffizient r liegt zwischen −1 und +1.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Heizgradtage & Verbrauch</p>
      <p>
        Je mehr Heizgradtage ein Monat hat (kälter), desto höher ist typischerweise
        der Heizenergieverbrauch. Das ergibt eine starke positive Korrelation (r ≈ 0.85–0.95).
      </p>
    </div>

    <!-- Plain-language explanation -->
    <div class="mb-8 space-y-6">
      <!-- Concrete energy examples for r values -->
      <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
        <p class="mb-3 text-sm font-semibold text-accent-400">Was bedeuten die Werte konkret?</p>
        <div class="space-y-3 text-sm text-text-secondary">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 shrink-0 font-mono text-accent-400">r &asymp; +1</span>
            <p><span class="font-semibold text-text-primary">Starker positiver Zusammenhang:</span>
              Heizgradtage und Heizverbrauch — mehr HGT &rarr; mehr Verbrauch.</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="mt-0.5 shrink-0 font-mono text-red-400">r &asymp; &minus;1</span>
            <p><span class="font-semibold text-text-primary">Starker negativer Zusammenhang:</span>
              Außentemperatur und Heizverbrauch — wärmer &rarr; weniger Heizung.</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="mt-0.5 shrink-0 font-mono text-text-muted">r &asymp; 0</span>
            <p><span class="font-semibold text-text-primary">Kein Zusammenhang:</span>
              Windrichtung und Stromverbrauch eines Bürogebäudes.</p>
          </div>
        </div>
      </div>

      <!-- Interpretation table -->
      <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
        <p class="mb-3 text-sm font-semibold text-accent-400">Interpretationstabelle</p>
        <div class="overflow-hidden rounded-lg">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-surface-600 text-text-muted">
                <th class="px-4 py-2">Bereich von r</th>
                <th class="px-4 py-2">Interpretation</th>
              </tr>
            </thead>
            <tbody class="text-text-secondary">
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-accent-400">+0.7 bis +1.0</td>
                <td class="px-4 py-2">Starker positiver Zusammenhang</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-accent-400">+0.4 bis +0.7</td>
                <td class="px-4 py-2">Mittlerer positiver Zusammenhang</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-text-muted">+0.2 bis +0.4</td>
                <td class="px-4 py-2">Schwacher positiver Zusammenhang</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-text-muted">&minus;0.2 bis +0.2</td>
                <td class="px-4 py-2">Kein linearer Zusammenhang</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-text-muted">&minus;0.4 bis &minus;0.2</td>
                <td class="px-4 py-2">Schwacher negativer Zusammenhang</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-4 py-2 font-mono text-red-400">&minus;0.7 bis &minus;0.4</td>
                <td class="px-4 py-2">Mittlerer negativer Zusammenhang</td>
              </tr>
              <tr>
                <td class="px-4 py-2 font-mono text-red-400">&minus;1.0 bis &minus;0.7</td>
                <td class="px-4 py-2">Starker negativer Zusammenhang</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Correlation != Causation -->
      <div class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
        <p class="mb-2 text-sm font-semibold text-amber-400">Goldene Regel: Korrelation ≠ Kausalität</p>
        <p class="text-sm leading-relaxed text-text-secondary">
          Nur weil zwei Dinge gemeinsam steigen oder fallen, heißt das nicht, dass das eine das andere
          <span class="italic">verursacht</span>.
        </p>
        <div class="mt-3 rounded-lg bg-surface-800 p-4 text-sm text-text-secondary">
          <p class="mb-1 font-semibold text-text-primary">Klassiker:</p>
          <p>
            Eisverkauf und Ertrinkungsfälle korrelieren positiv. Ursache? Beides steigt im
            <span class="text-accent-400">Sommer</span> — die gemeinsame Ursache ist die Jahreszeit,
            nicht das Eis.
          </p>
        </div>
      </div>
    </div>

    <!-- Formula -->
    <div class="mb-8">
      <h3 class="mb-1 text-sm font-semibold text-text-secondary">Pearson-Korrelationskoeffizient</h3>
      <FormulaBlock formula="r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2 \cdot \sum_{i=1}^{n}(y_i - \bar{y})^2}}" />
    </div>

    <!-- Correlation Slider Tool -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Correlation Slider</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <div class="mb-4 flex items-center gap-6">
          <div class="flex-1">
            <SliderInput
              v-model="targetR"
              :min="-1"
              :max="1"
              :step="0.05"
              label="Ziel-Korrelation"
            />
          </div>
          <button
            class="rounded-lg bg-surface-600 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-500 hover:text-text-primary"
            @click="reshuffle"
          >
            Neu mischen
          </button>
        </div>

        <div class="h-80">
          <Scatter :data="chartData" :options="chartOptions" />
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-surface-700 px-4 py-2">
              <span class="text-xs text-text-muted">Tatsächliches r</span>
              <p class="font-mono text-lg text-accent-400">{{ actualR.toFixed(3) }}</p>
            </div>
            <div class="rounded-lg bg-surface-700 px-4 py-2">
              <span class="text-xs text-text-muted">Stärke</span>
              <p class="text-lg text-accent-300">{{ rLabel(actualR) }}</p>
            </div>
          </div>
          <div class="text-xs text-text-muted">n = 60 Datenpunkte</div>
        </div>

        <!-- r scale -->
        <div class="mt-4 flex items-center gap-1 text-xs">
          <span class="text-red-400">−1</span>
          <div class="flex h-2 flex-1 overflow-hidden rounded-full">
            <div class="flex-1 bg-red-500/40" />
            <div class="flex-1 bg-red-400/20" />
            <div class="flex-1 bg-surface-600" />
            <div class="flex-1 bg-accent-400/20" />
            <div class="flex-1 bg-accent-500/40" />
          </div>
          <span class="text-accent-400">+1</span>
          <!-- Marker for current r -->
          <div class="relative -mt-3 ml-[-50%] w-full" aria-hidden="true" />
        </div>
        <div class="flex justify-between text-xs text-text-muted">
          <span>perfekt negativ</span>
          <span>kein Zusammenhang</span>
          <span>perfekt positiv</span>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        r = +1 bedeutet perfekter positiver linearer Zusammenhang, r = −1 perfekt negativ,
        r = 0 kein linearer Zusammenhang. Korrelation bedeutet nicht Kausalität!
      </p>
    </div>
  </div>
</template>
