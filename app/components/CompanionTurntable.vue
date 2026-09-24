<script setup lang="ts">
import type { CompanionCharacter } from '~/composables/useCompanion'

// Escenario 3D: la mascota (un solo sprite plano, liviano) gira sobre una tarima.
// Se arrastra para girarla como en un selector de jugador de FIFA; al soltar sigue con inercia.
const props = withDefaults(defineProps<{ character: CompanionCharacter; size?: number }>(), { size: 150 })

const angle = ref(0)
const dragging = ref(false)
let lastX = 0
let velocity = 0
let raf = 0

function stopInertia() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function onDown(e: PointerEvent) {
  stopInertia()
  dragging.value = true
  lastX = e.clientX
  velocity = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - lastX
  lastX = e.clientX
  angle.value += dx * 0.7
  velocity = dx * 0.7
}

function onUp() {
  if (!dragging.value) return
  dragging.value = false
  const tick = () => {
    velocity *= 0.94
    angle.value += velocity
    if (Math.abs(velocity) > 0.05) raf = requestAnimationFrame(tick)
    else raf = 0
  }
  raf = requestAnimationFrame(tick)
}

// Vuelve de frente por el camino más corto.
function faceFront() {
  stopInertia()
  const target = Math.round(angle.value / 360) * 360
  const start = angle.value
  const t0 = performance.now()
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / 500)
    angle.value = start + (target - start) * (1 - Math.pow(1 - k, 3))
    if (k < 1) raf = requestAnimationFrame(step)
    else raf = 0
  }
  raf = requestAnimationFrame(step)
}

function spin(dir: 1 | -1) {
  stopInertia()
  velocity = dir * 14
  onUp()
}

const facing = computed(() => {
  const a = ((angle.value % 360) + 360) % 360
  if (a < 45 || a >= 315) return 'De frente'
  if (a < 135) return 'De perfil'
  if (a < 225) return 'De espaldas'
  return 'De perfil'
})

onBeforeUnmount(stopInertia)
</script>

<template>
  <div class="turntable relative select-none">
    <div class="stage" :class="dragging ? 'cursor-grabbing' : 'cursor-grab'" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @dblclick="faceFront">
      <div class="figure" :style="{ transform: `rotateY(${angle}deg)` }">
        <CompanionSprite :character="character" :size="size" :idle-every="5.5" />
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 mt-2">
      <button type="button" class="tt-btn" aria-label="Girar a la izquierda" @click="spin(-1)">⟲</button>
      <span class="min-w-[5.5rem] text-center text-[11px] font-bold text-muted">{{ facing }}</span>
      <button type="button" class="tt-btn" aria-label="Girar a la derecha" @click="spin(1)">⟳</button>
    </div>
    <p class="text-[10px] text-muted text-center mt-0.5">Arrastra para girar · doble toque para enfrentarlo</p>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  touch-action: none;
  perspective: 700px;
}
.figure {
  pointer-events: none;
}
.tt-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid rgb(var(--c-accent) / 0.45);
  background: rgb(var(--c-surface));
  color: rgb(var(--c-accent-deep));
  font-size: 1.1rem;
  line-height: 1;
}
.tt-btn:active {
  transform: scale(0.9);
}
</style>
