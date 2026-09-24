<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const lines = computed<string[]>(() => {
  const l = Array.isArray(props.data.lines) ? props.data.lines : []
  return [l[0] ?? '', l[1] ?? '', l[2] ?? '']
})

function setLine(i: number, v: string) {
  const next = [...lines.value]
  next[i] = v
  emit('update', { lines: next })
}
</script>

<template>
  <StickerFrame :color="data.color" fallback="#fbe3ea" @remove="emit('remove')">
    <p class="text-sm font-semibold text-black/70 mb-2">💗 Hoy agradezco…</p>
    <div class="flex flex-col gap-1.5">
      <label v-for="(line, i) in lines" :key="i" class="flex items-center gap-2 border-b border-black/10 pb-1">
        <span class="text-xs" :class="line ? 'opacity-100' : 'opacity-40'">🤍</span>
        <input
          :value="line"
          type="text"
          maxlength="80"
          placeholder="Algo bonito…"
          class="flex-1 min-w-0 bg-transparent outline-none text-sm text-black/70 placeholder-black/30"
          @input="setLine(i, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </StickerFrame>
</template>
