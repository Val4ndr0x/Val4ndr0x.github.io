<script setup lang="ts">
import type { BookPage, Sticker } from '~/composables/useBooks'
import StickerTitle from '~/components/stickers/StickerTitle.vue'
import StickerBanner from '~/components/stickers/StickerBanner.vue'
import StickerDate from '~/components/stickers/StickerDate.vue'
import StickerMood from '~/components/stickers/StickerMood.vue'
import StickerTodo from '~/components/stickers/StickerTodo.vue'
import StickerChecklist from '~/components/stickers/StickerChecklist.vue'
import StickerNote from '~/components/stickers/StickerNote.vue'
import StickerSleep from '~/components/stickers/StickerSleep.vue'
import StickerStars from '~/components/stickers/StickerStars.vue'
import StickerImage from '~/components/stickers/StickerImage.vue'
import StickerWashi from '~/components/stickers/StickerWashi.vue'
import StickerPolaroid from '~/components/stickers/StickerPolaroid.vue'
import StickerClip from '~/components/stickers/StickerClip.vue'
import StickerPin from '~/components/stickers/StickerPin.vue'
import StickerStamp from '~/components/stickers/StickerStamp.vue'
import StickerEmoji from '~/components/stickers/StickerEmoji.vue'
import StickerWeather from '~/components/stickers/StickerWeather.vue'
import StickerWater from '~/components/stickers/StickerWater.vue'
import StickerGratitude from '~/components/stickers/StickerGratitude.vue'
import StickerHabits from '~/components/stickers/StickerHabits.vue'
import StickerDraw from '~/components/stickers/StickerDraw.vue'
import StickerLanguage from '~/components/stickers/StickerLanguage.vue'
import StickerVocab from '~/components/stickers/StickerVocab.vue'

import { isLightColor, isHex } from '~/utils/color'
import { STICKER_COLOR_PRESETS } from '~/utils/stickerOptions'
import { getPagePaper } from '~/utils/pagePapers'
import type { StickerType } from '~/composables/useBooks'

const props = defineProps<{ page: BookPage; bookId: string }>()
const { moveSticker, updateSticker, removeSticker, setStickerLayout, bringToFront } = useBooks()

const componentMap = {
  title: StickerTitle,
  banner: StickerBanner,
  date: StickerDate,
  mood: StickerMood,
  todo: StickerTodo,
  checklist: StickerChecklist,
  note: StickerNote,
  sleep: StickerSleep,
  stars: StickerStars,
  image: StickerImage,
  washi: StickerWashi,
  polaroid: StickerPolaroid,
  clip: StickerClip,
  pin: StickerPin,
  stamp: StickerStamp,
  emoji: StickerEmoji,
  weather: StickerWeather,
  water: StickerWater,
  gratitude: StickerGratitude,
  habits: StickerHabits,
  drawing: StickerDraw,
  language: StickerLanguage,
  vocab: StickerVocab,
} as const

// Stickers puramente decorativos: sin texto que editar, así que no muestran el botón de tipo de letra.
const DECORATIVE: StickerType[] = ['image', 'washi', 'polaroid', 'clip', 'pin', 'stamp', 'emoji', 'drawing']

// Ancho base (px) de cada tipo cuando flota libre en modo scrapbook.
const FREE_WIDTH: Partial<Record<StickerType, number>> = {
  washi: 170,
  clip: 34,
  pin: 34,
  stamp: 110,
  polaroid: 170,
  emoji: 90,
  image: 130,
  drawing: 280,
}
const FREE_WIDTH_DEFAULT = 240

const paperStyle = computed(() => {
  const paper = getPagePaper(props.page.paper)
  if (!paper) return {}
  return { backgroundImage: paper.css, ...(paper.size ? { backgroundSize: paper.size } : {}) }
})

const pageIsDark = computed(() => !isLightColor(props.page.color))
const colorStickerId = ref<string | null>(null)
const colorSticker = computed(() => props.page.stickers.find((s) => s.id === colorStickerId.value) ?? null)

function stickerIsDark(sticker: Sticker) {
  return isHex(sticker.data.color) && !isLightColor(sticker.data.color)
}

const canvasRef = ref<HTMLElement | null>(null)
const draggingId = ref<string | null>(null)
const resizingId = ref<string | null>(null)
const livePositions = reactive<Record<string, { x: number; y: number }>>({})
const liveScale = reactive<Record<string, number>>({})
const stickerHeights = reactive<Record<string, number>>({})

let dragState: { stickerId: string; startClientX: number; startClientY: number; startX: number; startY: number } | null = null
let resizeState: { stickerId: string; startClientX: number; startScale: number; baseWidth: number } | null = null

