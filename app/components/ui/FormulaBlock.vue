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
  <div
    class="my-4 overflow-x-auto rounded-lg bg-surface-800 px-6 py-4"
    v-html="html"
  />
</template>
