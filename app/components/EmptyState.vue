<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div class="relative z-10 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 8.2l7.1-.6L12 2.5z" />
    </svg>
    <div class="flex flex-col gap-1">
      <span class="text-base font-semibold text-white/75">{{ title }}</span>
      <span class="text-sm text-white/40">{{ subtitle }}</span>
    </div>
  </div>
</template>
