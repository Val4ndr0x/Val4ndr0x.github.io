<script setup lang="ts">
import { daysUntil } from '~/composables/useKeepsakes'
import { toDateKey, addDays } from '~/utils/calendarDate'

const k = useKeepsakes()
const { companionName } = useCompanion()
const { celebrate } = useConfetti()

// ── Gratitud ──
const gratitudeText = ref('')
function saveGratitude() {
  k.addGratitude(gratitudeText.value)
  gratitudeText.value = ''
}
const gratitudeShown = computed(() => k.gratitude.value.slice(0, 6))

// ── Cápsula ──
const capsuleText = ref('')
const capsuleDate = ref('')
const capsuleError = ref('')
const today = toDateKey(new Date())
const CAPSULE_PRESETS = [
  { label: '1 semana', days: 7 },
  { label: '1 mes', days: 30 },
  { label: '3 meses', days: 90 },
  { label: '1 año', days: 365 },
]
function presetDate(days: number) {
  capsuleDate.value = toDateKey(addDays(new Date(), days))
}
function saveCapsule() {
  capsuleError.value = ''
  if (!capsuleText.value.trim()) return (capsuleError.value = 'Escribe un mensaje para tu yo del futuro.')
  if (!capsuleDate.value || capsuleDate.value <= today) return (capsuleError.value = 'Elige una fecha futura.')
  if (k.addCapsule(capsuleText.value, capsuleDate.value)) {
    capsuleText.value = ''
    capsuleDate.value = ''
    useSound().play('buy')
  }
}
const shownCapsule = ref<string | null>(null)
function openCapsule(id: string) {
  if (k.openCapsule(id)) {
    shownCapsule.value = id
    celebrate('estrellas')
  }
}

// ── Cuenta regresiva ──
const cdTitle = ref('')
const cdDate = ref('')
const cdEmoji = ref('🎉')
const CD_EMOJIS = ['🎉', '🎂', '✈️', '💍', '🎓', '🏖️', '🎄', '💌']
function saveCountdown() {
  k.addCountdown(cdTitle.value, cdDate.value, cdEmoji.value)
  cdTitle.value = ''
  cdDate.value = ''
}
function daysLabel(date: string) {
  const d = daysUntil(date)
  if (d === 0) return '¡Es hoy! 🎉'
  if (d === 1) return 'Mañana'
  if (d < 0) return `Hace ${-d} ${d === -1 ? 'día' : 'días'}`
  return `Faltan ${d} días`
}

