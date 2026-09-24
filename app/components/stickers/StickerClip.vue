<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()
const color = computed(() => props.data.color || '#c98aa6')
</script>

<template>
  <div class="relative group w-full flex justify-center">
    <svg viewBox="0 0 40 90" class="w-full drop-shadow" aria-label="Clip">
      <path
        d="M27 24v40a9 9 0 0 1-18 0V18a13 13 0 0 1 26 0v42"
        fill="none"
        :stroke="color"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M31 30v34a13 13 0 0 1-26 0V26" fill="none" :stroke="color" stroke-width="4.5" stroke-linecap="round" opacity=".55" />
    </svg>
    <button
      type="button"
      class="absolute -top-2 -right-3 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar clip"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>
