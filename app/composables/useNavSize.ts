const STORAGE_KEY = 'todo-nav-icon-size-v1'

export const NAV_ICON_MIN = 18
export const NAV_ICON_MAX = 40
export const NAV_ICON_DEFAULT = 28

const iconSize = ref(NAV_ICON_DEFAULT)
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(n) && n >= NAV_ICON_MIN && n <= NAV_ICON_MAX) iconSize.value = n
  } catch {
    // ignore corrupted/blocked storage
  }
}

/** Tamaño (px) de los iconos de la barra de navegación (lateral y móvil), ajustable por el usuario. */
export function useNavSize() {
  load()

  function setIconSize(value: number) {
    iconSize.value = Math.min(NAV_ICON_MAX, Math.max(NAV_ICON_MIN, Math.round(value)))
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, String(iconSize.value))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }

  return { iconSize, setIconSize }
}
