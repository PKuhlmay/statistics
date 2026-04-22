<script setup lang="ts">
import { fTest, variance } from '~/utils/stats'

definePageMeta({ title: 'F-Test' })

const rawInput1 = ref('22.1, 23.5, 21.8, 24.2, 22.7, 23.1, 22.5, 23.8')
const rawInput2 = ref('18.5, 28.2, 15.1, 30.5, 19.8, 27.3, 16.2, 29.1')
const alpha = ref(0.05)

function parseInput(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n))
}

const sample1 = computed(() => parseInput(rawInput1.value))
const sample2 = computed(() => parseInput(rawInput2.value))

const result = computed(() => {
  if (sample1.value.length < 2 || sample2.value.length < 2) return null
  return fTest(sample1.value, sample2.value)
})

const significant = computed(() => result.value ? result.value.pValue < alpha.value : false)
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">F-Test</h1>
    <p class="mb-6 text-text-secondary">
      Der F-Test prüft, ob die Varianzen zweier Stichproben signifikant verschieden sind.
      Er ist Voraussetzung für viele weitere Tests (z.B. ANOVA, Regressionsvergleich).
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Zwei Gebäude vergleichen</p>
      <p>
        Gebäude A hat stabile Verbrauchswerte (geringe Varianz), Gebäude B schwankt stark.
        Der F-Test prüft: Ist dieser Unterschied in der Streuung statistisch signifikant?
      </p>
    </div>

    <!-- Formula -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">F-Statistik</h3>
        <FormulaBlock formula="F = \frac{s_1^2}{s_2^2} \qquad df_1 = n_1 - 1, \quad df_2 = n_2 - 1" />
      </div>
    </div>

    <!-- Interactive calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">F-Test Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm text-text-secondary">Stichprobe 1 (Gebäude A):</label>
            <input
              v-model="rawInput1"
              type="text"
              class="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm text-text-secondary">Stichprobe 2 (Gebäude B):</label>
            <input
              v-model="rawInput2"
              type="text"
              class="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
            >
          </div>
        </div>

        <div class="mb-4">
          <SliderInput
            v-model="alpha"
            :min="0.01"
            :max="0.1"
            :step="0.01"
            label="Signifikanzniveau (α)"
          />
        </div>

        <div v-if="result" class="space-y-3">
          <!-- Variance bars -->
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-surface-700 p-4">
              <p class="mb-2 text-xs text-text-muted">Varianz s₁² (Stichprobe 1)</p>
              <p class="font-mono text-xl text-accent-400">{{ result.var1.toFixed(3) }}</p>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-600">
                <div
                  class="h-full rounded-full bg-accent-500 transition-all"
                  :style="{ width: `${Math.min((result.var1 / Math.max(result.var1, result.var2)) * 100, 100)}%` }"
                />
              </div>
            </div>
            <div class="rounded-lg bg-surface-700 p-4">
              <p class="mb-2 text-xs text-text-muted">Varianz s₂² (Stichprobe 2)</p>
              <p class="font-mono text-xl text-accent-300">{{ result.var2.toFixed(3) }}</p>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-600">
                <div
                  class="h-full rounded-full bg-accent-300 transition-all"
                  :style="{ width: `${Math.min((result.var2 / Math.max(result.var1, result.var2)) * 100, 100)}%` }"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">F-Statistik</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.fStat.toFixed(4) }}</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">p-Wert</p>
              <p
                class="mt-1 font-mono text-lg"
                :class="significant ? 'text-red-400' : 'text-accent-400'"
              >
                {{ result.pValue.toFixed(4) }}
              </p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">df₁</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.df1 }}</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">df₂</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.df2 }}</p>
            </div>
          </div>

          <div
            class="rounded-lg p-4 text-sm font-medium"
            :class="significant ? 'bg-red-500/10 text-red-400' : 'bg-accent-500/10 text-accent-400'"
          >
            {{ significant
              ? 'H₀ ablehnen: Die Varianzen sind signifikant verschieden.'
              : 'H₀ nicht ablehnen: Kein signifikanter Unterschied der Varianzen nachweisbar.'
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Der F-Test vergleicht Varianzen zweier Gruppen. F ≈ 1 bedeutet ähnliche Streuung,
        F ≫ 1 oder F ≪ 1 deutet auf unterschiedliche Variabilität hin.
        Voraussetzung: beide Stichproben sind annähernd normalverteilt.
      </p>
    </div>
  </div>
</template>
