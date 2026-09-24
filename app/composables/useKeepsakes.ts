import { toDateKey } from '~/utils/calendarDate'
import { LETTERS } from '~/utils/casitaData'

export type GratitudeEntry = { id: string; date: string; text: string }
export type Capsule = { id: string; text: string; createdAt: number; openAt: string; opened: boolean }
export type Countdown = { id: string; title: string; emoji: string; date: string }

type Data = {
  gratitude: GratitudeEntry[]
  capsules: Capsule[]
  countdowns: Countdown[]
  /** Cartitas leídas: fecha → índice de la frase. */
  letters: Record<string, number>
}

const STORAGE_KEY = 'todo-keepsakes-v1'

const gratitude = ref<GratitudeEntry[]>([])
const capsules = ref<Capsule[]>([])
const countdowns = ref<Countdown[]>([])
const letters = ref<Record<string, number>>({})
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const d = JSON.parse(raw) as Partial<Data>
    if (Array.isArray(d.gratitude)) gratitude.value = d.gratitude.filter((g) => g && typeof g.id === 'string' && typeof g.text === 'string')
    if (Array.isArray(d.capsules)) capsules.value = d.capsules.filter((c) => c && typeof c.id === 'string' && typeof c.openAt === 'string')
    if (Array.isArray(d.countdowns)) countdowns.value = d.countdowns.filter((c) => c && typeof c.id === 'string' && typeof c.date === 'string')
    if (d.letters && typeof d.letters === 'object') letters.value = d.letters
  } catch {
    // ignore corrupted storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    const data: Data = { gratitude: gratitude.value, capsules: capsules.value, countdowns: countdowns.value, letters: letters.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore write failures
  }
}

/** Índice de la frase del día: estable para una misma fecha. */
function letterIndexFor(dateKey: string) {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) | 0
  return Math.abs(hash) % LETTERS.length
}

export function daysUntil(dateKey: string) {
  const target = new Date(`${dateKey}T00:00:00`).getTime()
  const today = new Date(`${toDateKey(new Date())}T00:00:00`).getTime()
  return Math.round((target - today) / 86400000)
}

export function useKeepsakes() {
  load()

  // ── Cartita del día ──
  const todayKey = () => toDateKey(new Date())
  const todayLetter = computed(() => LETTERS[letterIndexFor(todayKey())]!)
  const letterOpened = computed(() => letters.value[todayKey()] !== undefined)
  const pastLetters = computed(() =>
    Object.entries(letters.value)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .map(([date, idx]) => ({ date, text: LETTERS[idx] ?? '' })),
  )

  function openLetter() {
    if (letterOpened.value) return
    letters.value = { ...letters.value, [todayKey()]: letterIndexFor(todayKey()) }
    persist()
    useRewards().bump('letters')
    useSound().play('sparkle')
  }

  // ── Gratitud ──
  function addGratitude(text: string) {
    const t = text.trim()
    if (!t) return
    gratitude.value = [{ id: uuid(), date: todayKey(), text: t }, ...gratitude.value]
    persist()
    useRewards().bump('gratitude')
    useSound().play('pop')
  }

  function removeGratitude(id: string) {
    gratitude.value = gratitude.value.filter((g) => g.id !== id)
    persist()
  }

  // ── Cápsula del tiempo ──
  function addCapsule(text: string, openAt: string) {
    const t = text.trim()
    if (!t || !openAt || openAt <= todayKey()) return false
    capsules.value = [{ id: uuid(), text: t, createdAt: Date.now(), openAt, opened: false }, ...capsules.value]
    persist()
    return true
  }

  function openCapsule(id: string) {
    const c = capsules.value.find((x) => x.id === id)
    if (!c || c.opened || c.openAt > todayKey()) return false
    c.opened = true
    persist()
    useRewards().bump('capsules')
    useSound().play('unlock')
    return true
  }

  function removeCapsule(id: string) {
    capsules.value = capsules.value.filter((c) => c.id !== id)
    persist()
  }

  // ── Cuenta regresiva ──
  function addCountdown(title: string, date: string, emoji: string) {
    const t = title.trim()
    if (!t || !date) return
    countdowns.value = [...countdowns.value, { id: uuid(), title: t, date, emoji: emoji || '🎉' }]
    persist()
  }

  function removeCountdown(id: string) {
    countdowns.value = countdowns.value.filter((c) => c.id !== id)
    persist()
  }

  const sortedCountdowns = computed(() => [...countdowns.value].sort((a, b) => a.date.localeCompare(b.date)))
  const nextCountdown = computed(() => sortedCountdowns.value.find((c) => daysUntil(c.date) >= 0) ?? null)

  return {
    gratitude,
    capsules,
    countdowns: sortedCountdowns,
    nextCountdown,
    todayLetter,
    letterOpened,
    pastLetters,
    openLetter,
    addGratitude,
    removeGratitude,
    addCapsule,
    openCapsule,
    removeCapsule,
    addCountdown,
    removeCountdown,
  }
}
