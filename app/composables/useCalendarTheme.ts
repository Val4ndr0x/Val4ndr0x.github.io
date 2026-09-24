import { hsvToRgb, isHex, rgbToHex, rgbToHsv, hexToRgb, mixHex } from '~/utils/color'

export type CalendarTemplate = {
  id: string
  label: string
  colors: string[]
  animated?: boolean
  /** Un sticker (imagen de /public/stickers) por mes (enero → diciembre), para plantillas "cute". */
  stickers?: string[]
  /** Fuente decorativa para el nombre del mes (ya cargada globalmente vía Google Fonts). */
  font?: string
  /** Plantillas de fondo oscuro: usa texto claro en las cabeceras de mes. */
  dark?: boolean
}

export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/** Color pastel a partir de tono (0-360), saturación y brillo (0-1). */
function hsv(h: number, s = 0.32, v = 1): string {
  return rgbToHex(hsvToRgb(((h % 360) + 360) % 360, s, v))
}

const range12 = (fn: (i: number) => string) => Array.from({ length: 12 }, (_, i) => fn(i))

/** Plantillas al estilo de los efectos de un teclado RGB. `animated` = el patrón se desplaza en vivo. */
export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  { id: 'onda', label: 'Onda arcoíris', animated: true, colors: range12((i) => hsv(i * 30)) },
  { id: 'espectro', label: 'Ciclo de espectro', animated: true, colors: range12((i) => hsv(i * 30 + 15, 0.38)) },
  { id: 'respiracion', label: 'Respiración', colors: range12((i) => hsv(330, 0.1 + 0.32 * Math.abs(Math.sin((i / 12) * Math.PI)), 1)) },
  { id: 'alterno', label: 'Alternado (rojo / cian)', colors: range12((i) => (i % 2 ? hsv(185, 0.35) : hsv(355, 0.35))) },
  { id: 'rgb', label: 'Rojo · Verde · Azul', colors: range12((i) => hsv([0, 120, 240][i % 3]!, 0.4)) },
  { id: 'cascada', label: 'Cascada (magenta → cian)', colors: range12((i) => hsv(300 - (i / 11) * 120, 0.38)) },
  { id: 'fuego', label: 'Fuego', colors: range12((i) => hsv(5 + (i / 11) * 50, 0.42, 1)) },
  { id: 'aurora', label: 'Aurora', colors: range12((i) => hsv(120 + (i / 11) * 160, 0.35)) },

  // ── Plantillas cute ──────────────────────────────────────────────
  {
    id: 'amigos-del-ano',
    label: 'Amigos del año',
    font: "'Fredoka', sans-serif",
    colors: ['#dfeaf5', '#fde2ea', '#e8f3d9', '#f5e6f5', '#fdf1c9', '#dff3f5', '#fde7d3', '#d9ecf7', '#f6e3cc', '#ffe4c4', '#e9ddd0', '#dbe7f5'],
    stickers: ['adorable', 'forma-de-corazon', 'planta', 'conejo', 'linda', 'los-anteojos', 'rana', 'alejarse', 'gato', 'calabaza', 'cafe', 'gato(1)'].map((f) => `/stickers/${f}.png`),
  },
  {
    id: 'kawaii-dulces',
    label: 'Kawaii y dulces',
    font: "'Pacifico', cursive",
    colors: range12((i) => hsv(i * 30 + 10, 0.2, 1)),
    stickers: ['cafe(1)', 'torta', 'fruta', 'pina', 'kawaii', 'creatividad(2)', 'cafe(2)', 'creatividad(1)', 'enojado', 'leer', 'cafe', 'ser-creativo'].map((f) => `/stickers/${f}.png`),
  },
  {
    id: 'sakura',
    label: 'Sakura',
    font: "'Dancing Script', cursive",
    colors: range12((i) => hsv(340 - (i / 11) * 40, 0.22, 1)),
    stickers: ['chica(1)', 'forma-de-corazon', 'chica(2)', 'linda(1)', 'chica(4)', 'amor', 'muchacha', 'rubor', 'chica(3)', 'kawaii', 'chica(5)', 'paz'].map((f) => `/stickers/${f}.png`),
  },
  {
    id: 'cielo-algodon',
    label: 'Cielo de algodón',
    font: "'Patrick Hand', cursive",
    colors: range12((i) => hsv(200 + (i / 11) * 60, 0.2, 1)),
    stickers: ['gato(1)', 'conejo', 'alejarse', 'linda(1)', 'gato', 'creatividad(1)', 'cantar(2)', 'rana', 'creatividad(2)', 'adorable', 'leer', 'hola'].map((f) => `/stickers/${f}.png`),
  },
  {
    id: 'matcha-fresa',
    label: 'Matcha y fresa',
    font: "'Fredoka', sans-serif",
    colors: range12((i) => (i % 2 ? '#dcebd2' : '#fde3e8')),
    stickers: ['planta', 'torta', 'cafe', 'fruta', 'rana', 'pina', 'cafe(1)', 'torta', 'cafe(2)', 'planta', 'fruta', 'pina'].map((f) => `/stickers/${f}.png`),
  },
  {
    id: 'noche-estrellada',
    label: 'Noche estrellada',
    font: "'Fredoka', sans-serif",
    dark: true,
    colors: range12((i) => mixHex('#1a1d3a', '#3a2f5c', i / 11)),
    stickers: ['gato(1)', 'linda(1)', 'cantar', 'adorable', 'gato', 'kawaii', 'cantar(1)', 'alejarse', 'calabaza', 'creatividad', 'hola', 'gato(1)'].map((f) => `/stickers/${f}.png`),
  },
]

