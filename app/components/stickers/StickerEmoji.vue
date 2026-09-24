<script setup lang="ts">
defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()
</script>

<template>
  <div class="relative group w-full flex items-center justify-center">
    <span class="text-[64px] leading-none select-none drop-shadow-sm" :title="data.label">{{ data.emoji }}</span>
    <button
      type="button"
      class="absolute -top-1 right-0 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar sticker"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>
