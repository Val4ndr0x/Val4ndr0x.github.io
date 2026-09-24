<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const title = computed({
  get: () => props.data.title ?? '',
  set: (v: string) => emit('update', { title: v }),
})

function select(i: number) {
  const next = props.data.value === i + 1 ? i : i + 1
  emit('update', { value: next })
}
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#ffffff' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <input
      v-model="title"
      type="text"
      placeholder="Productividad"
      class="text-sm font-semibold text-black/70 mb-2 bg-transparent outline-none w-2/3"
    />
    <div class="flex gap-1.5">
      <button v-for="i in 5" :key="i" type="button" class="text-accent" @click="select(i - 1)">
        <AppIcon :name="(data.value ?? 0) >= i ? 'star-filled' : 'star'" :size="22" />
      </button>
    </div>
  </div>
</template>
