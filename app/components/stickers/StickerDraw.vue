<script setup lang="ts">
type Stroke = { d: string; color: string; width: number }

const props = defineProps<{ data: Record<string, any>; stickerId?: string }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const MARKER_COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#d97706', '#db2777', '#7c3aed']
const BG_COLORS = ['#fffdf7', '#fdeec9', '#eef0d9', '#dbe7f5', '#e6dbf0', '#f3e3d3']
const THIN_WIDTH = 4
const THICK_WIDTH = 9

const svgRef = ref<SVGSVGElement | null>(null)
const strokes = computed<Stroke[]>(() => props.data.strokes ?? [])
const color = computed(() => props.data.color ?? MARKER_COLORS[0])
const thick = computed(() => props.data.thick ?? true)
const strokeWidth = computed(() => (thick.value ? THICK_WIDTH : THIN_WIDTH))
// Fondo del lienzo (no la tinta): separado de "color" para no mezclar el color del plumón
// con si la hoja de dibujo se ve o no. Así se puede escribir directo sobre el papel de la página.
const transparentBg = computed(() => !!props.data.transparentBg)
const bgColor = computed(() => props.data.bgColor ?? BG_COLORS[0])
const showBgPicker = ref(false)

function setColor(c: string) {
  emit('update', { color: c })
}
function toggleThickness() {
  emit('update', { thick: !thick.value })
}
function toggleBg() {
  emit('update', { transparentBg: !transparentBg.value })
  showBgPicker.value = false
}
function setBgColor(c: string) {
  emit('update', { bgColor: c, transparentBg: false })
  showBgPicker.value = false
}
function undo() {
  emit('update', { strokes: strokes.value.slice(0, -1) })
}
function clearAll() {
  emit('update', { strokes: [] })
}