export const MONTH_COLOR_PRESETS = [
  '#f8c8d8', '#fbd5c0', '#fbe7b0', '#d8ecb8', '#bfe8cc', '#bfe6e2',
  '#c2e0f4', '#c9d3f5', '#dcc9f3', '#f1c8ec', '#f7c6c9', '#e3d6c8',
]

const STORAGE_KEY = 'todo-calendar-theme-v1'

const monthColors = ref<string[]>([...(CALENDAR_TEMPLATES[0]?.colors ?? [])])
const templateId = ref<string | null>(CALENDAR_TEMPLATES[0]?.id ?? null)
/** Desplazamiento de tono (grados) para las plantillas animadas. */
const hueShift = ref(0)
let loaded = false
let animTimer: ReturnType<typeof setInterval> | null = null

function shiftHue(hex: string, deg: number): string {
  if (!deg) return hex
  const { h, s, v } = rgbToHsv(hexToRgb(hex))
  return rgbToHex(hsvToRgb((h + deg) % 360, s, v))
}

function syncAnimation() {
  if (!import.meta.client) return
  const animated = CALENDAR_TEMPLATES.find((t) => t.id === templateId.value)?.animated
  if (animated && !animTimer) {
    animTimer = setInterval(() => { hueShift.value = (hueShift.value + 2) % 360 }, 120)
  } else if (!animated && animTimer) {
    clearInterval(animTimer)
    animTimer = null
    hueShift.value = 0
  }
}

/** Color propio de cada año (tono distinto por año, estable). */
export function colorForYear(year: number): string {
  return hsv(((year * 137.508) % 360), 0.5, 0.95)
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      syncAnimation()
      return
    }
    const data = JSON.parse(raw) as { monthColors?: unknown; templateId?: unknown }
    if (Array.isArray(data.monthColors) && data.monthColors.length === 12 && data.monthColors.every(isHex)) {
      monthColors.value = data.monthColors as string[]
      templateId.value = typeof data.templateId === 'string' ? data.templateId : null
    }
    syncAnimation()
  } catch {
    // ignore corrupted storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ monthColors: monthColors.value, templateId: templateId.value }))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useCalendarTheme() {
  load()

  function setMonthColor(month: number, color: string) {
    if (month < 0 || month > 11 || !isHex(color)) return
    const next = [...monthColors.value]
    next[month] = color
    monthColors.value = next
    templateId.value = null
    syncAnimation()
    persist()
  }

  function applyTemplate(id: string) {
    const template = CALENDAR_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    monthColors.value = [...template.colors]
    templateId.value = template.id
    syncAnimation()
    persist()
  }

  function colorForMonth(month: number) {
    return shiftHue(monthColors.value[month] ?? '#f8c8d8', hueShift.value)
  }

  /** Color de cada día: recorre los 12 colores de la plantilla día a día (empezando en el de su mes), como un efecto de teclado RGB. */
  function colorForDay(_year: number, month: number, day: number) {
    return colorForMonth((month + day - 1) % 12)
  }

  /** Plantilla activa completa (null si el usuario editó colores sueltos a mano). */
  const activeTemplate = computed(() => CALENDAR_TEMPLATES.find((t) => t.id === templateId.value) ?? null)

  /** Sticker (imagen) del mes según la plantilla activa, si define alguno. */
  function stickerForMonth(month: number) {
    return activeTemplate.value?.stickers?.[month] ?? null
  }


  return {
    monthColors,
    templateId,
    templates: CALENDAR_TEMPLATES,
    activeTemplate,
    setMonthColor,
    applyTemplate,
    colorForMonth,
    colorForYear,
    colorForDay,
    stickerForMonth,
  }
}
