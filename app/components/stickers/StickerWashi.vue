<script setup lang="ts">
const props = defineProps<{ data: Record<string, any>; stickerId?: string }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const PATTERNS = ['dots', 'stripes', 'hearts', 'plaid', 'plain'] as const
const pattern = computed(() => (PATTERNS as readonly string[]).includes(props.data.pattern) ? (props.data.pattern as string) : 'dots')
const color = computed(() => props.data.color || '#f7b8cf')

const overlay = computed(() => {
  switch (pattern.value) {
    case 'stripes':
      return 'repeating-linear-gradient(135deg, rgba(255,255,255,.55) 0 6px, transparent 6px 12px)'
    case 'hearts':
      return 'radial-gradient(circle at 25% 50%, rgba(255,255,255,.7) 3px, transparent 3.5px), radial-gradient(circle at 75% 50%, rgba(255,255,255,.7) 3px, transparent 3.5px)'
    case 'plaid':
      return 'repeating-linear-gradient(0deg, rgba(255,255,255,.4) 0 3px, transparent 3px 9px), repeating-linear-gradient(90deg, rgba(255,255,255,.4) 0 3px, transparent 3px 9px)'
    case 'plain':
      return 'none'
    default:
      return 'radial-gradient(rgba(255,255,255,.75) 2px, transparent 2.6px)'
  }
})
const size = computed(() => (pattern.value === 'hearts' ? '20px 100%' : pattern.value === 'dots' ? '12px 12px' : 'auto'))

function next() {
  emit('update', { pattern: PATTERNS[(PATTERNS.indexOf(pattern.value as (typeof PATTERNS)[number]) + 1) % PATTERNS.length] })
}
</script>

<template>
  <div class="relative group h-7">
    <button
      type="button"
      class="washi block w-full h-full"
      :style="{ backgroundColor: color, backgroundImage: overlay, backgroundSize: size }"
      title="Toca para cambiar el diseño"
      aria-label="Cambiar diseño de la cinta"
      @click="next"
    />
    <button
      type="button"
      class="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar cinta"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.washi {
  opacity: 0.9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  /* Bordes dentados como una cinta washi recortada. */
  clip-path: polygon(0 8%, 3% 0, 6% 8%, 9% 0, 12% 8%, 15% 0, 18% 8%, 21% 0, 24% 8%, 27% 0, 30% 8%, 33% 0, 36% 8%, 39% 0, 42% 8%, 45% 0, 48% 8%, 51% 0, 54% 8%, 57% 0, 60% 8%, 63% 0, 66% 8%, 69% 0, 72% 8%, 75% 0, 78% 8%, 81% 0, 84% 8%, 87% 0, 90% 8%, 93% 0, 96% 8%, 100% 0, 100% 92%, 97% 100%, 94% 92%, 91% 100%, 88% 92%, 85% 100%, 82% 92%, 79% 100%, 76% 92%, 73% 100%, 70% 92%, 67% 100%, 64% 92%, 61% 100%, 58% 92%, 55% 100%, 52% 92%, 49% 100%, 46% 92%, 43% 100%, 40% 92%, 37% 100%, 34% 92%, 31% 100%, 28% 92%, 25% 100%, 22% 92%, 19% 100%, 16% 92%, 13% 100%, 10% 92%, 7% 100%, 4% 92%, 0 100%);
}
</style>
