<script setup lang="ts">
import { vif, pearsonR } from '~/utils/stats'

definePageMeta({ title: 'VIF' })

// Editable predictor data
const predictorNames = ref(['Heizgradtage', 'Fläche (m²)', 'Alter (Jahre)'])
const predictorData = ref([
  [180, 220, 300, 150, 250, 320, 100, 200, 280, 350],
  [500, 500, 500, 800, 800, 800, 1200, 1200, 1200, 1200],
  [5, 5, 5, 15, 15, 15, 30, 30, 30, 30],
])

const vifValues = computed(() => {
  if (predictorData.value.length < 2) return []
  return vif(predictorData.value)
})

// Correlation matrix
const correlationMatrix = computed(() => {
  const k = predictorData.value.length
  const matrix: number[][] = []
  for (let i = 0; i < k; i++) {
    const row: number[] = []
    for (let j = 0; j < k; j++) {
      row.push(i === j ? 1 : pearsonR(predictorData.value[i], predictorData.value[j]))
    }
    matrix.push(row)
  }
  return matrix
})

function vifSeverity(v: number): { label: string; class: string } {
  if (v < 5) return { label: 'OK', class: 'text-green-400 bg-green-500/20' }
  if (v < 10) return { label: 'Moderat', class: 'text-yellow-400 bg-yellow-500/20' }
  return { label: 'Kritisch', class: 'text-red-400 bg-red-500/20' }
}

function corrColor(r: number): string {
  const abs = Math.abs(r)
  if (abs > 0.8) return 'text-red-400'
  if (abs > 0.5) return 'text-yellow-400'
  return 'text-accent-400'
}

function updateValue(predIdx: number, valIdx: number, value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return
  predictorData.value[predIdx][valIdx] = num
  // Trigger reactivity
  predictorData.value = [...predictorData.value]
}

