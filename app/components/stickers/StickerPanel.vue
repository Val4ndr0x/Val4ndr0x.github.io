<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const title = computed({
  get: () => props.data.title ?? '',
  set: (v: string) => emit('update', { title: v }),
})
const value = computed({
  get: () => props.data.value ?? '',
  set: (v: string) => emit('update', { value: v }),
})

const tape = computed<string>(() => props.data.tape ?? '')
</script>

<template>
  <div class="relative w-full h-full rounded-xl2 p-3 group flex flex-col" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#e7dcf0' }">
    <span
      v-if="tape"
      class="absolute -top-2 left-1/2 -translate-x-1/2 -rotate-2 w-16 h-4 rounded-[2px] pointer-events-none opacity-80"
      :style="{ backgroundImage: `repeating-conic-gradient(${tape} 0 25%, transparent 0 50%)`, backgroundSize: '8px 8px', backgroundColor: 'rgba(255,255,255,.55)' }"
    />
    <button
      type="button"
      class="absolute top-1.5 right-1.5 z-[1] w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <input
      v-model="title"
      type="text"
      placeholder="Título"
      class="w-full text-center text-sm font-bold tracking-wide text-black/70 bg-transparent outline-none placeholder-black/30 mb-1.5"
    />
    <textarea
      v-if="!data.noText"
      v-model="value"
      placeholder="Escribe aquí..."
      class="flex-1 min-h-0 w-full bg-transparent outline-none text-sm text-black/70 placeholder-black/30 resize-none leading-6"
      :style="data.lined ? { backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 23px, rgba(0,0,0,.14) 23px 24px)', backgroundAttachment: 'local' } : undefined"
    />
  </div>
</template>
