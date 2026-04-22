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

// Mode: slider-generated or freehand
const mode = ref<'slider' | 'freehand'>('slider')

// Slider mode
const targetR = ref(0.8)
const seed = ref(42)
const generated = computed(() => generateCorrelatedData(60, targetR.value, seed.value))

// Freehand mode
const freehandPoints = ref<{ x: number; y: number }[]>([])
const chartRef = ref<InstanceType<typeof Scatter> | null>(null)

// Current data based on mode
const currentX = computed(() =>
  mode.value === 'slider' ? generated.value.x : freehandPoints.value.map((p) => p.x),
)
const currentY = computed(() =>
  mode.value === 'slider' ? generated.value.y : freehandPoints.value.map((p) => p.y),
)
const actualR = computed(() => pearsonR(currentX.value, currentY.value))

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Daten',
      data: currentX.value.map((xi, i) => ({ x: xi, y: currentY.value[i] })),
      backgroundColor: mode.value === 'freehand' ? 'rgba(248, 113, 113, 0.6)' : 'rgba(129, 140, 248, 0.6)',
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 200 },
  scales: {
    x: {
      type: 'linear' as const,
      ...(mode.value === 'freehand' ? { min: 0, max: 10, suggestedMin: 0, suggestedMax: 10 } : {}),
      title: { display: true, text: mode.value === 'freehand' ? 'x (Klick zum Setzen)' : 'x', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      type: 'linear' as const,
      ...(mode.value === 'freehand' ? { min: 0, max: 10, suggestedMin: 0, suggestedMax: 10 } : {}),
      title: { display: true, text: 'y', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    tooltip: { enabled: false },
  },
}))

function handleChartClick(event: MouseEvent) {
  if (mode.value !== 'freehand' || !chartRef.value?.chart) return
  const chart = chartRef.value.chart as { scales: { x: { getValueForPixel: (px: number) => number }; y: { getValueForPixel: (px: number) => number } }; canvas: HTMLCanvasElement }
  const rect = chart.canvas.getBoundingClientRect()
  const canvasX = event.clientX - rect.left
  const canvasY = event.clientY - rect.top
  const x = chart.scales.x.getValueForPixel(canvasX)
  const y = chart.scales.y.getValueForPixel(canvasY)
  if (x != null && y != null && x >= 0 && x <= 10 && y >= 0 && y <= 10) {
    freehandPoints.value = [...freehandPoints.value, { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }]
  }
}

function reshuffle() {
  seed.value = Math.floor(Math.random() * 10000)
}

function clearFreehand() {
  freehandPoints.value = []
}

function undoFreehand() {
  freehandPoints.value = freehandPoints.value.slice(0, -1)
}

function loadPreset(preset: 'positive' | 'negative' | 'none' | 'curve') {
  const presets: Record<string, { x: number; y: number }[]> = {
    positive: [
      { x: 1, y: 1.5 }, { x: 2, y: 2.8 }, { x: 3, y: 3.2 }, { x: 4, y: 4.5 },
      { x: 5, y: 5.1 }, { x: 6, y: 5.8 }, { x: 7, y: 7.2 }, { x: 8, y: 7.9 }, { x: 9, y: 8.5 },
    ],
    negative: [
      { x: 1, y: 9 }, { x: 2, y: 7.5 }, { x: 3, y: 7 }, { x: 4, y: 5.8 },
      { x: 5, y: 5.2 }, { x: 6, y: 4 }, { x: 7, y: 3.5 }, { x: 8, y: 2 }, { x: 9, y: 1.5 },
    ],
    none: [
      { x: 1, y: 5 }, { x: 2, y: 2 }, { x: 3, y: 8 }, { x: 4, y: 3 },
      { x: 5, y: 7 }, { x: 6, y: 4 }, { x: 7, y: 6 }, { x: 8, y: 1 }, { x: 9, y: 9 },
    ],
    curve: [
      { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 3, y: 7 }, { x: 4, y: 8.5 },
      { x: 5, y: 9 }, { x: 6, y: 8.5 }, { x: 7, y: 7 }, { x: 8, y: 5 }, { x: 9, y: 2 },
    ],
  }
  freehandPoints.value = presets[preset]
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

    <!-- Correlation Tool -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Korrelation ausprobieren</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <!-- Mode selector -->
        <div class="mb-4 flex gap-2">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="mode === 'slider' ? 'bg-accent-500 text-white' : 'bg-surface-700 text-text-secondary hover:bg-surface-600'"
            @click="mode = 'slider'"
          >
            Slider-Modus
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="mode === 'freehand' ? 'bg-accent-500 text-white' : 'bg-surface-700 text-text-secondary hover:bg-surface-600'"
            @click="mode = 'freehand'"
          >
            Freihand-Modus
          </button>
        </div>

        <!-- Slider mode controls -->
        <div v-if="mode === 'slider'" class="mb-4 flex items-center gap-6">
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

        <!-- Freehand mode controls -->
        <div v-if="mode === 'freehand'" class="mb-4">
          <p class="mb-3 text-sm text-text-secondary">
            Klicke auf den Chart, um Punkte zu setzen. Beobachte, wie sich r verändert.
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-lg bg-surface-600 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-500"
              @click="undoFreehand"
              :disabled="freehandPoints.length === 0"
            >
              Letzten Punkt entfernen
            </button>
            <button
              class="rounded-lg bg-surface-600 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-500"
              @click="clearFreehand"
            >
              Alle löschen
            </button>
            <span class="mx-2 text-xs text-text-muted">|</span>
            <span class="text-xs text-text-muted">Presets:</span>
            <button class="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400 hover:bg-green-500/30" @click="loadPreset('positive')">r ≈ +1</button>
            <button class="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/30" @click="loadPreset('negative')">r ≈ −1</button>
            <button class="rounded bg-surface-600 px-2 py-1 text-xs text-text-muted hover:bg-surface-500" @click="loadPreset('none')">r ≈ 0</button>
            <button class="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/30" @click="loadPreset('curve')">U-Form</button>
          </div>
        </div>

        <div class="h-80" @click="mode === 'freehand' ? handleChartClick($event) : undefined">
          <Scatter :key="mode" ref="chartRef" :data="chartData" :options="chartOptions" />
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-surface-700 px-4 py-2">
              <span class="text-xs text-text-muted">Tatsächliches r</span>
              <p class="font-mono text-lg text-accent-400">
                {{ currentX.length >= 2 ? actualR.toFixed(3) : '–' }}
              </p>
            </div>
            <div class="rounded-lg bg-surface-700 px-4 py-2">
              <span class="text-xs text-text-muted">Stärke</span>
              <p class="text-lg text-accent-300">
                {{ currentX.length >= 2 ? rLabel(actualR) : '–' }}
              </p>
            </div>
          </div>
          <div class="text-xs text-text-muted">
            n = {{ currentX.length }} Datenpunkte
          </div>
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
