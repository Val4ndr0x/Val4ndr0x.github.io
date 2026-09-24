<script setup lang="ts">
import { xpThreshold, POINTS_PER_TASK } from '~/composables/useCompanion'

const { userName, companionName, character, renameCompanion, renameUser, xp, level, streak, longestStreak, lastLevelUp, clearLevelUp, resetLevel, points, totalCompleted, hunger, thirst, items, recipeItems, feed, refreshNeeds } = useCompanion()
const { respond, idleLine } = useCompanionBrain()
const { insigniaDisplay } = useRewards()
const { stage, greeting, syncStage, pending, tasksToday, mood } = useCompanionState()
const { errorMessage } = useCompanionAI()

const open = ref(false)
// En la casita y el café Mapachín está ocupado allí dentro: la insignia flotante se oculta.
const route = useRoute()
const busy = computed(() => route.path.startsWith('/casita') || route.path.startsWith('/cafe'))
watch(busy, (b) => { if (b) open.value = false })
const tab = ref<'chat' | 'comida' | 'hoy' | 'perfil' | 'ajustes'>('chat')
const NAV = [
  { id: 'chat', icon: 'chat', label: 'Chat' },
  { id: 'comida', icon: 'food', label: 'Comida' },
  { id: 'hoy', icon: 'checklist', label: 'Hoy' },
  { id: 'perfil', icon: 'book', label: 'Registro' },
  { id: 'ajustes', icon: 'settings', label: 'Ajustes' },
] as const
const dexNumber = '001'
// Ajustes: menú lateral estilo Assassin's Creed (lista a la izquierda, detalle a la derecha, escenario 3D al centro).
const SETTINGS = [
  { id: 'identidad', icon: 'user', label: 'Identidad', hint: 'Nombres' },
  { id: 'nivel', icon: 'rotate', label: 'Reiniciar nivel', hint: 'Volver a empezar' },
  { id: 'movimiento', icon: 'run', label: 'Movimiento', hint: 'Correr por la pantalla' },
  { id: 'ia', icon: 'brain', label: 'IA libre', hint: 'Cerebro del chat' },
] as const
const setSel = ref<(typeof SETTINGS)[number]['id']>('identidad')
const setCurrent = computed(() => SETTINGS.find((x) => x.id === setSel.value)!)
const wide = computed(() => open.value && view.value === 'section' && tab.value === 'ajustes')
// Selector estilo Omnitrix: se gira el dial para elegir y se confirma pulsando el núcleo.
const view = ref<'dial' | 'section'>('dial')
const sel = ref(0)
const STEP = 360 / NAV.length
const DIAL_R = 96
const selected = computed(() => NAV[sel.value]!)
function pick(i: number) {
  if (sel.value === i) return confirmPick()
  sel.value = i
}
function confirmPick() {
  tab.value = selected.value.id
  view.value = 'section'
}
function cycle(dir: 1 | -1) {
  sel.value = (sel.value + dir + NAV.length) % NAV.length
}
const dexEntry = computed(
  () =>
    `${companionName.value || 'Mapachín'} es un mapache curioso que vive en tu lista de tareas. Crece con cada tarea que completas y se pone triste si lo dejas sin comer. Su mejor amigo es ${userName.value || 'su entrenador'}.`,
)
const companionNameInput = ref('')
const userNameInput = ref('')

const xpProgress = computed(() => Math.min(100, Math.round((xp.value / xpThreshold(level.value)) * 100)))

const confirmReset = ref(false)

function doResetLevel() {
  resetLevel()
  confirmReset.value = false
  syncStage()
  pushCompanionMessage('¡Empecemos de nuevo! Vuelvo a ser un huevito 🥚')
  tab.value = 'chat'
  view.value = 'section'
}

const showCelebration = ref(false)
const celebrationLevel = ref(1)
let celebrationTimer: ReturnType<typeof setTimeout> | null = null

watch(lastLevelUp, (newLevel) => {
  if (newLevel === null) return
  celebrationLevel.value = newLevel
  useConfetti().celebrate()
  showCelebration.value = true
  if (celebrationTimer) clearTimeout(celebrationTimer)
  celebrationTimer = setTimeout(() => {
    showCelebration.value = false
    clearLevelUp()
  }, 2200)
})

type ChatMessage = { id: string; from: 'user' | 'companion'; text: string }
const messages = ref<ChatMessage[]>([])
const chatInput = ref('')
const thinking = ref(false)
const chatScroll = ref<HTMLElement | null>(null)

function scrollChatToBottom() {
  nextTick(() => {
    if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight
  })
}

