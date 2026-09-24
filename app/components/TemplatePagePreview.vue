<script setup lang="ts">
import BookPage from '~/components/BookPage.vue'
import type { BookPage as BookPageData } from '~/composables/useBooks'
import type { TemplatePage } from '~/utils/bookTemplates'

const props = defineProps<{ page: TemplatePage }>()

// La hoja se dibuja con el componente real a un ancho fijo y se reduce con transform
// para que la miniatura sea idéntica a lo que se va a crear.
const BASE_WIDTH = 560
const ASPECT = 4 / 3

const outer = ref<HTMLElement | null>(null)
const scale = ref(0.5)

let observer: ResizeObserver | null = null
onMounted(() => {
  if (!outer.value) return
  observer = new ResizeObserver(([entry]) => {
    if (entry) scale.value = entry.contentRect.width / BASE_WIDTH
  })
  observer.observe(outer.value)
})
onBeforeUnmount(() => observer?.disconnect())

// Datos de solo lectura: ids estables por instancia, sin tocar el estado del libro.
const preview = computed<BookPageData>(() => ({
  id: 'preview',
  color: props.page.color,
  paper: props.page.paper,
  stickers: props.page.stickers.map((s, i) => ({ ...s, id: `preview-${i}`, data: s.data })),
}))
</script>

<template>
  <div ref="outer" class="relative w-full overflow-hidden rounded-lg pointer-events-none select-none" :style="{ aspectRatio: `3 / 4`, backgroundColor: page.color }">
    <div class="absolute top-0 left-0 origin-top-left" :style="{ width: `${BASE_WIDTH}px`, transform: `scale(${scale})` }">
      <BookPage :page="preview" book-id="" :style="{ minHeight: `${BASE_WIDTH * ASPECT}px` }" />
    </div>
  </div>
</template>
