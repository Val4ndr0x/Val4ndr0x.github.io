import { hexToRgb, isHex, mixHex } from '~/utils/color'

export type CuteTheme = { id: string; label: string; emoji: string; bg: string | null; accent: string | null }

export const CUTE_THEMES: CuteTheme[] = [
  { id: 'clasico', label: 'Clásico', emoji: '🌙', bg: null, accent: null },
  { id: 'matcha', label: 'Matcha', emoji: '🍵', bg: '#dcebd2', accent: '#7fae6a' },
  { id: 'fresa', label: 'Fresa con crema', emoji: '🍓', bg: '#fde3e8', accent: '#f0708f' },
  { id: 'lavanda', label: 'Lavanda', emoji: '💜', bg: '#e6def5', accent: '#a888e0' },
  { id: 'sakura', label: 'Sakura', emoji: '🌸', bg: '#fdecef', accent: '#e58aa8' },
  { id: 'algodon', label: 'Cielo de algodón', emoji: '☁️', bg: '#dcecf8', accent: '#6fb1e0' },
  { id: 'noche', label: 'Noche estrellada', emoji: '🌌', bg: '#1a1d3a', accent: '#f5c76a' },
]

export const AMBIENT_FX = [
  { id: 'none', label: 'Ninguno', emoji: '🚫' },
  { id: 'petalos', label: 'Pétalos', emoji: '🌸' },
  { id: 'nubes', label: 'Nubes', emoji: '☁️' },
  { id: 'luciernagas', label: 'Luciérnagas', emoji: '✨' },
  { id: 'lluvia', label: 'Lluvia tranquila', emoji: '🌧️' },
  { id: 'estrellas', label: 'Estrellas', emoji: '⭐' },
] as const

export type AmbientFxId = (typeof AMBIENT_FX)[number]['id']

export const CURSORS = [
  { id: 'default', label: 'Normal', emoji: '🖱️' },
  { id: 'huella', label: 'Huellita', emoji: '🐾' },
  { id: 'estrella', label: 'Estrellita', emoji: '⭐' },
  { id: 'corazon', label: 'Corazón', emoji: '💗' },
  { id: 'flor', label: 'Florecita', emoji: '🌸' },
] as const

export type CursorId = (typeof CURSORS)[number]['id']

export const CONFETTI_KINDS = [
  { id: 'aleatorio', label: 'Sorpresa', emoji: '🎉' },
  { id: 'corazones', label: 'Corazones', emoji: '💖' },
  { id: 'estrellas', label: 'Estrellas', emoji: '✨' },
  { id: 'petalos', label: 'Pétalos', emoji: '🌸' },
  { id: 'ninguno', label: 'Sin confeti', emoji: '🚫' },
] as const

export type ConfettiKind = (typeof CONFETTI_KINDS)[number]['id']

type CuteData = { theme: string; auto: boolean; fx: AmbientFxId; cursor: CursorId; confetti: ConfettiKind }

const STORAGE_KEY = 'todo-cute-v1'

const themeId = ref('clasico')
const auto = ref(false)
const fx = ref<AmbientFxId>('none')
const cursor = ref<CursorId>('default')
const confetti = ref<ConfettiKind>('aleatorio')
/** Hora actual (se refresca desde el plugin) para que el tema automático reaccione. */
const hour = ref(new Date().getHours())
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const d = JSON.parse(raw) as Partial<CuteData>
    if (typeof d.theme === 'string') themeId.value = d.theme
    auto.value = !!d.auto
    if (AMBIENT_FX.some((f) => f.id === d.fx)) fx.value = d.fx as AmbientFxId
    if (CURSORS.some((c) => c.id === d.cursor)) cursor.value = d.cursor as CursorId
    if (CONFETTI_KINDS.some((c) => c.id === d.confetti)) confetti.value = d.confetti as ConfettiKind
  } catch {
    // ignore corrupted storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    const data: CuteData = { theme: themeId.value, auto: auto.value, fx: fx.value, cursor: cursor.value, confetti: confetti.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore write failures
  }
}

/** Amanecer → fresa, tarde → matcha, noche → noche estrellada. */
function themeForHour(h: number) {
  if (h >= 5 && h < 12) return 'fresa'
  if (h >= 12 && h < 19) return 'matcha'
  return 'noche'
}

function cursorImage(emoji: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text x='2' y='25' font-size='24'>${emoji}</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 6 6, auto`
}

export function useCuteTheme() {
  load()
  const { setBgColor } = useAppTheme()
  const { seasonThemes } = useRewards()

  const themes = computed<CuteTheme[]>(() => [...CUTE_THEMES, ...seasonThemes.value.map((t) => ({ ...t }))])
  const activeThemeId = computed(() => (auto.value ? themeForHour(hour.value) : themeId.value))
  const activeTheme = computed(() => themes.value.find((t) => t.id === activeThemeId.value) ?? CUTE_THEMES[0]!)

  function applyAccent() {
    if (!import.meta.client) return
    const root = document.documentElement
    const accent = activeTheme.value.accent
    const vars = ['--c-accent', '--c-accent-soft', '--c-accent-deep']
    if (!accent || !isHex(accent)) {
      for (const v of vars) root.style.removeProperty(v)
      return
    }
    const ch = (hex: string) => {
      const { r, g, b } = hexToRgb(hex)
      return `${r} ${g} ${b}`
    }
    root.style.setProperty('--c-accent', ch(accent))
    root.style.setProperty('--c-accent-soft', ch(mixHex(accent, '#ffffff', 0.45)))
    root.style.setProperty('--c-accent-deep', ch(mixHex(accent, '#000000', 0.25)))
  }

  function applyCursor() {
    if (!import.meta.client) return
    const root = document.documentElement
    const opt = CURSORS.find((c) => c.id === cursor.value)
    if (!opt || opt.id === 'default') {
      root.classList.remove('cute-cursor')
      root.style.removeProperty('--cute-cursor')
      return
    }
    root.style.setProperty('--cute-cursor', cursorImage(opt.emoji))
    root.classList.add('cute-cursor')
  }

  /** `explicit`: el usuario eligió el tema (el clásico entonces también repone el fondo). */
  function applyTheme(explicit = false) {
    const t = activeTheme.value
    if (t.bg) setBgColor(t.bg)
    else if (explicit) setBgColor(null)
    applyAccent()
  }

  function init() {
    applyTheme(false)
    applyCursor()
  }

  function selectTheme(id: string) {
    themeId.value = id
    auto.value = false
    persist()
    applyTheme(true)
  }

  function setAuto(value: boolean) {
    auto.value = value
    persist()
    applyTheme(true)
  }

  function refreshHour() {
    const h = new Date().getHours()
    if (h === hour.value) return
    hour.value = h
    if (auto.value) applyTheme(true)
  }

  function setFx(id: AmbientFxId) {
    fx.value = id
    persist()
  }

  function setCursor(id: CursorId) {
    cursor.value = id
    persist()
    applyCursor()
  }

  function setConfetti(id: ConfettiKind) {
    confetti.value = id
    persist()
  }

  return { themes, themeId, activeThemeId, auto, fx, cursor, confetti, init, selectTheme, setAuto, refreshHour, setFx, setCursor, setConfetti }
}