function pushCompanionMessage(text: string) {
  messages.value.push({ id: uuid(), from: 'companion', text })
  scrollChatToBottom()
}

async function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return
  messages.value.push({ id: uuid(), from: 'user', text })
  const history = messages.value
    .slice(0, -1)
    .map((m) => ({ role: m.from === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }))
  chatInput.value = ''
  scrollChatToBottom()
  thinking.value = true
  const minDelay = new Promise((r) => setTimeout(r, 350 + Math.random() * 350))
  const [reply] = await Promise.all([respond(text, history), minDelay])
  thinking.value = false
  pushCompanionMessage(reply)
}

// "Vida propia": de tanto en tanto el compañero dice algo por su cuenta, aunque no le escribas.
const showIdleBubble = ref(false)
const idleText = ref('')
let idleShowTimer: ReturnType<typeof setTimeout> | null = null
let idleHideTimer: ReturnType<typeof setTimeout> | null = null

function scheduleIdleBubble() {
  if (idleShowTimer) clearTimeout(idleShowTimer)
  const delay = 90_000 + Math.random() * 90_000
  idleShowTimer = setTimeout(() => {
    if (!open.value && document.visibilityState === 'visible') {
      idleText.value = idleLine()
      showIdleBubble.value = true
      if (idleHideTimer) clearTimeout(idleHideTimer)
      idleHideTimer = setTimeout(() => {
        showIdleBubble.value = false
      }, 6000)
    }
    scheduleIdleBubble()
  }, delay)
}

let needsTimer: ReturnType<typeof setInterval> | null = null

const petRef = ref<{ el: HTMLElement | null; eat: (emoji: string) => void } | null>(null)

function onFed(item: { emoji: string; label: string; xp: number }) {
  pushCompanionMessage(`¡Ñam! ${item.emoji} ${item.label}, gracias ${userName.value || 'amigo'} 💛 (+${item.xp} XP)`)
}

// Saludo de la mascota al abrir la app (una vez por sesión): hora del día, humor y tareas de hoy.
function showGreeting() {
  try {
    if (sessionStorage.getItem('todo-greeted') === '1') return
    sessionStorage.setItem('todo-greeted', '1')
  } catch {
    // sin sessionStorage: se muestra igual
  }
  idleText.value = greeting()
  showIdleBubble.value = true
  if (idleHideTimer) clearTimeout(idleHideTimer)
  idleHideTimer = setTimeout(() => {
    showIdleBubble.value = false
  }, 7000)
}

watch(level, () => syncStage())
watch(tab, (t) => {
  const i = NAV.findIndex((n) => n.id === t)
  if (i >= 0) sel.value = i
})

// Insignia arrastrable: la posición se recuerda entre visitas.
const BADGE_SIZE = 96
const POS_KEY = 'mapachin-badge-pos'
const badgeRoot = ref<HTMLElement | null>(null)
const pos = ref<{ x: number; y: number } | null>(null)
const dragging = ref(false)
const winW = ref(1024)
const winH = ref(768)
let dragStart: { px: number; py: number; x: number; y: number } | null = null
let moved = false

function clampPos(x: number, y: number) {
  return {
    x: Math.min(Math.max(8, x), Math.max(8, winW.value - BADGE_SIZE - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, winH.value - BADGE_SIZE - 8)),
  }
}

function onBadgeDown(e: PointerEvent) {
  const rect = badgeRoot.value?.getBoundingClientRect()
  if (!rect) return
  dragStart = { px: e.clientX, py: e.clientY, x: rect.left, y: rect.top }
  moved = false
  window.addEventListener('pointermove', onBadgeMove)
  window.addEventListener('pointerup', onBadgeUp)
  window.addEventListener('pointercancel', onBadgeUp)
}

function onBadgeMove(e: PointerEvent) {
  if (!dragStart) return
  const dx = e.clientX - dragStart.px
  const dy = e.clientY - dragStart.py
  if (!moved && Math.hypot(dx, dy) < 6) return
  moved = true
  dragging.value = true
  pos.value = clampPos(dragStart.x + dx, dragStart.y + dy)
}

function onBadgeUp() {
  window.removeEventListener('pointermove', onBadgeMove)
  window.removeEventListener('pointerup', onBadgeUp)
  window.removeEventListener('pointercancel', onBadgeUp)
  dragStart = null
  dragging.value = false
  if (moved && pos.value) {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos.value))
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }
}

function onBadgeClick() {
  if (moved) {
    moved = false
    return
  }
  togglePopover()
}

