<script setup lang="ts">
import type { CompanionCharacter } from '~/composables/useCompanion'
import type { MoodId } from '~/composables/useCompanionState'

// Estilo Talking Tom (mantenla pulsada para agarrarla como un muñequito y arrastrarla; al soltarla cae y vuelve a su sitio): deslizar el dedo la acaricia, un toque seco la golpea (se queja y llora) y se le da de comer soltándole la comida encima.
const props = withDefaults(defineProps<{ character: CompanionCharacter; size?: number; mood?: MoodId }>(), { size: 110 })
const emit = defineEmits<{ pet: []; hit: [count: number]; comfort: [] }>()

const { play } = useSound()

const root = ref<HTMLElement | null>(null)
const hearts = ref<{ id: number; x: number; y: number }[]>([])
const petting = ref(false)
const eating = ref(false)
const flying = ref<string | null>(null)
const hurt = ref(false)
const punching = ref(false)
const punchKey = ref(0)
let punchTimer: ReturnType<typeof setTimeout> | null = null
const petState = useCompanionState()
const punchSize = computed(() => Math.round(props.size * petState.stage.value.scale * 0.88))
const crying = ref(false)
const hurtText = ref('')
const impacts = ref<{ id: number; x: number; y: number }[]>([])
const flip = ref(1)
const dragEl = ref<HTMLElement | null>(null)
const grabbed = ref(false)
const dropping = ref(false)
const dx = ref(0)
const dy = ref(0)
const tilt = ref(0)
let grabX = 0
let grabY = 0
let holdTimer: ReturnType<typeof setTimeout> | null = null
let uid = 0
let down = false
let lastX = 0
let lastY = 0
let dist = 0
let strokes = 0
let eatTimer: ReturnType<typeof setTimeout> | null = null
let hurtTimer: ReturnType<typeof setTimeout> | null = null
let downAt = 0
let travelled = 0
let hitCount = 0
let hitWindow: ReturnType<typeof setTimeout> | null = null

function spawnHeart(e: PointerEvent) {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const id = ++uid
  hearts.value.push({ id, x: e.clientX - rect.left, y: e.clientY - rect.top })
  setTimeout(() => {
    hearts.value = hearts.value.filter((h) => h.id !== id)
  }, 1000)
}

function onDown(e: PointerEvent) {
  down = true
  downAt = performance.now()
  lastX = e.clientX
  lastY = e.clientY
  dist = 0
  travelled = 0
  strokes = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  if (holdTimer) clearTimeout(holdTimer)
  // Si se mantiene pulsada sin acariciar, se la agarra.
  holdTimer = setTimeout(() => {
    if (!down || petting.value || travelled >= 12 || dropping.value) return
    grabbed.value = true
    grabX = lastX
    grabY = lastY
    dx.value = 0
    dy.value = 0
    play('pop')
  }, 380)
}

function onMove(e: PointerEvent) {
  if (!down) return
  if (grabbed.value) {
    tilt.value = Math.max(-18, Math.min(18, (e.clientX - lastX) * 1.4 + tilt.value * 0.6))
    lastX = e.clientX
    lastY = e.clientY
    dx.value = e.clientX - grabX
    dy.value = e.clientY - grabY
    return
  }
  const step = Math.hypot(e.clientX - lastX, e.clientY - lastY)
  travelled += step
  lastX = e.clientX
  lastY = e.clientY
  // Hasta que el gesto se vuelve un arrastre, todavía podría ser un golpe.
  if (travelled < 12) return
  if (!petting.value) {
    petting.value = true
    emit('pet')
  }
  dist += step
  if (dist > 46) {
    dist = 0
    strokes++
    spawnHeart(e)
    play(strokes % 3 === 0 ? 'sparkle' : 'pop')
    if (hurt.value && strokes >= 2) comfort()
  }
}

/** Al soltarla cae con gravedad, rebota aplastándose y queda en su lugar. */
function release() {
  const x = dx.value
  const y = dy.value
  const r = tilt.value
  grabbed.value = false
  dropping.value = true
  const fallMs = Math.min(650, 260 + Math.hypot(x, y) * 0.9)
  const total = fallMs / 0.55
  const done = () => {
    dropping.value = false
    dx.value = 0
    dy.value = 0
    tilt.value = 0
  }
  const el = dragEl.value
  if (!el || typeof el.animate !== 'function') return done()
  setTimeout(() => play('land'), fallMs)
  const anim = el.animate(
    [
      { transform: `translate(${x}px, ${y}px) rotate(${r}deg)`, offset: 0, easing: 'cubic-bezier(0.55, 0, 0.9, 0.6)' },
      { transform: 'translate(0, 0) rotate(0deg) scale(1.14, 0.8)', offset: 0.55, easing: 'ease-out' },
      { transform: 'translate(0, -18px) scale(0.95, 1.06)', offset: 0.72, easing: 'ease-in' },
      { transform: 'translate(0, 0) scale(1.06, 0.93)', offset: 0.86 },
      { transform: 'translate(0, 0) scale(1, 1)', offset: 1 },
    ],
    { duration: total },
  )
  anim.onfinish = done
  anim.oncancel = done
}