const resizeObserver = import.meta.client
  ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.stickerId
        if (id) stickerHeights[id] = entry.contentRect.height
      }
    })
  : null

const stickerEls = new Map<string, HTMLElement>()

function registerStickerEl(el: Element | null, id: string) {
  const prev = stickerEls.get(id)
  if (prev && prev !== el) {
    resizeObserver?.unobserve(prev)
    stickerEls.delete(id)
  }
  if (el instanceof HTMLElement) {
    el.dataset.stickerId = id
    resizeObserver?.observe(el)
    stickerEls.set(id, el)
  }
}

onBeforeUnmount(() => resizeObserver?.disconnect())

function snapX(pct: number) {
  return STICKER_SNAP_X.reduce((closest, p) => (Math.abs(p - pct) < Math.abs(closest - pct) ? p : closest))
}
function snapY(px: number) {
  return Math.max(0, Math.round(px / STICKER_ROW_UNIT) * STICKER_ROW_UNIT)
}

function anchorTransform(x: number) {
  if (x <= 0) return 'translate(0, 0)'
  if (x >= 100) return 'translate(-100%, 0)'
  return 'translate(-50%, 0)'
}

// Estilo del sticker mientras se está arrastrando: sigue al puntero libremente.
function draggingStyle(sticker: Sticker) {
  const pos = livePositions[sticker.id] ?? sticker
  if (sticker.free) return freeStyle(sticker)
  return {
    left: `${pos.x}%`,
    top: `${pos.y}px`,
    transform: anchorTransform(pos.x),
  }
}

function boxFor(sticker: Sticker) {
  const pos = livePositions[sticker.id] ?? sticker
  const height = stickerHeights[sticker.id] ?? 150
  return { top: pos.y, bottom: pos.y + height, x: pos.x }
}

function boxesOverlap(a: { top: number; bottom: number }, b: { top: number; bottom: number }) {
  return a.top < b.bottom && b.top < a.bottom
}

// A diferencia de boxesOverlap (cualquier roce cuenta, usado para agrupar filas ya
// existentes), esta exige que la superposición cubra al menos la mitad de la caja más
// chica. Se usa para decidir si soltar un sticker debe unirlo a una fila: con el
// espaciado normal entre stickers (unos pocos px de margen) un roce mínimo no debería
// juntarlos, o cualquier drag terminaría encadenando todos los stickers en una sola fila.
function boxesOverlapSignificantly(a: { top: number; bottom: number }, b: { top: number; bottom: number }) {
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  const minHeight = Math.min(a.bottom - a.top, b.bottom - b.top)
  return minHeight > 0 && overlap > minHeight * 0.5
}

// Máximo de stickers que pueden compartir una fila (columnas). Una fila llena nunca
// acepta un tercero, ni al soltar un sticker (ver onDragEnd) ni al agrupar para pintar.
const MAX_ROW_STICKERS = 2

// Agrupa los stickers de la página en "filas": stickers cuyo rango vertical se superpone
// comparten fila, hasta un máximo de MAX_ROW_STICKERS. Una fila con un solo sticker ocupa
// todo el ancho; con dos, se reparten el ancho en columnas de igual proporción.
const rowGroups = computed(() => {
  const groups: { sticker: Sticker; box: ReturnType<typeof boxFor> }[][] = []
  for (const sticker of props.page.stickers) {
    if (sticker.free) continue
    const item = { sticker, box: boxFor(sticker) }
    const group = groups.find((g) => g.length < MAX_ROW_STICKERS && g.some((other) => boxesOverlap(other.box, item.box)))
    if (group) group.push(item)
    else groups.push([item])
  }
  return groups
})

const ROW_GAP = 8

// Estilo de un sticker en modo scrapbook: flota libre, rotado y escalado.
function freeStyle(sticker: Sticker) {
  const pos = livePositions[sticker.id] ?? sticker
  const scale = liveScale[sticker.id] ?? sticker.scale ?? 1
  return {
    left: `${pos.x}%`,
    top: `${pos.y}px`,
    width: `${FREE_WIDTH[sticker.type] ?? FREE_WIDTH_DEFAULT}px`,
    transform: `translate(-50%, 0) rotate(${sticker.rot ?? 0}deg) scale(${scale})`,
    transformOrigin: '50% 0',
    zIndex: draggingId.value === sticker.id || resizingId.value === sticker.id ? 60 : (sticker.z ?? 10),
  }
}

function stickerStyle(sticker: Sticker) {
  if (sticker.free) return freeStyle(sticker)
  return draggingId.value === sticker.id ? draggingStyle(sticker) : settledStyle(sticker)
}

