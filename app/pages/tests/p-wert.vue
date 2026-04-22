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
import { normalCurvePoints, normalPdf, tTest, mean, standardDeviation } from '~/utils/stats'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

definePageMeta({ title: 'p-Wert' })

// Interactive hypothesis test
// Monthly gas consumption (MWh) — testing against energy certificate target
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

const decision = computed(() => {
  if (!result.value) return ''
  return result.value.pValue < alpha.value
    ? 'H₀ ablehnen — der Unterschied ist statistisch signifikant.'
    : 'H₀ nicht ablehnen — kein signifikanter Unterschied nachweisbar.'
})

// Normal curve for visualization
const curveData = computed(() => {
  const { x, y } = normalCurvePoints(0, 1, 200, 4)
  return { labels: x.map((v) => v.toFixed(2)), x, y }
})

const chartData = computed(() => {
  const tStat = result.value?.tStat ?? 0
  const absT = Math.abs(tStat)
  return {
    labels: curveData.value.labels,
    datasets: [
      {
        label: 'Näherung (Normalverteilung)',
        data: curveData.value.y,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Ablehnungsbereich',
        data: curveData.value.x.map((xi) =>
          Math.abs(xi) >= absT ? normalPdf(xi, 0, 1) : null,
        ),
        borderColor: 'rgba(248, 113, 113, 0.8)',
        backgroundColor: 'rgba(248, 113, 113, 0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 0,
        spanGaps: false,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 150 },
  scales: {
    x: {
      type: 'category' as const,
      ticks: { color: '#64748b', maxTicksLimit: 9, font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: {
    tooltip: { enabled: false },
    legend: { labels: { color: '#94a3b8' } },
  },
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">p-Wert</h1>
    <p class="mb-6 text-text-secondary">
      Der p-Wert gibt die Wahrscheinlichkeit an, die beobachteten (oder extremere) Daten zu sehen,
      wenn die Nullhypothese wahr wäre. Je kleiner der p-Wert, desto stärker die Evidenz gegen H₀.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energieausweis-Prüfung</p>
      <p>
        Eine Industriehalle soll laut Energieausweis maximal 140 MWh/Monat verbrauchen.
        Du misst 10 Monate und willst prüfen: Weicht der tatsächliche Verbrauch
        signifikant vom Sollwert ab?
      </p>
    </div>

    <!-- Schritt für Schritt Erklärung -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Schritt für Schritt</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5 space-y-5">
        <!-- Was ist der p-Wert? -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Was ist der p-Wert?</h3>
          <p class="text-sm text-text-secondary">
            Der p-Wert beantwortet eine einfache Frage:
            <span class="font-semibold text-text-primary">Wie wahrscheinlich wäre es, dieses Ergebnis durch Zufall zu bekommen, wenn eigentlich nichts passiert wäre?</span>
          </p>
        </div>

        <!-- Münz-Analogie -->
        <div class="rounded-lg bg-surface-900 p-4">
          <p class="mb-1 text-sm font-semibold text-text-primary">Die Münz-Analogie</p>
          <p class="text-sm text-text-secondary">
            Stell dir vor, jemand behauptet, eine faire Münze zu haben. Dann wirft er 10x Kopf hintereinander.
            Wahrscheinlichkeit bei einer fairen Münze: <span class="font-mono text-red-400">0,1 %</span>.
            Die Münze ist wahrscheinlich nicht fair!
          </p>
          <p class="mt-2 text-xs text-text-muted">
            Der p-Wert wäre hier 0,001 — extrem unwahrscheinlich unter der Annahme "faire Münze" (= Nullhypothese).
          </p>
        </div>

        <!-- Energie-Beispiel -->
        <div class="rounded-lg bg-surface-900 p-4">
          <p class="mb-1 text-sm font-semibold text-accent-400">Praxisbeispiel: Gebäudesanierung</p>
          <p class="text-sm text-text-secondary">
            Hat die Sanierung den Gasverbrauch gesenkt?
          </p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">Verbrauch vorher</p>
              <p class="mt-1 font-mono text-lg text-text-primary">Ø 450 kWh/Tag</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">Verbrauch nachher</p>
              <p class="mt-1 font-mono text-lg text-accent-400">Ø 390 kWh/Tag</p>
            </div>
          </div>
          <p class="mt-3 text-sm text-text-secondary">
            p = <span class="font-mono text-red-400">0,002</span> → Ja, die Senkung ist statistisch signifikant.
            Die Wahrscheinlichkeit, diesen Unterschied rein zufällig zu beobachten, liegt bei nur 0,2 %.
          </p>
        </div>

        <!-- Signifikanzniveau-Tabelle -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-text-primary">Signifikanzniveaus — die Ampel-Logik</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-600">
                  <th class="px-3 py-2 text-left text-xs text-text-muted">p-Wert</th>
                  <th class="px-3 py-2 text-left text-xs text-text-muted">Bedeutung</th>
                  <th class="px-3 py-2 text-left text-xs text-text-muted">Bewertung</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-surface-700/50">
                  <td class="px-3 py-2 font-mono text-text-primary">p > 0,05</td>
                  <td class="px-3 py-2 text-text-secondary">Nicht signifikant</td>
                  <td class="px-3 py-2"><span class="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">Kein Grund, H₀ abzulehnen</span></td>
                </tr>
                <tr class="border-b border-surface-700/50">
                  <td class="px-3 py-2 font-mono text-text-primary">p ≤ 0,05</td>
                  <td class="px-3 py-2 text-text-secondary">Signifikant</td>
                  <td class="px-3 py-2"><span class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">Hinweis auf echten Effekt</span></td>
                </tr>
                <tr class="border-b border-surface-700/50">
                  <td class="px-3 py-2 font-mono text-text-primary">p ≤ 0,01</td>
                  <td class="px-3 py-2 text-text-secondary">Hoch signifikant</td>
                  <td class="px-3 py-2"><span class="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">Starke Evidenz gegen H₀</span></td>
                </tr>
                <tr>
                  <td class="px-3 py-2 font-mono text-text-primary">p ≤ 0,001</td>
                  <td class="px-3 py-2 text-text-secondary">Höchst signifikant</td>
                  <td class="px-3 py-2"><span class="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">Sehr starke Evidenz gegen H₀</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stichprobengröße -->
        <div class="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p class="mb-1 text-sm font-semibold text-yellow-400">Achtung: p-Wert und Stichprobengröße</p>
          <p class="text-sm text-text-secondary">
            Bei großen Datensätzen werden selbst winzige Unterschiede signifikant.
            Ein Unterschied von 0,5 kWh bei 10.000 Messpunkten kann p &lt; 0,001 ergeben —
            obwohl er praktisch irrelevant ist.
            <span class="font-semibold text-text-primary">Deshalb immer auch die praktische Bedeutsamkeit (Effektgröße) prüfen!</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Concept -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Hypothesen</h3>
        <FormulaBlock formula="H_0: \mu = \mu_0 \qquad H_1: \mu \neq \mu_0" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Entscheidungsregel</h3>
        <FormulaBlock formula="p < \alpha \Rightarrow H_0 \text{ ablehnen}" />
      </div>
    </div>

    <!-- Interactive calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Hypothesentest-Rechner</h2>
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
              <label class="mb-1 block text-sm text-text-secondary">H₀: μ₀ =</label>
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
                label="Signifikanzniveau (α)"
              />
            </div>
          </div>
        </div>

        <!-- Visualization -->
        <div class="mb-4 h-56">
          <Line :data="chartData" :options="chartOptions" />
        </div>

        <!-- Results -->
        <div v-if="result" class="space-y-3">
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">x&#772;</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.sampleMean.toFixed(3) }}</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">t-Statistik</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.tStat.toFixed(4) }}</p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">p-Wert</p>
              <p
                class="mt-1 font-mono text-lg"
                :class="result.pValue < alpha ? 'text-red-400' : 'text-accent-400'"
              >
                {{ result.pValue.toFixed(4) }}
              </p>
            </div>
            <div class="rounded-lg bg-surface-700 p-3 text-center">
              <p class="text-xs text-text-muted">df</p>
              <p class="mt-1 font-mono text-lg text-text-primary">{{ result.df }}</p>
            </div>
          </div>

          <div
            class="rounded-lg p-4 text-sm font-medium"
            :class="result.pValue < alpha ? 'bg-red-500/10 text-red-400' : 'bg-accent-500/10 text-accent-400'"
          >
            {{ decision }}
          </div>
        </div>
      </div>
    </div>

    <!-- Common misinterpretations -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Häufige Fehlinterpretationen</h2>
      <div class="space-y-2">
        <div class="rounded-lg border border-red-500/20 bg-surface-800 p-4">
          <p class="text-sm text-red-400">p = 0.03 bedeutet NICHT „3 % Wahrscheinlichkeit, dass H₀ wahr ist"</p>
          <p class="mt-1 text-xs text-text-secondary">
            Der p-Wert sagt: „Wenn H₀ stimmt, würden wir so extreme Daten nur in 3 % der Fälle sehen."
          </p>
        </div>
        <div class="rounded-lg border border-red-500/20 bg-surface-800 p-4">
          <p class="text-sm text-red-400">p &gt; 0.05 bedeutet NICHT „kein Effekt"</p>
          <p class="mt-1 text-xs text-text-secondary">
            Es bedeutet nur: „Wir haben nicht genug Evidenz, um H₀ abzulehnen." Der Effekt könnte trotzdem existieren.
          </p>
        </div>
        <div class="rounded-lg border border-red-500/20 bg-surface-800 p-4">
          <p class="text-sm text-red-400">Ein kleiner p-Wert sagt NICHTS über die Effektgröße</p>
          <p class="mt-1 text-xs text-text-secondary">
            Bei großem n kann auch ein winziger Unterschied signifikant werden. Immer auch die Effektgröße betrachten!
          </p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Der p-Wert misst die Überraschung der Daten unter H₀ — nicht die Wahrscheinlichkeit der Hypothese.
        Signifikanz (p &lt; α) bedeutet nicht automatisch praktische Relevanz.
      </p>
    </div>
  </div>
</template>
