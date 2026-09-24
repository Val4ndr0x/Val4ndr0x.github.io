<script setup lang="ts">
import type { CompanionCharacter } from '~/composables/useCompanion'
import type { MoodId, StageId } from '~/composables/useCompanionState'

// Mascota con vida: cambia de tamaño según su etapa, nace de un huevito y refleja su humor.
const props = withDefaults(
  defineProps<{ character: CompanionCharacter; size?: number; paused?: boolean; stage?: StageId; mood?: MoodId; still?: boolean; gait?: 'walk' | 'run' | null }>(),
  { size: 96, paused: false, still: false, gait: null },
)

const state = useCompanionState()
const { level } = useCompanion()

const stageId = computed<StageId>(() => props.stage ?? state.stage.value.id)
const moodId = computed<MoodId>(() => props.mood ?? state.mood.value)
const scale = computed(() => (props.stage ? (state.stage.value.id === props.stage ? state.stage.value.scale : 1) : state.stage.value.scale))
const spriteSize = computed(() => Math.round(props.size * scale.value))
const isEgg = computed(() => stageId.value === 'huevo' && level.value < 2)
const sleeping = computed(() => moodId.value === 'sleeping')
// Triste (hambre, sed o días sin venir): Mapachín se ve abandonado, llorando en el suelo.
const abandoned = computed(() => moodId.value === 'sad' && props.character.id === 'mapache' && !isEgg.value)
const abandonedSize = computed(() => Math.round(spriteSize.value * 0.88))
</script>

<template>
  <div
    class="avatar relative inline-flex items-end justify-center shrink-0"
    :class="[`mood-${moodId}`, `stage-${stageId}`, still ? 'is-still' : '']"
    :style="{ width: `${Math.round(size * 1.15)}px`, height: `${Math.round(size * 1.1)}px` }"
  >
    <span v-if="stageId === 'legendario'" class="aura" />

    <svg v-if="isEgg" class="egg" :width="size * 0.7" :height="size * 0.85" viewBox="0 0 60 74" aria-label="Huevito">
      <path d="M30 3C16 3 6 26 6 44c0 16 10 27 24 27s24-11 24-27C54 26 44 3 30 3z" fill="#fff4e0" stroke="#e3c9a3" stroke-width="2" />
      <path d="M8 40l8-6 7 7 7-8 7 8 7-7 8 6" fill="none" stroke="#e3c9a3" stroke-width="2" stroke-linejoin="round" />
      <circle cx="20" cy="54" r="4" fill="#f4c3d8" />
      <circle cx="38" cy="58" r="3" fill="#f4c3d8" />
      <circle cx="33" cy="22" r="3" fill="#ffd9e6" />
    </svg>
    <CompanionSprite v-else-if="abandoned" class="sad-pet" :character="MAPACHIN_ANIMS.abandoned" :size="abandonedSize" :idle-every="7" :paused="paused" />
    <CompanionSprite v-else class="pet" :character="character" :size="spriteSize" :idle-every="gait ? 0 : 5.5" :speed="gait === 'run' ? 0.45 : 0.8" :paused="paused || sleeping || still" />

    <span v-if="sleeping" class="badge zzz">💤</span>
    <template v-else-if="moodId === 'sad'">
      <span class="tear tear-l pointer-events-none absolute leading-none">💧</span>
      <span class="tear tear-r tear-2 pointer-events-none absolute leading-none">💧</span>
    </template>
    <span v-else-if="moodId === 'excited'" class="badge sparkle">✨</span>
    <span v-else-if="moodId === 'focus'" class="badge book">📚</span>
  </div>
</template>

<style scoped>
.avatar {
  position: relative;
}
.pet,
.egg {
  transform-origin: 50% 100%;
}
/* Con vida: respira apoyada en los pies y, junto con su movimiento de lado a lado, da un saltito y se ladea. */
.mood-happy .pet {
  animation: avatar-breathe 2.6s ease-in-out infinite;
}
.mood-happy:not(.is-still),
.mood-focus:not(.is-still) {
  animation: avatar-alive 5.5s ease-in-out infinite;
  transform-origin: 50% 100%;
}
.mood-excited .pet {
  animation: avatar-bounce 0.9s ease-in-out infinite;
}
.sad-pet {
  transform-origin: 50% 100%;
  animation: avatar-breathe 3.4s ease-in-out infinite;
}
.is-still .sad-pet {
  animation: none;
}
.mood-sad .pet {
  filter: saturate(0.55);
  animation: avatar-droop 4s ease-in-out infinite;
}
.mood-sleeping .pet {
  filter: brightness(0.75) saturate(0.7);
  transform: scaleY(0.94);
}
.mood-focus .pet {
  animation: avatar-breathe 3.4s ease-in-out infinite;
}
.egg {
  animation: egg-wobble 3.6s ease-in-out infinite;
}
.is-still .pet,
.is-still .egg {
  animation: none;
}
.aura {
  position: absolute;
  inset: 8% 6% 0;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 226, 140, 0.55), transparent 70%);
  animation: aura-pulse 2.8s ease-in-out infinite;
}
.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 0.95em;
  line-height: 1;
  pointer-events: none;
}
.zzz {
  animation: zzz-rise 2.6s ease-in-out infinite;
}
.tear {
  top: 42%;
  font-size: 0.85em;
  animation: tear-fall 1.8s ease-in infinite;
}
.tear-l {
  left: 36%;
}
.tear-r {
  left: 58%;
}
.tear-2 {
  animation-delay: 0.9s;
}
@keyframes tear-fall {
  from {
    transform: translateY(0) scale(0.8);
    opacity: 0.95;
  }
  to {
    transform: translateY(28px) scale(1);
    opacity: 0;
  }
}
.sparkle {
  animation: aura-pulse 1.1s ease-in-out infinite;
}
@keyframes avatar-breathe {
  0%,
  100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(0.985, 1.035);
  }
}
@keyframes avatar-alive {
  0%,
  78%,
  100% {
    transform: translateY(0) rotate(0);
  }
  82% {
    transform: translateY(-6px) rotate(-3deg);
  }
  88% {
    transform: translateY(0) rotate(2deg);
  }
  93% {
    transform: translateY(-3px) rotate(-1.5deg);
  }
  97% {
    transform: translateY(0) rotate(0.5deg);
  }
}
@keyframes avatar-float {
  50% {
    transform: translateY(-3px);
  }
}
@keyframes avatar-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  40% {
    transform: translateY(-9px) scale(0.97, 1.05);
  }
  70% {
    transform: translateY(0) scale(1.04, 0.95);
  }
}
@keyframes avatar-droop {
  50% {
    transform: translateY(2px) scaleY(0.96);
  }
}
@keyframes egg-wobble {
  0%,
  100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(-5deg);
  }
  40% {
    transform: rotate(4deg);
  }
  60% {
    transform: rotate(0);
  }
}
@keyframes aura-pulse {
  50% {
    opacity: 0.55;
    transform: scale(1.06);
  }
}
@keyframes zzz-rise {
  0% {
    transform: translateY(4px);
    opacity: 0.3;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateY(-8px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pet,
  .egg,
  .aura,
  .badge {
    animation: none !important;
  }
}
</style>