/** Convierte coordenadas de pantalla a las del viewBox del SVG, sin importar rotación/escala del sticker. */
function toSvgPoint(e: PointerEvent): { x: number; y: number } | null {
  const svg = svgRef.value
  if (!svg) return null
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

/** Promedia cada punto con sus vecinos para quitar el temblor del pulso/touch antes de suavizar. */
function movingAverage(points: { x: number; y: number }[], windowSize = 3): { x: number; y: number }[] {
  if (points.length < 3) return points
  const half = Math.floor(windowSize / 2)
  return points.map((_, i) => {
    let sx = 0
    let sy = 0
    let n = 0
    for (let j = Math.max(0, i - half); j <= Math.min(points.length - 1, i + half); j++) {
      sx += points[j]!.x
      sy += points[j]!.y
      n++
    }
    return { x: sx / n, y: sy / n }
  })
}

/** Convierte una polilínea en una curva Catmull-Rom (vía beziers cúbicas): pasa por todos los
 *  puntos con tangentes continuas, así el trazo se ve como una línea fluida y no como quiebres. */
function catmullRomToBezierPath(points: { x: number; y: number }[]): string {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y} L ${points[0]!.x} ${points[0]!.y}`
  if (points.length === 2) return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
}

/** Suaviza puntos crudos del puntero para que el trazo se vea como escritura prolija y no como saltos angulosos. */
function smoothPath(points: { x: number; y: number }[]): string {
  return catmullRomToBezierPath(movingAverage(points))
}

/** Distancia perpendicular de un punto a la recta a-b. */
function pointLineDistance(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  const projX = a.x + t * dx
  const projY = a.y + t * dy
  return Math.hypot(p.x - projX, p.y - projY)
}

/** Si el trazo es casi una línea recta (poca desviación respecto a la cuerda inicio-fin), la endereza. */
function detectStraightLine(points: { x: number; y: number }[]): { x1: number; y1: number; x2: number; y2: number } | null {
  const a = points[0]!
  const b = points[points.length - 1]!
  const chord = Math.hypot(b.x - a.x, b.y - a.y)
  if (chord < 12) return null
  let maxDev = 0
  for (const p of points) {
    const dev = pointLineDistance(p, a, b)
    if (dev > maxDev) maxDev = dev
  }
  if (maxDev / chord < 0.045) return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  return null
}

/** Si el trazo es un lazo cerrado con radio ~constante respecto a su elipse envolvente
 *  (ej. una "O" torcida), lo reemplaza por un óvalo/círculo perfecto. */
function detectEllipse(points: { x: number; y: number }[]): { cx: number; cy: number; rx: number; ry: number } | null {
  if (points.length < 8) return null
  const a = points[0]!
  const b = points[points.length - 1]!
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const w = maxX - minX
  const h = maxY - minY
  if (w < 14 || h < 14) return null
  const diag = Math.hypot(w, h)
  if (Math.hypot(b.x - a.x, b.y - a.y) > diag * 0.3) return null // el trazo no llegó a cerrarse

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const rx = w / 2
  const ry = h / 2
  let sum = 0
  let sumSq = 0
  for (const p of points) {
    const nx = (p.x - cx) / rx
    const ny = (p.y - cy) / ry
    const r = Math.hypot(nx, ny)
    sum += r
    sumSq += r * r
  }
  const n = points.length
  const mean = sum / n
  const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean))
  if (Math.abs(mean - 1) < 0.22 && std < 0.16) return { cx, cy, rx, ry }
  return null
}

/** Path SVG de una elipse perfecta (4 curvas cúbicas), centrada en (cx, cy). */
function ellipsePathD(cx: number, cy: number, rx: number, ry: number): string {
  const k = 0.5522847498
  const ox = rx * k
  const oy = ry * k
  return [
    `M ${cx - rx} ${cy}`,
    `C ${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry}`,
    `C ${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy}`,
    `C ${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry}`,
    `C ${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy}`,
    'Z',
  ].join(' ')
}

/** Decide la forma final de un trazo terminado: recta, óvalo/círculo, o curva suavizada normal. */
function finalizePath(points: { x: number; y: number }[]): string {
  const line = detectStraightLine(points)
  if (line) return `M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`
  const ellipse = detectEllipse(points)
  if (ellipse) return ellipsePathD(ellipse.cx, ellipse.cy, ellipse.rx, ellipse.ry)
  return smoothPath(points)
}

const drawing = ref(false)
const livePoints = ref<{ x: number; y: number }[]>([])
const livePath = computed(() => smoothPath(livePoints.value))

function onPointerDown(e: PointerEvent) {
  const p = toSvgPoint(e)
  if (!p) return
  drawing.value = true
  livePoints.value = [p]
  ;(e.target as SVGSVGElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!drawing.value) return
  const p = toSvgPoint(e)
  if (!p) return
  const last = livePoints.value[livePoints.value.length - 1]
  // Filtra puntos casi idénticos: menos ruido para suavizar y menos tamaño de trazo guardado.
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return
  livePoints.value.push(p)
}

function endStroke() {
  if (!drawing.value) return
  drawing.value = false
  if (livePoints.value.length > 1) {
    const stroke: Stroke = { d: finalizePath(livePoints.value), color: color.value, width: strokeWidth.value }
    emit('update', { strokes: [...strokes.value, stroke] })
  }
  livePoints.value = []
}
</script>

<template>
  <div class="draw-sticker relative w-full group flex flex-col gap-1.5">
    <div class="flex items-center gap-1.5 flex-wrap">
      <button
        v-for="c in MARKER_COLORS"
        :key="c"
        type="button"
        class="w-5 h-5 rounded-full border-2 shrink-0"
        :class="color === c ? 'border-black/50 scale-110' : 'border-white/70'"
        :style="{ backgroundColor: c }"
        :aria-label="`Color ${c}`"
        @click="setColor(c)"
      />
      <button
        type="button"
        class="ml-1 px-2 h-6 rounded-full text-[11px] font-semibold bg-black/5 hover:bg-black/10 text-black/60 shrink-0"
        :title="thick ? 'Trazo grueso (plumón)' : 'Trazo fino'"
        @click="toggleThickness"
      >
        {{ thick ? '●' : '·' }} {{ thick ? 'Grueso' : 'Fino' }}
      </button>
      <button
        type="button"
        class="w-6 h-6 rounded-full border-2 shrink-0 checker-bg"
        :class="transparentBg ? 'border-black/50 scale-110' : 'border-white/70'"
        title="Fondo del lienzo transparente (escribir sobre el papel de la página)"
        @click="toggleBg"
      />
      <div class="relative shrink-0">
        <button
          type="button"
          class="w-6 h-6 rounded-full border-2"
          :class="!transparentBg ? 'border-black/50 scale-110' : 'border-white/70'"
          :style="{ backgroundColor: bgColor }"
          title="Color de fondo del lienzo"
          @click.stop="showBgPicker = !showBgPicker"
        />
        <div v-if="showBgPicker" class="absolute top-7 left-0 z-10 flex items-center gap-1 p-1.5 rounded-full bg-white shadow border border-border" @pointerdown.stop>
          <button
            v-for="c in BG_COLORS"
            :key="c"
            type="button"
            class="w-5 h-5 rounded-full border-2 shrink-0"
            :class="!transparentBg && bgColor === c ? 'border-black/50 scale-110' : 'border-white/70'"
            :style="{ backgroundColor: c }"
            :aria-label="`Fondo ${c}`"
            @click="setBgColor(c)"
          />
        </div>
      </div>
      <button
        type="button"
        class="px-2 h-6 rounded-full text-[11px] font-semibold bg-black/5 hover:bg-black/10 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Deshacer último trazo"
        :disabled="!strokes.length"
        @click="undo"
      >
        ↩ Deshacer
      </button>
      <button
        type="button"
        class="px-2 h-6 rounded-full text-[11px] font-semibold bg-black/5 hover:bg-black/10 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        title="Borrar todo"
        :disabled="!strokes.length"
        @click="clearAll"
      >
        🗑 Borrar
      </button>
      <button
        type="button"
        class="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        @click="emit('remove')"
      >
        <AppIcon name="x" :size="14" />
      </button>
    </div>

    <div
      class="relative w-full aspect-[3/2] rounded-xl2 border border-black/10 overflow-hidden touch-none"
      :class="transparentBg ? '' : 'shadow-inner'"
      :style="transparentBg ? {} : { backgroundColor: bgColor }"
    >
      <svg
        ref="svgRef"
        class="absolute inset-0 w-full h-full"
        viewBox="0 0 300 200"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endStroke"
        @pointercancel="endStroke"
        @pointerleave="endStroke"
      >
        <path
          v-for="(s, i) in strokes"
          :key="i"
          :d="s.d"
          fill="none"
          :stroke="s.color"
          :stroke-width="s.width"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path v-if="drawing" :d="livePath" fill="none" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p v-if="!strokes.length && !drawing" class="absolute inset-0 flex items-center justify-center text-xs text-black/25 pointer-events-none px-4 text-center">
        ✏️ Escribí o dibujá acá con el plumón
      </p>
    </div>
  </div>
</template>

<style scoped>
.checker-bg {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
}
</style>
