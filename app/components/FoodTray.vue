<script setup lang="ts">
import { POINTS_PER_TASK } from '~/composables/useCompanion'

// Bandeja de comida: arrastra un alimento hasta la mascota (o tócalo) para dárselo.
type Item = { id: string; label: string; emoji: string; kind: 'food' | 'drink'; cost: number; restore: number; xp: number }

const props = defineProps<{ pet: { el: HTMLElement | null; eat: (emoji: string) => void } | null }>()
const emit = defineEmits<{ fed: [item: Item]; refuse: [text: string] }>()

const { items, recipeItems, feed, points, hunger, thirst } = useCompanion()
const all = computed<Item[]>(() => [...(items as Item[]), ...(recipeItems.value as Item[])])

const drag = ref<{ item: Item; x: number; y: number } | null>(null)
const shaking = ref<string | null>(null)
let startX = 0
let startY = 0
const moved = ref(false)

function refuse(item: Item, text: string) {
  shaking.value = item.id
  setTimeout(() => (shaking.value = null), 400)
  emit('refuse', text)
}

function tryFeed(item: Item) {
  const level = item.kind === 'food' ? hunger.value : thirst.value
  if (level >= 98) return refuse(item, item.kind === 'food' ? '¡Estoy lleno! 🤰' : '¡No tengo sed! 💧')
  if (feed(item.id)) {
    props.pet?.eat(item.emoji)
    emit('fed', item)
  }
}

function overPet(x: number, y: number) {
  const r = props.pet?.el?.getBoundingClientRect()
  if (!r) return false
  const pad = 24
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
}

function onDown(e: PointerEvent, item: Item) {
  if (points.value < item.cost) return refuse(item, `Te faltan ⭐ ${item.cost - points.value} para ${item.label.toLowerCase()}`)
  startX = e.clientX
  startY = e.clientY
  moved.value = false
  drag.value = { item, x: e.clientX, y: e.clientY }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', cancel)
}

function onMove(e: PointerEvent) {
  if (!drag.value) return
  if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) moved.value = true
  drag.value = { ...drag.value, x: e.clientX, y: e.clientY }
}

function cleanup() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', cancel)
  drag.value = null
}

function onUp(e: PointerEvent) {
  const item = drag.value?.item
  cleanup()
  if (!item) return
  // Un toque suelto también alimenta; si se arrastró, solo cuenta al soltarla sobre la mascota.
  if (!moved.value || overPet(e.clientX, e.clientY)) tryFeed(item)
}

function cancel() {
  cleanup()
}

onBeforeUnmount(cleanup)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-3 text-xs text-muted">
      <span class="font-semibold text-ink">⭐ {{ points }}</span>
      <span class="flex items-center gap-1 flex-1">🍽️
        <span class="flex-1 h-1.5 rounded-full bg-border overflow-hidden"><span class="block h-full rounded-full transition-[width]" :class="hunger < 25 ? 'bg-red-400' : 'bg-accent'" :style="{ width: `${hunger}%` }" /></span>
      </span>
      <span class="flex items-center gap-1 flex-1">💧
        <span class="flex-1 h-1.5 rounded-full bg-border overflow-hidden"><span class="block h-full rounded-full transition-[width]" :class="thirst < 25 ? 'bg-red-400' : 'bg-accent'" :style="{ width: `${thirst}%` }" /></span>
      </span>
    </div>
    <p class="text-[11px] text-muted">Arrastra la comida hasta la boca (o tócala). Ganas {{ POINTS_PER_TASK }} ⭐ por tarea. Desliza el dedo sobre la mascota para acariciarla 💗</p>

    <div class="grid grid-cols-3 gap-1.5">
      <button
        v-for="item in all"
        :key="item.id"
        type="button"
        class="flex flex-col items-center gap-0.5 bg-base border border-border rounded-xl py-2 text-[11px] hover:border-accent active:scale-95 transition"
        :class="[points < item.cost && 'opacity-50', shaking === item.id && 'tray-shake']"
        style="touch-action: none"
        :title="`+${item.restore} ${item.kind === 'food' ? 'comida' : 'bebida'} · +${item.xp} XP`"
        @pointerdown.prevent="onDown($event, item)"
        @keydown.enter.prevent="tryFeed(item)"
      >
        <span class="text-xl leading-none">{{ item.emoji }}</span>
        <span class="text-ink truncate max-w-full px-1">{{ item.label }}</span>
        <span class="text-muted">⭐ {{ item.cost }}</span>
      </button>
    </div>

    <Teleport to="body">
      <span
        v-if="drag && moved"
        class="fixed z-[100] pointer-events-none text-4xl leading-none drop-shadow-lg"
        :style="{ left: `${drag.x}px`, top: `${drag.y}px`, transform: 'translate(-50%, -60%) rotate(-8deg)' }"
      >{{ drag.item.emoji }}</span>
    </Teleport>
  </div>
</template>

<style scoped>
.tray-shake {
  animation: tray-shake 0.4s ease-in-out;
}
@keyframes tray-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
