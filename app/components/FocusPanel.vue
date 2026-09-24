<script setup lang="ts">
const { character, companionName } = useCompanion()
const p = usePomodoro()

const PRESETS = [15, 25, 50]
const RADIUS = 70
const CIRC = 2 * Math.PI * RADIUS
const offset = computed(() => CIRC * (1 - p.progress.value))

const avatarMood = computed(() => (p.phase.value === 'focus' ? 'focus' : p.phase.value === 'break' ? 'happy' : undefined))
</script>

<template>
  <div class="flex flex-col items-center gap-4 rounded-xl2 border border-border bg-surface p-5">
    <h3 class="text-sm font-bold text-ink self-start">🍅 Modo enfoque</h3>

    <div class="relative w-[190px] h-[190px] flex items-center justify-center">
      <svg class="absolute inset-0 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" :r="RADIUS" fill="none" stroke="currentColor" class="text-border" stroke-width="8" />
        <circle
          cx="80"
          cy="80"
          :r="RADIUS"
          fill="none"
          stroke="currentColor"
          class="text-accent transition-[stroke-dashoffset] duration-500"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="offset"
        />
      </svg>
      <div class="flex flex-col items-center">
        <CompanionAvatar v-if="character" :character="character" :size="64" :mood="avatarMood" :still="p.phase.value === 'idle'" />
        <span class="text-2xl font-bold text-ink tabular-nums -mt-1">{{ p.label.value }}</span>
      </div>
    </div>

    <p class="text-xs text-muted text-center min-h-[2.2rem]">
      <template v-if="p.phase.value === 'focus'">{{ companionName }} estudia contigo. Si sales de la pestaña, se queda dormidito 💤</template>
      <template v-else-if="p.phase.value === 'break'">Descanso: estira las piernas y toma agüita 💧</template>
      <template v-else>Elige cuánto quieres concentrarte y {{ companionName }} te acompaña.</template>
    </p>

    <div v-if="p.phase.value === 'idle'" class="flex flex-col items-center gap-3 w-full">
      <div class="flex gap-1.5">
        <button
          v-for="m in PRESETS"
          :key="m"
          type="button"
          class="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="p.focusMinutes.value === m ? 'bg-accent text-white' : 'bg-surface-soft text-muted hover:text-ink'"
          @click="p.focusMinutes.value = m"
        >
          {{ m }} min
        </button>
      </div>
      <button type="button" class="w-full max-w-xs py-2.5 rounded-full bg-accent text-white text-sm font-semibold active:scale-[0.99]" @click="p.start()">Empezar a enfocarme</button>
    </div>
    <div v-else class="flex gap-2">
      <button type="button" class="px-5 py-2 rounded-full bg-surface-soft text-ink text-sm font-semibold" @click="p.stop()">Cancelar</button>
    </div>

    <div v-if="p.awayNotice.value && p.phase.value === 'focus'" class="text-xs rounded-xl2 bg-surface-soft text-ink px-3 py-2 text-center">
      Saliste un rato y {{ companionName }} se durmió 💤 — el premio será menor.
    </div>

    <div v-if="p.lastResult.value" class="w-full rounded-xl2 bg-accent-soft/30 border border-accent p-3 text-center flex flex-col gap-2 result">
      <p class="text-sm font-semibold text-ink">
        {{ p.lastResult.value.distracted ? '¡Sesión completada!' : '¡Sesión perfecta! 🎉' }}
      </p>
      <p class="text-xs text-muted">+{{ p.lastResult.value.xp }} XP · +{{ p.lastResult.value.points }} monedas</p>
      <button type="button" class="self-center px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold" @click="p.startBreak()">Tomar un descanso ({{ p.breakMinutes.value }} min)</button>
    </div>
  </div>
</template>

<style scoped>
.result {
  animation: result-pop 0.35s ease-out;
}
@keyframes result-pop {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}
@media (prefers-reduced-motion: reduce) {
  .result {
    animation: none;
  }
}
</style>
