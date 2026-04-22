<script setup lang="ts">
import { mean, standardDeviation, variance, iqr } from '~/utils/stats'

definePageMeta({ title: 'Streuungsmaße' })

const rawInput = ref('18, 20, 22, 24, 26, 28, 30')
const data = computed(() =>
  rawInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
)

const stats = computed(() => {
  const d = data.value
  if (d.length < 2) return null
  const sorted = [...d].sort((a, b) => a - b)
  const iqrResult = iqr(d)
  return {
    mean: mean(d),
    variance: variance(d),
    stdDev: standardDeviation(d),
    range: sorted[sorted.length - 1] - sorted[0],
    ...iqrResult,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
})

// Distribution comparison: tight vs wide
const tightData = [23, 24, 24, 25, 25, 25, 26, 26, 27]
const wideData = [10, 15, 20, 25, 30, 35, 40]

const tightStats = { stdDev: standardDeviation(tightData), mean: mean(tightData) }
const wideStats = { stdDev: standardDeviation(wideData), mean: mean(wideData) }
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Streuungsmaße</h1>
    <p class="mb-6 text-text-secondary">
      Wie weit weichen die Werte vom Zentrum ab? Streuungsmaße quantifizieren die Variabilität eines Datensatzes.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Heizgradtage</p>
      <p>
        Zwei Gebäude verbrauchen im Schnitt gleich viel Energie (25 MWh/Monat).
        Gebäude A schwankt zwischen 23–27 MWh, Gebäude B zwischen 10–40 MWh.
        Der Mittelwert ist gleich — die Streuung verrät den Unterschied.
      </p>
    </div>

    <!-- Formulas -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Varianz (Stichprobe)</h3>
        <FormulaBlock formula="s^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Standardabweichung</h3>
        <FormulaBlock formula="s = \sqrt{s^2} = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2}" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Interquartilsabstand (IQR)</h3>
        <FormulaBlock formula="\text{IQR} = Q_3 - Q_1" />
      </div>
    </div>

    <!-- Rechner -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <label class="mb-2 block text-sm text-text-secondary">Datensatz (kommagetrennt):</label>
        <input
          v-model="rawInput"
          type="text"
          class="mb-4 w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
        >

        <div v-if="stats" class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Spannweite</p>
            <p class="mt-1 font-mono text-xl text-text-primary">{{ stats.range.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Varianz</p>
            <p class="mt-1 font-mono text-xl text-text-primary">{{ stats.variance.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">Std.-Abweichung</p>
            <p class="mt-1 font-mono text-xl text-accent-400">{{ stats.stdDev.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4 text-center">
            <p class="text-xs text-text-muted">IQR</p>
            <p class="mt-1 font-mono text-xl text-accent-300">{{ stats.iqr.toFixed(2) }}</p>
          </div>
        </div>

        <div v-if="stats" class="mt-4 grid grid-cols-3 gap-2 text-xs text-text-muted">
          <span>Q1: <span class="font-mono text-text-secondary">{{ stats.q1.toFixed(2) }}</span></span>
          <span>Mittelwert: <span class="font-mono text-text-secondary">{{ stats.mean.toFixed(2) }}</span></span>
          <span>Q3: <span class="font-mono text-text-secondary">{{ stats.q3.toFixed(2) }}</span></span>
        </div>
      </div>
    </div>

    <!-- Visual comparison -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Vergleich: Enge vs. breite Streuung</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Gebäude A — geringe Streuung</h3>
          <div class="mb-3 flex items-end gap-1" style="height: 80px;">
            <div
              v-for="(val, i) in tightData"
              :key="i"
              class="flex-1 rounded-t bg-accent-500/60 transition-all"
              :style="{ height: `${((val - 20) / 10) * 100}%` }"
            />
          </div>
          <p class="font-mono text-sm text-text-muted">
            s = {{ tightStats.stdDev.toFixed(2) }} | x&#772; = {{ tightStats.mean.toFixed(1) }}
          </p>
        </div>
        <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Gebäude B — hohe Streuung</h3>
          <div class="mb-3 flex items-end gap-1" style="height: 80px;">
            <div
              v-for="(val, i) in wideData"
              :key="i"
              class="flex-1 rounded-t bg-accent-300/60 transition-all"
              :style="{ height: `${(val / 40) * 100}%` }"
            />
          </div>
          <p class="font-mono text-sm text-text-muted">
            s = {{ wideStats.stdDev.toFixed(2) }} | x&#772; = {{ wideStats.mean.toFixed(1) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Die Standardabweichung misst die typische Abweichung vom Mittelwert.
        Der IQR ist robuster gegen Ausreißer und beschreibt die mittleren 50 % der Daten.
      </p>
    </div>
  </div>
</template>
