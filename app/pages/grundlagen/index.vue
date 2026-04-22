<script setup lang="ts">
definePageMeta({ title: 'Grundlagen' })

const topics = [
  {
    title: 'Lagemaße',
    description: 'Mittelwert, Median und Modus — wo liegt das Zentrum der Daten?',
    to: '/grundlagen/lagemasse',
    tags: ['Mittelwert', 'Median', 'Modus', 'Outlier-Effekt'],
  },
  {
    title: 'Streuungsmaße',
    description: 'Wie weit streuen die Werte? Standardabweichung, Varianz und IQR.',
    to: '/grundlagen/streuung',
    tags: ['Standardabweichung', 'Varianz', 'IQR', 'Spannweite'],
  },
  {
    title: 'Verteilungen',
    description: 'Normalverteilung, Schiefe und wie Daten sich verteilen.',
    to: '/grundlagen/verteilungen',
    tags: ['Normalverteilung', 'Histogramm', 'μ & σ Slider'],
  },
  {
    title: 'Korrelation',
    description: 'Zusammenhänge messen — von perfekter Korrelation bis kein Zusammenhang.',
    to: '/grundlagen/korrelation',
    tags: ['Pearson r', 'Streudiagramm', 'Correlation Slider'],
  },
]
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-2 text-3xl font-bold">Grundlagen der Statistik</h1>
    <p class="mb-8 text-text-secondary">
      Die Bausteine der deskriptiven Statistik — von Lagemaßen bis zur Korrelation.
      Jedes Thema enthält interaktive Tools zum Experimentieren.
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
