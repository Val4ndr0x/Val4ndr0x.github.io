type Phase = 'idle' | 'focus' | 'break'

const phase = ref<Phase>('idle')
const focusMinutes = ref(25)
const breakMinutes = ref(5)
const endsAt = ref(0)
const now = ref(Date.now())
/** Segundos que se estuvo fuera de la pestaña durante el enfoque actual. */
const awaySeconds = ref(0)
const awayNotice = ref(false)
const lastResult = ref<{ xp: number; points: number; distracted: boolean } | null>(null)
let hiddenAt = 0
let timer: ReturnType<typeof setInterval> | null = null
let wired = false

const AWAY_LIMIT = 30

function finish() {
  const wasFocus = phase.value === 'focus'
  phase.value = 'idle'
  endsAt.value = 0
  useSound().play('chime')
  if (!wasFocus) return
  const distracted = awaySeconds.value > AWAY_LIMIT
  const mins = focusMinutes.value
  const xp = Math.round(mins * (distracted ? 0.4 : 0.8))
  const points = Math.round(mins / (distracted ? 6 : 3))
  useCompanion().awardBonus(xp, points)
  useRewards().bump('focus')
  lastResult.value = { xp, points, distracted }
  useConfetti().celebrate(distracted ? 'estrellas' : undefined)
}

function tick() {
  now.value = Date.now()
  if (phase.value !== 'idle' && now.value >= endsAt.value) finish()
}

function wire() {
  if (wired || !import.meta.client) return
  wired = true
  timer = setInterval(tick, 500)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (phase.value === 'focus') hiddenAt = Date.now()
      return
    }
    if (hiddenAt && phase.value === 'focus') {
      awaySeconds.value += Math.round((Date.now() - hiddenAt) / 1000)
      if (awaySeconds.value > AWAY_LIMIT) awayNotice.value = true
    }
    hiddenAt = 0
    tick()
  })
}

export function usePomodoro() {
  wire()

  const remainingMs = computed(() => (phase.value === 'idle' ? focusMinutes.value * 60000 : Math.max(0, endsAt.value - now.value)))
  const totalMs = computed(() => (phase.value === 'break' ? breakMinutes.value : focusMinutes.value) * 60000)
  const progress = computed(() => (phase.value === 'idle' ? 0 : 1 - remainingMs.value / totalMs.value))
  const label = computed(() => {
    const s = Math.ceil(remainingMs.value / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  })

  function start(minutes = focusMinutes.value) {
    focusMinutes.value = minutes
    awaySeconds.value = 0
    awayNotice.value = false
    lastResult.value = null
    now.value = Date.now()
    endsAt.value = now.value + minutes * 60000
    phase.value = 'focus'
    useSound().play('pop')
  }

  function startBreak() {
    lastResult.value = null
    now.value = Date.now()
    endsAt.value = now.value + breakMinutes.value * 60000
    phase.value = 'break'
  }

  function stop() {
    phase.value = 'idle'
    endsAt.value = 0
    awayNotice.value = false
  }

  return { phase, focusMinutes, breakMinutes, remainingMs, progress, label, awayNotice, lastResult, start, startBreak, stop, isFocusing: computed(() => phase.value === 'focus') }
}
