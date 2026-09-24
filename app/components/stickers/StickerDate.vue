<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const value = computed({
  get: () => props.data.value ?? '',
  set: (v: string) => emit('update', { value: v }),
})
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#dce8da' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <div class="flex items-center gap-3">
      <span class="text-sm font-semibold text-black/70">Fecha:</span>
      <input v-model="value" type="date" class="bg-transparent outline-none text-black/70 text-sm flex-1" />
    </div>
  </div>
</template>