function stickerClass(sticker: Sticker) {
  return [
    sticker.free ? (draggingId.value === sticker.id ? 'shadow-xl cursor-grabbing' : '') : draggingId.value === sticker.id ? 'w-[80%] sm:w-[46%] z-30 shadow-xl cursor-grabbing' : 'z-0',
    stickerIsDark(sticker) ? 'sticker-dark' : '',
  ]
}

function toggleFree(sticker: Sticker) {
  if (sticker.free) {
    // Vuelve a la grilla: cae en su propia fila, justo debajo del contenido.
    setStickerLayout(props.bookId, props.page.id, sticker.id, { free: false, rot: 0, scale: 1, x: 50, y: nextStickerY() })
  } else {
    const wrap = canvasRef.value
    const w = wrap?.getBoundingClientRect().width ?? 600
    const base = FREE_WIDTH[sticker.type] ?? FREE_WIDTH_DEFAULT
    // Se queda cerca de donde estaba, centrado en su columna actual.
    const x = Math.max(base / 2 / w * 100, Math.min(100 - base / 2 / w * 100, sticker.x))
    setStickerLayout(props.bookId, props.page.id, sticker.id, { free: true, x, y: sticker.y, rot: sticker.rot ?? 0, scale: sticker.scale ?? 1 })
    bringToFront(props.bookId, props.page.id, sticker.id)
  }
}

function nudge(sticker: Sticker, patch: { rot?: number; scale?: number }) {
  setStickerLayout(props.bookId, props.page.id, sticker.id, {
    rot: ((sticker.rot ?? 0) + (patch.rot ?? 0)) % 360,
    scale: (sticker.scale ?? 1) + (patch.scale ?? 0),
  })
}

// Estilo del sticker cuando está asentado en la grilla (no se está arrastrando).
function settledStyle(sticker: Sticker) {
  const pos = livePositions[sticker.id] ?? sticker
  const group = rowGroups.value.find((g) => g.some((item) => item.sticker.id === sticker.id))
  if (!group || group.length === 1) {
    return { left: '0%', top: `${pos.y}px`, width: '100%', transform: 'translate(0, 0)' }
  }
  const sorted = [...group].sort((a, b) => a.box.x - b.box.x)
  const n = sorted.length
  const idx = sorted.findIndex((item) => item.sticker.id === sticker.id)
  const width = (100 - ROW_GAP * (n - 1)) / n
  const left = idx * (width + ROW_GAP)
  return { left: `${left}%`, top: `${pos.y}px`, width: `${width}%`, transform: 'translate(0, 0)' }
}

// Punto más bajo ocupado por algún sticker (según su alto real ya renderizado).
const contentBottom = computed(() => {
  let max = 0
  for (const sticker of props.page.stickers) {
    const pos = livePositions[sticker.id] ?? sticker
    const h = (stickerHeights[sticker.id] ?? 150) * (sticker.free ? (sticker.scale ?? 1) : 1)
    max = Math.max(max, pos.y + h)
  }
  return max
})

const canvasHeight = computed(() => (props.page.stickers.length ? contentBottom.value + 32 : 0))

const NEW_STICKER_GAP = 16

// Posición para un sticker que se agrega con el selector (no arrastrado): se coloca
// justo debajo del contenido real ya en la página, usando los altos ya medidos, en
// vez de asumir un alto fijo por sticker (eso dejaba huecos enormes o encimaba
// stickers cuando el alto real no coincidía con lo asumido).
function nextStickerY() {
  return props.page.stickers.length ? contentBottom.value + NEW_STICKER_GAP : 16
}

defineExpose({ nextStickerY })

function onDragStart(e: PointerEvent, sticker: Sticker) {
  e.preventDefault()
  e.stopPropagation()
  dragState = {
    stickerId: sticker.id,
    startClientX: e.clientX,
    startClientY: e.clientY,
    startX: sticker.x,
    startY: sticker.y,
  }
  draggingId.value = sticker.id
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
}

