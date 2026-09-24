<script setup lang="ts">
const { fx } = useCuteTheme()

type Item = { left: number; size: number; dur: number; delay: number; drift: number; top: number }

// Posiciones fijas por sesión: se generan una vez para no "saltar" al re-renderizar.
const items: Item[] = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 47 + Math.random() * 30) % 100,
  size: 0.7 + Math.random() * 0.9,
  dur: 9 + Math.random() * 9,
  delay: -Math.random() * 16,
  drift: (Math.random() - 0.5) * 120,
  top: Math.random() * 90,
}))

const EMOJI: Record<string, string> = { petalos: '🌸', nubes: '☁️', luciernagas: '✨', estrellas: '⭐' }
</script>

<template>
  <div v-if="fx !== 'none'" class="ambient fixed inset-0 pointer-events-none overflow-hidden z-[5]" aria-hidden="true">
    <template v-if="fx === 'lluvia'">
      <span
        v-for="(it, i) in items"
        :key="i"
        class="rain-drop"
        :style="{ left: `${it.left}%`, animationDuration: `${0.9 + it.size * 0.5}s`, animationDelay: `${it.delay / 8}s`, height: `${10 + it.size * 12}px` }"
      />
    </template>
    <template v-else-if="fx === 'nubes'">
      <span
        v-for="(it, i) in items.slice(0, 7)"
        :key="i"
        class="cloud"
        :style="{ top: `${it.top}%`, fontSize: `${34 + it.size * 40}px`, animationDuration: `${50 + it.dur * 4}s`, animationDelay: `${it.delay * 3}s` }"
      >
        ☁️
      </span>
    </template>
    <template v-else-if="fx === 'luciernagas'">
      <span
        v-for="(it, i) in items"
        :key="i"
        class="firefly"
        :style="{ left: `${it.left}%`, top: `${it.top}%`, animationDuration: `${4 + it.dur / 2}s`, animationDelay: `${it.delay / 2}s`, '--drift': `${it.drift / 3}px` }"
      />
    </template>
    <template v-else-if="fx === 'estrellas'">
      <span
        v-for="(it, i) in items"
        :key="i"
        class="twinkle"
        :style="{ left: `${it.left}%`, top: `${it.top}%`, fontSize: `${8 + it.size * 10}px`, animationDuration: `${2 + it.size * 2}s`, animationDelay: `${it.delay / 4}s` }"
      >
        {{ i % 3 === 0 ? '⭐' : '✦' }}
      </span>
    </template>
    <template v-else>
      <span
        v-for="(it, i) in items"
        :key="i"
        class="faller"
        :style="{ left: `${it.left}%`, fontSize: `${12 + it.size * 10}px`, animationDuration: `${it.dur}s`, animationDelay: `${it.delay}s`, '--drift': `${it.drift}px` }"
      >
        {{ EMOJI[fx] }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.faller {
  position: absolute;
  top: -30px;
  opacity: 0.75;
  animation: fall linear infinite;
}
@keyframes fall {
  to {
    transform: translate(var(--drift), 108vh) rotate(360deg);
  }
}
.rain-drop {
  position: absolute;
  top: -30px;
  width: 1.5px;
  border-radius: 2px;
  background: linear-gradient(to bottom, transparent, rgba(140, 180, 230, 0.6));
  animation: rain linear infinite;
}
@keyframes rain {
  to {
    transform: translateY(110vh);
  }
}
.cloud {
  position: absolute;
  left: -15%;
  opacity: 0.45;
  animation: cloud-drift linear infinite;
}
@keyframes cloud-drift {
  to {
    transform: translateX(130vw);
  }
}
.firefly {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #ffe98a;
  box-shadow: 0 0 10px 3px rgba(255, 228, 120, 0.7);
  animation: firefly ease-in-out infinite alternate;
}
@keyframes firefly {
  0% {
    transform: translate(0, 0);
    opacity: 0.1;
  }
  50% {
    opacity: 0.95;
  }
  100% {
    transform: translate(var(--drift), -40px);
    opacity: 0.15;
  }
}
.twinkle {
  position: absolute;
  color: #ffe9a8;
  animation: twinkle ease-in-out infinite alternate;
}
@keyframes twinkle {
  from {
    opacity: 0.15;
    transform: scale(0.7);
  }
  to {
    opacity: 0.9;
    transform: scale(1.15);
  }
}
@media (prefers-reduced-motion: reduce) {
  .faller,
  .rain-drop,
  .cloud,
  .firefly,
  .twinkle {
    animation: none;
  }
}
</style>
