<script setup lang="ts">
import { getNoteStyle, noteStyleCss, noteTapeCss } from '~/utils/noteStyles'

const props = defineProps<{ data: Record<string, any>; stickerId?: string }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const title = computed({
  get: () => props.data.title ?? '',
  set: (v: string) => emit('update', { title: v }),
})
const value = computed({
  get: () => props.data.value ?? '',
  set: (v: string) => emit('update', { value: v }),
})

// Pequeña inclinación fija por sticker (según su id, no aleatoria en cada render)
// para que la nota se vea pegada "a mano", como una nota adhesiva real.
function tiltFor(seed: string | undefined) {
  if (!seed) return -1.5
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return ((Math.abs(hash) % 500) / 100) - 2.5 // rango aprox. [-2.5, 2.5] grados
}

const noteColor = computed(() => props.data.color || '#fdeec9')
const noteStyle = computed(() => getNoteStyle(props.data.style))
const bgStyle = computed(() => noteStyleCss(noteStyle.value))
const tapeStyle = computed(() => noteTapeCss(noteStyle.value))
const showStylePicker = ref(false)

const tilt = computed(() => tiltFor(props.stickerId))
const isTransparent = computed(() => props.data.color === 'transparent')

// Stickers decorativos en las esquinas de la nota (data.corners = { tl, tr, bl, br } -> ruta de imagen).
type Corner = 'tl' | 'tr' | 'bl' | 'br'
const CORNERS: { id: Corner; pos: string; label: string }[] = [
  { id: 'tl', pos: 'top-3.5 left-2', label: 'arriba a la izquierda' },
  { id: 'tr', pos: 'top-3.5 right-2', label: 'arriba a la derecha' },
  { id: 'bl', pos: 'bottom-2 left-2', label: 'abajo a la izquierda' },
  { id: 'br', pos: 'bottom-2 right-2', label: 'abajo a la derecha' },
]

const corners = computed<Partial<Record<Corner, string>>>(() => props.data.corners ?? {})
const galleryCorner = ref<Corner | null>(null)

function setCorner(image: string) {
  if (!galleryCorner.value) return
  emit('update', { corners: { ...corners.value, [galleryCorner.value]: image } })
  galleryCorner.value = null
}
</script>

<template>
  <div class="relative pt-2.5 px-1 group/note" :style="{ transform: `rotate(${tilt}deg)` }">
    <span
      v-if="!isTransparent"
      class="absolute -top-1 left-1/2 -translate-x-1/2 -rotate-2 w-14 h-5 rounded-[2px] bg-white/50 border border-white/60 shadow-sm pointer-events-none"
      :style="tapeStyle"
    />

    <div
      class="sticky-note relative w-full p-3.5 sm:p-4 group flex flex-col"
      :class="{ 'sticky-note--transparent': isTransparent }"
      :style="{ backgroundColor: noteColor, ...bgStyle }"
    >
      <button
        type="button"
        class="absolute top-1.5 right-8 z-[2] w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Fondo de la nota"
        @click="showStylePicker = true"
      >
        <span class="text-sm leading-none">▦</span>
      </button>
      <button
        type="button"
        class="absolute top-1.5 right-1.5 z-[2] w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="emit('remove')"
      >
        <AppIcon name="x" :size="14" />
      </button>
      <input
        v-model="title"
        type="text"
        placeholder="Título"
        class="text-sm font-semibold text-black/70 mb-2 bg-transparent outline-none"
      />
      <textarea
        v-model="value"
        rows="3"
        placeholder="Escribe aquí..."
        class="flex-1 bg-transparent outline-none text-sm text-black/70 placeholder-black/35 resize-none"
      />
      <span v-if="!isTransparent" class="sticky-note-fold" />
    </div>

    <template v-for="c in CORNERS" :key="c.id">
      <button
        v-if="corners[c.id]"
        type="button"
        class="absolute w-11 h-11 z-[1] hover:scale-105 transition-transform"
        :class="c.pos"
        :title="`Cambiar sticker ${c.label}`"
        @click="galleryCorner = c.id"
      >
        <img :src="corners[c.id]" alt="" class="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm" draggable="false" />
      </button>
      <button
        v-else
        type="button"
        class="absolute w-6 h-6 z-[1] rounded-full border border-dashed border-black/30 bg-white/70 text-black/40 text-sm leading-none flex items-center justify-center opacity-0 group-hover/note:opacity-100 focus:opacity-100 transition-opacity"
        :class="c.pos"
        :title="`Agregar sticker ${c.label}`"
        @click="galleryCorner = c.id"
      >
        +
      </button>
    </template>

    <Teleport to="body">
      <NoteStylePicker
        v-if="showStylePicker"
        :model-value="data.style"
        :color="noteColor"
        @pick="(id: string) => { emit('update', { style: id }); showStylePicker = false }"
        @close="showStylePicker = false"
      />
      <StickerGallery v-if="galleryCorner" allow-clear @close="galleryCorner = null" @pick="setCorner" @clear="setCorner('')" />
    </Teleport>
  </div>
</template>

<style scoped>
.sticky-note {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%);
  box-shadow: 3px 7px 12px rgba(80, 60, 20, 0.18), 0 1px 0 rgba(255, 255, 255, 0.4) inset;
}
.sticky-note--transparent {
  clip-path: none;
  box-shadow: none;
}
.sticky-note-fold {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.65) 45%, rgba(80, 60, 20, 0.2) 46%);
  pointer-events: none;
}
</style>
