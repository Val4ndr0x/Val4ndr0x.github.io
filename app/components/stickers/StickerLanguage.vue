<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const MIN_COLS = 4
const MAX_COLS = 12
const MAX_ROWS = 12

const text = computed<string>(() => (typeof props.data.text === 'string' ? props.data.text : ''))
const date = computed<string>(() => (typeof props.data.date === 'string' ? props.data.date : ''))
const cols = computed(() => Math.min(MAX_COLS, Math.max(MIN_COLS, Number(props.data.cols) || 8)))
const rows = computed(() => Math.min(MAX_ROWS, Math.max(1, Number(props.data.rows) || 4)))
const trace = computed(() => props.data.trace !== false)

// Dibujo a mano dentro de cada casilla de práctica: los trazos de cada una viven en su propio
// viewBox 100×100, indexados por "fila-columna", y no pueden salirse de su casilla.
type Stroke = { d: string; color: string; width: number }
const INK_COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a']
const THIN_WIDTH = 3.5
const THICK_WIDTH = 6
const ink = computed<string>(() => props.data.ink ?? INK_COLORS[0]!)
const thick = computed(() => !!props.data.thick)
const cellStrokes = computed<Record<string, Stroke[]>>(() => props.data.cellStrokes ?? {})
const hasStrokes = computed(() => Object.values(cellStrokes.value).some((l) => l.length))
const lastKey = ref<string | null>(null)

// Un carácter por casilla (sin espacios). Array.from respeta hangul, kana y emojis.
const chars = computed(() => Array.from(text.value.replace(/\s+/g, '')))

// Si la frase es más larga que una fila, el modelo ocupa varias filas seguidas.
const modelRows = computed(() => Math.max(1, Math.ceil(chars.value.length / cols.value)))

type Cell = { char: string; kind: 'model' | 'trace' | 'blank' }

const grid = computed<Cell[][]>(() => {
  const out: Cell[][] = []
  const chunk = (r: number) => chars.value.slice(r * cols.value, (r + 1) * cols.value)
  for (let r = 0; r < modelRows.value + rows.value; r++) {
    const isModel = r < modelRows.value
    const source = chunk(isModel ? r : (r - modelRows.value) % modelRows.value)
    out.push(
      Array.from({ length: cols.value }, (_, c) => {
        const char = source[c] ?? ''
        if (!char) return { char: '', kind: 'blank' }
        return { char, kind: isModel ? 'model' : trace.value ? 'trace' : 'blank' }
      }),
    )
  }
  return out
})

const drawing = ref<{ key: string; el: SVGSVGElement } | null>(null)
const livePoints = ref<{ x: number; y: number }[]>([])

function smoothPath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return ''
  const f = (n: number) => Math.round(n * 10) / 10
  if (pts.length < 3) return `M ${f(pts[0]!.x)} ${f(pts[0]!.y)} L ${f(pts[pts.length - 1]!.x)} ${f(pts[pts.length - 1]!.y)}`
  let d = `M ${f(pts[0]!.x)} ${f(pts[0]!.y)}`
  // Curvas cuadráticas por los puntos medios: trazo fluido sin quiebres del pulso.
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i]!.x + pts[i + 1]!.x) / 2
    const my = (pts[i]!.y + pts[i + 1]!.y) / 2
    d += ` Q ${f(pts[i]!.x)} ${f(pts[i]!.y)} ${f(mx)} ${f(my)}`
  }
  const last = pts[pts.length - 1]!
  return `${d} L ${f(last.x)} ${f(last.y)}`
}
const livePath = computed(() => smoothPath(livePoints.value))

/** Coordenadas de pantalla → viewBox de la casilla, acotadas a sus bordes. */
function cellPoint(e: PointerEvent, el: SVGSVGElement) {
  const r = el.getBoundingClientRect()
  const clamp = (v: number) => Math.min(100, Math.max(0, v))
  return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) }
}
function onCellDown(e: PointerEvent, key: string) {
  const el = e.currentTarget as SVGSVGElement
  drawing.value = { key, el }
  livePoints.value = [cellPoint(e, el)]
  el.setPointerCapture(e.pointerId)
}
function onCellMove(e: PointerEvent) {
  if (!drawing.value) return
  const p = cellPoint(e, drawing.value.el)
  const last = livePoints.value[livePoints.value.length - 1]
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < 1) return
  livePoints.value.push(p)
}
function onCellUp() {
  const cur = drawing.value
  if (!cur) return
  drawing.value = null
  const pts = livePoints.value
  livePoints.value = []
  if (!pts.length) return
  // Un toque suelto deja un punto.
  const path = pts.length === 1 ? smoothPath([pts[0]!, { x: pts[0]!.x + 0.1, y: pts[0]!.y }]) : smoothPath(pts)
  const stroke: Stroke = { d: path, color: ink.value, width: thick.value ? THICK_WIDTH : THIN_WIDTH }
  lastKey.value = cur.key
  set({ cellStrokes: { ...cellStrokes.value, [cur.key]: [...(cellStrokes.value[cur.key] ?? []), stroke] } })
}
function undo() {
  const key = lastKey.value
  if (!key || !cellStrokes.value[key]?.length) return
  set({ cellStrokes: { ...cellStrokes.value, [key]: cellStrokes.value[key]!.slice(0, -1) } })
}
function clearDrawings() {
  lastKey.value = null
  set({ cellStrokes: {} })
}

