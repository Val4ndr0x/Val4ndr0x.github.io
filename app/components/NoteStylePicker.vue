<script setup lang="ts">
import { NOTE_STYLES, noteStyleCss, getNoteStyle } from '~/utils/noteStyles'

defineProps<{ modelValue: string | undefined; color: string }>()
const emit = defineEmits<{ pick: [id: string]; close: [] }>()
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[70]" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[85vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Fondo de la nota</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="overflow-y-auto grid grid-cols-3 gap-3">
        <button type="button" class="flex flex-col gap-1.5 items-center" @click="emit('pick', '')">
          <span
            class="flex items-center justify-center text-muted w-full aspect-[3/4] rounded-xl2 border-2 transition-transform hover:-translate-y-0.5"
            :class="!modelValue ? 'border-accent' : 'border-border'"
            :style="{ backgroundColor: color }"
          >
            Ø
          </span>
          <span class="text-[11px] font-medium text-ink">Liso</span>
        </button>
        <button v-for="s in NOTE_STYLES" :key="s.id" type="button" class="flex flex-col gap-1.5 items-center" @click="emit('pick', s.id)">
          <span
            class="block w-full aspect-[3/4] rounded-xl2 border-2 transition-transform hover:-translate-y-0.5"
            :class="modelValue === s.id ? 'border-accent' : 'border-border'"
            :style="{ backgroundColor: color, ...noteStyleCss(getNoteStyle(s.id)) }"
          />
          <span class="text-[11px] font-medium text-ink">{{ s.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