function onDragMove(e: PointerEvent) {
  if (!dragState || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const dx = e.clientX - dragState.startClientX
  const dy = e.clientY - dragState.startClientY
  const xPct = dragState.startX + (dx / rect.width) * 100
  const y = dragState.startY + dy
  livePositions[dragState.stickerId] = {
    x: Math.max(0, Math.min(100, xPct)),
    y: Math.max(0, y),
  }
}

function onDragEnd() {
  if (dragState) {
    const stickerId = dragState.stickerId
    const live = livePositions[stickerId]
    const dragged = props.page.stickers.find((s) => s.id === stickerId)
    if (live && dragged?.free) {
      // Scrapbook: se queda exactamente donde se suelta.
      moveSticker(props.bookId, props.page.id, stickerId, Math.round(live.x * 10) / 10, Math.round(live.y))
      delete livePositions[stickerId]
    } else if (live) {
      const snappedX = snapX(live.x)
      const snappedY = snapY(live.y)
      const height = stickerHeights[stickerId] ?? 150
      const droppedBox = { top: snappedY, bottom: snappedY + height }

      // Stickers cuyo rango vertical se superpone de forma significativa con donde se soltó éste
      // (no cualquier roce, para no encadenar todos los stickers en una sola fila sin querer).
      const mates = props.page.stickers.filter((s) => {
        if (s.id === stickerId || s.free) return false
        const mateHeight = stickerHeights[s.id] ?? 150
        return boxesOverlapSignificantly(droppedBox, { top: s.y, bottom: s.y + mateHeight })
      })

      if (!mates.length || mates.length >= MAX_ROW_STICKERS) {
        // Fila vacía, o ya llena (máximo dos columnas): el sticker cae en su propia fila.
        moveSticker(props.bookId, props.page.id, stickerId, 50, snappedY)
      } else {
        // Se juntó con otro(s) sticker(s): se alinean en la misma fila y se reparten
        // el ancho en columnas de igual proporción.
        const group = [...mates.map((s) => ({ id: s.id, x: s.x })), { id: stickerId, x: snappedX }]
        const sorted = [...group].sort((a, b) => a.x - b.x)
        const n = sorted.length
        sorted.forEach((item, idx) => {
          const x = Math.round(((idx + 0.5) / n) * 100)
          moveSticker(props.bookId, props.page.id, item.id, x, snappedY)
        })
      }
      delete livePositions[stickerId]
    }
  }
  dragState = null
  draggingId.value = null
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
}

// Redimensionar arrastrando la manija de la esquina (modo scrapbook), al estilo Canva:
// se agranda/achica en vivo mientras se arrastra, sin tener que tocar botones de +/-.
function onResizeStart(e: PointerEvent, sticker: Sticker) {
  e.preventDefault()
  e.stopPropagation()
  resizeState = {
    stickerId: sticker.id,
    startClientX: e.clientX,
    startScale: sticker.scale ?? 1,
    baseWidth: FREE_WIDTH[sticker.type] ?? FREE_WIDTH_DEFAULT,
  }
  liveScale[sticker.id] = resizeState.startScale
  resizingId.value = sticker.id
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd)
}

function onResizeMove(e: PointerEvent) {
  if (!resizeState) return
  const dx = e.clientX - resizeState.startClientX
  const scale = resizeState.startScale + dx / resizeState.baseWidth
  liveScale[resizeState.stickerId] = Math.max(0.5, Math.min(2.5, scale))
}

function onResizeEnd() {
  if (resizeState) {
    const scale = liveScale[resizeState.stickerId] ?? resizeState.startScale
    setStickerLayout(props.bookId, props.page.id, resizeState.stickerId, { scale })
    delete liveScale[resizeState.stickerId]
  }
  resizeState = null
  resizingId.value = null
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', onResizeEnd)
}
</script>

