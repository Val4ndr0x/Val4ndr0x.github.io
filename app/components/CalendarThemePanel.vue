<script setup lang="ts">
import { MONTH_COLOR_PRESETS, MONTH_NAMES } from '~/composables/useCalendarTheme'

const emit = defineEmits<{ close: [] }>()
const { monthColors, templateId, templates, setMonthColor, applyTemplate } = useCalendarTheme()

const editingMonth = ref<number | null>(null)
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" @click.self="emit('close')">
    <div class="w-full sm:max-w-md bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[90vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Colores del calendario</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="overflow-y-auto flex flex-col gap-5">
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-0.5">Plantillas</h3>
          <div class="flex flex-col gap-2">
            <button
              v-for="t in templates"
              :key="t.id"
              type="button"
              class="flex items-center gap-3 rounded-xl2 border-2 p-2.5 text-left transition-colors"
              :class="templateId === t.id ? 'border-accent bg-surface-soft' : 'border-border hover:border-muted'"
              @click="applyTemplate(t.id)"
            >
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-ink mb-1.5" :style="{ fontFamily: t.font }">{{ t.label }}</span>
                <span class="flex h-3 rounded-full overflow-hidden">
                  <span v-for="(c, i) in t.colors" :key="i" class="flex-1" :style="{ backgroundColor: c }" />
                </span>
              </span>
              <span v-if="templateId === t.id" class="text-accent text-lg leading-none">✓</span>
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-0.5">Color de cada mes</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(name, m) in MONTH_NAMES"
              :key="m"
              type="button"
              class="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:border-accent transition-colors"
              @click="editingMonth = m"
            >
              <span class="w-5 h-5 rounded-full border border-black/10 shrink-0" :style="{ backgroundColor: monthColors[m] }" />
              <span class="text-xs text-ink truncate">{{ name }}</span>
            </button>
          </div>
        </div>
      </div>

      <button type="button" class="w-full py-2.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent-deep transition-colors" @click="emit('close')">
        Listo
      </button>
    </div>

    <ColorPickerPopover
      v-if="editingMonth !== null"
      :title="`Color de ${MONTH_NAMES[editingMonth]}`"
      :model-value="monthColors[editingMonth] ?? '#f8c8d8'"
      :presets="MONTH_COLOR_PRESETS"
      @update:model-value="(c) => setMonthColor(editingMonth!, c)"
      @close="editingMonth = null"
    />
  </div>
</template>
