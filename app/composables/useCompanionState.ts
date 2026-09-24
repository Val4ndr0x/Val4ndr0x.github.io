import { toDateKey } from '~/utils/calendarDate'

export type StageId = 'huevo' | 'cria' | 'joven' | 'adulto' | 'legendario'
export type MoodId = 'sleeping' | 'sad' | 'excited' | 'happy' | 'focus'

export const STAGES: { id: StageId; label: string; min: number; scale: number }[] = [
  { id: 'huevo', label: 'Huevito', min: 1, scale: 0.85 },
  { id: 'cria', label: 'Cría', min: 2, scale: 0.72 },
  { id: 'joven', label: 'Joven', min: 5, scale: 0.86 },
  { id: 'adulto', label: 'Adulto', min: 10, scale: 1 },
  { id: 'legendario', label: 'Legendario', min: 20, scale: 1.1 },
]

export const MOOD_LABEL: Record<MoodId, string> = {
  sleeping: 'Durmiendo 💤',
  sad: 'Un poquito triste 🥺',
  excited: '¡Emocionado! ✨',
  happy: 'Contento 😊',
  focus: 'Estudiando contigo 📚',
}

/** Reloj reactivo (cada minuto) para que el humor cambie con la hora sin recargar. */
const clock = ref(Date.now())
let clockStarted = false

export function useCompanionState() {
  if (import.meta.client && !clockStarted) {
    clockStarted = true
    setInterval(() => (clock.value = Date.now()), 60_000)
  }

  const c = useCompanion()
  const rewards = useRewards()
  const ledger = usePointsLedger()
  const { lists } = useLists()
  const pomodoro = usePomodoro()

  const stage = computed(() => {
    let found = STAGES[0]!
    for (const s of STAGES) if (c.level.value >= s.min) found = s
    return found
  })

  const tasksToday = computed(() => {
    const key = toDateKey(new Date(clock.value))
    return ledger.entries.value.filter((e) => toDateKey(new Date(e.at)) === key).length
  })

  const daysAway = computed(() => {
    const last = c.lastCompletionDateKey.value
    if (!last) return 0
    const today = new Date(`${toDateKey(new Date(clock.value))}T00:00:00`).getTime()
    return Math.round((today - new Date(`${last}T00:00:00`).getTime()) / 86400000)
  })

  const mood = computed<MoodId>(() => {
    if (pomodoro.isFocusing.value) return 'focus'
    const h = new Date(clock.value).getHours()
    if (h >= 23 || h < 6) return 'sleeping'
    if (c.hunger.value < 25 || c.thirst.value < 25 || daysAway.value >= 2) return 'sad'
    if (tasksToday.value >= 3 || c.streak.value >= 3) return 'excited'
    return 'happy'
  })

  /** Tareas sin completar que vencen hoy o ya vencieron, y total pendientes. */
  const pending = computed(() => {
    const today = toDateKey(new Date(clock.value))
    let due = 0
    let total = 0
    for (const l of lists.value) {
      for (const t of l.tasks) {
        if (t.completed) continue
        total++
        if (t.dueDate && t.dueDate <= today) due++
      }
    }
    return { due, total }
  })

  /** Mensaje de la mascota según hora, humor y tareas pendientes. */
  function greeting() {
    const name = c.userName.value || 'amigo'
    const h = new Date().getHours()
    const { due, total } = pending.value
    const cositas = (n: number) => `${n} ${n === 1 ? 'cosita' : 'cositas'}`

    if (mood.value === 'sad') {
      if (daysAway.value >= 2) return `¡${name}! Te extrañé 🥺 ¿hacemos una tarea chiquitita juntos?`
      return `Tengo un poquito de hambre o sed… 🥺 ¿me das algo, ${name}?`
    }
    if (h >= 23 || h < 6) return `Shhh… ya es tarde, ${name}. Descansemos un ratito 🌙`
    if (h < 12) {
      if (due) return `¡Buenos días, ${name}! Hoy tienes ${cositas(due)} para hoy 🌷`
      if (total) return `¡Buenos días, ${name}! Tienes ${cositas(total)} pendiente${total === 1 ? '' : 's'}, sin prisa 🌷`
      return `¡Buenos días, ${name}! Hoy está todo tranquilo ☀️`
    }
    if (h < 19) {
      if (tasksToday.value >= 3) return `¡Vas volando, ${name}! ${tasksToday.value} tareas hoy ✨`
      if (due) return `¡Buenas tardes, ${name}! Aún quedan ${cositas(due)} para hoy 🍵`
      return `¡Buenas tardes, ${name}! ¿Un tecito y seguimos? 🍵`
    }
    if (tasksToday.value > 0) return `¡Buenas noches, ${name}! Hoy hiciste ${cositas(tasksToday.value)}. Estoy orgulloso 🌙`
    return `¡Buenas noches, ${name}! Mañana será un lindo día para empezar 🌙`
  }

  /** Avisa (una sola vez) cuando el huevito eclosiona o la mascota crece de etapa. */
  function syncStage() {
    const current = stage.value.id
    const seen = rewards.seenStage.value
    if (seen === current) return
    // Bajó de etapa (p. ej. al reiniciar el nivel): se registra sin festejar.
    const idx = (id: string | null) => STAGES.findIndex((s) => s.id === id)
    if (seen && idx(current) < idx(seen)) {
      rewards.markStageSeen(current)
      return
    }
    if (seen === 'huevo' && current !== 'huevo') {
      rewards.notify('🐣', '¡Eclosionó!', `${c.companionName.value || 'Tu mascota'} salió del huevito`, { tab: 'casita', hl: 'pet' })
      useConfetti().celebrate('estrellas')
      useSound().play('unlock')
    } else if (seen) {
      rewards.notify('🌟', '¡Creció!', `${c.companionName.value || 'Tu mascota'} ahora es ${stage.value.label.toLowerCase()}`, { tab: 'casita', hl: 'pet' })
      useConfetti().celebrate()
    }
    rewards.markStageSeen(current)
  }

  return { stage, mood, moodLabel: computed(() => MOOD_LABEL[mood.value]), pending, tasksToday, greeting, syncStage }
}
