<script setup lang="ts">
definePageMeta({ title: 'ML-Modelle' })

interface Model {
  name: string
  type: string
  description: string
  strengths: string[]
  weaknesses: string[]
  complexity: number // 1-5
  interpretability: number // 1-5
  dataNeeded: string
  useCase: string
}

const models: Model[] = [
  {
    name: 'Lineare Regression',
    type: 'Parametrisch',
    description: 'Modelliert einen linearen Zusammenhang zwischen Prädiktoren und Zielgröße. Einfach, schnell und interpretierbar.',
    strengths: ['Sehr interpretierbar', 'Schnell trainiert', 'Gute Baseline', 'Wenig Daten nötig'],
    weaknesses: ['Nur lineare Zusammenhänge', 'Empfindlich gegen Ausreißer', 'Multikollinearitäts-Probleme'],
    complexity: 1,
    interpretability: 5,
    dataNeeded: '< 100 Datenpunkte reichen',
    useCase: 'Einfache Prognosen, wenn der Zusammenhang annähernd linear ist (z.B. HGT → Verbrauch).',
  },
  {
    name: 'Random Forest',
    type: 'Ensemble (Bagging)',
    description: 'Baut viele Entscheidungsbäume auf zufälligen Subsets und mittelt die Vorhersagen. Robust und vielseitig.',
    strengths: ['Keine Feature-Skalierung nötig', 'Handles nicht-lineare Zusammenhänge', 'Feature Importance', 'Robuster gegen Overfitting als Einzelbäume'],
    weaknesses: ['Langsamer als lineare Modelle', 'Weniger interpretierbar', 'Größerer Speicherbedarf'],
    complexity: 3,
    interpretability: 3,
    dataNeeded: '> 500 Datenpunkte empfohlen',
    useCase: 'Mittlere Datenmenge, gemischte Features, wenn gute Genauigkeit ohne viel Tuning gefragt ist.',
  },
  {
    name: 'ExtraTrees',
    type: 'Ensemble (Random Subspace)',
    description: 'Wie Random Forest, aber mit komplett zufälligen Split-Schwellen (kein Bootstrap-Sampling). Schneller trainiert und oft weniger Varianz.',
    strengths: ['Schneller als Random Forest', 'Oft geringere Varianz als Random Forest', 'Feature Importance', 'Kein Feature-Scaling nötig'],
    weaknesses: ['Etwas höherer Bias möglich', 'Große Modelle', 'Schwer zu interpretieren'],
    complexity: 3,
    interpretability: 2,
    dataNeeded: '> 500 Datenpunkte empfohlen',
    useCase: 'In MESSDAS der Standard für Energieverbrauchs-Forecasts — gute Balance aus Geschwindigkeit und Genauigkeit.',
  },
  {
    name: 'Prophet',
    type: 'Additives Zeitreihenmodell',
    description: 'Facebooks Zeitreihen-Framework. Zerlegt die Serie in Trend, Saisonalität und Feiertage.',
    strengths: ['Automatische Saisonalitäts-Erkennung', 'Handles fehlende Werte', 'Interpretierbare Komponenten', 'Einfache API'],
    weaknesses: ['Prognostiziert nur eine Zielvariable', 'Kann bei irregulären Mustern versagen', 'Weniger flexibel als ML-Modelle bei vielen Prädiktoren'],
    complexity: 2,
    interpretability: 4,
    dataNeeded: '> 1 Jahr Zeitreihe (mind. 2 Saisonzyklen)',
    useCase: 'Monatliche/wöchentliche Energieprognose mit klarer Saisonalität.',
  },
  {
    name: 'BlockRNN',
    type: 'Deep Learning (RNN)',
    description: 'Rekurrentes neuronales Netz, das Sequenzen in Blöcken verarbeitet. Erfasst zeitliche Abhängigkeiten.',
    strengths: ['Erfasst komplexe zeitliche Muster', 'Multivariat möglich', 'Mit LSTM/GRU-Zellen auch lange Abhängigkeiten lernbar'],
    weaknesses: ['Viele Daten nötig', 'Schwer zu interpretieren', 'Langsames Training', 'Hyperparameter-sensitiv'],
    complexity: 5,
    interpretability: 1,
    dataNeeded: '> 10.000 Datenpunkte empfohlen',
    useCase: 'Komplexe Zeitreihen mit vielen Features, wenn genug Daten vorhanden sind.',
  },
]