function onUp(e: PointerEvent) {
  if (holdTimer) clearTimeout(holdTimer)
  if (grabbed.value) {
    down = false
    petting.value = false
    release()
    return
  }
  const wasTap = down && !petting.value && travelled < 12 && performance.now() - downAt < 350
  down = false
  petting.value = false
  if (wasTap) hit(e)
}

function endHurt() {
  hurt.value = false
  crying.value = false
  hurtText.value = ''
}

/** Un toque seco: golpecito en la barriga o la cara. */
function hit(e: PointerEvent) {
  const rect = root.value?.getBoundingClientRect()
  if (rect) {
    const id = ++uid
    const x = e.clientX - rect.left
    flip.value = x < rect.width / 2 ? 1 : -1 // se echa hacia el lado contrario al golpe
    impacts.value.push({ id, x, y: e.clientY - rect.top })
    setTimeout(() => {
      impacts.value = impacts.value.filter((i) => i.id !== id)
    }, 600)
  }
  hitCount++
  if (hitWindow) clearTimeout(hitWindow)
  hitWindow = setTimeout(() => (hitCount = 0), 4000)

  // La animación del golpe se ve una sola vez por golpe (se reinicia si vuelve a pegarle).
  punching.value = true
  punchKey.value++
  if (punchTimer) clearTimeout(punchTimer)
  punchTimer = setTimeout(() => (punching.value = false), 1300)

  hurt.value = true
  crying.value = hitCount >= 3
  hurtText.value = crying.value ? '¡Buaaa! 😭' : ['¡Ay! 😣', '¡Auch! 🥺', '¡Eso dolió! 😢'][hitCount % 3]!
  play(crying.value ? 'cry' : 'ouch')
  if (hurtTimer) clearTimeout(hurtTimer)
  hurtTimer = setTimeout(endHurt, crying.value ? 6000 : 3200)
  emit('hit', hitCount)
}

/** Los mimos la consuelan. */
function comfort() {
  if (hurtTimer) clearTimeout(hurtTimer)
  if (punchTimer) clearTimeout(punchTimer)
  punching.value = false
  endHurt()
  hitCount = 0
  emit('comfort')
}

/** Llamado desde fuera: la comida vuela hasta la boca y la mascota mastica. */
function eat(emoji: string) {
  flying.value = emoji
  eating.value = true
  if (eatTimer) clearTimeout(eatTimer)
  setTimeout(() => (flying.value = null), 520)
  eatTimer = setTimeout(() => (eating.value = false), 1700)
}

onBeforeUnmount(() => {
  if (eatTimer) clearTimeout(eatTimer)
  if (hurtTimer) clearTimeout(hurtTimer)
  if (holdTimer) clearTimeout(holdTimer)
  if (punchTimer) clearTimeout(punchTimer)
  if (hitWindow) clearTimeout(hitWindow)
})

defineExpose({ el: root, eat })

const avatarMood = computed<MoodId | undefined>(() => (grabbed.value ? 'excited' : hurt.value ? 'sad' : petting.value || eating.value ? 'excited' : props.mood))
</script>

