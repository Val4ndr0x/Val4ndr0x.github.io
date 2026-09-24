import { DECOR, type DecorSlot } from '~/utils/cafeDecor'
import { RECIPES, recipeProgress } from '~/utils/cafeRecipes'
import { CAFE_STYLES } from '~/utils/cafeStyles'
import type { Recipe } from '~/utils/cafeRecipes'

type CafeData = {
  owned: string[]
  placed: Partial<Record<DecorSlot, string>>
  /** null hasta la primera vez: así las recetas que ya estaban ganadas no se "celebran" de golpe. */
  seenRecipes: string[] | null
  rain: boolean
  ownedStyles?: string[]
  activeStyle?: string | null
}

const STORAGE_KEY = 'todo-cafe-v1'

const owned = ref<string[]>([])
const placed = ref<Partial<Record<DecorSlot, string>>>({})
/** Transitorio: piezas que solo se están probando (no compradas); no se guardan. */
const preview = ref<Partial<Record<DecorSlot, string>>>({})
const seenRecipes = ref<string[] | null>(null)
const rain = ref(false)
const ownedStyles = ref<string[]>([])
const activeStyle = ref<string | null>(null)
/** Transitorio: estilo que solo se está probando. */
const previewStyle = ref<string | null>(null)
/** Transitorio: último pedido servido, para el globo de diálogo del compañero en la escena. */
const flash = ref<string | null>(null)
let flashTimer: ReturnType<typeof setTimeout> | null = null
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<CafeData>
    if (Array.isArray(data.owned)) owned.value = data.owned.filter((x) => typeof x === 'string')
    if (data.placed && typeof data.placed === 'object') placed.value = data.placed
    if (Array.isArray(data.seenRecipes)) seenRecipes.value = data.seenRecipes.filter((x) => typeof x === 'string')
    rain.value = !!data.rain
    if (Array.isArray(data.ownedStyles)) ownedStyles.value = data.ownedStyles.filter((x) => typeof x === 'string')
    if (typeof data.activeStyle === 'string') activeStyle.value = data.activeStyle
  } catch {
    // ignore corrupted storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ owned: owned.value, placed: placed.value, seenRecipes: seenRecipes.value, rain: rain.value, ownedStyles: ownedStyles.value, activeStyle: activeStyle.value }),
    )
  } catch {
    // ignore write failures
  }
}

export function useCafe() {
  load()
  const { lists } = useLists()
  const companion = useCompanion()
  const { play } = useSound()

  // Partidas anteriores al contador de por vida: al menos las tareas ya completadas hoy.
  companion.raiseTotalCompleted(lists.value.reduce((n, l) => n + l.tasks.filter((t) => t.completed).length, 0))

  const stats = computed(() => ({
    tasks: companion.totalCompleted.value,
    streak: companion.longestStreak.value,
    level: companion.level.value,
  }))

  const recipes = computed(() => RECIPES.map((r) => ({ ...r, ...recipeProgress(r, stats.value) })))
  const unlockedRecipes = computed(() => recipes.value.filter((r) => r.unlocked))

  /** Devuelve las recetas recién desbloqueadas desde la última vez y las marca como vistas. */
  function checkUnlocks(): Recipe[] {
    const ids = unlockedRecipes.value.map((r) => r.id)
    if (seenRecipes.value === null) {
      seenRecipes.value = ids
      persist()
      return []
    }
    const seen = seenRecipes.value
    const fresh = unlockedRecipes.value.filter((r) => !seen.includes(r.id))
    if (fresh.length) {
      seenRecipes.value = [...seen, ...fresh.map((r) => r.id)]
      persist()
    }
    return fresh
  }

  /** Lo que se ve en la escena: lo puesto, más lo que se está probando. */
  const currentStyle = computed(() => CAFE_STYLES.find((x) => x.id === (previewStyle.value ?? activeStyle.value)) ?? null)
  const theme = computed(() => currentStyle.value?.theme ?? null)
  const shown = computed(() => ({ ...placed.value, ...(currentStyle.value?.items ?? {}), ...preview.value }))

  /** Prueba un estilo entero sin comprarlo (o deja de probarlo). */
  function previewStyleToggle(id: string) {
    previewStyle.value = previewStyle.value === id ? null : id
    play('pop')
  }

  function buyStyle(id: string) {
    const st = CAFE_STYLES.find((x) => x.id === id)
    if (!st || ownedStyles.value.includes(id)) return false
    if (!companion.spendPoints(st.cost)) return false
    ownedStyles.value = [...ownedStyles.value, id]
    activeStyle.value = id
    previewStyle.value = null
    persist()
    play('buy')
    return true
  }

  /** Pone un estilo que ya es tuyo (o vuelve a las piezas sueltas con null). */
  function setStyle(id: string | null) {
    if (id && !ownedStyles.value.includes(id)) return
    activeStyle.value = id
    previewStyle.value = null
    persist()
    play('pop')
  }

  /** Prueba una pieza sin comprarla (o deja de probarla si ya se estaba probando). */
  function previewDecor(id: string) {
    const item = DECOR.find((d) => d.id === id)
    if (!item) return
    const next = { ...preview.value }
    if (next[item.slot] === id) delete next[item.slot]
    else next[item.slot] = id
    preview.value = next
    play('pop')
  }

  function clearPreview() {
    preview.value = {}
    previewStyle.value = null
  }

  const cafeLevel = computed(() => 1 + Math.floor(owned.value.length / 2))

  function buyDecor(id: string) {
    const item = DECOR.find((d) => d.id === id)
    if (!item || owned.value.includes(id)) return false
    if (!companion.spendPoints(item.cost)) return false
    owned.value = [...owned.value, id]
    const { [item.slot]: _p, ...rest } = preview.value
    preview.value = rest
    placed.value = { ...placed.value, [item.slot]: id }
    persist()
    play('buy')
    return true
  }

  /** Coloca la pieza (si ya es tuya) o la quita si ya estaba puesta. */
  function toggleDecor(id: string) {
    const item = DECOR.find((d) => d.id === id)
    if (!item || !owned.value.includes(id)) return
    const next = { ...placed.value }
    if (next[item.slot] === id) delete next[item.slot]
    else next[item.slot] = id
    const { [item.slot]: _p, ...rest } = preview.value
    preview.value = rest
    placed.value = next
    persist()
    play('pop')
  }

  function toggleRain() {
    rain.value = !rain.value
    persist()
  }

  function announce(text: string) {
    flash.value = text
    if (flashTimer) clearTimeout(flashTimer)
    flashTimer = setTimeout(() => {
      flash.value = null
    }, 3500)
  }

  return {
    owned,
    placed,
    shown,
    theme,
    currentStyle,
    ownedStyles,
    activeStyle,
    previewStyle,
    previewStyleToggle,
    buyStyle,
    setStyle,
    preview,
    previewDecor,
    clearPreview,
    rain,
    flash,
    stats,
    recipes,
    unlockedRecipes,
    cafeLevel,
    checkUnlocks,
    buyDecor,
    toggleDecor,
    toggleRain,
    announce,
  }
}
