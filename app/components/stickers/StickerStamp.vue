<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

// Sellos de goma: se cambia de diseño con un toque.
const STAMPS = [
  { emoji: '⭐', text: 'GENIAL' },
  { emoji: '🌸', text: 'LINDO DÍA' },
  { emoji: '✅', text: 'HECHO' },
  { emoji: '💪', text: 'LO LOGRÉ' },
  { emoji: '💗', text: 'CON AMOR' },
  { emoji: '🎉', text: 'APROBADO' },
]

const index = computed(() => Math.min(STAMPS.length - 1, Math.max(0, Number(props.data.index) || 0)))
const stamp = computed(() => STAMPS[index.value]!)
const color = computed(() => props.data.color || '#d9587b')

function next() {
  emit('update', { index: (index.value + 1) % STAMPS.length })
}
</script>

<template>
  <div class="relative group w-full flex justify-center">
    <button type="button" class="w-full" title="Toca para cambiar el sello" aria-label="Cambiar sello" @click="next">
      <svg viewBox="0 0 120 120" class="w-full stamp" :style="{ color }">
        <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" stroke-width="4" />
        <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" />
        <text x="60" y="58" text-anchor="middle" font-size="30" dominant-baseline="middle">{{ stamp.emoji }}</text>
        <text x="60" y="88" text-anchor="middle" font-size="13" font-weight="800" letter-spacing="1.2" fill="currentColor" font-family="sans-serif">{{ stamp.text }}</text>
      </svg>
    </button>
    <button
      type="button"
      class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar sello"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.stamp {
  opacity: 0.88;
  mix-blend-mode: multiply;
}
</style>
