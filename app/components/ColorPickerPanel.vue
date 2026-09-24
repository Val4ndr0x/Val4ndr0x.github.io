<script setup lang="ts">
import { isHex } from '~/utils/color'

const props = defineProps<{
  modelValue: string
  presets: string[]
  /** Muestra un botón extra para dejar el fondo transparente (usado por los stickers del libro). */
  allowTransparent?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [color: string] }>()

const hexInput = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    hexInput.value = v
  },
)

function applyHex() {
  const raw = hexInput.value.trim()
  const hex = raw.startsWith('#') ? raw : `#${raw}`
  if (isHex(hex)) emit('update:modelValue', hex.toLowerCase())
  else hexInput.value = props.modelValue
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-0.5">Colores</h3>
      <div class="grid grid-cols-6 gap-2.5">
        <button
          v-if="allowTransparent"
          type="button"
          class="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 checker-bg"
          :class="modelValue === 'transparent' ? 'border-accent' : 'border-border'"
          title="Sin fondo (transparente)"
          @click="emit('update:modelValue', 'transparent')"
        />
        <button
          v-for="color in presets"
          :key="color"
          type="button"
          class="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
          :class="modelValue.toLowerCase() === color.toLowerCase() ? 'border-accent' : 'border-border'"
          :style="{ backgroundColor: color }"
          :title="color"
          @click="emit('update:modelValue', color)"
        />
      </div>
    </div>

    <div class="border-t border-border pt-4">
      <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-3 px-0.5">Rueda de colores</h3>
      <div class="flex flex-col items-center gap-3">
        <ColorWheel :model-value="modelValue" @update:model-value="(c) => emit('update:modelValue', c)" />
        <div class="flex items-center gap-3 w-full">
          <div class="w-11 h-11 rounded-xl2 border border-border shrink-0" :style="{ backgroundColor: modelValue }" />
          <input
            v-model="hexInput"
            type="text"
            placeholder="#rrggbb"
            maxlength="7"
            class="flex-1 min-w-0 bg-surface-soft text-ink placeholder-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-accent text-sm tabular-nums"
            @change="applyHex"
            @keyup.enter="applyHex"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checker-bg {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
}
</style>