<template>
  <div
    ref="root"
    class="pet-play relative inline-block select-none cursor-grab active:cursor-grabbing"
    :class="{ 'is-grabbed': grabbed, 'is-petting': petting, 'is-eating': eating, 'is-hurt': hurt, 'is-crying': crying }"
    :style="{ '--flip': flip, touchAction: 'none' }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div ref="dragEl" class="pet-drag" :style="grabbed || dropping ? { transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg)`, zIndex: 30, position: 'relative' } : undefined">
    <div class="pet-body" :class="{ 'is-dangling': grabbed }">
      <div
        v-if="punching"
        class="inline-flex items-end justify-center"
        :style="{ width: `${Math.round(size * 1.15)}px`, height: `${Math.round(size * 1.1)}px` }"
      >
        <CompanionSprite :key="punchKey" :character="MAPACHIN_ANIMS.punch" :size="punchSize" :speed="1.2" once />
      </div>
      <CompanionAvatar v-else :character="character" :size="size" :mood="avatarMood" />
    </div>
    </div>

    <span
      v-for="h in hearts"
      :key="h.id"
      class="heart pointer-events-none absolute text-lg leading-none"
      :style="{ left: `${h.x}px`, top: `${h.y}px` }"
    >💗</span>

    <span
      v-for="i in impacts"
      :key="i.id"
      class="impact pointer-events-none absolute text-2xl leading-none"
      :style="{ left: `${i.x}px`, top: `${i.y}px` }"
    >💥</span>

    <template v-if="hurt">
      <span class="tear tear-l pointer-events-none absolute text-base leading-none">💧</span>
      <span class="tear tear-r pointer-events-none absolute text-base leading-none">💧</span>
      <template v-if="crying">
        <span class="tear tear-l tear-2 pointer-events-none absolute text-base leading-none">💧</span>
        <span class="tear tear-r tear-2 pointer-events-none absolute text-base leading-none">💧</span>
      </template>
      <span class="nom pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 whitespace-nowrap bg-surface border border-border rounded-full px-2 py-0.5 text-[11px] font-semibold text-ink">
        {{ hurtText }}
      </span>
    </template>

    <span v-if="flying" class="fly pointer-events-none absolute left-1/2 top-[38%] text-3xl leading-none">{{ flying }}</span>
    <span v-if="eating" class="nom pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 whitespace-nowrap bg-surface border border-border rounded-full px-2 py-0.5 text-[11px] font-semibold text-ink">
      ¡Ñam ñam! 😋
    </span>
  </div>
</template>

<style scoped>
.pet-drag {
  transform-origin: 50% 20%;
  will-change: transform;
}
.is-grabbed {
  cursor: grabbing !important;
}
.is-dangling {
  transform-origin: 50% 0%;
  animation: pet-dangle 0.7s ease-in-out infinite !important;
}
@keyframes pet-dangle {
  0%, 100% { transform: rotate(-3deg) scale(0.96, 1.06); }
  50% { transform: rotate(3deg) scale(0.96, 1.06); }
}
.is-hurt .pet-body {
  animation: pet-recoil 0.45s ease-out, pet-sob 0.5s ease-in-out 0.45s infinite;
}
.is-crying .pet-body {
  animation: pet-recoil 0.45s ease-out, pet-sob 0.28s ease-in-out 0.45s infinite;
}
@keyframes pet-recoil {
  0% { transform: translateX(0) rotate(0) scale(1); }
  25% { transform: translateX(calc(var(--flip) * 12px)) rotate(calc(var(--flip) * 9deg)) scale(0.88, 1.08); }
  60% { transform: translateX(calc(var(--flip) * -4px)) rotate(calc(var(--flip) * -3deg)) scale(1.05, 0.95); }
  100% { transform: translateX(0) rotate(0) scale(1); }
}
@keyframes pet-sob {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(2px) scale(1.03, 0.96); }
}
.impact {
  animation: impact-pop 0.6s ease-out forwards;
}
@keyframes impact-pop {
  from { transform: translate(-50%, -50%) scale(0.4) rotate(-15deg); opacity: 1; }
  to { transform: translate(-50%, -50%) scale(1.5) rotate(10deg); opacity: 0; }
}
.tear {
  top: 42%;
  animation: tear-fall 0.9s ease-in infinite;
}
.tear-l { left: 36%; }
.tear-r { left: 58%; }
.tear-2 { animation-delay: 0.45s; }
@keyframes tear-fall {
  from { transform: translateY(0) scale(0.8); opacity: 0.95; }
  to { transform: translateY(34px) scale(1); opacity: 0; }
}
.pet-body {
  transform-origin: 50% 100%;
}
.is-petting .pet-body {
  animation: pet-wobble 0.5s ease-in-out infinite;
}
.is-eating .pet-body {
  animation: pet-chomp 0.42s ease-in-out 4;
}
@keyframes pet-wobble {
  0%, 100% { transform: rotate(-3deg) scale(1.03, 0.97); }
  50% { transform: rotate(3deg) scale(0.97, 1.03); }
}
@keyframes pet-chomp {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.1, 0.88); }
}
.heart {
  animation: heart-up 1s ease-out forwards;
}
@keyframes heart-up {
  from { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
  to { transform: translate(-50%, -260%) scale(1.3); opacity: 0; }
}
.fly {
  animation: food-fly 0.5s ease-in forwards;
}
@keyframes food-fly {
  from { transform: translate(-50%, -190%) scale(1.3); opacity: 1; }
  to { transform: translate(-50%, 0) scale(0.2); opacity: 0; }
}
.nom {
  animation: nom-pop 0.25s ease-out;
}
@keyframes nom-pop {
  from { transform: translate(-50%, 6px) scale(0.7); opacity: 0; }
  to { transform: translate(-50%, 0) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .pet-body, .heart, .fly, .nom, .impact, .tear { animation: none !important; }
}
</style>