const selectedModel = ref<string | null>(null)

// Decision tree questions
interface TreeNode {
  question: string
  yes: string | TreeNode
  no: string | TreeNode
}

const decisionTree: TreeNode = {
  question: 'Hast du eine Zeitreihe mit klarer Saisonalität?',
  yes: {
    question: 'Brauchst du multivariate Prädiktoren?',
    yes: {
      question: 'Hast du > 10.000 Datenpunkte?',
      yes: 'BlockRNN',
      no: 'ExtraTrees',
    },
    no: 'Prophet',
  },
  no: {
    question: 'Ist der Zusammenhang annähernd linear?',
    yes: 'Lineare Regression',
    no: {
      question: 'Ist Trainingsgeschwindigkeit wichtig?',
      yes: 'ExtraTrees',
      no: 'Random Forest',
    },
  },
}

// Interactive decision tree state
const treeAnswers = ref<boolean[]>([])
const currentNode = computed(() => {
  let node: string | TreeNode = decisionTree
  for (const answer of treeAnswers.value) {
    if (typeof node === 'string') break
    node = answer ? node.yes : node.no
  }
  return node
})
const isLeaf = computed(() => typeof currentNode.value === 'string')
const currentQuestion = computed(() =>
  typeof currentNode.value === 'string' ? null : currentNode.value.question,
)
const recommendation = computed(() =>
  typeof currentNode.value === 'string' ? currentNode.value : null,
)

function answerQuestion(yes: boolean) {
  treeAnswers.value = [...treeAnswers.value, yes]
}

function resetTree() {
  treeAnswers.value = []
}