// Modo movimiento: Mapachín sale a caminar y correr por toda la pantalla con su animación normal.
const ROAM_KEY = 'mapachin-roaming'
const roaming = ref(false)
let roamRaf = 0
let roamLast = 0
let roamSpeed = 90
let roamWaitUntil = 0
const gait = ref<'walk' | 'run' | null>(null)
const lean = ref(0)

// Rutas en "L": camina en línea recta hacia un rincón/borde y luego gira 90° (nada de diagonales al azar).
// Prefiere los bordes para no estorbar el contenido, y descansa largo rato en cada destino.
let roamLegs: { x: number; y: number }[] = []

function planRoute() {
  const p = pos.value!
  const maxX = Math.max(8, winW.value - BADGE_SIZE - 8)
  const maxY = Math.max(8, winH.value - BADGE_SIZE - 8)
  const edge = (lo: number, hi: number) => (Math.random() < 0.5 ? lo + Math.random() * 60 : hi - Math.random() * 60)
  const dest = { x: Math.min(maxX, Math.max(8, edge(8, maxX))), y: Math.min(maxY, Math.max(8, edge(8, maxY))) }
  const corner = Math.random() < 0.5 ? { x: dest.x, y: p.y } : { x: p.x, y: dest.y }
  roamLegs = [corner, dest].filter((l, i, a) => Math.hypot(l.x - (a[i - 1]?.x ?? p.x), l.y - (a[i - 1]?.y ?? p.y)) > 24)
}

function roamTick(t: number) {
  roamRaf = requestAnimationFrame(roamTick)
  const dt = Math.min(0.05, (t - roamLast) / 1000)
  roamLast = t
  // Triste/abandonado: se queda quieto y no sale a pasear hasta que vuelva a estar contento.
  if (busy.value || open.value || dragging.value || !pos.value || t < roamWaitUntil || mood.value === 'sad') {
    gait.value = null
    return
  }
  if (!roamLegs.length) planRoute()
  const leg = roamLegs[0]
  if (!leg) {
    roamWaitUntil = t + 3000
    return
  }
  const dx = leg.x - pos.value.x
  const dy = leg.y - pos.value.y
  const dist = Math.hypot(dx, dy)
  roamSpeed = dist > 350 ? 240 : 95 // trechos largos: trota; cortos: camina
  const step = roamSpeed * dt
  if (dist <= step) {
    pos.value = clampPos(leg.x, leg.y)
    roamLegs.shift()
    gait.value = null
    // pausa breve al girar en la esquina; descanso largo al llegar
    roamWaitUntil = t + (roamLegs.length ? 350 : 5000 + Math.random() * 7000)
    return
  }
  gait.value = roamSpeed > 200 ? 'run' : 'walk'
  lean.value = Math.sign(dx) * (gait.value === 'run' ? 9 : 4)
  pos.value = clampPos(pos.value.x + (dx / dist) * step, pos.value.y + (dy / dist) * step)
}

function setRoaming(on: boolean) {
  roaming.value = on
  try {
    localStorage.setItem(ROAM_KEY, on ? '1' : '0')
  } catch {
    // ignore write failures
  }
  cancelAnimationFrame(roamRaf)
  gait.value = null
  if (!on) return
  if (!pos.value) {
    const rect = badgeRoot.value?.getBoundingClientRect()
    pos.value = clampPos(rect?.left ?? 24, rect?.top ?? winH.value - 160)
  }
  roamLegs = []
  roamLast = performance.now()
  roamRaf = requestAnimationFrame(roamTick)
}

function syncWindow() {
  winW.value = window.innerWidth
  winH.value = window.innerHeight
  if (pos.value) pos.value = clampPos(pos.value.x, pos.value.y)
}

// Si la insignia queda arriba o a la derecha, el panel se abre hacia el otro lado.
const panelBelow = computed(() => !!pos.value && pos.value.y < 440)
const panelRight = computed(() => !!pos.value && pos.value.x + 300 > winW.value)
const panelPos = computed(() => `${panelBelow.value ? 'top-28' : 'bottom-28'} ${panelRight.value ? 'right-0' : 'left-0'}`)

