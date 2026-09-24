import { toDateKey } from '~/utils/calendarDate'

/** Una redención de puntos: quién debía completar la tarea (null = sin asignar) y cuánto ganó. */
export type PointsEntry = {
  taskId: string
  assignee: string | null
  points: number
  at: number
}

const STORAGE_KEY = 'todo-points-ledger-v1'

const entries = ref<PointsEntry[]>([])
let loaded = false

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (Array.isArray(raw)) {
      entries.value = raw
        .filter((e: any) => e && typeof e.points === 'number' && typeof e.at === 'number')
        .map((e: any) => ({
          taskId: String(e.taskId ?? ''),
          assignee: typeof e.assignee === 'string' && e.assignee.trim() ? e.assignee.trim() : null,
          points: e.points,
          at: e.at,
        }))
    }
  } catch {
    entries.value = []
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  } catch {
    // ignore write failures
  }
}

export type PersonPoints = { name: string; today: number; month: number; total: number }

export function usePointsLedger() {
  load()

  function record(taskId: string, assignee: string | null, points: number) {
    entries.value.push({ taskId, assignee: assignee?.trim() || null, points, at: Date.now() })
    persist()
  }

  const todayKey = () => toDateKey(new Date())
  const monthKey = () => todayKey().slice(0, 7)
  const sum = (list: PointsEntry[]) => list.reduce((acc, e) => acc + e.points, 0)

  const totalPoints = computed(() => sum(entries.value))
  const pointsToday = computed(() => sum(entries.value.filter((e) => toDateKey(new Date(e.at)) === todayKey())))
  const pointsThisMonth = computed(() => sum(entries.value.filter((e) => toDateKey(new Date(e.at)).startsWith(monthKey()))))

  /** Puntos redimidos por persona (hoy / este mes / total), de mayor a menor total. */
  const byPerson = computed<PersonPoints[]>(() => {
    const map = new Map<string, PersonPoints>()
    const t = todayKey()
    const m = monthKey()
    for (const e of entries.value) {
      const name = e.assignee ?? 'Sin asignar'
      const row = map.get(name) ?? { name, today: 0, month: 0, total: 0 }
      const key = toDateKey(new Date(e.at))
      row.total += e.points
      if (key.startsWith(m)) row.month += e.points
      if (key === t) row.today += e.points
      map.set(name, row)
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  })

  /** Puntos por día de los últimos `n` días (el último es hoy). */
  function lastDays(n: number) {
    const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return Array.from({ length: n }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (n - 1 - i))
      const key = toDateKey(d)
      return { key, label: labels[d.getDay()]!, points: sum(entries.value.filter((e) => toDateKey(new Date(e.at)) === key)) }
    })
  }

  /** Puntos por mes de los últimos `n` meses (el último es el actual). */
  function lastMonths(n: number) {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return Array.from({ length: n }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - (n - 1 - i))
      const key = toDateKey(d).slice(0, 7)
      return { key, label: labels[d.getMonth()]!, points: sum(entries.value.filter((e) => toDateKey(new Date(e.at)).startsWith(key))) }
    })
  }

  return { entries, record, totalPoints, pointsToday, pointsThisMonth, byPerson, lastDays, lastMonths }
}
