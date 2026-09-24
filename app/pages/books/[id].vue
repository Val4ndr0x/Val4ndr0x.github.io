<script setup lang="ts">
import { ALL_STICKER_OPTIONS, type StickerOption } from '~/utils/stickerOptions'
import type { BookTemplate } from '~/utils/bookTemplates'
import { PAGE_COLORS } from '~/composables/useBooks'
import BookPage from '~/components/BookPage.vue'

const route = useRoute()
const router = useRouter()
const { getBook, setBookFont, addPage, applyTemplate, deletePage, addSticker, setCover, setCoverImage, setPageColor, setPagePaper, setBookTexture } = useBooks()

const bookId = route.params.id as string
const book = getBook(bookId)

const pageIndex = ref(0)
const showPicker = ref(false)
const showCoverPicker = ref(false)
const showPageColor = ref(false)
const showPaper = ref(false)
const showTemplates = ref(false)
const bookPageRef = ref<InstanceType<typeof BookPage> | null>(null)

const MAX_INLINE_STICKERS = 4
const inlineStickerOptions = ALL_STICKER_OPTIONS.slice(0, MAX_INLINE_STICKERS)
const hasMoreStickerOptions = ALL_STICKER_OPTIONS.length > MAX_INLINE_STICKERS

watchEffect(() => {
  if (book.value === null) {
    router.replace('/books')
  }
})

const currentPage = computed(() => book.value?.pages[pageIndex.value] ?? null)
const totalPages = computed(() => book.value?.pages.length ?? 0)

function prevPage() {
  if (pageIndex.value > 0) pageIndex.value--
}
function nextPage() {
  if (book.value && pageIndex.value < book.value.pages.length - 1) pageIndex.value++
}

function onAddPage() {
  const idx = addPage(bookId)
  if (typeof idx === 'number') pageIndex.value = idx
}

function onDeletePage() {
  if (!currentPage.value || !book.value) return
  if (book.value.pages.length <= 1) return
  deletePage(bookId, currentPage.value.id)
  if (pageIndex.value >= book.value.pages.length) {
    pageIndex.value = book.value.pages.length - 1
  }
}

function onPickTemplate(template: BookTemplate, pageIdx?: number) {
  if (!currentPage.value) return
  const first = applyTemplate(bookId, template.id, pageIdx === undefined ? undefined : [pageIdx], currentPage.value.id)
  if (typeof first === 'number') pageIndex.value = first
  showTemplates.value = false
}

function onPick(type: any, data: Record<string, any>, opt?: StickerOption) {
  if (!currentPage.value) return
  const y = bookPageRef.value?.nextStickerY()
  if (opt?.free) {
    // Scrapbook: cae cerca del centro de lo que ya hay, con un pequeño desorden natural.
    const jitter = () => (Math.random() - 0.5) * 24
    const fy = Math.max(20, (y ?? 16) - 120 + Math.random() * 60)
    addSticker(bookId, currentPage.value.id, type, data, { x: 50 + jitter(), y: fy }, { free: true, rot: (opt.rot ?? 0) + (Math.random() - 0.5) * 6, scale: 1, z: 10 })
  } else {
    addSticker(bookId, currentPage.value.id, type, data, y !== undefined ? { x: 50, y } : undefined)
  }
  showPicker.value = false
}
</script>