onMounted(() => {
  syncWindow()
  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? 'null')
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') pos.value = clampPos(saved.x, saved.y)
  } catch {
    // ignore corrupt or unavailable storage
  }
  window.addEventListener('resize', syncWindow)
  try {
    if (localStorage.getItem(ROAM_KEY) === '1') setRoaming(true)
  } catch {
    // ignore unavailable storage
  }
  needsTimer = setInterval(refreshNeeds, 60_000)
  scheduleIdleBubble()
  syncStage()
  window.setTimeout(showGreeting, 2200)
})
onUnmounted(() => {
  window.removeEventListener('resize', syncWindow)
  cancelAnimationFrame(roamRaf)
  window.removeEventListener('pointermove', onBadgeMove)
  window.removeEventListener('pointerup', onBadgeUp)
  window.removeEventListener('pointercancel', onBadgeUp)
  if (needsTimer) clearInterval(needsTimer)
  if (idleShowTimer) clearTimeout(idleShowTimer)
  if (idleHideTimer) clearTimeout(idleHideTimer)
})

function togglePopover() {
  if (!open.value) {
    view.value = 'dial'
    companionNameInput.value = companionName.value
    userNameInput.value = userName.value
    showIdleBubble.value = false
    if (!messages.value.length) {
      pushCompanionMessage(`¡Hola, ${userName.value || 'amigo'}! Soy ${companionName.value || 'tu compañero'} 👋 Decime qué necesitás organizar.`)
    }
  }
  open.value = !open.value
}

function save() {
  renameCompanion(companionNameInput.value)
  renameUser(userNameInput.value)
  tab.value = 'perfil'
}

</script>

