<script setup lang="ts">
defineProps<{
  title: string
  modelValue: string
  presets: string[]
  allowTransparent?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [color: string]; close: [] }>()
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[70]" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[90vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="overflow-y-auto">
        <ColorPickerPanel
          :model-value="modelValue"
          :presets="presets"
          :allow-transparent="allowTransparent"
          @update:model-value="(c) => emit('update:modelValue', c)"
        />
      </div>

      <button
        type="button"
        class="w-full py-2.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent-deep transition-colors"
        @click="emit('close')"
      >
        Listo
      </button>
    </div>
  </div>
</template>
