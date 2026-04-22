<script setup lang="ts">
import { mean, median, mode } from '~/utils/stats'

definePageMeta({ title: 'Lagemaße' })

// Interactive dataset — monthly energy consumption (MWh) of an industrial building
const rawInput = ref('142, 158, 137, 165, 148, 152, 145, 312')
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
const baseData = [142, 158, 137, 165, 148, 152, 145, 139, 150, 160]
const outlierValue = ref(310)

const outlierData = computed(() =>
  includeOutlier.value ? [...baseData, outlierValue.value] : [...baseData],
)

const outlierStats = computed(() => ({
  mean: mean(outlierData.value),
  median: median(outlierData.value),
}))

// Energy domain example
const energyExample = `Ein Industriebetrieb verbraucht monatlich 137–165 MWh Strom (Produktion + Kühlung).
Im August springt der Wert auf 312 MWh — eine Kältemaschine lief im Dauerbetrieb wegen eines defekten Thermostats.
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

    <!-- Beginner-friendly explanations -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Was sind Lagemaße?</h2>
      <p class="mb-6 text-sm text-text-secondary">
        Lagemaße beantworten eine einfache Frage: <span class="text-accent-400">Welcher Wert ist „typisch" für meinen Datensatz?</span>
        Je nach Situation eignet sich ein anderes Maß besser.
      </p>

      <div class="space-y-4">
        <!-- Mittelwert -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Mittelwert (Arithmetisches Mittel)</h3>
          <p class="mb-2 text-sm text-text-secondary">
            Alle Werte zusammenzählen und durch die Anzahl teilen — fertig.
          </p>
          <div class="mb-2 rounded-lg bg-surface-900 px-4 py-2 font-mono text-sm text-text-muted">
            (142 + 158 + 137 + 165 + 148 + 152 + 145 + 312) / 8 = 169,9
          </div>
          <div class="flex gap-4 text-sm">
            <span class="text-green-400">+ Einfach zu berechnen, nutzt alle Werte</span>
          </div>
          <div class="flex gap-4 text-sm">
            <span class="text-red-400">− Empfindlich gegen Ausreißer — ein einzelner Extremwert verzerrt das Ergebnis</span>
          </div>
        </div>

        <!-- Median -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Median</h3>
          <p class="mb-2 text-sm text-text-secondary">
            Alle Werte sortieren — der Wert in der Mitte ist der Median.
            Bei einer geraden Anzahl nimmt man den Durchschnitt der beiden mittleren Werte.
          </p>
          <div class="mb-2 rounded-lg bg-surface-900 px-4 py-3 font-mono text-sm text-text-muted">
            <div class="mb-1">Sortiert: 137, 142, 145, 148, <span class="text-accent-300">152</span>, 158, 165, 312</div>
            <div>Mitte: (148 + 152) / 2 = <span class="text-accent-300">150</span></div>
          </div>
          <p class="mb-2 text-sm text-text-secondary">
            Obwohl 312 MWh dabei ist, bleibt der Median bei 150 — viel näher am tatsächlichen Normalverbrauch als der Mittelwert (169,9).
          </p>
          <div class="text-sm text-green-400">+ Robust gegen Ausreißer — ideal bei schiefen Verteilungen</div>
        </div>

        <!-- Modus -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-2 font-semibold text-accent-400">Modus</h3>
          <p class="mb-2 text-sm text-text-secondary">
            Der häufigste Wert im Datensatz. Besonders nützlich bei Kategorien,
            z.&nbsp;B. der häufigste Fehlercode einer Anlage oder der meistgenutzte Betriebsmodus.
          </p>
          <p class="text-sm text-text-muted">
            Bei Messdaten (kontinuierliche Werte) kommt es selten vor, dass ein Wert mehrfach auftaucht — dann gibt es keinen Modus.
          </p>
        </div>

        <!-- Decision table -->
        <div class="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <h3 class="mb-3 font-semibold text-accent-400">Wann nehme ich was?</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-600 text-left text-text-muted">
                <th class="pb-2 pr-4">Situation</th>
                <th class="pb-2 pr-4">Empfehlung</th>
                <th class="pb-2">Warum</th>
              </tr>
            </thead>
            <tbody class="text-text-secondary">
              <tr class="border-b border-surface-700">
                <td class="py-2 pr-4">Normalfall (symmetrische Verteilung)</td>
                <td class="py-2 pr-4 font-semibold text-accent-400">Mittelwert</td>
                <td class="py-2">Nutzt alle Datenpunkte, gibt besten Schätzwert</td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="py-2 pr-4">Ausreißer vorhanden / schiefe Verteilung</td>
                <td class="py-2 pr-4 font-semibold text-accent-300">Median</td>
                <td class="py-2">Wird von Extremwerten nicht verzerrt</td>
              </tr>
              <tr>
                <td class="py-2 pr-4">Kategorische Daten</td>
                <td class="py-2 pr-4 font-semibold text-accent-300">Modus</td>
                <td class="py-2">Einziges Lagemaß, das für Kategorien funktioniert</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
              :min="200"
              :max="500"
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
                :style="{ width: `${Math.min((outlierStats.mean / 300) * 100, 100)}%` }"
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
                :style="{ width: `${Math.min((outlierStats.median / 300) * 100, 100)}%` }"
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
