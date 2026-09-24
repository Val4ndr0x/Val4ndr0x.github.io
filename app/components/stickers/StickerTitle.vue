<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const text = computed({
  get: () => props.data.text ?? '',
  set: (value: string) => emit('update', { text: value }),
})
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
    <input
      v-model="text"
      type="text"
      placeholder="Título de la página"
      class="w-full text-2xl sm:text-3xl font-bold text-black/80 outline-none text-center bg-transparent placeholder-black/25"
    />
  </div>
</template>
