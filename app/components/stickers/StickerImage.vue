<script setup lang="ts">
defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group flex items-center justify-center min-h-[90px]" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#ffffff' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <img :src="data.src" :alt="data.label || 'Sticker'" class="max-h-24 sm:max-h-28 max-w-full object-contain" />
  </div>
</template>
