<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="group flex flex-col items-center justify-center gap-4 aspect-[3/4] rounded-xl2 bg-accent-soft/90 border-2 border-dashed border-accent/60 hover:border-accent transition-colors"
    @click="$emit('click')"
  >
    <span class="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
      <AppIcon name="plus" :size="24" />
    </span>
    <span class="text-accent-deep font-semibold">Nuevo Libro</span>
  </button>
</template>
