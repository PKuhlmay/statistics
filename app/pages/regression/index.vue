<script setup lang="ts">
definePageMeta({ title: 'Regression' })

const topics = [
  {
    title: 'Einfache lineare Regression',
    description: 'Eine Gerade durch die Daten legen — OLS-Methode, R² und die Regression Sandbox.',
    to: '/regression/einfach',
    tags: ['OLS', 'R²', 'Regression Sandbox', 'Residuen'],
  },
  {
    title: 'Multiple Regression',
    description: 'Mehrere Prädiktoren gleichzeitig — adj. R², Koeffizienten und LINE-Voraussetzungen.',
    to: '/regression/multipel',
    tags: ['adj. R²', 'Koeffizienten', 'LINE-Prinzip', 'Residuenplot'],
  },
]
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Lineare Regression</h1>
    <p class="mb-8 text-text-secondary">
      Regression modelliert den Zusammenhang zwischen einer abhängigen Variable
      und einem oder mehreren Prädiktoren — das Fundament der prädiktiven Statistik.
    </p>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.title"
        :to="topic.to"
        class="group rounded-xl border border-surface-700 bg-surface-800 p-5 transition-all hover:border-accent-500/50"
      >
        <h2 class="mb-2 text-lg font-semibold group-hover:text-accent-400 transition-colors">
          {{ topic.title }}
        </h2>
        <p class="mb-3 text-sm text-text-secondary">{{ topic.description }}</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in topic.tags"
            :key="tag"
            class="rounded-md bg-surface-700 px-2 py-0.5 text-xs text-text-muted"
          >
            {{ tag }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
