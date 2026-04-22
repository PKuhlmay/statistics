<script setup lang="ts">
import { mean, median, mode } from '~/utils/stats'

definePageMeta({ title: 'Lagemaße' })

// Interactive dataset — editable by user
const rawInput = ref('22, 24, 23, 25, 22, 23, 24, 100')
const data = computed(() =>
  rawInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
)

const stats = computed(() => {
  const d = data.value
  if (d.length === 0) return null
  const sorted = [...d].sort((a, b) => a - b)
  return {
    mean: mean(d),
    median: median(d),
    mode: mode(d),
    sorted,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
})

// Outlier tool: toggle the outlier on/off
const includeOutlier = ref(true)
const baseData = [22, 24, 23, 25, 22, 23, 24, 21, 23, 25]
const outlierValue = ref(100)

const outlierData = computed(() =>
  includeOutlier.value ? [...baseData, outlierValue.value] : [...baseData],
)

const outlierStats = computed(() => ({
  mean: mean(outlierData.value),
  median: median(outlierData.value),
}))

// Energy domain example
const energyExample = `Stell dir vor, du misst den monatlichen Energieverbrauch (MWh) eines Gebäudes:
22, 24, 23, 25, 22, 23, 24. Im August springt der Wert auf 100 MWh (Klimaanlage defekt).
Der Mittelwert steigt drastisch — der Median bleibt stabil.`
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <!-- Concept -->
    <h1 class="mb-2 text-3xl font-bold">Lagemaße</h1>
    <p class="mb-6 text-text-secondary">
      Lagemaße beschreiben, wo das „Zentrum" eines Datensatzes liegt.
      Die drei wichtigsten: Mittelwert, Median und Modus.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energieverbrauch</p>
      <p class="whitespace-pre-line">{{ energyExample }}</p>
    </div>

    <!-- Formulas -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Arithmetisches Mittel</h3>
        <FormulaBlock formula="\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Median</h3>
        <FormulaBlock formula="\tilde{x} = \begin{cases} x_{\frac{n+1}{2}} & \text{wenn } n \text{ ungerade} \\ \frac{1}{2}\left(x_{\frac{n}{2}} + x_{\frac{n}{2}+1}\right) & \text{wenn } n \text{ gerade} \end{cases}" />
      </div>
    </div>

    <!-- Interactive calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <label class="mb-2 block text-sm text-text-secondary">Datensatz (kommagetrennt):</label>
        <input
          v-model="rawInput"
          type="text"
          class="mb-4 w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
        >

        <div v-if="stats" class="grid grid-cols-3 gap-4">
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Mittelwert</p>
            <p class="mt-1 font-mono text-2xl text-accent-400">{{ stats.mean.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Median</p>
            <p class="mt-1 font-mono text-2xl text-accent-300">{{ stats.median.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Modus</p>
            <p class="mt-1 font-mono text-2xl text-accent-300">
              {{ stats.mode.length > 0 ? stats.mode.join(', ') : 'keiner' }}
            </p>
          </div>
        </div>

        <div v-if="stats" class="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <span>Sortiert:</span>
          <span class="font-mono">{{ stats.sorted.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Outlier Effect Tool -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Outlier-Effekt Tool</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Beobachte, wie ein einzelner Ausreißer den Mittelwert verschiebt, während der Median stabil bleibt.
        </p>

        <div class="mb-4 flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="includeOutlier"
              type="checkbox"
              class="rounded accent-accent-500"
            >
            <span>Ausreißer einbeziehen</span>
          </label>
          <div v-if="includeOutlier" class="flex items-center gap-2">
            <span class="text-sm text-text-secondary">Wert:</span>
            <input
              v-model.number="outlierValue"
              type="range"
              :min="50"
              :max="200"
              class="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-surface-600 accent-accent-500"
            >
            <span class="font-mono text-sm text-accent-400">{{ outlierValue }}</span>
          </div>
        </div>

        <div class="mb-4 rounded-lg bg-surface-900 px-4 py-2 font-mono text-sm">
          {{ outlierData.join(', ') }}
        </div>

        <!-- Visual bar comparison -->
        <div class="space-y-3">
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-text-secondary">Mittelwert</span>
              <span class="font-mono text-accent-400">{{ outlierStats.mean.toFixed(2) }}</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-surface-700">
              <div
                class="h-full rounded-full bg-accent-500 transition-all duration-300"
                :style="{ width: `${Math.min((outlierStats.mean / 100) * 100, 100)}%` }"
              />
            </div>
          </div>
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-text-secondary">Median</span>
              <span class="font-mono text-accent-300">{{ outlierStats.median.toFixed(2) }}</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-surface-700">
              <div
                class="h-full rounded-full bg-accent-300 transition-all duration-300"
                :style="{ width: `${Math.min((outlierStats.median / 100) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Der Mittelwert reagiert empfindlich auf Ausreißer — der Median nicht.
        Bei schiefen Verteilungen oder Ausreißern ist der Median das robustere Lagemaß.
      </p>
    </div>
  </div>
</template>
