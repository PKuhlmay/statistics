<script setup lang="ts">
import { grubbs, mean, standardDeviation } from '~/utils/stats'

definePageMeta({ title: 'Grubbs-Test' })

const rawInput = ref('22, 24, 23, 25, 22, 23, 24, 21, 23, 85')

const data = computed(() =>
  rawInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
)

const result = computed(() => {
  if (data.value.length < 3) return null
  return grubbs(data.value)
})

const dataMean = computed(() => mean(data.value))
const dataStd = computed(() => standardDeviation(data.value))

// Iterative Grubbs: keep removing outliers
const iterativeResults = computed(() => {
  const results: Array<{
    outlier: number
    gStat: number
    critical: number
    isOutlier: boolean
    remaining: number[]
  }> = []
  let current = [...data.value]

  for (let i = 0; i < 5; i++) {
    if (current.length < 3) break
    const res = grubbs(current)
    results.push({ ...res, remaining: [...current] })
    if (!res.isOutlier) break
    current = current.filter((_, idx) => idx !== res.outlierIndex)
  }

  return results
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Grubbs-Test</h1>
    <p class="mb-6 text-text-secondary">
      Der Grubbs-Test prüft, ob der extremste Wert eines Datensatzes ein
      statistisch signifikanter Ausreißer ist (bei normalverteilten Daten).
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energiemonitoring</p>
      <p>
        Ein Gebäude verbraucht normalerweise 21–25 MWh/Monat. Ein Monat zeigt 85 MWh.
        Ist das ein statistischer Ausreißer oder noch im Rahmen der Normalverteilung?
      </p>
    </div>

    <!-- Formula -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Grubbs-Statistik</h3>
        <FormulaBlock formula="G = \frac{\max_i |x_i - \bar{x}|}{s}" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Kritischer Wert (α = 0.05)</h3>
        <FormulaBlock formula="G_{krit} = \frac{n-1}{\sqrt{n}} \sqrt{\frac{t^2_{\alpha/(2n),\, n-2}}{n - 2 + t^2_{\alpha/(2n),\, n-2}}}" />
      </div>
    </div>

    <!-- Interactive tool -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Grubbs-Test Tool</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <div class="mb-4">
          <label class="mb-1 block text-sm text-text-secondary">Datensatz (kommagetrennt):</label>
          <input
            v-model="rawInput"
            type="text"
            class="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
          >
        </div>

        <!-- Visual data points -->
        <div v-if="result" class="mb-4">
          <p class="mb-2 text-xs text-text-muted">Datenpunkte (Ausreißer rot markiert):</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(val, i) in data"
              :key="i"
              class="rounded-lg px-3 py-1.5 font-mono text-sm transition-colors"
              :class="i === result.outlierIndex && result.isOutlier
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                : 'bg-surface-700 text-text-primary'"
            >
              {{ val }}
            </span>
          </div>
        </div>

        <!-- Stats -->
        <div v-if="result" class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">x&#772;</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ dataMean.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">s</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ dataStd.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">G</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ result.gStat.toFixed(4) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">G_krit</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ result.critical.toFixed(4) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">Verdächtig</p>
            <p class="mt-1 font-mono text-lg" :class="result.isOutlier ? 'text-red-400' : 'text-accent-400'">
              {{ result.outlier }}
            </p>
          </div>
        </div>

        <div
          v-if="result"
          class="rounded-lg p-4 text-sm font-medium"
          :class="result.isOutlier ? 'bg-red-500/10 text-red-400' : 'bg-accent-500/10 text-accent-400'"
        >
          {{ result.isOutlier
            ? `G = ${result.gStat.toFixed(4)} > G_krit = ${result.critical.toFixed(4)} → ${result.outlier} ist ein signifikanter Ausreißer (α = 0.05).`
            : `G = ${result.gStat.toFixed(4)} ≤ G_krit = ${result.critical.toFixed(4)} → Kein signifikanter Ausreißer nachweisbar.`
          }}
        </div>
      </div>
    </div>

    <!-- Iterative results -->
    <div v-if="iterativeResults.length > 1" class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Iterativer Grubbs-Test</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Der Grubbs-Test kann iterativ angewandt werden: nach dem Entfernen eines Ausreißers
          wird erneut getestet, bis kein weiterer Ausreißer gefunden wird.
        </p>
        <div class="space-y-3">
          <div
            v-for="(iter, i) in iterativeResults"
            :key="i"
            class="flex items-center gap-4 rounded-lg bg-surface-700 p-3"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-600 text-xs font-bold text-text-muted">
              {{ i + 1 }}
            </span>
            <div class="flex-1 text-sm">
              <span class="text-text-secondary">Verdächtig: </span>
              <span class="font-mono text-text-primary">{{ iter.outlier }}</span>
              <span class="mx-2 text-text-muted">|</span>
              <span class="text-text-secondary">G = </span>
              <span class="font-mono text-text-primary">{{ iter.gStat.toFixed(3) }}</span>
              <span class="text-text-muted"> vs. </span>
              <span class="font-mono text-text-primary">{{ iter.critical.toFixed(3) }}</span>
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="iter.isOutlier ? 'bg-red-500/20 text-red-400' : 'bg-accent-500/20 text-accent-400'"
            >
              {{ iter.isOutlier ? 'Ausreißer' : 'OK' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Der Grubbs-Test erkennt einzelne Ausreißer in normalverteilten Daten.
        Immer iterativ anwenden — nach Entfernen eines Ausreißers kann der nächste sichtbar werden.
        Ausreißer nicht blind entfernen — die Ursache analysieren!
      </p>
    </div>
  </div>
</template>