const inputCls = 'w-full bg-base text-ink placeholder-muted rounded-xl2 px-3 py-2 text-sm outline-none border border-border focus:border-accent'
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Cartita del día -->
    <section class="rounded-xl2 border border-border bg-surface p-4">
      <h3 class="text-sm font-bold text-ink mb-2">💌 Cartita del día</h3>
      <button
        v-if="!k.letterOpened.value"
        type="button"
        class="w-full flex flex-col items-center gap-1 rounded-xl2 bg-accent-soft/30 border-2 border-dashed border-accent py-6 hover:bg-accent-soft/50 transition-colors"
        @click="k.openLetter()"
      >
        <span class="text-5xl leading-none envelope">✉️</span>
        <span class="text-sm font-semibold text-ink">{{ companionName }} te dejó una cartita</span>
        <span class="text-[11px] text-muted">Toca para abrirla</span>
      </button>
      <div v-else class="rounded-xl2 bg-[#fff8ec] text-black/75 px-4 py-4 shadow-sm letter">
        <p class="text-sm leading-relaxed">{{ k.todayLetter.value }}</p>
        <p class="text-right text-xs mt-2 text-black/50">— {{ companionName }} 🐾</p>
      </div>

      <details v-if="k.pastLetters.value.length > 1" class="mt-3">
        <summary class="text-xs text-muted cursor-pointer">Cartitas anteriores</summary>
        <ul class="mt-2 flex flex-col gap-1.5">
          <li v-for="l in k.pastLetters.value.slice(1)" :key="l.date" class="text-xs text-ink bg-surface-soft rounded-xl2 px-3 py-2">
            <span class="text-muted">{{ l.date }}</span> · {{ l.text }}
          </li>
        </ul>
      </details>
    </section>

    <!-- Gratitud -->
    <section class="rounded-xl2 border border-border bg-surface p-4">
      <h3 class="text-sm font-bold text-ink mb-2">💗 Diario de gratitud</h3>
      <form class="flex gap-2" @submit.prevent="saveGratitude">
        <input v-model="gratitudeText" type="text" maxlength="140" placeholder="Hoy agradezco…" :class="inputCls" />
        <button type="submit" class="shrink-0 px-4 rounded-full bg-accent text-white text-sm font-semibold disabled:opacity-40" :disabled="!gratitudeText.trim()">Guardar</button>
      </form>
      <ul v-if="gratitudeShown.length" class="mt-3 flex flex-col gap-1.5">
        <li v-for="g in gratitudeShown" :key="g.id" class="group flex items-start gap-2 bg-surface-soft rounded-xl2 px-3 py-2">
          <span class="text-base leading-tight">💗</span>
          <span class="flex-1 text-sm text-ink">{{ g.text }} <span class="text-[10px] text-muted">{{ g.date }}</span></span>
          <button type="button" class="text-muted hover:text-danger text-xs opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Borrar" @click="k.removeGratitude(g.id)">✕</button>
        </li>
      </ul>
      <p v-else class="text-xs text-muted mt-2">Escribe una cosita bonita del día. También puedes ponerla en tus libros con el sticker de gratitud.</p>
    </section>

    <!-- Cápsula del tiempo -->
    <section class="rounded-xl2 border border-border bg-surface p-4">
      <h3 class="text-sm font-bold text-ink mb-2">⏳ Cápsula del tiempo</h3>
      <textarea v-model="capsuleText" rows="3" maxlength="600" placeholder="Querido yo del futuro…" :class="[inputCls, 'resize-none']" />
      <div class="flex flex-wrap gap-1.5 mt-2">
        <button
          v-for="p in CAPSULE_PRESETS"
          :key="p.days"
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-soft text-muted hover:text-ink transition-colors"
          @click="presetDate(p.days)"
        >
          {{ p.label }}
        </button>
        <input v-model="capsuleDate" type="date" :min="today" class="bg-base text-ink rounded-full px-3 py-1 text-xs border border-border outline-none" />
      </div>
      <p v-if="capsuleError" class="text-xs text-danger mt-1.5">{{ capsuleError }}</p>
      <button type="button" class="mt-2 w-full py-2 rounded-full bg-accent text-white text-sm font-semibold" @click="saveCapsule">Sellar cápsula 🔒</button>

      <ul v-if="k.capsules.value.length" class="mt-3 flex flex-col gap-2">
        <li v-for="c in k.capsules.value" :key="c.id" class="rounded-xl2 bg-surface-soft p-3">
          <template v-if="c.opened">
            <p class="text-[10px] text-muted mb-1">Escrita el {{ new Date(c.createdAt).toLocaleDateString() }} · abierta</p>
            <p class="text-sm text-ink whitespace-pre-line" :class="shownCapsule === c.id ? 'capsule-reveal' : ''">{{ c.text }}</p>
          </template>
          <div v-else class="flex items-center gap-2">
            <span class="text-2xl leading-none">{{ c.openAt <= today ? '📬' : '🔒' }}</span>
            <span class="flex-1 text-xs text-ink">
              {{ c.openAt <= today ? '¡Ya se puede abrir!' : `Se abre el ${c.openAt} (faltan ${daysUntil(c.openAt)} días)` }}
            </span>
            <button v-if="c.openAt <= today" type="button" class="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold" @click="openCapsule(c.id)">Abrir</button>
          </div>
          <button v-if="c.opened || c.openAt > today" type="button" class="text-[10px] text-muted hover:text-danger mt-1" @click="k.removeCapsule(c.id)">Borrar</button>
        </li>
      </ul>
    </section>

    <!-- Cuenta regresiva -->
    <section class="rounded-xl2 border border-border bg-surface p-4">
      <h3 class="text-sm font-bold text-ink mb-2">🎉 Cuenta regresiva</h3>
      <div class="flex gap-1.5 flex-wrap mb-2">
        <button
          v-for="e in CD_EMOJIS"
          :key="e"
          type="button"
          class="w-8 h-8 rounded-full text-lg leading-none border-2 transition-colors"
          :class="cdEmoji === e ? 'border-accent bg-accent-soft/30' : 'border-transparent bg-surface-soft'"
          @click="cdEmoji = e"
        >
          {{ e }}
        </button>
      </div>
      <form class="flex gap-2 flex-wrap" @submit.prevent="saveCountdown">
        <input v-model="cdTitle" type="text" maxlength="40" placeholder="¿Qué estás esperando?" :class="[inputCls, 'flex-1 min-w-[10rem]']" />
        <input v-model="cdDate" type="date" class="bg-base text-ink rounded-xl2 px-3 py-2 text-sm border border-border outline-none" />
        <button type="submit" class="px-4 rounded-full bg-accent text-white text-sm font-semibold disabled:opacity-40" :disabled="!cdTitle.trim() || !cdDate">Agregar</button>
      </form>

      <ul v-if="k.countdowns.value.length" class="mt-3 flex flex-col gap-2">
        <li v-for="c in k.countdowns.value" :key="c.id" class="group flex items-center gap-3 rounded-xl2 bg-surface-soft px-3 py-2.5" :class="daysUntil(c.date) === 0 ? 'ring-2 ring-accent' : ''">
          <span class="text-2xl leading-none" :class="daysUntil(c.date) === 0 ? 'party' : ''">{{ c.emoji }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-ink truncate">{{ c.title }}</span>
            <span class="block text-[11px] text-muted">{{ c.date }}</span>
          </span>
          <button v-if="daysUntil(c.date) === 0" type="button" class="text-xs font-semibold text-accent" @click="celebrate()">¡Celebrar!</button>
          <span class="text-xs font-semibold" :class="daysUntil(c.date) < 0 ? 'text-muted' : 'text-accent'">{{ daysLabel(c.date) }}</span>
          <button type="button" class="text-muted hover:text-danger text-xs opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Borrar" @click="k.removeCountdown(c.id)">✕</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.envelope {
  animation: envelope-wiggle 2.4s ease-in-out infinite;
}
.letter {
  animation: letter-in 0.4s ease-out;
}
.party {
  display: inline-block;
  animation: envelope-wiggle 0.8s ease-in-out infinite;
}
.capsule-reveal {
  animation: letter-in 0.6s ease-out;
}
@keyframes envelope-wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-6deg);
  }
  75% {
    transform: rotate(6deg);
  }
}
@keyframes letter-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
}
@media (prefers-reduced-motion: reduce) {
  .envelope,
  .letter,
  .party,
  .capsule-reveal {
    animation: none;
  }
}
</style>
