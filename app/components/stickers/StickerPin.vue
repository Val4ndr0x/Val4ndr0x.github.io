<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()
const color = computed(() => props.data.color || '#e5566d')
</script>

<template>
  <div class="relative group w-full flex justify-center">
    <svg viewBox="0 0 40 52" class="w-full drop-shadow-md" aria-label="Chincheta">
      <ellipse cx="20" cy="47" rx="6" ry="2" fill="rgba(0,0,0,.18)" />
      <rect x="18.6" y="26" width="2.8" height="20" rx="1.4" fill="#9aa0a6" />
      <path d="M8 14a12 10 0 0 1 24 0l-3 12H11z" :fill="color" />
      <ellipse cx="20" cy="13" rx="12" ry="9" :fill="color" />
      <ellipse cx="15" cy="9.5" rx="4" ry="2.4" fill="rgba(255,255,255,.55)" />
    </svg>
    <button
      type="button"
      class="absolute -top-2 -right-3 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar chincheta"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>
