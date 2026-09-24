export type ConfettiBurst = { id: string; x: number; y: number; emojis: string[]; count: number }

const SETS: Record<string, string[]> = {
  corazones: ['💗', '💖', '💕', '💘'],
  estrellas: ['⭐', '✨', '🌟', '💫'],
  petalos: ['🌸', '🌷', '🌺', '🌼'],
}

const bursts = ref<ConfettiBurst[]>([])

export function useConfetti() {
  /** Lanza confeti desde (x, y) en píxeles de la ventana. `kind` fuerza un tipo; si no, usa la preferencia del usuario. */
  function burst(x: number, y: number, kind?: string, count = 14) {
    if (!import.meta.client) return
    const pref = kind ?? useCuteTheme().confetti.value
    if (pref === 'ninguno') return
    const key = pref === 'aleatorio' ? (['corazones', 'estrellas', 'petalos'] as const)[Math.floor(Math.random() * 3)]! : pref
    bursts.value.push({ id: uuid(), x, y, emojis: SETS[key] ?? SETS.estrellas!, count })
  }

  function burstFromEl(el: Element | null | undefined, kind?: string, count?: number) {
    if (!import.meta.client) return
    const rect = el?.getBoundingClientRect()
    if (rect) burst(rect.left + rect.width / 2, rect.top + rect.height / 2, kind, count)
    else burst(window.innerWidth / 2, window.innerHeight / 3, kind, count)
  }

  /** Lluvia grande desde el centro superior (celebraciones). */
  function celebrate(kind?: string) {
    if (!import.meta.client) return
    const w = window.innerWidth
    burst(w * 0.25, window.innerHeight * 0.4, kind, 16)
    burst(w * 0.5, window.innerHeight * 0.3, kind, 20)
    burst(w * 0.75, window.innerHeight * 0.4, kind, 16)
  }

  function remove(id: string) {
    bursts.value = bursts.value.filter((b) => b.id !== id)
  }

  return { bursts, burst, burstFromEl, celebrate, remove }
}
