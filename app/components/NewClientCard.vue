<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="group flex flex-col items-center justify-center gap-3 min-h-[210px] rounded-[22px] bg-white/50 dark:bg-surface-soft/50 border-2 border-dashed border-black/15 dark:border-border hover:border-black/30 dark:hover:border-accent/50 hover:bg-white/70 dark:hover:bg-surface-soft/80 transition-colors"
    @click="$emit('click')"
  >
    <span class="w-12 h-12 rounded-full bg-white dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shadow-sm group-hover:scale-105 transition-transform">
      <AppIcon name="plus" :size="22" />
    </span>
    <span class="text-black/60 dark:text-muted font-semibold">Nuevo cliente</span>
  </button>
</template>
