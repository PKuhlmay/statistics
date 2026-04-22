<script setup lang="ts">
import { tTest } from '~/utils/stats'

definePageMeta({ title: 'T-Test' })

// Monthly electricity consumption (MWh) — testing against target from energy audit
const rawInput = ref('148, 162, 139, 171, 155, 158, 144, 167, 141, 153')
const mu0 = ref(140)
const alpha = ref(0.05)

const data = computed(() =>
  rawInput.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n)),
)

const result = computed(() => {
  if (data.value.length < 2) return null
  return tTest(data.value, mu0.value)
})

const significant = computed(() => result.value ? result.value.pValue < alpha.value : false)

const steps = computed(() => {
  if (!result.value) return []
  const r = result.value
  const n = data.value.length
  return [
    { label: 'Stichprobenmittel berechnen', formula: `\\bar{x} = ${r.sampleMean.toFixed(4)}` },
    { label: 'Standardabweichung berechnen', formula: `s = ${r.sampleStd.toFixed(4)}` },
    { label: 'Standardfehler berechnen', formula: `SE = \\frac{s}{\\sqrt{n}} = \\frac{${r.sampleStd.toFixed(4)}}{\\sqrt{${n}}} = ${(r.sampleStd / Math.sqrt(n)).toFixed(4)}` },
    { label: 't-Statistik berechnen', formula: `t = \\frac{\\bar{x} - \\mu_0}{SE} = \\frac{${r.sampleMean.toFixed(4)} - ${mu0.value}}{${(r.sampleStd / Math.sqrt(n)).toFixed(4)}} = ${r.tStat.toFixed(4)}` },
    { label: 'p-Wert bestimmen', formula: `p = ${r.pValue.toFixed(6)} \\quad (df = ${r.df})` },
    { label: 'Entscheidung', formula: `p = ${r.pValue.toFixed(4)} ${significant.value ? '<' : '\\geq'} \\alpha = ${alpha.value} \\Rightarrow H_0 \\text{ ${significant.value ? 'ablehnen' : 'nicht ablehnen'}}` },
  ]
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">T-Test</h1>
    <p class="mb-6 text-text-secondary">
      Der Ein-Stichproben-t-Test prüft, ob der Mittelwert einer Stichprobe
      signifikant von einem hypothetischen Wert μ₀ abweicht.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energieaudit-Prüfung</p>
      <p>
        Laut Energieaudit soll eine Produktionshalle max. 140 MWh/Monat verbrauchen.
        Du misst 10 Monate und willst prüfen, ob der reale Verbrauch signifikant vom Sollwert abweicht.
      </p>
    </div>

    <!-- Beginner explanation -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Einfach erklärt</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5 space-y-5">
        <!-- Core question -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Die Kernfrage des Ein-Stichproben-T-Tests</h3>
          <p class="text-sm text-text-secondary">
            <span class="font-semibold text-text-primary">Weicht der Mittelwert meiner Stichprobe signifikant von einem
            bekannten Referenzwert ab — oder ist der Unterschied nur Zufall?</span>
          </p>
          <p class="mt-2 text-sm text-text-secondary">
            Du hast z.&nbsp;B. einen Sollwert aus einem Energieaudit. Deine Messwerte liegen etwas darüber.
            Aber reicht das aus, um zu sagen „der Verbrauch ist wirklich höher"? Oder ist die Abweichung
            nur natürliche Schwankung? Der t-Test gibt dir eine statistisch fundierte Antwort.
          </p>
        </div>

        <!-- Münz-Analogie -->
        <div class="rounded-lg bg-surface-900 p-4">
          <p class="mb-1 text-sm font-semibold text-text-primary">Die Münz-Analogie</p>
          <p class="text-sm text-text-secondary">
            Stell dir vor, eine faire Münze soll im Schnitt 50 % Kopf zeigen (= Referenzwert μ₀ = 50 %).
            Du wirfst 20× und bekommst 65 % Kopf. Ist die Münze unfair — oder war das Zufall?
            Der t-Test berechnet, wie wahrscheinlich dieses Ergebnis bei einer fairen Münze wäre.
          </p>
        </div>

        <!-- Varianten-Überblick -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-text-primary">Varianten des T-Tests</h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div class="rounded-lg bg-surface-700 p-3">
              <p class="text-xs font-semibold text-accent-400">Ein-Stichproben</p>
              <p class="mt-1 text-xs text-text-secondary">Vergleicht den Mittelwert einer Stichprobe mit einem festen Referenzwert μ₀.</p>
              <p class="mt-1 text-xs text-accent-300">← Der Rechner unten</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3">
              <p class="text-xs font-semibold text-text-muted">Zwei-Stichproben</p>
              <p class="mt-1 text-xs text-text-secondary">Vergleicht die Mittelwerte zweier unabhängiger Gruppen (z.&nbsp;B. Gebäude A vs. B).</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3">
              <p class="text-xs font-semibold text-text-muted">Gepaarter T-Test</p>
              <p class="mt-1 text-xs text-text-secondary">Vergleicht Vorher-Nachher-Messungen am selben Objekt (z.&nbsp;B. vor/nach Sanierung).</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-text-muted">
            In der Regression wird eine verwandte Form des t-Tests verwendet, um zu prüfen, ob einzelne Koeffizienten
            signifikant von Null abweichen — das Grundprinzip ist dasselbe.
          </p>
        </div>
      </div>
    </div>

    <!-- Formula -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">t-Statistik</h3>
        <FormulaBlock formula="t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}" />
      </div>
    </div>

    <!-- Interactive calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">T-Test Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <div class="mb-4 space-y-3">
          <div>
            <label class="mb-1 block text-sm text-text-secondary">Stichprobe (kommagetrennt):</label>
            <input
              v-model="rawInput"
              type="text"
              class="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
            >
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm text-text-secondary">Referenzwert μ₀:</label>
              <input
                v-model.number="mu0"
                type="number"
                step="0.1"
                class="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-500"
              >
            </div>
            <div>
              <SliderInput
                v-model="alpha"
                :min="0.01"
                :max="0.1"
                :step="0.01"
                label="α"
              />
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="result" class="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">n</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ data.length }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">x&#772;</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ result.sampleMean.toFixed(3) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">s</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ result.sampleStd.toFixed(3) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">t</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ result.tStat.toFixed(4) }}</p>
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
        </div>

        <div
          v-if="result"
          class="mt-3 rounded-lg p-4 text-sm font-medium"
          :class="significant ? 'bg-red-500/10 text-red-400' : 'bg-accent-500/10 text-accent-400'"
        >
          {{ significant
            ? `H₀ ablehnen: Der Mittelwert (${result.sampleMean.toFixed(2)}) weicht signifikant von μ₀ = ${mu0} ab.`
            : `H₀ nicht ablehnen: Kein signifikanter Unterschied zu μ₀ = ${mu0} nachweisbar.`
          }}
        </div>
      </div>
    </div>

    <!-- Step-by-step -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Schritt für Schritt</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <ol class="space-y-3">
          <li
            v-for="(step, i) in steps"
            :key="i"
            class="flex gap-3"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-400">
              {{ i + 1 }}
            </span>
            <div class="flex-1">
              <p class="mb-1 text-sm text-text-secondary">{{ step.label }}</p>
              <FormulaBlock :formula="step.formula" :display="false" />
            </div>
          </li>
        </ol>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Der t-Test vergleicht den Stichprobenmittel mit einem Referenzwert.
        Er ist robust bei annähernd normalverteilten Daten und kleinen Stichproben (n &lt; 30).
      </p>
    </div>
  </div>
</template>
