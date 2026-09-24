<script setup lang="ts">
import { BOOK_TEMPLATES, type BookTemplate } from '~/utils/bookTemplates'

const props = withDefaults(defineProps<{
  /** Permite usar una sola página de la plantilla (al crear un libro nuevo no aplica). */
  allowSinglePage?: boolean
  allLabel?: string
}>(), { allowSinglePage: true, allLabel: 'Usar este diario' })

const emit = defineEmits<{
  close: []
  'pick-page': [template: BookTemplate, pageIndex: number]
  'pick-all': [template: BookTemplate]
}>()

const selected = ref<BookTemplate | null>(null)
const pageIndex = ref(0)

// Las páginas se arman una vez por plantilla seleccionada (los ids internos solo importan al crear).
const pages = computed(() => selected.value?.build() ?? [])
const covers = BOOK_TEMPLATES.map((t) => ({ template: t, first: t.build()[0]! }))

function open(t: BookTemplate) {
  selected.value = t
  pageIndex.value = 0
}
function back() {
  selected.value = null
}
function prev() {
  if (pageIndex.value > 0) pageIndex.value--
}
function next() {
  if (pageIndex.value < pages.value.length - 1) pageIndex.value++
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[70]" @click.self="emit('close')">
    <div class="w-full sm:max-w-2xl bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-3 border border-border h-[90vh] sm:h-[85vh]">
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="selected"
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft"
          title="Volver a las plantillas"
          @click="back"
        >
          <AppIcon name="arrow-left" :size="18" />
        </button>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold text-ink truncate">{{ selected ? selected.label : 'Plantillas' }}</h2>
          <p v-if="!selected" class="text-xs text-muted">Elige un diseño de páginas para tu libro.</p>
          <p v-else class="text-xs text-muted truncate">{{ selected.blurb }}</p>
        </div>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <!-- Galería de plantillas -->
      <div v-if="!selected" class="flex-1 min-h-0 overflow-y-auto">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-1">
          <button
            v-for="c in covers"
            :key="c.template.id"
            type="button"
            class="flex flex-col gap-2 p-2.5 rounded-xl2 bg-surface-soft hover:bg-accent-soft transition-colors text-left"
            @click="open(c.template)"
          >
            <TemplatePagePreview :page="c.first" class="border border-border" />
            <span class="text-sm font-semibold text-ink leading-tight">{{ c.template.label }}</span>
            <span class="text-[11px] text-muted leading-tight -mt-1">{{ c.template.blurb }}</span>
          </button>
        </div>
      </div>

      <!-- Vista previa de las páginas de la plantilla -->
      <template v-else>
        <div class="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-4">
          <div class="w-full max-w-[280px]">
            <TemplatePagePreview :key="`${selected.id}-${pageIndex}`" :page="pages[pageIndex]!" class="border border-border shadow-md" />
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button type="button" class="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center text-ink disabled:opacity-30" :disabled="pageIndex === 0" @click="prev">
              <AppIcon name="arrow-left" :size="16" />
            </button>
            <span class="text-sm text-muted tabular-nums">{{ pageIndex + 1 }}/{{ pages.length }}</span>
            <button type="button" class="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center text-ink disabled:opacity-30" :disabled="pageIndex === pages.length - 1" @click="next">
              <AppIcon name="arrow-left" :size="16" class="rotate-180" />
            </button>
          </div>

          <div class="flex gap-2 shrink-0 pb-1">
            <button
              v-for="(p, i) in pages"
              :key="i"
              type="button"
              class="w-14 rounded-md border-2 overflow-hidden transition-transform hover:-translate-y-0.5"
              :class="pageIndex === i ? 'border-accent' : 'border-border'"
              @click="pageIndex = i"
            >
              <TemplatePagePreview :page="p" class="!rounded-none" />
            </button>
          </div>
        </div>

        <div class="flex gap-2 shrink-0">
          <button
            v-if="props.allowSinglePage"
            type="button"
            class="flex-1 px-4 py-2.5 rounded-full border border-border bg-surface text-ink font-semibold hover:bg-surface-soft"
            @click="emit('pick-page', selected, pageIndex)"
          >
            Usar esta página
          </button>
          <button type="button" class="flex-1 px-4 py-2.5 rounded-full bg-accent text-white font-semibold" @click="emit('pick-all', selected)">
            {{ props.allLabel }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