function complexityBar(n: number): string {
  return `${(n / 5) * 100}%`
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="mb-2 text-3xl font-bold">ML-Modelle — Übersicht</h1>
    <p class="mb-8 text-text-secondary">
      Die MESSDAS-Plattform nutzt verschiedene Modelle für Energieverbrauchs-Forecasts.
      Hier ein Überblick: wann welches Modell passt, Stärken, Schwächen und Entscheidungshilfe.
    </p>

    <!-- Comparison table -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Vergleichstabelle</h2>
      <div class="overflow-x-auto rounded-xl border border-surface-700">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-surface-800">
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted">Modell</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted">Typ</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-text-muted">Komplexität</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-text-muted">Interpretierbarkeit</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted">Datenbedarf</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="model in models"
              :key="model.name"
              class="cursor-pointer border-t border-surface-700 transition-colors hover:bg-surface-800"
              :class="selectedModel === model.name ? 'bg-surface-800' : ''"
              @click="selectedModel = selectedModel === model.name ? null : model.name"
            >
              <td class="px-4 py-3 font-medium text-text-primary">{{ model.name }}</td>
              <td class="px-4 py-3 text-text-secondary">{{ model.type }}</td>
              <td class="px-4 py-3">
                <div class="mx-auto h-2 w-20 overflow-hidden rounded-full bg-surface-600">
                  <div
                    class="h-full rounded-full bg-accent-500 transition-all"
                    :style="{ width: complexityBar(model.complexity) }"
                  />
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="mx-auto h-2 w-20 overflow-hidden rounded-full bg-surface-600">
                  <div
                    class="h-full rounded-full bg-green-500 transition-all"
                    :style="{ width: complexityBar(model.interpretability) }"
                  />
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-text-muted">{{ model.dataNeeded }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail cards -->
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="model in models"
        :key="model.name"
        class="rounded-xl border bg-surface-800 p-5 transition-all"
        :class="selectedModel === model.name ? 'border-accent-500/50 shadow-lg shadow-accent-500/5' : 'border-surface-700'"
      >
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-accent-400">{{ model.name }}</h3>
          <span class="rounded-full bg-surface-700 px-2 py-0.5 text-xs text-text-muted">{{ model.type }}</span>
        </div>
        <p class="mb-3 text-xs text-text-secondary">{{ model.description }}</p>

        <div class="mb-2">
          <p class="mb-1 text-xs font-semibold text-green-400">Stärken</p>
          <ul class="space-y-0.5">
            <li v-for="s in model.strengths" :key="s" class="text-xs text-text-secondary">
              + {{ s }}
            </li>
          </ul>
        </div>

        <div class="mb-3">
          <p class="mb-1 text-xs font-semibold text-red-400">Schwächen</p>
          <ul class="space-y-0.5">
            <li v-for="w in model.weaknesses" :key="w" class="text-xs text-text-secondary">
              − {{ w }}
            </li>
          </ul>
        </div>

        <div class="rounded-lg bg-surface-700 p-2 text-xs text-text-muted">
          {{ model.useCase }}
        </div>
      </div>
    </div>

    <!-- Interactive decision tree -->
    <div class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Entscheidungsbaum — Welches Modell?</h2>
      <div class="rounded-xl border border-surface-700 bg-surface-800 p-6">
        <p class="mb-4 text-sm text-text-secondary">
          Beantworte die Fragen und erhalte eine Modellempfehlung für deinen Anwendungsfall.
        </p>

        <!-- Question history -->
        <div v-if="treeAnswers.length > 0" class="mb-4 space-y-2">
          <div
            v-for="(answer, i) in treeAnswers"
            :key="i"
            class="flex items-center gap-2 rounded-lg bg-surface-700 px-4 py-2 text-sm"
          >
            <span class="text-text-secondary">{{ i + 1 }}.</span>
            <span class="text-text-muted">Beantwortet mit</span>
            <span :class="answer ? 'text-green-400' : 'text-red-400'">
              {{ answer ? 'Ja' : 'Nein' }}
            </span>
          </div>
        </div>

        <!-- Current question or result -->
        <div v-if="!isLeaf && currentQuestion" class="text-center">
          <p class="mb-6 text-lg font-semibold text-text-primary">{{ currentQuestion }}</p>
          <div class="flex justify-center gap-4">
            <button
              class="rounded-lg bg-green-500/20 px-8 py-3 font-medium text-green-400 transition-colors hover:bg-green-500/30"
              @click="answerQuestion(true)"
            >
              Ja
            </button>
            <button
              class="rounded-lg bg-red-500/20 px-8 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/30"
              @click="answerQuestion(false)"
            >
              Nein
            </button>
          </div>
        </div>

        <div v-if="isLeaf && recommendation" class="text-center">
          <p class="mb-2 text-sm text-text-muted">Empfehlung</p>
          <p class="mb-4 text-3xl font-bold text-accent-400">{{ recommendation }}</p>
          <p class="mb-6 text-sm text-text-secondary">
            {{ models.find((m) => m.name === recommendation)?.useCase }}
          </p>
          <button
            class="rounded-lg bg-surface-600 px-6 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-500"
            @click="resetTree"
          >
            Neu starten
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="rounded-lg border border-accent-500/30 bg-accent-500/5 p-5">
      <p class="text-sm font-semibold text-accent-400">Takeaway</p>
      <p class="mt-1 text-sm text-text-secondary">
        Es gibt kein „bestes" Modell — nur das passende für den Anwendungsfall.
        Starte mit dem einfachsten Modell (Lineare Regression) als Baseline und
        steigere die Komplexität nur, wenn die Daten es hergeben.
      </p>
    </div>
  </div>
</template>
