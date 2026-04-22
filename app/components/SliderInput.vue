<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min: number
  max: number
  step?: number
  label: string
  unit?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between text-sm">
      <span class="text-text-secondary">{{ label }}</span>
      <span class="font-mono text-accent-400">{{ modelValue }}{{ unit ?? '' }}</span>
    </div>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step ?? 0.1"
      class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-600 accent-accent-500"
      @input="onInput"
    >
  </div>
</template>