function set(patch: Record<string, any>) {
  emit('update', patch)
}
function step(key: 'cols' | 'rows', delta: number) {
  const [min, max, cur] = key === 'cols' ? [MIN_COLS, MAX_COLS, cols.value] : [1, MAX_ROWS, rows.value]
  set({ [key]: Math.min(max, Math.max(min, cur + delta)) })
}
</script>

<template>
  <StickerFrame :color="data.color" fallback="#ffffff" @remove="emit('remove')">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-lg leading-none">✍️</span>
      <input
        :value="text"
        type="text"
        maxlength="60"
        placeholder="Frase a practicar: 안녕하세요, こんにちは, 你好…"
        class="flex-1 min-w-0 bg-transparent outline-none text-sm font-semibold text-black/75 placeholder-black/30 border-b border-dashed border-black/15 pb-0.5"
        @input="set({ text: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <label class="flex items-baseline gap-1.5 mb-2 text-[11px] font-semibold text-black/45">
      Fecha:
      <input
        :value="date"
        type="text"
        maxlength="20"
        class="flex-1 min-w-0 bg-transparent outline-none text-xs font-normal text-black/65 border-b border-dotted border-black/25"
        @input="set({ date: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="flex flex-col gap-1.5">
      <div v-for="(row, r) in grid" :key="r" class="grid gap-[3px]" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
        <div
          v-for="(cell, c) in row"
          :key="c"
          class="lang-cell relative aspect-square rounded-[3px] border border-black/25 flex items-center justify-center leading-none select-none overflow-hidden"
          :class="cell.kind === 'model' ? 'text-black/85 font-semibold' : 'text-black/20'"
          :style="{ fontSize: `clamp(14px, ${Math.round(400 / cols)}%, 32px)` }"
        >
          {{ cell.char }}
          <svg
            v-if="cell.kind !== 'model'"
            viewBox="0 0 100 100"
            class="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            @pointerdown.stop.prevent="onCellDown($event, `${r}-${c}`)"
            @pointermove="onCellMove"
            @pointerup="onCellUp"
            @pointercancel="onCellUp"
          >
            <path
              v-for="(s, i) in cellStrokes[`${r}-${c}`] ?? []"
              :key="i"
              :d="s.d"
              fill="none"
              :stroke="s.color"
              :stroke-width="s.width"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              v-if="drawing?.key === `${r}-${c}`"
              :d="livePath"
              fill="none"
              :stroke="ink"
              :stroke-width="thick ? THICK_WIDTH : THIN_WIDTH"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-black/50">
      ✏️
      <button
        v-for="c in INK_COLORS"
        :key="c"
        type="button"
        class="w-5 h-5 rounded-full border-2 shrink-0"
        :class="ink === c ? 'border-black/50 scale-110' : 'border-white/70'"
        :style="{ backgroundColor: c }"
        :aria-label="`Color ${c}`"
        @click="set({ ink: c })"
      />
      <button type="button" class="px-2 h-5 rounded-full bg-white/60 hover:bg-white" @click="set({ thick: !thick })">{{ thick ? 'Grueso' : 'Fino' }}</button>
      <button type="button" class="px-2 h-5 rounded-full bg-white/60 hover:bg-white disabled:opacity-40" :disabled="!lastKey || !cellStrokes[lastKey]?.length" @click="undo">↩ Deshacer</button>
      <button type="button" class="px-2 h-5 rounded-full bg-white/60 hover:bg-white disabled:opacity-40" :disabled="!hasStrokes" @click="clearDrawings">🗑 Borrar</button>
    </div>

    <div class="mt-2 flex items-center gap-2 flex-wrap text-[11px] font-semibold text-black/50">
      <span class="flex items-center gap-1">
        Filas
        <button type="button" class="w-5 h-5 rounded-full bg-white/60 hover:bg-white" aria-label="Menos filas" @click="step('rows', -1)">−</button>
        <span class="w-4 text-center">{{ rows }}</span>
        <button type="button" class="w-5 h-5 rounded-full bg-white/60 hover:bg-white" aria-label="Más filas" @click="step('rows', 1)">＋</button>
      </span>
      <span class="flex items-center gap-1">
        Casillas
        <button type="button" class="w-5 h-5 rounded-full bg-white/60 hover:bg-white" aria-label="Menos casillas" @click="step('cols', -1)">−</button>
        <span class="w-4 text-center">{{ cols }}</span>
        <button type="button" class="w-5 h-5 rounded-full bg-white/60 hover:bg-white" aria-label="Más casillas" @click="step('cols', 1)">＋</button>
      </span>
      <label class="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" class="accent-current" :checked="trace" @change="set({ trace: ($event.target as HTMLInputElement).checked })" />
        Calcar
      </label>
    </div>
  </StickerFrame>
</template>

<style scoped>
/* Cruz punteada al centro de cada casilla, como en los cuadernos de caligrafía. */
.lang-cell {
  background-image:
    repeating-linear-gradient(to right, rgba(0, 0, 0, 0.16) 0 3px, transparent 3px 6px),
    repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.16) 0 3px, transparent 3px 6px);
  background-size: 100% 1px, 1px 100%;
  background-position: center, center;
  background-repeat: no-repeat;
}
</style>
