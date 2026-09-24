<script setup lang="ts">
import type { CompanionCharacter } from '~/composables/useCompanion'

const props = withDefaults(
  defineProps<{
    character: CompanionCharacter
    size?: number
    speed?: number
    paused?: boolean
    once?: boolean
    /** Segundos de un ciclo completo: queda quieto y solo se mueve (20% del ciclo) de vez en cuando. */
    idleEvery?: number
  }>(),
  {
    size: 96,
    speed: 0.9,
    paused: false,
    once: false,
    idleEvery: 0,
  },
)

const displayHeight = computed(() => props.size)
const displayWidth = computed(() => Math.round((props.character.frameWidth / props.character.frameHeight) * props.size))
// En modo `once` se recorre hasta el último frame y se queda ahí (no vuelve a empezar).
const sheetShift = computed(() => -(displayWidth.value * (props.character.frames - (props.once ? 1 : 0))))
</script>

<template>
  <div class="relative shrink-0" :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }">
  <div
    class="companion-sprite"
    :class="{ 'is-idle': idleEvery && !once }"
    :style="{
      width: displayWidth + 'px',
      height: displayHeight + 'px',
      backgroundImage: `url(${character.sprite})`,
      backgroundSize: `${displayWidth * character.frames}px ${displayHeight}px`,
      animationDuration: `${idleEvery || speed}s`,
      animationTimingFunction: `steps(${character.frames - (once ? 1 : 0)})`,
      animationIterationCount: once ? 1 : undefined,
      animationFillMode: once ? 'forwards' : undefined,
      animationPlayState: paused ? 'paused' : 'running',
      backgroundPositionX: paused ? '0px' : undefined,
      '--sprite-shift': sheetShift + 'px',
    }"
  />
  </div>
</template>

<style scoped>
.companion-sprite {
  background-repeat: no-repeat;
  background-position: 0 0;
  animation-name: companion-frame;
  animation-iteration-count: infinite;
}
.companion-sprite.is-idle {
  animation-name: companion-frame-idle;
}
@keyframes companion-frame-idle {
  0%,
  80% {
    background-position-x: 0px;
  }
  100% {
    background-position-x: var(--sprite-shift);
  }
}
@keyframes companion-frame {
  from {
    background-position-x: 0px;
  }
  to {
    background-position-x: var(--sprite-shift);
  }
}
</style>
