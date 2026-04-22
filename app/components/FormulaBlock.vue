<script setup lang="ts">
import katex from 'katex'

const props = defineProps<{
  formula: string
  display?: boolean
}>()

const html = computed(() =>
  katex.renderToString(props.formula, {
    displayMode: props.display ?? true,
    throwOnError: false,
  }),
)
</script>

<template>
  <ClientOnly>
    <div
      class="my-4 overflow-x-auto rounded-lg border border-surface-700 bg-surface-900/50 px-6 py-4"
      v-html="html"
    />
    <template #fallback>
      <div class="my-4 h-12 animate-pulse rounded-lg bg-surface-800" />
    </template>
  </ClientOnly>
</template>
