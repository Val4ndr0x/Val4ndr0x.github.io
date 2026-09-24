import { toDateKey } from '~/utils/calendarDate'
import { CASITA_STYLES } from '~/utils/casitaStyles'
import {
  ACHIEVEMENTS,
  COLLECTIBLES,
  FRIENDS,
  FURNITURE,
  PASS_TIERS,
  SEASONS,
  findCollectible,
  seasonCollectibleId,
  seasonKey,
  type CasitaStats,
  type Collectible,
  type Friend,
  type FurnitureSlot,
} from '~/utils/casitaData'

type Counters = { early: number; night: number; focus: number; gratitude: number; capsules: number; letters: number }

type RewardsData = {
  unlocked: Record<string, number>
  seenFriends: string[]
  insignia: string | null
  collection: Record<string, number>
  lastChest: string | null
  chests: number
  claimed: string[]
  counters: Counters
  packsGiven: number
  room: Partial<Record<FurnitureSlot, string>>
  wallColor: string
  ownedStyles?: string[]
  activeStyle?: string | null
  floorColor: string
  seenStage: string | null
  welcome: boolean
  initialized: boolean
}

/** Dónde ver el premio: pestaña de /casita y, opcional, el elemento a señalar (data-hl). */
export type RewardTarget = { tab: 'casita' | 'logros' | 'cofre' | 'temporada'; hl?: string }

export type RewardToastItem = { id: string; emoji: string; title: string; text: string; target?: RewardTarget }

export type ChestPrize = { kind: 'coins' | 'xp' | 'sticker'; emoji: string; label: string; collectible?: Collectible; isNew?: boolean }

const STORAGE_KEY = 'todo-rewards-v1'

