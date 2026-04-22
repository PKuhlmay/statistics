<script setup lang="ts">
import { mean, standardDeviation, variance, iqr } from '~/utils/stats'

definePageMeta({ title: 'Streuungsmaße' })

// Monthly gas consumption (MWh) of an office building
const rawInput = ref('85, 92, 78, 105, 98, 88, 95, 82, 110, 91, 87, 102')
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

// Distribution comparison: well-insulated vs poorly insulated building (MWh/month)
const tightData = [88, 91, 90, 93, 92, 91, 89, 94, 90]
const wideData = [45, 68, 95, 130, 152, 118, 72]

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
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Zwei Produktionshallen</p>
      <p>
        Halle A (gut gedämmt, konstante Auslastung) schwankt zwischen 88–94 MWh/Monat.
        Halle B (schlecht gedämmt, wechselnde Schichten) schwankt zwischen 45–152 MWh/Monat.
        Der Mittelwert ist ähnlich — die Streuung zeigt das tatsächliche Risiko.
      </p>
    </div>

    <!-- Beginner-friendly explanations -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Warum Streuung wichtig ist</h2>
      <p class="mb-6 text-sm text-text-secondary">
        Der Durchschnitt allein reicht nicht. Zwei Hallen können den gleichen Durchschnittsverbrauch haben,
        aber <span class="text-accent-400">völlig unterschiedlich schwanken</span>.
        Streuungsmaße zeigen, wie zuverlässig der Mittelwert wirklich ist.
      </p>

      <div class="space-y-4">
        <!-- Spannweite -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Spannweite (Range)</h3>
          <p class="mb-2 text-sm text-text-secondary">
            Das einfachste Streuungsmaß: <span class="text-text-primary">größter Wert minus kleinster Wert</span>.
          </p>
          <div class="mb-2 rounded-lg bg-surface-900 px-4 py-2 font-mono text-sm text-text-muted">
            Spannweite = 110 − 78 = 32 MWh
          </div>
          <p class="text-sm text-red-400">
            − Problem: Ein einziger Ausreißer macht die Spannweite riesig — sie nutzt nur zwei von allen Werten.
          </p>
        </div>

        <!-- Standardabweichung -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Standardabweichung</h3>
          <p class="mb-3 text-sm text-text-secondary">
            Misst die <span class="text-text-primary">typische Abweichung</span> jedes Werts vom Mittelwert.
            Schritt für Schritt:
          </p>
          <ol class="mb-3 space-y-1.5 text-sm text-text-secondary">
            <li class="flex gap-2">
              <span class="font-mono text-accent-400">1.</span>
              <span>Mittelwert berechnen</span>
            </li>
            <li class="flex gap-2">
              <span class="font-mono text-accent-400">2.</span>
              <span>Für jeden Wert: Abweichung vom Mittelwert berechnen</span>
            </li>
            <li class="flex gap-2">
              <span class="font-mono text-accent-400">3.</span>
              <span>Jede Abweichung quadrieren (damit sich positive und negative nicht aufheben)</span>
            </li>
            <li class="flex gap-2">
              <span class="font-mono text-accent-400">4.</span>
              <span>Durchschnitt der Quadrate = <span class="text-accent-300">Varianz</span></span>
            </li>
            <li class="flex gap-2">
              <span class="font-mono text-accent-400">5.</span>
              <span>Wurzel ziehen = <span class="text-accent-300">Standardabweichung</span></span>
            </li>
          </ol>
          <div class="flex gap-4 text-sm">
            <span class="text-green-400">Kleine Std.-Abw. = Werte liegen eng beieinander → stabiler Verbrauch</span>
          </div>
          <div class="flex gap-4 text-sm">
            <span class="text-red-400">Große Std.-Abw. = Werte schwanken stark → unberechenbarer Verbrauch</span>
          </div>
        </div>

        <!-- IQR -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Interquartilsabstand (IQR)</h3>
          <p class="mb-3 text-sm text-text-secondary">
            Sortiere alle Werte. Teile sie in vier gleiche Gruppen.
            <span class="text-text-primary">IQR = Q3 − Q1</span> — das ist die Spanne der mittleren 50 %.
          </p>
          <div class="mb-3 rounded-lg bg-surface-900 px-4 py-3">
            <div class="flex items-center justify-between text-xs text-text-muted">
              <span>Min</span>
              <span>Q1 (25%)</span>
              <span>Median</span>
              <span>Q3 (75%)</span>
              <span>Max</span>
            </div>
            <div class="mt-2 flex h-4 items-center">
              <div class="h-0.5 flex-1 bg-surface-600" />
              <div class="h-4 w-px bg-text-muted" />
              <div class="h-3 flex-1 rounded-l bg-accent-500/30" />
              <div class="h-4 w-px bg-accent-400" />
              <div class="h-3 flex-1 rounded-r bg-accent-500/30" />
              <div class="h-4 w-px bg-text-muted" />
              <div class="h-0.5 flex-1 bg-surface-600" />
            </div>
            <div class="mt-1 flex justify-center">
              <span class="text-xs font-semibold text-accent-400">← IQR: mittlere 50 % →</span>
            </div>
          </div>
          <p class="text-sm text-green-400">
            + Robust gegen Ausreißer — Extremwerte liegen außerhalb von Q1–Q3 und beeinflussen den IQR nicht.
          </p>
        </div>
      </div>
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
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Halle A — geringe Streuung</h3>
          <div class="mb-3 flex items-end gap-1" style="height: 80px;">
            <div
              v-for="(val, i) in tightData"
              :key="i"
              class="flex-1 rounded-t bg-accent-500/60 transition-all"
              :style="{ height: `${(val / 100) * 100}%` }"
            />
          </div>
          <p class="font-mono text-sm text-text-muted">
            s = {{ tightStats.stdDev.toFixed(2) }} | x&#772; = {{ tightStats.mean.toFixed(1) }}
          </p>
        </div>
        <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Halle B — hohe Streuung</h3>
          <div class="mb-3 flex items-end gap-1" style="height: 80px;">
            <div
              v-for="(val, i) in wideData"
              :key="i"
              class="flex-1 rounded-t bg-accent-300/60 transition-all"
              :style="{ height: `${(val / 160) * 100}%` }"
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
