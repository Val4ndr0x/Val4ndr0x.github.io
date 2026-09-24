<script setup lang="ts">
export type Filter = 'all' | 'active' | 'completed'

defineProps<{ modelValue: Filter }>()
const emit = defineEmits<{ 'update:modelValue': [value: Filter] }>()

const options: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
]
</script>

<template>
  <div class="relative z-10 flex gap-2 my-4">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="flex-1 py-2 rounded-full text-sm transition-colors backdrop-blur-sm"
      :class="modelValue === option.value
        ? 'bg-accent-soft text-accent-deep shadow-sm font-semibold border border-transparent'
        : 'bg-surface/80 text-muted hover:text-ink hover:bg-surface border border-transparent'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