function updateName(idx: number, value: string) {
  predictorNames.value[idx] = value
  predictorNames.value = [...predictorNames.value]
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">VIF — Variance Inflation Factor</h1>
    <p class="mb-6 text-text-secondary">
      Der VIF misst, wie stark ein Prädiktor durch die anderen Prädiktoren erklärt werden kann.
      Hohe VIF-Werte deuten auf Multikollinearität hin — die Koeffizienten werden instabil.
    </p>

    <div class="mb-8 rounded-lg border border-surface-700 bg-surface-800 p-5 text-sm text-text-secondary">
      <p class="mb-1 font-semibold text-accent-400">Beispiel: Energiemodell</p>
      <p>
        Wenn Gebäudefläche und Gebäudealter stark korreliert sind (große Gebäude = alte Gebäude),
        kann das Modell nicht mehr unterscheiden, welcher Faktor den Verbrauch treibt.
        Der VIF macht dieses Problem sichtbar.
      </p>
    </div>

    <!-- Beginner explanation -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Einfach erklärt</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5 space-y-5">
        <!-- Was ist Multikollinearität? -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-accent-400">Was ist Multikollinearität?</h3>
          <p class="text-sm text-text-secondary">
            Multikollinearität bedeutet: <span class="font-semibold text-text-primary">Zwei oder mehr Variablen im Modell messen
            im Grunde das Gleiche.</span> Sie sind so stark miteinander korreliert, dass das Modell nicht
            mehr unterscheiden kann, welche Variable den Effekt verursacht.
          </p>
          <div class="mt-3 rounded-lg bg-surface-900 p-4">
            <p class="mb-1 text-sm font-semibold text-text-primary">Klassisches Beispiel: Temperatur und Heizgradtage</p>
            <p class="text-sm text-text-secondary">
              Heizgradtage (HGT) werden direkt aus der Außentemperatur berechnet!
              Beide ins Modell zu stecken bringt keine neue Information — sie sagen im Prinzip das Gleiche aus,
              nur in unterschiedlicher Form.
            </p>
          </div>
        </div>

        <!-- Warum ist das ein Problem? -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-text-primary">Warum ist das ein Problem?</h3>
          <div class="space-y-2">
            <div class="flex items-start gap-3 rounded-lg bg-surface-900 p-3">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">1</span>
              <div>
                <p class="text-sm font-semibold text-text-primary">Koeffizienten werden instabil</p>
                <p class="text-xs text-text-secondary">Kleine Änderungen in den Daten führen zu großen Sprüngen in den Koeffizienten. Heute sagt das Modell "Temperatur ist wichtig", morgen "HGT ist wichtig".</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-lg bg-surface-900 p-3">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">2</span>
              <div>
                <p class="text-sm font-semibold text-text-primary">T-Tests werden unzuverlässig</p>
                <p class="text-xs text-text-secondary">Beide Variablen können als "nicht signifikant" erscheinen, obwohl sie zusammen den Verbrauch perfekt erklären.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-lg bg-surface-900 p-3">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">3</span>
              <div>
                <p class="text-sm font-semibold text-text-primary">Modell wird schwer interpretierbar</p>
                <p class="text-xs text-text-secondary">Man kann nicht mehr sagen, welcher Faktor den Verbrauch treibt — die Effekte "verschwimmen".</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ASCII diagram -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-text-primary">Visualisierung</h3>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="rounded-lg bg-surface-900 p-4">
              <p class="mb-2 text-xs font-semibold text-green-400">Ohne Multikollinearität</p>
              <pre class="font-mono text-xs text-text-secondary leading-relaxed">  Temperatur ──→ Verbrauch
                          ↗
  Fläche ────────┘
                          ↗
  Alter ─────────┘</pre>
              <p class="mt-2 text-xs text-text-muted">Jede Variable hat einen klaren, eigenen Einfluss.</p>
            </div>
            <div class="rounded-lg bg-surface-900 p-4">
              <p class="mb-2 text-xs font-semibold text-red-400">Mit Multikollinearität</p>
              <pre class="font-mono text-xs text-text-secondary leading-relaxed">  Temperatur ←──→ HGT
       ↘          ↙
        ??? Verbrauch ???
       ↗          ↖
  Fläche ←──→ Alter</pre>
              <p class="mt-2 text-xs text-text-muted">Die Einflüsse lassen sich nicht mehr sauber trennen.</p>
            </div>
          </div>
        </div>

        <!-- Was tun? -->
        <div>
          <h3 class="mb-2 text-sm font-semibold text-text-primary">Was tun bei hohem VIF?</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-600">
                  <th class="px-3 py-2 text-left text-xs text-text-muted">Option</th>
                  <th class="px-3 py-2 text-left text-xs text-text-muted">Maßnahme</th>
                  <th class="px-3 py-2 text-left text-xs text-text-muted">Wann sinnvoll?</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-surface-700/50">
                  <td class="px-3 py-2 font-semibold text-text-primary">1. Entfernen</td>
                  <td class="px-3 py-2 text-text-secondary">Eine der korrelierten Variablen aus dem Modell nehmen</td>
                  <td class="px-3 py-2 text-text-secondary">Standard-Vorgehen, wenn Interpretation wichtig ist</td>
                </tr>
                <tr class="border-b border-surface-700/50">
                  <td class="px-3 py-2 font-semibold text-text-primary">2. Kombinieren</td>
                  <td class="px-3 py-2 text-text-secondary">Variablen zusammenfassen (z.B. per PCA oder gewichtetem Index)</td>
                  <td class="px-3 py-2 text-text-secondary">Wenn beide Variablen inhaltlich wichtig sind</td>
                </tr>
                <tr>
                  <td class="px-3 py-2 font-semibold text-text-primary">3. Akzeptieren</td>
                  <td class="px-3 py-2 text-text-secondary">VIF ignorieren und Modell so lassen</td>
                  <td class="px-3 py-2 text-text-secondary">Wenn nur Vorhersage zählt, nicht die Interpretation der Koeffizienten</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Formula -->
    <div class="mb-8">
      <h3 class="mb-1 text-sm font-semibold text-text-secondary">VIF-Berechnung</h3>
      <FormulaBlock formula="VIF_j = \frac{1}{1 - R_j^2}" />
      <p class="mt-2 text-sm text-text-secondary">
        Dabei ist R²ⱼ das Bestimmtheitsmaß der Regression von Prädiktor xⱼ auf alle übrigen Prädiktoren.
      </p>
    </div>

    <!-- VIF Calculator -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">VIF-Rechner</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-5">
        <!-- Editable data table -->
        <div class="mb-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-600">
                <th class="px-2 py-2 text-left text-xs text-text-muted">#</th>
                <th
                  v-for="(name, j) in predictorNames"
                  :key="j"
                  class="px-2 py-2"
                >
                  <input
                    :value="name"
                    class="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-center text-xs font-semibold text-accent-400 outline-none hover:border-surface-600 focus:border-accent-500 focus:bg-surface-900"
                    @change="updateName(j, ($event.target as HTMLInputElement).value)"
                  >
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(_, i) in predictorData[0]"
                :key="i"
                class="border-b border-surface-700/50"
              >
                <td class="px-2 py-1 text-xs text-text-muted">{{ i + 1 }}</td>
                <td
                  v-for="(pred, j) in predictorData"
                  :key="j"
                  class="px-2 py-1"
                >
                  <input
                    :value="pred[i]"
                    type="number"
                    class="w-20 rounded border border-surface-600 bg-surface-900 px-2 py-1 text-center font-mono text-xs text-text-primary outline-none focus:border-accent-500"
                    @change="updateValue(j, i, ($event.target as HTMLInputElement).value)"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VIF Results -->
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div
            v-for="(v, i) in vifValues"
            :key="i"
            class="rounded-lg bg-surface-700 p-4"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-text-primary">{{ predictorNames[i] }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="vifSeverity(v).class"
              >
                {{ vifSeverity(v).label }}
              </span>
            </div>
            <p class="font-mono text-2xl" :class="vifSeverity(v).class.split(' ')[0]">
              {{ v.toFixed(2) }}
            </p>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-600">
              <div
                class="h-full rounded-full transition-all"
                :class="v >= 10 ? 'bg-red-500' : v >= 5 ? 'bg-yellow-500' : 'bg-green-500'"
                :style="{ width: `${Math.min((v / 20) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Correlation matrix -->
        <div class="mb-4">
          <p class="mb-2 text-sm font-semibold text-text-secondary">Korrelationsmatrix</p>
          <div class="overflow-x-auto">
            <table class="text-sm">
              <thead>
                <tr>
                  <th class="px-3 py-1" />
                  <th
                    v-for="(name, j) in predictorNames"
                    :key="j"
                    class="px-3 py-1 text-xs text-text-muted"
                  >
                    {{ name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in correlationMatrix" :key="i">
                  <td class="px-3 py-1 text-xs text-text-muted">{{ predictorNames[i] }}</td>
                  <td
                    v-for="(val, j) in row"
                    :key="j"
                    class="px-3 py-1 text-center font-mono text-sm"
                    :class="i === j ? 'text-text-muted' : corrColor(val)"
                  >
                    {{ val.toFixed(3) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Interpretation guide -->
        <div class="rounded-lg bg-surface-900 p-4 text-sm">
          <p class="mb-2 font-semibold text-text-primary">Interpretation</p>
          <ul class="space-y-1 text-text-secondary">
            <li><span class="text-green-400">VIF &lt; 5</span> — Keine problematische Multikollinearität</li>
            <li><span class="text-yellow-400">5 ≤ VIF &lt; 10</span> — Moderate Multikollinearität, beobachten</li>
            <li><span class="text-red-400">VIF ≥ 10</span> — Starke Multikollinearität, Maßnahmen nötig</li>
          </ul>
          <p class="mt-2 text-xs text-text-muted">
            Gegenmaßnahmen: Prädiktoren entfernen, kombinieren (PCA), oder Regularisierung (Ridge) nutzen.
          </p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        VIF &gt; 10 ist ein Warnsignal: Die Koeffizienten des Regressionsmodells werden unzuverlässig.
        Immer VIF prüfen, bevor man Koeffizienten interpretiert!
      </p>
    </div>
  </div>
</template>