<template>
  <div
    v-if="character && !busy"
    ref="badgeRoot"
    class="fixed"
    :class="[wide ? 'z-[60]' : 'z-20', pos ? '' : 'bottom-20 sm:bottom-6 left-6']"
    :style="pos ? { left: `${pos.x}px`, top: `${pos.y}px` } : undefined"
  >
    <div
      v-if="showCelebration"
      :class="panelPos"
      class="absolute w-max bg-accent text-white text-sm font-semibold rounded-full px-4 py-2 shadow-lg celebration-pop"
    >
      🎉 ¡Nivel {{ celebrationLevel }}!
    </div>

    <div
      v-else-if="showIdleBubble"
      :class="panelPos"
      class="absolute w-56 bg-surface border border-border text-ink text-xs rounded-2xl rounded-bl-sm px-3 py-2 shadow-lg celebration-pop"
    >
      {{ idleText }}
    </div>

    <div v-if="wide" class="fixed inset-0 z-40 bg-black/50" @click="open = false" />

    <div
      v-if="open"
      :class="wide ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(820px,94vw)] max-h-[92vh] overflow-y-auto z-50' : [panelPos, 'absolute w-80 max-w-[92vw]']"
      class="bg-surface border-4 border-accent rounded-3xl p-3 shadow-2xl flex flex-col"
    >
      <!-- Selector estilo Omnitrix -->
      <div v-if="view === 'dial'" class="omni-bg rounded-2xl p-2 select-none">
        <div class="flex items-center justify-between px-2 pt-1 text-[10px] font-bold tracking-widest omni-text">
          <span>MAPADEX</span>
          <span>{{ companionName }} · Nv. {{ level }}</span>
        </div>
        <div class="omni relative mx-auto" :style="{ width: `${DIAL_R * 2 + 64}px`, height: `${DIAL_R * 2 + 64}px` }">
          <div class="omni-ring absolute inset-2 rounded-full" />
          <div class="omni-ring-inner absolute rounded-full" :style="{ inset: '30px' }" />
          <div class="absolute inset-0 omni-spin" :style="{ transform: `rotate(${-sel * STEP}deg)` }">
            <button
              v-for="(n, i) in NAV"
              :key="n.id"
              type="button"
              class="omni-item absolute left-1/2 top-1/2 -ml-6 -mt-6 w-12 h-12 rounded-full flex items-center justify-center text-xl"
              :class="sel === i ? 'is-sel' : ''"
              :style="{ transform: `rotate(${i * STEP}deg) translateY(-${DIAL_R}px) rotate(${-i * STEP + sel * STEP}deg)` }"
              :aria-label="n.label"
              @click="pick(i)"
            >
              <AppIcon :name="n.icon" :size="24" />
            </button>
          </div>
          <button type="button" class="omni-core absolute left-1/2 top-1/2 -ml-11 -mt-11 w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center" aria-label="Abrir sección" @click="confirmPick">
            <CompanionAvatar :character="character" :size="52" class="pointer-events-none" />
          </button>
        </div>
        <div class="flex items-center justify-center gap-4 pb-1">
          <button type="button" class="omni-arrow" aria-label="Anterior" @click="cycle(-1)">‹</button>
          <p class="w-28 text-center text-lg font-extrabold tracking-wide omni-text">{{ selected.label.toUpperCase() }}</p>
          <button type="button" class="omni-arrow" aria-label="Siguiente" @click="cycle(1)">›</button>
        </div>
      </div>

      <template v-else>
      <!-- Barra de la sección -->
      <div class="mb-2.5 rounded-2xl bg-base border border-border px-2 py-2 flex items-center gap-2">
        <button type="button" class="shrink-0 flex items-center gap-1 pl-2 pr-3 h-9 rounded-full omni-mini text-white text-xs font-bold" aria-label="Volver al menú" @click="view = 'dial'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Volver
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-ink truncate">
            <AppIcon :name="selected.icon" :size="16" class="inline -mt-0.5 mr-0.5" /> {{ selected.label }}
            <span v-if="insigniaDisplay" :title="insigniaDisplay.label">{{ insigniaDisplay.emoji }}</span>
          </p>
          <div class="mt-1 h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div class="h-full bg-accent rounded-full transition-[width]" :style="{ width: `${xpProgress}%` }" />
          </div>
        </div>
        <CompanionAvatar :character="character" :size="36" />
      </div>

      <template v-if="tab === 'chat'">
        <div ref="chatScroll" class="flex flex-col gap-2 mb-2 max-h-56 overflow-y-auto pr-1">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="max-w-[85%] text-xs rounded-2xl px-3 py-2 whitespace-pre-line"
            :class="msg.from === 'user'
              ? 'self-end bg-accent text-white rounded-br-sm'
              : 'self-start bg-base text-ink rounded-bl-sm'"
          >
            {{ msg.text }}
          </div>
          <div v-if="thinking" class="self-start bg-base text-muted text-xs rounded-2xl rounded-bl-sm px-3 py-2">
            •••
          </div>
        </div>
        <form class="flex gap-1.5" @submit.prevent="sendChat">
          <input
            v-model="chatInput"
            type="text"
            placeholder="Escribile algo..."
            maxlength="200"
            class="flex-1 min-w-0 bg-base text-ink placeholder-muted rounded-full px-3 py-2 text-sm outline-none border border-border focus:border-accent"
          />
          <button
            type="submit"
            class="shrink-0 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:brightness-105 active:scale-95 transition disabled:opacity-40"
            :disabled="!chatInput.trim()"
            aria-label="Enviar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </template>

      <template v-else-if="tab === 'comida'">
        <div class="flex justify-center mb-2">
          <PetInteractive ref="petRef" :character="character" :size="84" />
        </div>
        <FoodTray :pet="petRef" @fed="onFed" @refuse="pushCompanionMessage" />
      </template>

      <template v-else-if="tab === 'hoy'">
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="rounded-2xl bg-base border border-border py-2 text-center">
            <p class="text-xl font-extrabold text-accent leading-none">{{ pending.due }}</p>
            <p class="text-[10px] text-muted mt-1">Para hoy</p>
          </div>
          <div class="rounded-2xl bg-base border border-border py-2 text-center">
            <p class="text-xl font-extrabold text-accent leading-none">{{ tasksToday }}</p>
            <p class="text-[10px] text-muted mt-1">Hechas hoy</p>
          </div>
          <div class="rounded-2xl bg-base border border-border py-2 text-center">
            <p class="text-xl font-extrabold text-accent leading-none">{{ streak }}</p>
            <p class="text-[10px] text-muted mt-1">Racha</p>
          </div>
        </div>
        <p class="text-[11px] text-muted mb-3 text-center">
          {{ pending.total ? `Tienes ${pending.total} tarea${pending.total === 1 ? '' : 's'} pendiente${pending.total === 1 ? '' : 's'}.` : 'No tienes tareas pendientes. ¡Todo tranquilo!' }}
        </p>
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink to="/" class="text-center py-2 rounded-full bg-base border border-border text-accent text-xs font-semibold hover:border-accent transition" @click="open = false">Mis listas</NuxtLink>
          <NuxtLink to="/calendario" class="text-center py-2 rounded-full bg-base border border-border text-accent text-xs font-semibold hover:border-accent transition" @click="open = false">Calendario</NuxtLink>
        </div>
      </template>

      <template v-else-if="tab === 'perfil'">
        <div class="rounded-2xl border border-border bg-base overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-accent text-white text-[11px] font-bold tracking-wide">
            <span>N.º {{ dexNumber }}</span>
            <span>REGISTRO</span>
          </div>
          <div class="dex-screen flex justify-center py-3">
            <CompanionAvatar :character="character" :size="92" />
          </div>
          <div class="px-3 pb-3">
            <p class="text-base font-bold text-ink leading-tight">{{ companionName }}</p>
            <div class="flex flex-wrap gap-1 mt-1 mb-2">
              <span class="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">🦝 Compañero</span>
              <span class="px-2 py-0.5 rounded-full bg-base border border-border text-muted text-[10px] font-bold">{{ stage.label }}</span>
              <span class="px-2 py-0.5 rounded-full bg-base border border-border text-muted text-[10px] font-bold">Nivel {{ level }}</span>
            </div>
            <p class="text-[11px] text-muted leading-snug mb-3">{{ dexEntry }}</p>

            <div class="flex flex-col gap-1.5 text-[11px]">
              <div class="flex items-center gap-2">
                <span class="w-14 text-muted font-semibold">EXP</span>
                <div class="flex-1 h-2 rounded-full bg-border overflow-hidden"><div class="h-full bg-accent rounded-full" :style="{ width: `${xpProgress}%` }" /></div>
                <span class="w-14 text-right text-ink font-semibold">{{ xp }}/{{ xpThreshold(level) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 text-muted font-semibold">🍖 Comida</span>
                <div class="flex-1 h-2 rounded-full bg-border overflow-hidden"><div class="h-full rounded-full" :class="hunger < 25 ? 'bg-red-400' : 'bg-green-400'" :style="{ width: `${hunger}%` }" /></div>
                <span class="w-14 text-right text-ink font-semibold">{{ Math.round(hunger) }}%</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-14 text-muted font-semibold">💧 Bebida</span>
                <div class="flex-1 h-2 rounded-full bg-border overflow-hidden"><div class="h-full rounded-full" :class="thirst < 25 ? 'bg-red-400' : 'bg-sky-400'" :style="{ width: `${thirst}%` }" /></div>
                <span class="w-14 text-right text-ink font-semibold">{{ Math.round(thirst) }}%</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-1.5 mt-3 text-center">
              <div class="rounded-xl bg-surface border border-border py-1.5">
                <p class="text-sm font-bold text-ink">🔥 {{ streak }}</p>
                <p class="text-[10px] text-muted">Racha · récord {{ longestStreak }}</p>
              </div>
              <div class="rounded-xl bg-surface border border-border py-1.5">
                <p class="text-sm font-bold text-ink">✅ {{ totalCompleted }}</p>
                <p class="text-[10px] text-muted">Tareas hechas</p>
              </div>
              <div class="rounded-xl bg-surface border border-border py-1.5">
                <p class="text-sm font-bold text-ink">🪙 {{ points }}</p>
                <p class="text-[10px] text-muted">Monedas</p>
              </div>
            </div>

            <p class="text-[11px] text-muted mt-3">Entrenador: <span class="font-semibold text-ink">{{ userName }}</span></p>
            <NuxtLink to="/casita" class="block mt-2 text-center py-1.5 rounded-full bg-base border border-border text-accent text-xs font-semibold hover:border-accent transition" @click="open = false">🏡 Ir a su casita</NuxtLink>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="grid gap-3 md:grid-cols-[190px_1fr_250px]">
          <!-- Menú (izquierda) -->
          <nav class="ac-menu flex md:flex-col gap-1.5 order-2 md:order-1" aria-label="Ajustes">
            <button
              v-for="opt in SETTINGS"
              :key="opt.id"
              type="button"
              class="ac-item flex-1 md:flex-none flex items-center gap-2.5 text-left px-3 py-2.5 transition"
              :class="setSel === opt.id ? 'is-active' : ''"
              @click="setSel = opt.id"
            >
              <AppIcon :name="opt.icon" :size="20" class="shrink-0" />
              <span class="min-w-0">
                <span class="block text-xs font-bold truncate">{{ opt.label }}</span>
                <span class="hidden md:block text-[10px] opacity-70 truncate">{{ opt.hint }}</span>
              </span>
            </button>
          </nav>

          <!-- Escenario 3D (centro) -->
          <div class="order-1 md:order-2 min-w-0">
            <CompanionTurntable :character="character" :size="150" />
            <p class="text-center text-sm font-bold text-ink mt-2">{{ companionName }}</p>
            <p class="text-center text-[11px] text-muted">Nv. {{ level }} · {{ stage.label }}</p>
          </div>

          <!-- Detalle (derecha) -->
          <section class="ac-detail order-3 rounded-2xl border border-border bg-base p-3 min-w-0">
            <p class="text-[10px] font-bold tracking-widest text-accent mb-0.5">{{ setCurrent.hint.toUpperCase() }}</p>
            <p class="text-sm font-bold text-ink mb-3"><AppIcon :name="setCurrent.icon" :size="16" class="inline -mt-0.5 mr-0.5" /> {{ setCurrent.label }}</p>

            <template v-if="setSel === 'identidad'">
              <label class="block mb-3">
                <span class="text-xs text-muted mb-1 block">Tu compañero</span>
                <input
                  v-model="companionNameInput"
                  type="text"
                  maxlength="20"
                  class="w-full bg-surface text-ink placeholder-muted rounded-full px-3 py-2 text-sm outline-none border border-border focus:border-accent"
                />
              </label>
              <label class="block mb-4">
                <span class="text-xs text-muted mb-1 block">Tú (entrenador)</span>
                <input
                  v-model="userNameInput"
                  type="text"
                  maxlength="20"
                  class="w-full bg-surface text-ink placeholder-muted rounded-full px-3 py-2 text-sm outline-none border border-border focus:border-accent"
                />
              </label>
              <button
                type="button"
                class="w-full py-2 rounded-full bg-accent text-white text-sm font-semibold hover:brightness-105 active:scale-[0.99] transition"
                @click="save"
              >
                Guardar
              </button>
            </template>

            <template v-else-if="setSel === 'nivel'">
              <p class="text-[11px] text-muted mb-3">Vuelve al nivel 1 con 0 XP. Conservas monedas, racha, medallas y stickers.</p>
              <div v-if="!confirmReset">
                <button type="button" class="w-full py-2 rounded-full bg-surface border border-border text-ink text-xs font-semibold hover:border-danger hover:text-danger transition" @click="confirmReset = true">Reiniciar nivel</button>
              </div>
              <div v-else class="flex gap-2">
                <button type="button" class="flex-1 py-2 rounded-full bg-danger text-white text-xs font-semibold" @click="doResetLevel">Sí, reiniciar</button>
                <button type="button" class="flex-1 py-2 rounded-full bg-surface border border-border text-ink text-xs font-semibold" @click="confirmReset = false">Cancelar</button>
              </div>
            </template>

            <template v-else-if="setSel === 'movimiento'">
              <p class="text-[11px] text-muted mb-3">Mapachín sale a caminar y correr por toda la pantalla. Toca a Mapachín para detenerlo y abrir su menú.</p>
              <button
                type="button"
                class="w-full py-2 rounded-full text-xs font-semibold transition"
                :class="roaming ? 'bg-accent text-white' : 'bg-surface border border-border text-ink hover:border-accent'"
                @click="setRoaming(!roaming)"
              >
                {{ roaming ? 'Desactivar movimiento' : 'Activar movimiento' }}
              </button>
            </template>

            <template v-else>
              <p class="text-xs text-muted">
                Respondo preguntas libres con IA en la nube (Gemini), sin descargar nada. Solo se usa cuando lo que escribes no es un comando de la app.
              </p>
              <p v-if="errorMessage" class="text-xs text-red-400 mt-2">Último error: {{ errorMessage }}</p>
            </template>
          </section>
        </div>
      </template>
      </template>
    </div>

    <button
      type="button"
      class="w-24 h-24 flex items-end justify-center drop-shadow-lg select-none touch-none"
      :class="dragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105 active:scale-95 transition-transform'"
      :title="`${companionName}${insigniaDisplay ? ' ' + insigniaDisplay.emoji : ''} · ${userName} · Nivel ${level}`"
      @pointerdown="onBadgeDown"
      @click="onBadgeClick"
    >
      <span class="roam-body" :class="gait ? `is-${gait}` : ''" :style="{ '--lean': `${lean}deg` }">
        <CompanionAvatar :character="character" :size="84" :paused="!open && !roaming" :gait="gait" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.roam-body {
  display: inline-flex;
  transform-origin: 50% 100%;
  transition: transform 0.25s ease;
}
.roam-body.is-walk {
  animation: roam-walk 0.5s ease-in-out infinite;
}
.roam-body.is-run {
  animation: roam-run 0.32s ease-in-out infinite;
}
@keyframes roam-walk {
  0%, 100% { transform: translateY(0) rotate(calc(var(--lean) - 2deg)); }
  50% { transform: translateY(-6px) rotate(calc(var(--lean) + 2deg)); }
}
@keyframes roam-run {
  0%, 100% { transform: translateY(0) scale(1.05, 0.93) rotate(var(--lean)); }
  50% { transform: translateY(-16px) scale(0.96, 1.06) rotate(var(--lean)); }
}
.omni-bg {
  background: radial-gradient(circle at 50% 45%, rgb(var(--c-accent-soft) / 0.55), rgb(var(--c-base)) 78%);
  border: 1px solid rgb(var(--c-border));
}
.omni-text {
  color: rgb(var(--c-accent-deep));
}
.omni-ring {
  background: conic-gradient(from 0deg, rgb(var(--c-surface)), rgb(var(--c-accent-soft)), rgb(var(--c-surface)), rgb(var(--c-accent-soft)), rgb(var(--c-surface)));
  border: 3px solid rgb(var(--c-accent) / 0.55);
  box-shadow: 0 6px 18px rgb(var(--c-accent) / 0.22), inset 0 0 16px rgb(var(--c-accent) / 0.12);
}
.omni-ring-inner {
  background: radial-gradient(circle, rgb(var(--c-surface)) 60%, rgb(var(--c-accent-soft) / 0.6) 100%);
  border: 2px dashed rgb(var(--c-accent) / 0.4);
}
.omni-spin {
  transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.omni-item {
  color: rgb(var(--c-accent));
  background: rgb(var(--c-surface));
  border: 2px solid rgb(var(--c-accent) / 0.45);
  box-shadow: 0 3px 8px rgb(var(--c-accent) / 0.2);
  transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1), box-shadow 0.2s, border-color 0.2s;
}
.omni-item.is-sel {
  border-color: rgb(var(--c-accent));
  background: rgb(var(--c-accent-soft));
  box-shadow: 0 0 0 4px rgb(var(--c-accent) / 0.25), 0 4px 12px rgb(var(--c-accent) / 0.4);
}
.omni-core {
  background: radial-gradient(circle at 50% 40%, rgb(var(--c-surface)), rgb(var(--c-accent-soft)));
  border: 4px solid rgb(var(--c-accent));
  box-shadow: 0 0 0 3px rgb(var(--c-accent) / 0.45), 0 6px 18px rgb(var(--c-accent) / 0.5);
  animation: omni-pulse 2.4s ease-in-out infinite;
  transition: transform 0.15s;
}
.omni-core:active {
  transform: scale(0.92);
}
.omni-mini {
  background: radial-gradient(circle at 35% 30%, rgb(var(--c-accent-soft)), rgb(var(--c-accent)) 70%);
  border: 2px solid rgb(var(--c-surface));
  box-shadow: 0 0 0 2px rgb(var(--c-accent) / 0.4);
}
.omni-arrow {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 1.4rem;
  line-height: 1;
  color: rgb(var(--c-accent-deep));
  border: 2px solid rgb(var(--c-accent) / 0.45);
  background: rgb(var(--c-surface));
}
.omni-arrow:active {
  transform: scale(0.9);
}
@keyframes omni-pulse {
  50% {
    box-shadow: 0 0 0 7px rgb(var(--c-accent) / 0.3), 0 6px 22px rgb(var(--c-accent) / 0.65);
  }
}
@media (prefers-reduced-motion: reduce) {
  .omni-core {
    animation: none;
  }
  .omni-spin,
  .omni-item {
    transition: none;
  }
}
.ac-item {
  position: relative;
  border-left: 3px solid rgb(var(--c-border));
  background: rgb(var(--c-base));
  color: rgb(var(--c-muted));
  border-radius: 0 0.9rem 0.9rem 0;
}
.ac-item:hover {
  color: rgb(var(--c-ink));
  border-left-color: rgb(var(--c-accent) / 0.6);
}
.ac-item.is-active {
  color: rgb(var(--c-ink));
  border-left-color: rgb(var(--c-accent));
  background: linear-gradient(90deg, rgb(var(--c-accent-soft) / 0.7), rgb(var(--c-base)));
  transform: translateX(6px);
}
@media (max-width: 767px) {
  .ac-item {
    border-left-width: 0;
    border-bottom: 3px solid rgb(var(--c-border));
    border-radius: 0.9rem 0.9rem 0 0;
  }
  .ac-item.is-active {
    border-bottom-color: rgb(var(--c-accent));
    transform: none;
  }
}
.dex-screen {
  background-image: radial-gradient(circle at 50% 60%, rgba(255, 255, 255, 0.55), transparent 65%),
    repeating-linear-gradient(0deg, transparent 0 11px, rgba(0, 0, 0, 0.04) 11px 12px);
  background-color: rgba(0, 0, 0, 0.03);
}
.celebration-pop {
  animation: celebration-pop 0.35s ease-out;
}
@keyframes celebration-pop {
  from {
    transform: scale(0.7) translateY(6px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
