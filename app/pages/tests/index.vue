<script setup lang="ts">
definePageMeta({ title: 'Statistische Tests' })

const topics = [
  {
    title: 'p-Wert',
    description: 'Was bedeutet der p-Wert und wie interpretiert man ihn richtig?',
    to: '/tests/p-wert',
    tags: ['Hypothesentest', 'Signifikanzniveau', 'Fehler 1. Art'],
  },
  {
    title: 'T-Test',
    description: 'Unterscheidet sich der Mittelwert signifikant von einem Referenzwert?',
    to: '/tests/t-test',
    tags: ['Ein-Stichproben', 't-Statistik', 'Freiheitsgrade'],
  },
  {
    title: 'F-Test',
    description: 'Sind die Varianzen zweier Stichproben signifikant verschieden?',
    to: '/tests/f-test',
    tags: ['Varianzvergleich', 'F-Verteilung', 'Zwei Stichproben'],
  },
  {
    title: 'Grubbs-Test',
    description: 'Gibt es einen statistisch signifikanten Ausreißer im Datensatz?',
    to: '/tests/grubbs',
    tags: ['Ausreißer', 'G-Statistik', 'Kritischer Wert'],
  },
  {
    title: 'VIF',
    description: 'Wie stark korrelieren die Prädiktoren untereinander (Multikollinearität)?',
    to: '/tests/vif',
    tags: ['Multikollinearität', 'Regression', 'Varianz-Inflation'],
  },
]
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Statistische Tests</h1>
    <p class="mb-8 text-text-secondary">
      Hypothesen prüfen, Ausreißer erkennen, Modellvoraussetzungen testen —
      jeder Test mit Formel, Erklärung und interaktivem Rechner.
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
