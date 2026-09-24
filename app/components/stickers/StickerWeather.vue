<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const OPTIONS = [
  { emoji: '☀️', label: 'Soleado' },
  { emoji: '🌤️', label: 'Despejado' },
  { emoji: '☁️', label: 'Nublado' },
  { emoji: '🌧️', label: 'Lluvia' },
  { emoji: '⛈️', label: 'Tormenta' },
  { emoji: '❄️', label: 'Frío' },
]

const current = computed(() => OPTIONS[props.data.value as number] ?? null)
</script>

<template>
  <StickerFrame :color="data.color" fallback="#dfeaf7" @remove="emit('remove')">
    <p class="text-sm font-semibold text-black/70 mb-2">
      El clima de hoy<span v-if="current" class="font-normal text-black/50"> · {{ current.label }}</span>
    </p>
    <div class="flex gap-2 justify-around">
      <button
        v-for="(o, i) in OPTIONS"
        :key="o.emoji"
        type="button"
        class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl leading-none transition-transform"
        :class="data.value === i ? 'ring-2 ring-accent scale-110' : 'opacity-70 hover:opacity-100'"
        :title="o.label"
        @click="emit('update', { value: i })"
      >
        {{ o.emoji }}
      </button>
    </div>
  </StickerFrame>
</template>
