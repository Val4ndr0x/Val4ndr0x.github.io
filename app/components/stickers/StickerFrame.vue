<script setup lang="ts">
// Tarjeta base de los stickers nuevos: fondo de color + botón de quitar al pasar el mouse.
defineProps<{ color?: string; fallback: string }>()
const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: color || fallback }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-[1]"
      aria-label="Quitar sticker"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <slot />
  </div>
</template>
