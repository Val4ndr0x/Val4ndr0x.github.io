<script setup lang="ts">
defineProps<{ modelValue: string | undefined; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function onOutside(e: PointerEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) window.addEventListener('pointerdown', onOutside)
  else window.removeEventListener('pointerdown', onOutside)
})
onBeforeUnmount(() => window.removeEventListener('pointerdown', onOutside))
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <button
      type="button"
      class="w-full h-full rounded-full flex items-center justify-center text-xs font-bold"
      :title="title ?? 'Tipo de letra'"
      @click="open = !open"
    >
      Aa
    </button>
    <div
      v-if="open"
      class="absolute left-0 top-full mt-2 z-50 w-56 max-h-64 overflow-y-auto rounded-xl bg-surface border border-border shadow-xl p-1.5 flex flex-col gap-0.5 text-left"
    >
      <button
        v-for="font in FONT_OPTIONS"
        :key="font.key"
        type="button"
        class="w-full text-left px-3 py-1.5 rounded-lg text-base font-normal text-ink transition-colors"
        :class="(modelValue ?? 'default') === font.key ? 'bg-accent-soft/40 ring-1 ring-accent' : 'hover:bg-surface-soft'"
        :style="{ fontFamily: font.family || undefined }"
        @click="emit('update:modelValue', font.key)"
      >
        {{ font.label }}
      </button>
    </div>
  </div>
</template>
