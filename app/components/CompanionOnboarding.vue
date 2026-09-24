<script setup lang="ts">
const { characters, completeSetup } = useCompanion()

const emit = defineEmits<{ done: [] }>()

type Step = 'choose' | 'companion' | 'user' | 'sending'
// Pasos que se van "escribiendo" en la carta, en orden; 'sending' no cuenta como dato, es el envío.
const STEP_ORDER: Step[] = ['choose', 'companion', 'user']
const step = ref<Step>('choose')
const stepIndex = computed(() => STEP_ORDER.indexOf(step.value))

const selectedId = ref(characters.find((c) => c.available)?.id ?? '')
const companionNameInput = ref('')
const userNameInput = ref('')

const selectedCharacter = computed(() => characters.find((c) => c.id === selectedId.value) ?? null)
const companionDisplay = computed(() => companionNameInput.value.trim() || 'Mapachín')
const userDisplay = computed(() => userNameInput.value.trim() || 'Amigo')

function chooseCharacter(id: string, available: boolean) {
  if (!available) return
  selectedId.value = id
  // Pequeña pausa para que se note la selección antes de pasar al siguiente dato.
  window.setTimeout(() => {
    if (step.value === 'choose') step.value = 'companion'
  }, 260)
}

function goBack() {
  if (step.value === 'user') step.value = 'companion'
  else if (step.value === 'companion') step.value = 'choose'
}

let finished = false
function finish() {
  if (finished) return
  finished = true
  completeSetup(selectedId.value, companionNameInput.value, userNameInput.value)
  emit('done')
}

function send() {
  if (step.value === 'sending' || !selectedId.value) return
  step.value = 'sending'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Red de seguridad por si el navegador no dispara animationend (o la animación está desactivada).
  window.setTimeout(finish, reduceMotion ? 500 : 1750)
}

