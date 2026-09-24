<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const GOAL = 8
const glasses = computed(() => Math.min(GOAL, Math.max(0, Number(props.data.value) || 0)))

// La carita cambia con cuánta agua llevas.
const face = computed(() => {
  const n = glasses.value
  if (n === 0) return '🥵'
  if (n < 4) return '😐'
  if (n < 7) return '🙂'
  if (n < GOAL) return '😊'
  return '🥳'
})

function tap(i: number) {
  // Tocar el último vaso lleno lo vacía; si no, llena hasta ese vaso.
  emit('update', { value: glasses.value === i + 1 ? i : i + 1 })
}
</script>

<template>
  <StickerFrame :color="data.color" fallback="#d9f0ea" @remove="emit('remove')">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-2xl leading-none">{{ face }}</span>
      <p class="text-sm font-semibold text-black/70">Agüita <span class="font-normal text-black/50">· {{ glasses }}/{{ GOAL }} vasos</span></p>
    </div>
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="i in GOAL"
        :key="i"
        type="button"
        class="w-8 h-9 rounded-md text-lg leading-none flex items-center justify-center transition-all"
        :class="glasses >= i ? 'bg-white scale-105' : 'bg-white/40 grayscale opacity-60 hover:opacity-100'"
        :aria-label="`Vaso ${i}`"
        @click="tap(i - 1)"
      >
        💧
      </button>
    </div>
  </StickerFrame>
</template>
