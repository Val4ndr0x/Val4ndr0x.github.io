<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="group flex flex-col items-center justify-center gap-4 aspect-[3/4] rounded-[22px] bg-white/50 dark:bg-surface-soft/50 border-2 border-dashed border-black/15 dark:border-border hover:border-black/30 dark:hover:border-accent/50 hover:bg-white/70 dark:hover:bg-surface-soft/80 transition-colors"
    @click="$emit('click')"
  >
    <span class="w-14 h-14 rounded-full bg-white dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shadow-sm group-hover:scale-105 transition-transform">
      <AppIcon name="plus" :size="24" />
    </span>
    <span class="text-black/60 dark:text-muted font-semibold">Nueva lista</span>
  </button>
</template>
