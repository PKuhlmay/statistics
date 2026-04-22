<script setup lang="ts">
definePageMeta({ title: 'Dashboard' })

interface TopicCard {
  title: string
  description: string
  to: string
  icon: string
  phase: number
  items: string[]
}

const topics: TopicCard[] = [
  {
    title: 'Grundlagen',
    description: 'Lagemaße, Streuung, Verteilungen und Korrelation — die Bausteine der Statistik.',
    to: '/grundlagen',
    icon: '📊',
    phase: 1,
    items: ['Mittelwert & Median', 'Standardabweichung', 'Normalverteilung', 'Pearson r'],
  },
  {
    title: 'Lineare Regression',
    description: 'Von der einfachen Geraden bis zur multiplen Regression mit Residuenanalyse.',
    to: '/regression',
    icon: '📈',
    phase: 2,
    items: ['OLS-Methode', 'R² & adj. R²', 'LINE-Prinzip', 'Residuenplots'],
  },
  {
    title: 'Statistische Tests',
    description: 'Hypothesen prüfen, Ausreißer erkennen, Multikollinearität bewerten.',
    to: '/tests',
    icon: '🧪',
    phase: 3,
    items: ['T-Test', 'F-Test', 'Grubbs-Test', 'VIF'],
  },
  {
    title: 'ML-Modelle',
    description: 'Überblick der MESSDAS-Forecast-Modelle — von ExtraTrees bis Prophet.',
    to: '/modelle',
    icon: '🤖',
    phase: 4,
    items: ['ExtraTrees', 'RandomForest', 'Prophet', 'BlockRNN'],
  },
]
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <!-- Hero -->
    <div class="mb-12">
      <h1 class="mb-3 text-4xl font-bold tracking-tight">
        Statistik <span class="text-accent-400">interaktiv</span> lernen
      </h1>
      <p class="max-w-2xl text-lg text-text-secondary">
        Abstrakte Konzepte greifbar machen — mit Live-Beispielen aus dem Energiemanagement,
        interaktiven Rechnern und Schritt-für-Schritt-Erklärungen.
      </p>
    </div>

    <!-- Topic cards -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.title"
        :to="topic.to"
        class="group rounded-xl border border-surface-700 bg-surface-800 p-6 transition-all hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/5"
      >
        <div class="mb-4 flex items-center justify-between">
          <span class="text-3xl">{{ topic.icon }}</span>
          <span class="rounded-full bg-surface-700 px-2.5 py-0.5 text-xs font-medium text-text-muted">
            Phase {{ topic.phase }}
          </span>
        </div>

        <h2 class="mb-2 text-xl font-semibold group-hover:text-accent-400 transition-colors">
          {{ topic.title }}
        </h2>
        <p class="mb-4 text-sm text-text-secondary">
          {{ topic.description }}
        </p>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="item in topic.items"
            :key="item"
            class="rounded-md bg-surface-700 px-2 py-0.5 text-xs text-text-muted"
          >
            {{ item }}
          </li>
        </ul>
      </NuxtLink>
    </div>
  </div>
</template>
