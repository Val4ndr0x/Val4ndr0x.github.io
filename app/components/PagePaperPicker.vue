<script setup lang="ts">
import { PAGE_PAPERS, type PagePaper } from '~/utils/pagePapers'

defineProps<{ modelValue: string | undefined }>()
const emit = defineEmits<{ pick: [paper: PagePaper]; close: [] }>()

function preview(p: PagePaper) {
  return {
    backgroundColor: p.color ?? '#fbfaf7',
    ...(p.css !== 'none' ? { backgroundImage: p.css, ...(p.size ? { backgroundSize: p.size } : {}) } : {}),
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[70]" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[85vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Papel de la página</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="overflow-y-auto grid grid-cols-3 gap-3">
        <button
          v-for="p in PAGE_PAPERS"
          :key="p.id"
          type="button"
          class="flex flex-col gap-1.5 items-center"
          @click="emit('pick', p)"
        >
          <span
            class="block w-full aspect-[3/4] rounded-xl2 border-2 transition-transform hover:-translate-y-0.5"
            :class="(modelValue ?? 'liso') === p.id ? 'border-accent' : 'border-border'"
            :style="preview(p)"
          />
          <span class="text-[11px] font-medium text-ink">{{ p.label }}</span>
        </button>
      </div>
      <p class="text-[11px] text-muted">Algunos papeles (galaxia, bosque, vintage…) también cambian el color de la hoja.</p>
    </div>
  </div>
</template>