<template>
  <div v-if="book" class="flex">
    <AppSidebar />

    <div class="flex-1 min-w-0 max-w-[720px] mx-auto w-full">
      <AppHeader :title="book.name" :title-font="book.font" show-back @back="router.push('/books')" />

      <div class="px-4 sm:px-6 pb-6 flex items-center gap-2 flex-wrap">
        <FontButton
          :model-value="book.font"
          title="Tipo de letra del título"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex-shrink-0 transition-colors"
          @update:model-value="(f: string) => setBookFont(book!.id, f)"
        />

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex items-center justify-center flex-shrink-0 transition-colors"
          title="Cambiar portada"
          @click="showCoverPicker = true"
        >
          <AppIcon name="palette" :size="16" />
        </button>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden"
          title="Color de esta página"
          @click="showPageColor = true"
        >
          <span class="w-5 h-5 rounded-full border-2 border-current" :style="{ backgroundColor: currentPage?.color }" />
        </button>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex items-center justify-center flex-shrink-0 transition-colors"
          title="Papel de la página"
          @click="showPaper = true"
        >
          <AppIcon name="paper" :size="16" />
        </button>

        <button
          type="button"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex items-center justify-center flex-shrink-0 transition-colors"
          title="Plantillas de páginas"
          @click="showTemplates = true"
        >
          <AppIcon name="template" :size="16" />
        </button>

        <button
          v-for="(opt, i) in inlineStickerOptions"
          :key="i"
          type="button"
          class="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent hover:text-white text-accent-deep flex items-center justify-center flex-shrink-0 transition-colors"
          :title="opt.label"
          @click="onPick(opt.type, opt.data)"
        >
          <img v-if="opt.image" :src="opt.image" :alt="opt.label" class="w-5 h-5 object-contain" />
          <AppIcon v-else :name="opt.icon!" :size="16" />
        </button>

        <button
          v-if="hasMoreStickerOptions"
          type="button"
          class="w-9 h-9 rounded-full bg-surface text-ink flex items-center justify-center flex-shrink-0"
          title="Ver más stickers"
          @click="showPicker = true"
        >
          <AppIcon name="arrow-left" :size="16" class="rotate-180" />
        </button>

        <button
          v-if="totalPages > 1"
          type="button"
          class="px-3 py-1.5 rounded-full bg-surface text-danger text-sm ml-auto"
          @click="onDeletePage"
        >
          Eliminar página
        </button>
      </div>

      <div class="px-4 sm:px-6">
        <BookPage v-if="currentPage" ref="bookPageRef" :page="currentPage" :book-id="bookId" />
      </div>

      <div class="flex items-center justify-center gap-4 py-6">
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-ink disabled:opacity-30"
          :disabled="pageIndex === 0"
          @click="prevPage"
        >
          <AppIcon name="arrow-left" :size="16" />
        </button>
        <span class="text-sm text-muted">{{ pageIndex + 1 }} / {{ totalPages }}</span>
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-ink disabled:opacity-30"
          :disabled="pageIndex === totalPages - 1"
          @click="nextPage"
        >
          <AppIcon name="arrow-left" :size="16" class="rotate-180" />
        </button>
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center"
          title="Nueva página"
          @click="onAddPage"
        >
          <AppIcon name="plus" :size="16" />
        </button>
      </div>
    </div>

    <StickerPicker v-if="showPicker" @close="showPicker = false" @pick="onPick" />

    <ColorPickerPopover
      v-if="showPageColor && currentPage"
      title="Color de la página"
      :model-value="currentPage.color"
      :presets="PAGE_COLORS"
      @update:model-value="(c) => setPageColor(bookId, currentPage!.id, c)"
      @close="showPageColor = false"
    />

    <BookTemplatePicker
      v-if="showTemplates"
      all-label="Usar todas las páginas"
      @pick-page="(t, i) => onPickTemplate(t, i)"
      @pick-all="(t) => onPickTemplate(t)"
      @close="showTemplates = false"
    />

    <PagePaperPicker
      v-if="showPaper && currentPage"
      :model-value="currentPage.paper"
      @pick="(p) => { setPagePaper(bookId, currentPage!.id, p.id, p.color); showPaper = false }"
      @close="showPaper = false"
    />

    <CoverPickerPopover
      v-if="showCoverPicker"
      :model-value="book.cover"
      :plain-color="book.color"
      :image="book.coverImage"
      :texture="book.texture"
      :clasp="book.clasp"
      @set-texture="(t, c) => setBookTexture(bookId, t, c)"
      @update:model-value="(c) => setCover(bookId, c)"
      @set-image="(img) => setCoverImage(bookId, img)"
      @close="showCoverPicker = false"
    />
  </div>
</template>
