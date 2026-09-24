<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const faces: { mouth: string }[] = [
  { mouth: 'M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5' },
  { mouth: 'M9 15.5c1 .7 2 1 3 1s2-.3 3-1' },
  { mouth: 'M9 15.5h6' },
  { mouth: 'M9 16.5c1-1 2-1.5 3-1.5s2 .5 3 1.5' },
]

function select(i: number) {
  emit('update', { value: i })
}
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#dcdaf0' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <p class="text-sm font-semibold text-black/70 mb-2">Mi estado de ánimo</p>
    <div class="flex gap-3 justify-around">
      <button
        v-for="(face, i) in faces"
        :key="i"
        type="button"
        class="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform"
        :class="data.value === i ? 'ring-2 ring-accent scale-110' : 'opacity-70 hover:opacity-100'"
        @click="select(i)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a3a42" stroke-width="1.5" stroke-linecap="round">
          <circle cx="9" cy="10" r="0.8" fill="#3a3a42" stroke="none" />
          <circle cx="15" cy="10" r="0.8" fill="#3a3a42" stroke="none" />
          <path :d="face.mouth" />
        </svg>
      </button>
    </div>
  </div>
</template>