const unlocked = ref<Record<string, number>>({})
const seenFriends = ref<string[]>([])
const insignia = ref<string | null>(null)
const collection = ref<Record<string, number>>({})
const lastChest = ref<string | null>(null)
const chests = ref(0)
const claimed = ref<string[]>([])
const counters = ref<Counters>({ early: 0, night: 0, focus: 0, gratitude: 0, capsules: 0, letters: 0 })
const packsGiven = ref(0)
const room = ref<Partial<Record<FurnitureSlot, string>>>({ wall: 'cuadrito', shelf: 'osito', left: 'planta', right: 'sillon', floor: 'alfombra-rosa' })
const ownedStyles = ref<string[]>([])
const activeStyle = ref<string | null>(null)
const wallColor = ref('#fde2ea')
const floorColor = ref('#e8c9a6')
const seenStage = ref<string | null>(null)
const welcome = ref(false)
/** Falso hasta la primera revisión: ahí se registran en silencio las medallas y amigos que ya se merecía. */
const initialized = ref(false)
const toasts = ref<RewardToastItem[]>([])
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const d = JSON.parse(raw) as Partial<RewardsData>
    if (d.unlocked && typeof d.unlocked === 'object') unlocked.value = d.unlocked
    if (Array.isArray(d.seenFriends)) seenFriends.value = d.seenFriends.filter((x) => typeof x === 'string')
    insignia.value = typeof d.insignia === 'string' ? d.insignia : null
    if (d.collection && typeof d.collection === 'object') collection.value = d.collection
    lastChest.value = typeof d.lastChest === 'string' ? d.lastChest : null
    chests.value = typeof d.chests === 'number' ? d.chests : 0
    if (Array.isArray(d.claimed)) claimed.value = d.claimed.filter((x) => typeof x === 'string')
    if (d.counters) counters.value = { ...counters.value, ...d.counters }
    packsGiven.value = typeof d.packsGiven === 'number' ? d.packsGiven : 0
    if (d.room && typeof d.room === 'object') room.value = d.room
    if (Array.isArray(d.ownedStyles)) ownedStyles.value = d.ownedStyles.filter((x) => typeof x === 'string')
    if (typeof d.activeStyle === 'string') activeStyle.value = d.activeStyle
    if (typeof d.wallColor === 'string') wallColor.value = d.wallColor
    if (typeof d.floorColor === 'string') floorColor.value = d.floorColor
    seenStage.value = typeof d.seenStage === 'string' ? d.seenStage : null
    welcome.value = !!d.welcome
    initialized.value = !!d.initialized
  } catch {
    // ignore corrupted storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    const data: RewardsData = {
      unlocked: unlocked.value,
      seenFriends: seenFriends.value,
      insignia: insignia.value,
      collection: collection.value,
      lastChest: lastChest.value,
      chests: chests.value,
      claimed: claimed.value,
      counters: counters.value,
      packsGiven: packsGiven.value,
      room: room.value,
      wallColor: wallColor.value,
      ownedStyles: ownedStyles.value,
      activeStyle: activeStyle.value,
      floorColor: floorColor.value,
      seenStage: seenStage.value,
      welcome: welcome.value,
      initialized: initialized.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

function pushToast(emoji: string, title: string, text: string, target?: RewardTarget) {
  toasts.value.push({ id: uuid(), emoji, title, text, target })
}

function rollCollectible(): Collectible {
  const owned = collection.value
  const weights = { comun: 70, raro: 24, epico: 6 }
  // Prefiere lo que aún no tienes (para que el álbum avance), pero puede repetirse.
  const pool = Math.random() < 0.8 ? COLLECTIBLES.filter((x) => !owned[x.id]) : COLLECTIBLES
  const source = pool.length ? pool : COLLECTIBLES
  const total = source.reduce((acc, x) => acc + weights[x.rarity], 0)
  let r = Math.random() * total
  for (const x of source) {
    r -= weights[x.rarity]
    if (r <= 0) return x
  }
  return source[source.length - 1]!
}

export function useRewards() {
  load()
  const companion = useCompanion()
  const ledger = usePointsLedger()

  const stats = computed<CasitaStats>(() => {
    const base = {
      tasks: companion.totalCompleted.value,
      streak: companion.streak.value,
      longest: companion.longestStreak.value,
      level: companion.level.value,
      chests: chests.value,
      focus: counters.value.focus,
      gratitude: counters.value.gratitude,
      capsules: counters.value.capsules,
      letters: counters.value.letters,
      early: counters.value.early,
      night: counters.value.night,
      collection: Object.keys(collection.value).length,
      seasons: claimed.value.length,
    }
    const friendCount = friends.value.length
    return { ...base, friends: friendCount, achievements: Object.keys(unlocked.value).length }
  })

  // Los amigos solo dependen de los contadores base, así que se calculan aparte para no crear un ciclo.
  const friends = computed<(Friend & { visitor?: boolean })[]>(() => {
    const t = companion.totalCompleted.value
    const lvl = companion.level.value
    const lng = companion.longestStreak.value
    const val = (s: string) => (s === 'tasks' ? t : s === 'level' ? lvl : lng)
    const base = FRIENDS.filter((f) => val(f.stat) >= f.goal)
    const visitors = claimed.value
      .filter((k) => k.endsWith(':2'))
      .map((k) => {
        const key = k.split(':')[0]!
        const season = SEASONS[Number(key.split('-')[1]) - 1]
        if (!season) return null
        return { id: `visita-${key}`, label: season.friend.label, emoji: season.friend.emoji, stat: 'tasks', goal: 0, blurb: `Visitante de ${season.name}.`, visitor: true } as Friend & { visitor: boolean }
      })
      .filter((x): x is Friend & { visitor: boolean } => !!x)
    return [...base, ...visitors]
  })

  function checkAchievements() {
    const s = stats.value
    // Primera vez con este sistema: quien ya venía usando la app recibe lo que ya se ganó sin avalancha de avisos.
    const silent = !initialized.value
    initialized.value = true
    let any = silent
    const notify = (emoji: string, title: string, text: string, target?: RewardTarget) => {
      if (!silent) pushToast(emoji, title, text, target)
    }
    for (const a of ACHIEVEMENTS) {
      if (unlocked.value[a.id] || s[a.stat] < a.goal) continue
      unlocked.value = { ...unlocked.value, [a.id]: Date.now() }
      notify(a.emoji, 'Nueva medalla', a.label, { tab: 'logros', hl: `ach-${a.id}` })
      any = true
    }
    for (const f of friends.value) {
      if (seenFriends.value.includes(f.id)) continue
      seenFriends.value = [...seenFriends.value, f.id]
      notify(f.emoji ?? '🐾', 'Nuevo amigo', `${f.label} llegó a la casita`, { tab: 'casita', hl: `friend-${f.id}` })
      any = true
    }
    if (any) {
      persist()
      if (!silent) useSound().play('sparkle', 0.15)
      // Una medalla nueva puede desbloquear otra (p. ej. "Casita llena").
      if (Object.keys(unlocked.value).length !== s.achievements) checkAchievements()
    }
  }

  function bump(key: keyof Counters, by = 1) {
    counters.value = { ...counters.value, [key]: counters.value[key] + by }
    persist()
    checkAchievements()
  }

  function grantCollectible(id?: string): { item: Collectible; isNew: boolean } {
    const item = (id ? findCollectible(id) : null) ?? rollCollectible()
    const isNew = !collection.value[item.id]
    collection.value = { ...collection.value, [item.id]: (collection.value[item.id] ?? 0) + 1 }
    persist()
    return { item, isNew }
  }

  /** Se llama cuando se completa una tarea: cuenta madrugadas/noches, regala stickers y revisa medallas. */
  function onTaskCompleted() {
    const h = new Date().getHours()
    if (h < 8) counters.value = { ...counters.value, early: counters.value.early + 1 }
    if (h >= 22) counters.value = { ...counters.value, night: counters.value.night + 1 }

    // Cada 7 tareas de por vida, un sticker sorpresa (máx. 3 de golpe para partidas ya avanzadas).
    const packs = Math.floor(companion.totalCompleted.value / 7)
    if (packs > packsGiven.value) {
      const n = Math.min(3, packs - packsGiven.value)
      packsGiven.value = packs
      for (let i = 0; i < n; i++) {
        const { item, isNew } = grantCollectible()
        pushToast(item.emoji, isNew ? 'Sticker nuevo' : 'Sticker repetido', item.label, { tab: 'cofre', hl: `sticker-${item.id}` })
      }
    }
    persist()
    checkAchievements()
  }

  // ── Cofrecito diario ──
  const canOpenChest = computed(() => lastChest.value !== toDateKey(new Date()))

  function openChest(): ChestPrize | null {
    if (!canOpenChest.value) return null
    lastChest.value = toDateKey(new Date())
    chests.value += 1
    const roll = Math.random()
    let prize: ChestPrize
    if (roll < 0.4) {
      const amount = 10 + Math.floor(Math.random() * 31)
      companion.awardBonus(0, amount)
      prize = { kind: 'coins', emoji: '🪙', label: `${amount} monedas` }
    } else if (roll < 0.62) {
      const amount = 15 + Math.floor(Math.random() * 26)
      companion.awardBonus(amount, 0)
      prize = { kind: 'xp', emoji: '⚡', label: `${amount} de XP` }
    } else {
      const { item, isNew } = grantCollectible()
      prize = { kind: 'sticker', emoji: item.emoji, label: item.label, collectible: item, isNew }
    }
    persist()
    useSound().play('sparkle')
    checkAchievements()
    return prize
  }

  // ── Pase de temporada ──
  const currentKey = computed(() => seasonKey())
  const tasksThisMonth = computed(() => {
    const prefix = currentKey.value
    return ledger.entries.value.filter((e) => toDateKey(new Date(e.at)).startsWith(prefix)).length
  })

  function isClaimed(tier: number, key = currentKey.value) {
    return claimed.value.includes(`${key}:${tier}`)
  }

  function claimTier(tier: number) {
    const def = PASS_TIERS[tier]
    const key = currentKey.value
    if (!def || isClaimed(tier) || tasksThisMonth.value < def.tasks) return false
    claimed.value = [...claimed.value, `${key}:${tier}`]
    const season = SEASONS[Number(key.split('-')[1]) - 1]!
    if (def.kind === 'stickers') {
      for (let i = 0; i < 3; i++) grantCollectible(seasonCollectibleId(key, i))
    } else if (def.kind === 'insignia') {
      companion.awardBonus(0, 100)
    }
    persist()
    pushToast(season.emoji, 'Pase de temporada', def.label, { tab: 'temporada', hl: `tier-${tier}` })
    useSound().play('unlock')
    checkAchievements()
    return true
  }

  /** Temas de temporada ya reclamados (se conservan para siempre). */
  const seasonThemes = computed(() =>
    claimed.value
      .filter((k) => k.endsWith(':0'))
      .map((k) => {
        const key = k.split(':')[0]!
        const season = SEASONS[Number(key.split('-')[1]) - 1]
        return season ? { id: `season-${key}`, emoji: season.emoji, ...season.theme } : null
      })
      .filter((x): x is { id: string; emoji: string; label: string; bg: string; accent: string } => !!x),
  )

  // ── Insignia junto al nombre ──
  const insigniaOptions = computed(() => {
    const list: { id: string; emoji: string; label: string }[] = []
    if (welcome.value) list.push({ id: 'welcome', emoji: '🎀', label: 'Miembro fundador' })
    for (const a of ACHIEVEMENTS) if (unlocked.value[a.id]) list.push({ id: `ach:${a.id}`, emoji: a.emoji, label: a.label })
    for (const k of claimed.value.filter((x) => x.endsWith(':3'))) {
      const key = k.split(':')[0]!
      const season = SEASONS[Number(key.split('-')[1]) - 1]
      if (season) list.push({ id: `season:${key}`, emoji: season.insignia.emoji, label: season.insignia.label })
    }
    return list
  })

  const insigniaDisplay = computed(() => insigniaOptions.value.find((o) => o.id === insignia.value) ?? null)

  function setInsignia(id: string | null) {
    insignia.value = id
    persist()
  }

  // ── Pack de bienvenida: 3 stickers + insignia de fundador ──
  function claimWelcome() {
    if (welcome.value) return false
    welcome.value = true
    for (let i = 0; i < 3; i++) grantCollectible()
    insignia.value = insignia.value ?? 'welcome'
    persist()
    pushToast('🎀', 'Pack de bienvenida', '3 stickers y la insignia de fundador', { tab: 'cofre', hl: 'album' })
    useSound().play('unlock')
    return true
  }

  // ── Casita ──
  function isFurnitureUnlocked(id: string) {
    const f = FURNITURE.find((x) => x.id === id)
    return !!f && stats.value[f.stat] >= f.goal
  }

  function buyStyle(id: string) {
    const st = CASITA_STYLES.find((x) => x.id === id)
    if (!st || ownedStyles.value.includes(id)) return false
    if (!companion.spendPoints(st.cost)) return false
    ownedStyles.value = [...ownedStyles.value, id]
    activeStyle.value = id
    persist()
    useSound().play('buy')
    return true
  }

  /** Pone un estilo que ya es tuyo, o vuelve a los muebles sueltos con null. */
  function setStyle(id: string | null) {
    if (id && !ownedStyles.value.includes(id)) return
    activeStyle.value = id
    persist()
    useSound().play('pop')
  }

  function setRoomItem(slot: FurnitureSlot, id: string | null) {
    const next = { ...room.value }
    if (id) next[slot] = id
    else delete next[slot]
    room.value = next
    persist()
  }

  function setWallColor(color: string) {
    wallColor.value = color
    persist()
  }

  function setFloorColor(color: string) {
    floorColor.value = color
    persist()
  }

  function markStageSeen(id: string) {
    seenStage.value = id
    persist()
  }

  return {
    stats,
    unlocked,
    achievements: ACHIEVEMENTS,
    friends,
    collection,
    counters,
    toasts,
    notify: pushToast,
    chests,
    canOpenChest,
    openChest,
    grantCollectible,
    bump,
    onTaskCompleted,
    checkAchievements,
    currentKey,
    tasksThisMonth,
    isClaimed,
    claimTier,
    seasonThemes,
    insigniaOptions,
    insigniaDisplay,
    setInsignia,
    welcome,
    claimWelcome,
    room,
    ownedStyles,
    activeStyle,
    buyStyle,
    setStyle,
    wallColor,
    floorColor,
    isFurnitureUnlocked,
    setRoomItem,
    setWallColor,
    setFloorColor,
    seenStage,
    markStageSeen,
    dismissToast: (id: string) => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    },
  }
}