<template>
  <div
    class="relative rounded-xl2 shadow-md min-h-[70vh] p-4 sm:p-6 pl-9 sm:pl-10 ml-4 transition-colors"
    :style="{ backgroundColor: page.color, ...paperStyle, ...(page.stickers.length ? { minHeight: `${Math.max(canvasHeight, 300)}px` } : {}) }"
  >
    <div class="absolute -left-4 top-4 bottom-4 flex flex-col justify-between pointer-events-none">
      <svg v-for="n in 14" :key="n" width="24" height="22" viewBox="0 0 26 24" fill="none" class="rotate-90">
        <ellipse cx="12" cy="6" rx="6" ry="5" fill="none" :stroke="pageIsDark ? '#8f8f99' : '#a39a8c'" stroke-width="3.5" />
        <path d="M6 8v11a2 2 0 0 0 2 2h1" :stroke="pageIsDark ? '#8f8f99' : '#a39a8c'" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </svg>
    </div>

    <!--
      Los stickers son position:absolute con left/width en %, así que su "containing
      block" es el padding-box de este wrapper. Si estuvieran directamente dentro del
      contenedor con el padding de la hoja, ese padding no les generaría margen (se
      posicionarían pegados al borde real, ignorándolo). Este wrapper interno, en
      cambio, no tiene padding propio: es un hijo normal del contenedor, así que ya
      queda insertado dentro del padding de la hoja, y los stickers heredan ese margen.
    -->
    <div v-if="page.stickers.length" ref="canvasRef" class="relative">
      <div
        v-for="sticker in page.stickers"
        :key="sticker.id"
        :ref="(el) => registerStickerEl(el as Element | null, sticker.id)"
        class="absolute group/sticker"
        :class="stickerClass(sticker)"
        :style="stickerStyle(sticker)"
      >
        <button
          type="button"
          class="absolute -top-2.5 -left-2.5 z-10 w-7 h-7 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 cursor-grab active:cursor-grabbing opacity-0 group-hover/sticker:opacity-100 transition-opacity touch-none"
          title="Mover sticker"
          @pointerdown="onDragStart($event, sticker)"
        >
          <AppIcon name="move" :size="14" />
        </button>
        <button
          v-if="sticker.type !== 'drawing'"
          type="button"
          class="absolute -top-2.5 left-5 z-10 w-7 h-7 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover/sticker:opacity-100 focus:opacity-100 transition-opacity"
          title="Color del sticker"
          @click="colorStickerId = sticker.id"
        >
          <AppIcon name="palette" :size="14" />
        </button>
        <div
          v-if="!DECORATIVE.includes(sticker.type)"
          class="absolute -top-2.5 left-12 z-10 opacity-0 group-hover/sticker:opacity-100 focus-within:opacity-100 transition-opacity"
        >
          <FontButton
            :model-value="sticker.data.font"
            title="Tipo de letra"
            class="w-7 h-7 rounded-full bg-white shadow border border-border text-black/40"
            @update:model-value="(f: string) => updateSticker(bookId, page.id, sticker.id, { font: f })"
          />
        </div>
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 flex items-center gap-1 rounded-full bg-white shadow border border-border px-1.5 py-0.5 text-black/55 text-xs opacity-0 group-hover/sticker:opacity-100 focus-within:opacity-100 transition-opacity whitespace-nowrap">
          <button type="button" class="px-1.5 h-6 rounded-full hover:bg-black/5 font-semibold" :title="sticker.free ? 'Volver a la grilla' : 'Modo scrapbook: mover, rotar y apilar libremente'" @click="toggleFree(sticker)">
            {{ sticker.free ? '▦' : '✂️' }}
          </button>
          <template v-if="sticker.free">
            <button type="button" class="w-6 h-6 rounded-full hover:bg-black/5" title="Girar a la izquierda" @click="nudge(sticker, { rot: -15 })">↺</button>
            <button type="button" class="w-6 h-6 rounded-full hover:bg-black/5" title="Girar a la derecha" @click="nudge(sticker, { rot: 15 })">↻</button>
            <button type="button" class="w-6 h-6 rounded-full hover:bg-black/5" title="Más chico" @click="nudge(sticker, { scale: -0.15 })">−</button>
            <button type="button" class="w-6 h-6 rounded-full hover:bg-black/5" title="Más grande" @click="nudge(sticker, { scale: 0.15 })">＋</button>
            <button type="button" class="w-6 h-6 rounded-full hover:bg-black/5" title="Traer al frente" @click="bringToFront(bookId, page.id, sticker.id)">⬆</button>
          </template>
        </div>
        <div
          v-if="sticker.free"
          class="absolute -bottom-2 -right-2 z-10 w-6 h-6 rounded-md bg-white shadow border-2 border-accent transition-opacity touch-none cursor-nwse-resize"
          :class="resizingId === sticker.id ? 'opacity-100' : 'opacity-0 group-hover/sticker:opacity-100'"
          title="Arrastrá para cambiar el tamaño"
          @pointerdown="onResizeStart($event, sticker)"
        />
        <component
          :is="componentMap[sticker.type]"
          :style="{ fontFamily: fontFamilyFor(sticker.data.font) }"
          :data="sticker.data"
          :sticker-id="sticker.id"
          @update="(d) => updateSticker(bookId, page.id, sticker.id, d)"
          @remove="removeSticker(bookId, page.id, sticker.id)"
        />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <AppIcon name="sticker" :size="48" :class="pageIsDark ? 'text-white/20' : 'text-black/15'" />
      <p class="text-sm" :class="pageIsDark ? 'text-white/50' : 'text-black/40'">Esta página está en blanco.<br />Agrega stickers para llenarla.</p>
    </div>

    <ColorPickerPopover
      v-if="colorSticker"
      title="Color del sticker"
      :model-value="colorSticker.data.color || '#ffffff'"
      :presets="STICKER_COLOR_PRESETS"
      allow-transparent
      @update:model-value="(c) => updateSticker(bookId, page.id, colorSticker!.id, { color: c })"
      @close="colorStickerId = null"
    />
  </div>
</template>
