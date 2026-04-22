<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { multipleRegression, mean } from '~/utils/stats'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip)

definePageMeta({ title: 'Multiple Regression' })

// Sample data: energy consumption with two predictors
// x1 = Heizgradtage, x2 = Gebäudefläche (m²)
const tableData = ref([
  { hgt: 180, flaeche: 500, verbrauch: 42 },
  { hgt: 220, flaeche: 500, verbrauch: 48 },
  { hgt: 300, flaeche: 500, verbrauch: 58 },
  { hgt: 150, flaeche: 800, verbrauch: 52 },
  { hgt: 250, flaeche: 800, verbrauch: 65 },
  { hgt: 320, flaeche: 800, verbrauch: 75 },
  { hgt: 100, flaeche: 1200, verbrauch: 55 },
  { hgt: 200, flaeche: 1200, verbrauch: 72 },
  { hgt: 280, flaeche: 1200, verbrauch: 85 },
  { hgt: 350, flaeche: 1200, verbrauch: 95 },
])

const regression = computed(() => {
  const x1 = tableData.value.map((r) => r.hgt)
  const x2 = tableData.value.map((r) => r.flaeche)
  const y = tableData.value.map((r) => r.verbrauch)
  return multipleRegression([x1, x2], y)
})

const predicted = computed(() => {
  const { intercept, coefficients } = regression.value
  return tableData.value.map(
    (r) => intercept + coefficients[0] * r.hgt + coefficients[1] * r.flaeche,
  )
})

// Residual chart
const residualChartData = computed(() => ({
  datasets: [
    {
      label: 'Residuen',
      data: predicted.value.map((pred, i) => ({
        x: pred,
        y: tableData.value[i].verbrauch - pred,
      })),
      backgroundColor: 'rgba(165, 180, 252, 0.6)',
      pointRadius: 6,
    },
    {
      label: 'Nulllinie',
      data: [
        { x: Math.min(...predicted.value) - 5, y: 0 },
        { x: Math.max(...predicted.value) + 5, y: 0 },
      ],
      borderColor: 'rgba(248, 113, 113, 0.5)',
      borderWidth: 1,
      borderDash: [6, 4],
      pointRadius: 0,
      type: 'line' as const,
      showLine: true,
    },
  ],
}))

const residualOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 100 },
  scales: {
    x: {
      type: 'linear' as const,
      title: { display: true, text: 'Vorhergesagt (ŷ)', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      type: 'linear' as const,
      title: { display: true, text: 'Residuum', color: '#64748b' },
      ticks: { color: '#64748b', font: { family: 'monospace', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
}

function updateRow(index: number, field: 'hgt' | 'flaeche' | 'verbrauch', value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return
  tableData.value[index] = { ...tableData.value[index], [field]: num }
}

function addRow() {
  tableData.value.push({ hgt: 200, flaeche: 600, verbrauch: 55 })
}

function removeRow(index: number) {
  if (tableData.value.length > 4) {
    tableData.value.splice(index, 1)
  }
}

// LINE checklist
const lineChecks = [
  { letter: 'L', name: 'Linearity', desc: 'Der Zusammenhang zwischen Prädiktoren und y ist linear.' },
  { letter: 'I', name: 'Independence', desc: 'Die Residuen sind voneinander unabhängig.' },
  { letter: 'N', name: 'Normality', desc: 'Die Residuen sind annähernd normalverteilt.' },
  { letter: 'E', name: 'Equal Variance', desc: 'Die Varianz der Residuen ist konstant (Homoskedastizität).' },
]
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Multiple Regression</h1>
    <p class="mb-6 text-text-secondary">
      Die multiple lineare Regression erweitert das einfache Modell um mehrere
      Prädiktoren: ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₖxₖ.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energieverbrauch mit zwei Prädiktoren</p>
      <p>
        Der monatliche Energieverbrauch hängt sowohl von den Heizgradtagen (Außentemperatur)
        als auch von der Gebäudefläche ab. Beide Faktoren gleichzeitig zu modellieren
        ergibt ein genaueres Bild als nur ein Prädiktor.
      </p>
    </div>

    <!-- Formulas -->
    <div class="mb-8 space-y-4">
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Modellgleichung</h3>
        <FormulaBlock formula="\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_k x_k" />
      </div>
      <div>
        <h3 class="mb-1 text-sm font-semibold text-text-secondary">Adjustiertes R²</h3>
        <FormulaBlock formula="R^2_{adj} = 1 - \frac{(1 - R^2)(n - 1)}{n - k - 1}" />
      </div>
    </div>

    <!-- Interactive table + calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Koeffizienten-Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Bearbeite die Daten — Koeffizienten, R² und Residuenplot aktualisieren sich live.
        </p>

        <!-- Data table -->
        <div class="mb-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-600 text-xs text-text-muted">
                <th class="px-2 py-2 text-left">#</th>
                <th class="px-2 py-2 text-left">Heizgradtage (x₁)</th>
                <th class="px-2 py-2 text-left">Fläche m² (x₂)</th>
                <th class="px-2 py-2 text-left">Verbrauch MWh (y)</th>
                <th class="px-2 py-2 text-left">ŷ</th>
                <th class="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in tableData"
                :key="i"
                class="border-b border-surface-700/50"
              >
                <td class="px-2 py-1 text-text-muted">{{ i + 1 }}</td>
                <td class="px-2 py-1">
                  <input
                    :value="row.hgt"
                    type="number"
                    class="w-20 rounded border border-surface-600 bg-surface-900 px-2 py-1 font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                    @change="updateRow(i, 'hgt', ($event.target as HTMLInputElement).value)"
                  >
                </td>
                <td class="px-2 py-1">
                  <input
                    :value="row.flaeche"
                    type="number"
                    class="w-20 rounded border border-surface-600 bg-surface-900 px-2 py-1 font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                    @change="updateRow(i, 'flaeche', ($event.target as HTMLInputElement).value)"
                  >
                </td>
                <td class="px-2 py-1">
                  <input
                    :value="row.verbrauch"
                    type="number"
                    class="w-20 rounded border border-surface-600 bg-surface-900 px-2 py-1 font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                    @change="updateRow(i, 'verbrauch', ($event.target as HTMLInputElement).value)"
                  >
                </td>
                <td class="px-2 py-1 font-mono text-xs text-accent-400">
                  {{ predicted[i]?.toFixed(1) ?? '–' }}
                </td>
                <td class="px-2 py-1">
                  <button
                    class="text-text-muted hover:text-red-400"
                    :disabled="tableData.length <= 4"
                    @click="removeRow(i)"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button
            class="mt-2 rounded bg-surface-600 px-3 py-1 text-xs text-text-secondary hover:bg-surface-500"
            @click="addRow"
          >
            + Zeile
          </button>
        </div>

        <!-- Coefficients -->
        <div class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">β₀</p>
            <p class="mt-1 font-mono text-lg text-text-primary">{{ regression.intercept.toFixed(2) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">β₁ (HGT)</p>
            <p class="mt-1 font-mono text-lg text-text-primary">
              {{ regression.coefficients[0]?.toFixed(4) ?? '–' }}
            </p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">β₂ (Fläche)</p>
            <p class="mt-1 font-mono text-lg text-text-primary">
              {{ regression.coefficients[1]?.toFixed(4) ?? '–' }}
            </p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">R²</p>
            <p class="mt-1 font-mono text-lg text-accent-400">{{ regression.r2.toFixed(4) }}</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-3 text-center">
            <p class="text-xs text-text-muted">adj. R²</p>
            <p class="mt-1 font-mono text-lg text-accent-300">{{ regression.adjR2.toFixed(4) }}</p>
          </div>
        </div>

        <p class="text-xs text-text-muted">
          ŷ = {{ regression.intercept.toFixed(2) }}
          + {{ regression.coefficients[0]?.toFixed(4) ?? '?' }} &middot; HGT
          + {{ regression.coefficients[1]?.toFixed(4) ?? '?' }} &middot; Fläche
        </p>
      </div>
    </div>

    <!-- Residual plot -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Residuenplot</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Residuen gegen vorhergesagte Werte — prüfe auf Muster, die auf verletzte Annahmen hindeuten.
        </p>
        <div class="h-56">
          <Scatter :data="residualChartData" :options="residualOptions" />
        </div>
      </div>
    </div>

    <!-- LINE principle -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">LINE-Prinzip — Voraussetzungen</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Damit die Regression valide Ergebnisse liefert, müssen vier Voraussetzungen erfüllt sein.
          Der Residuenplot oben hilft, diese visuell zu prüfen.
        </p>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            v-for="check in lineChecks"
            :key="check.letter"
            class="flex gap-3 rounded-lg bg-surface-700 p-4"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 font-mono text-lg font-bold text-accent-400">
              {{ check.letter }}
            </div>
            <div>
              <p class="text-sm font-semibold text-text-primary">{{ check.name }}</p>
              <p class="text-xs text-text-secondary">{{ check.desc }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-surface-900 p-4 text-sm">
          <p class="mb-2 font-semibold text-text-primary">Worauf achten im Residuenplot?</p>
          <ul class="space-y-1 text-text-secondary">
            <li><span class="text-accent-400">Trichterform</span> → Heteroskedastizität (E verletzt)</li>
            <li><span class="text-accent-400">Kurve / U-Form</span> → Nichtlinearität (L verletzt)</li>
            <li><span class="text-accent-400">Cluster / Trends</span> → Abhängigkeit (I verletzt)</li>
            <li><span class="text-accent-400">Extreme Ausreißer</span> → Normalität fragwürdig (N verletzt)</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Regularization overview -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Regularisierung — Überblick</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <p class="mb-4 text-sm text-text-secondary">
          Bei vielen Prädiktoren oder Multikollinearität können Regularisierungsmethoden
          Overfitting reduzieren, indem sie die Koeffizienten „bestrafen".
        </p>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="rounded-lg bg-surface-700 p-4">
            <h3 class="mb-1 text-sm font-semibold text-accent-400">Ridge (L2)</h3>
            <FormulaBlock formula="\min \sum(y_i - \hat{y}_i)^2 + \lambda \sum \beta_j^2" :display="false" />
            <p class="mt-2 text-xs text-text-secondary">Schrumpft Koeffizienten gegen Null, entfernt aber keine.</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4">
            <h3 class="mb-1 text-sm font-semibold text-accent-400">Lasso (L1)</h3>
            <FormulaBlock formula="\min \sum(y_i - \hat{y}_i)^2 + \lambda \sum |\beta_j|" :display="false" />
            <p class="mt-2 text-xs text-text-secondary">Kann Koeffizienten auf exakt Null setzen → Feature Selection.</p>
          </div>
          <div class="rounded-lg bg-surface-700 p-4">
            <h3 class="mb-1 text-sm font-semibold text-accent-400">Elastic Net</h3>
            <FormulaBlock formula="\min \sum(y_i - \hat{y}_i)^2 + \lambda_1 \sum|\beta_j| + \lambda_2 \sum\beta_j^2" :display="false" />
            <p class="mt-2 text-xs text-text-secondary">Kombination aus Ridge und Lasso — flexibelste Variante.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Nutze adj. R² statt R² bei mehreren Prädiktoren — es bestraft unnötige Variablen.
        Prüfe immer die LINE-Voraussetzungen per Residuenplot.
        Bei Multikollinearität helfen Regularisierung oder VIF-Analyse.
      </p>
    </div>
  </div>
</template>
