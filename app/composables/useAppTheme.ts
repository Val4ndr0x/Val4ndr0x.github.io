import { hexToRgb, isHex, isLightColor, mixHex } from '~/utils/color'

export const APP_BG_PRESETS: { id: string; label: string; color: string | null }[] = [
  { id: 'oscuro', label: 'Oscuro', color: null },
  { id: 'rosa', label: 'Rosa', color: '#f8e1ea' },
  { id: 'lavanda', label: 'Lavanda', color: '#e9e1f5' },
  { id: 'menta', label: 'Menta', color: '#dff1e6' },
  { id: 'cielo', label: 'Cielo', color: '#dfeaf7' },
  { id: 'durazno', label: 'Durazno', color: '#fbe8d9' },
  { id: 'limon', label: 'Limón', color: '#f7f3d2' },
  { id: 'lila-noche', label: 'Lila noche', color: '#2a2438' },
  { id: 'bosque', label: 'Bosque', color: '#1d2a26' },
  { id: 'marino', label: 'Marino', color: '#1b2536' },
]

const STORAGE_KEY = 'todo-app-bg-v1'
const VARS = ['--c-base', '--c-sidebar', '--c-surface', '--c-surface-soft', '--c-ink', '--c-muted', '--c-border']

/** null = tema oscuro original. */
const bgColor = ref<string | null>(null)
let loaded = false

function channels(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

function apply() {
  if (!import.meta.client) return
  const root = document.documentElement
  const color = bgColor.value
  if (!color) {
    for (const v of VARS) root.style.removeProperty(v)
    return
  }
  const light = isLightColor(color)
  const ink = light ? '#2b2830' : '#f5f5f7'
  const palette: Record<string, string> = {
    '--c-base': color,
    '--c-sidebar': light ? mixHex(color, '#ffffff', 0.35) : mixHex(color, '#000000', 0.25),
    '--c-surface': light ? mixHex(color, '#ffffff', 0.6) : mixHex(color, '#ffffff', 0.06),
    '--c-surface-soft': light ? mixHex(color, '#000000', 0.06) : mixHex(color, '#ffffff', 0.1),
    '--c-ink': ink,
    '--c-muted': mixHex(ink, color, 0.42),
    '--c-border': light ? mixHex(color, '#000000', 0.12) : mixHex(color, '#ffffff', 0.14),
  }
  for (const [name, hex] of Object.entries(palette)) root.style.setProperty(name, channels(hex))
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    bgColor.value = isHex(raw) ? raw : null
  } catch {
    bgColor.value = null
  }
  apply()
}

function persist() {
  if (!import.meta.client) return
  try {
    if (bgColor.value) localStorage.setItem(STORAGE_KEY, bgColor.value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useAppTheme() {
  load()

  function setBgColor(color: string | null) {
    bgColor.value = color
    apply()
    persist()
  }

  return { bgColor, setBgColor, presets: APP_BG_PRESETS }
}
