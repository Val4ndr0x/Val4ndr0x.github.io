<script setup lang="ts">
import type { ConfettiBurst } from '~/composables/useConfetti'

const { bursts, remove } = useConfetti()

type Particle = { emoji: string; dx: number; dy: number; rot: number; size: number; delay: number }

const cache = new Map<string, Particle[]>()

function particlesFor(b: ConfettiBurst): Particle[] {
  let list = cache.get(b.id)
  if (list) return list
  list = Array.from({ length: b.count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / b.count + Math.random() * 0.6
    const dist = 50 + Math.random() * 90
    return {
      emoji: b.emojis[Math.floor(Math.random() * b.emojis.length)]!,
      dx: Math.cos(angle) * dist,
      // Sube primero y termina cayendo: el destino vertical incluye la "gravedad".
      dy: Math.sin(angle) * dist - 30 + 90,
      rot: (Math.random() - 0.5) * 240,
      size: 13 + Math.random() * 10,
      delay: Math.random() * 0.12,
    }
  })
  cache.set(b.id, list)
  window.setTimeout(() => {
    cache.delete(b.id)
    remove(b.id)
  }, 1700)
  return list
}
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-[70] overflow-hidden" aria-hidden="true">
    <div v-for="b in bursts" :key="b.id" class="absolute" :style="{ left: `${b.x}px`, top: `${b.y}px` }">
      <span
        v-for="(p, i) in particlesFor(b)"
        :key="i"
        class="confetti-piece"
        :style="{ fontSize: `${p.size}px`, '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`, animationDelay: `${p.delay}s` }"
      >
        {{ p.emoji }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.confetti-piece {
  position: absolute;
  left: 0;
  top: 0;
  line-height: 1;
  opacity: 0;
  animation: confetti-fly 1.5s cubic-bezier(0.2, 0.7, 0.4, 1) forwards;
}
@keyframes confetti-fly {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(var(--rot));
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .confetti-piece {
    animation-duration: 0.01s;
  }
}
</style>