/** La carta termina de volar (animación `letter-fly` en el elemento raíz): recién ahí se guarda todo. */
function onLetterAnimationEnd(e: AnimationEvent) {
  if (e.animationName === 'letter-fly') finish()
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-base flex items-center justify-center p-4 sm:p-6 overflow-hidden">
    <div class="w-full max-w-sm flex flex-col items-center gap-5">
      <p v-if="step !== 'sending'" class="text-xs text-muted -mb-1">Antes de empezar</p>

      <!-- Progreso: un dato por paso, como si se fuera llenando la carta -->
      <div v-if="step !== 'sending'" class="flex items-center gap-2">
        <span
          v-for="(s, i) in STEP_ORDER"
          :key="s"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="i <= stepIndex ? 'w-6 bg-accent' : 'w-1.5 bg-border'"
        />
      </div>

      <!-- La carta: se completa paso a paso y, al terminar, se enrolla y sale volando como un avioncito -->
      <div class="letter" :class="step === 'sending' && 'is-sending'" @animationend="onLetterAnimationEnd">
        <div class="letter-face" :class="step === 'sending' && 'is-fading'">
          <div class="letter-seal">
            <CompanionSprite v-if="selectedCharacter" :character="selectedCharacter" :size="46" :paused="step === 'choose'" />
            <AppIcon v-else name="user" :size="18" class="text-muted" />
          </div>

          <Transition name="letter-step" mode="out-in">
            <div v-if="step === 'choose'" key="choose" class="flex flex-col items-center gap-3.5 flex-1">
              <div class="text-center">
                <h1 class="text-lg font-bold text-ink">Elige a tu compañero</h1>
                <p class="text-xs text-muted mt-1">Te va a acompañar mientras organizas tus tareas</p>
              </div>
              <div class="grid grid-cols-3 gap-2.5 w-full">
                <button
                  v-for="c in characters"
                  :key="c.id"
                  type="button"
                  class="relative rounded-2xl border-2 py-3 px-1.5 flex flex-col items-center gap-1.5 transition-colors"
                  :class="[
                    c.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                    selectedId === c.id ? 'border-accent bg-surface-soft' : 'border-border bg-surface-soft/40',
                  ]"
                  :disabled="!c.available"
                  @click="chooseCharacter(c.id, c.available)"
                >
                  <CompanionSprite v-if="c.available" :character="c" :size="42" :paused="selectedId !== c.id" />
                  <div v-else class="w-[42px] h-[42px] rounded-full bg-surface flex items-center justify-center text-muted">
                    <AppIcon name="lock" :size="16" />
                  </div>
                  <span class="text-[10px] text-muted text-center leading-tight">{{ c.available ? c.label : 'Pronto' }}</span>
                </button>
              </div>
            </div>

            <div v-else-if="step === 'companion'" key="companion" class="flex flex-col items-center gap-2.5 flex-1 text-center pt-1">
              <h1 class="text-lg font-bold text-ink">¡Hagamos las presentaciones!</h1>
              <p class="letter-line">Hola, me llamo...</p>
              <input
                v-model="companionNameInput"
                type="text"
                placeholder="Mapachín"
                maxlength="20"
                autofocus
                class="letter-input"
                @keyup.enter="step = 'user'"
              />
              <div class="flex gap-2 w-full mt-auto pt-3">
                <button type="button" class="letter-btn-secondary" aria-label="Atrás" @click="goBack">
                  <AppIcon name="arrow-left" :size="14" />
                </button>
                <button type="button" class="letter-btn-primary" @click="step = 'user'">Continuar</button>
              </div>
            </div>

            <div v-else-if="step === 'user'" key="user" class="flex flex-col items-center gap-2.5 flex-1 text-center pt-1">
              <p class="text-xs text-muted">{{ companionDisplay }} quiere saber cómo te llamas</p>
              <p class="letter-line">Y tú te llamas...</p>
              <input
                v-model="userNameInput"
                type="text"
                placeholder="Tu nombre"
                maxlength="20"
                autofocus
                class="letter-input"
                @keyup.enter="send"
              />
              <div class="flex gap-2 w-full mt-auto pt-3">
                <button type="button" class="letter-btn-secondary" aria-label="Atrás" @click="goBack">
                  <AppIcon name="arrow-left" :size="14" />
                </button>
                <button type="button" class="letter-btn-primary" @click="send">Enviar ✈️</button>
              </div>
            </div>

            <div v-else key="sending" class="flex flex-col items-center gap-1.5 flex-1 justify-center text-center">
              <p class="text-xs text-muted">Con cariño,</p>
              <p class="text-base font-bold text-ink">{{ companionDisplay }} 🦝</p>
              <p class="text-xs text-muted mt-2">Para: {{ userDisplay }}</p>
            </div>
          </Transition>
        </div>

        <svg class="letter-plane" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M6 52L92 10L60 92L48 58Z" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M48 58L92 10L34 64Z" fill="rgb(var(--c-accent-soft))" opacity="0.55" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.letter {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 6.4;
  max-height: 76vh;
  background: rgb(var(--c-surface));
  border: 1px solid rgb(var(--c-border));
  border-radius: 20px;
  box-shadow: 0 16px 32px -12px rgb(0 0 0 / 0.5);
  padding: 20px 18px 18px;
}
.letter-face {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
/* Renglones de carta, detrás del contenido */
.letter-face::before {
  content: '';
  position: absolute;
  inset: 66px 4px 8px;
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 26px, rgb(var(--c-border) / 0.45) 27px);
  pointer-events: none;
  z-index: -1;
}
.letter-seal {
  align-self: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 2px dashed rgb(var(--c-border));
  background: rgb(var(--c-surface-soft));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.letter-line {
  font-family: 'Caveat', cursive;
  font-size: 21px;
  line-height: 1;
  color: rgb(var(--c-muted));
}
.letter-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgb(var(--c-accent));
  text-align: center;
  font-family: 'Caveat', cursive;
  font-size: 30px;
  color: rgb(var(--c-ink));
  padding: 2px 4px 6px;
  outline: none;
}
.letter-input::placeholder {
  color: rgb(var(--c-muted) / 0.55);
}
.letter-btn-primary {
  flex: 1;
  padding: 10px 0;
  border-radius: 999px;
  background: rgb(var(--c-accent));
  color: white;
  font-weight: 600;
  font-size: 13px;
  transition: filter 0.15s, transform 0.1s;
}
.letter-btn-primary:hover {
  filter: brightness(1.06);
}
.letter-btn-primary:active {
  transform: scale(0.98);
}
.letter-btn-secondary {
  width: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgb(var(--c-surface-soft));
  border: 1px solid rgb(var(--c-border));
  color: rgb(var(--c-muted));
  display: flex;
  align-items: center;
  justify-content: center;
}
.letter-btn-secondary:hover {
  color: rgb(var(--c-ink));
}
.letter-plane {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 44%;
  height: 44%;
  opacity: 0;
  z-index: 2;
  pointer-events: none;
}

/* Transición entre pasos dentro de la carta */
.letter-step-enter-active,
.letter-step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.letter-step-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.letter-step-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

/* Envío: la carta se enrolla, se convierte en avioncito y sale volando */
.letter.is-sending {
  animation: letter-fly 1.6s cubic-bezier(0.45, 0, 0.3, 1) forwards;
  pointer-events: none;
}
.letter-face.is-fading {
  animation: letter-face-out 0.5s ease forwards;
}
.letter.is-sending .letter-plane {
  animation: letter-plane-in 0.45s ease 0.3s forwards;
}
@keyframes letter-face-out {
  0%,
  55% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes letter-plane-in {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(-8deg);
  }
}
@keyframes letter-fly {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    border-radius: 20px;
  }
  28% {
    transform: translate(0, -1%) rotate(-3deg) scale(0.9);
    border-radius: 20px;
  }
  55% {
    transform: translate(6%, -14%) rotate(8deg) scale(0.5);
    border-radius: 40%;
  }
  100% {
    transform: translate(170%, -150%) rotate(30deg) scale(0.15);
    border-radius: 50%;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-step-enter-active,
  .letter-step-leave-active {
    transition: opacity 0.12s ease;
  }
  .letter-step-enter-from,
  .letter-step-leave-to {
    transform: none;
  }
  .letter.is-sending {
    animation: letter-fade-out 0.4s ease forwards;
  }
  .letter-face.is-fading,
  .letter.is-sending .letter-plane {
    animation: none;
  }
  @keyframes letter-fade-out {
    to {
      opacity: 0;
    }
  }
}
</style>
