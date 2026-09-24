<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const options = ['4-6', '7-9', '10-12']

function select(opt: string) {
  emit('update', { value: opt })
}
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#ffffff' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <p class="text-sm font-semibold text-black/70 mb-3">Horas de sueño</p>
    <div class="flex gap-3 justify-around flex-wrap">
      <button
        v-for="opt in options"
        :key="opt"
        type="button"
        class="relative flex items-center justify-center transition-transform"
        :class="data.value === opt ? 'scale-110' : 'opacity-70 hover:opacity-100'"
        @click="select(opt)"
      >
        <AppIcon name="cloud" :size="56" :class="data.value === opt ? 'text-accent' : 'text-black/25'" />
        <span class="absolute text-xs font-semibold text-black/70">{{ opt }}</span>
      </button>
    </div>
  </div>
</template>
