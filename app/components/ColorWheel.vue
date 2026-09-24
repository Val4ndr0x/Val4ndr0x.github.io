<script setup lang="ts">
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from '~/utils/color'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [hex: string] }>()

const wheelRef = ref<HTMLElement | null>(null)

const hsv = reactive({ h: 0, s: 0, v: 1 })

watch(
  () => props.modelValue,
  (hex) => {
    const next = rgbToHsv(hexToRgb(hex))
    // Con brillo 0 o saturación 0 el tono no está definido: se conserva el que ya había para que el punto no salte.
    if (next.v > 0.001 && next.s > 0.001) hsv.h = next.h
    hsv.s = next.s
    hsv.v = next.v
  },
  { immediate: true },
)

function commit() {
  emit('update:modelValue', rgbToHex(hsvToRgb(hsv.h, hsv.s, hsv.v)))
}

function pickFromPointer(e: PointerEvent) {
  const el = wheelRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const dx = e.clientX - (rect.left + rect.width / 2)
  const dy = e.clientY - (rect.top + rect.height / 2)
  const radius = rect.width / 2
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI
  if (angle < 0) angle += 360
  hsv.h = angle
  hsv.s = Math.min(1, Math.hypot(dx, dy) / radius)
  commit()
}

function onPointerDown(e: PointerEvent) {
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  pickFromPointer(e)
}

function onPointerMove(e: PointerEvent) {
  if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return
  pickFromPointer(e)
}

const knobStyle = computed(() => {
  const rad = (hsv.h * Math.PI) / 180
  const r = hsv.s * 50
  return {
    left: `${50 + Math.cos(rad) * r}%`,
    top: `${50 + Math.sin(rad) * r}%`,
    backgroundColor: props.modelValue,
  }
})

const valueGradient = computed(() => {
  const full = rgbToHex(hsvToRgb(hsv.h, hsv.s, 1))
  return `linear-gradient(90deg, #000000, ${full})`
})

function onValueInput(e: Event) {
  hsv.v = Number((e.target as HTMLInputElement).value) / 100
  commit()
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="relative w-44 h-44">
      <div
        ref="wheelRef"
        class="absolute inset-0 rounded-full cursor-crosshair touch-none select-none shadow-inner"
        :style="{
          background: 'radial-gradient(circle closest-side, #ffffff, rgba(255,255,255,0)), conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          filter: `brightness(${0.25 + hsv.v * 0.75})`,
        }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
      />
      <span
        class="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        :style="knobStyle"
      />
    </div>
    <input
      type="range"
      min="0"
      max="100"
      :value="Math.round(hsv.v * 100)"
      class="w-44 h-3 rounded-full appearance-none cursor-pointer"
      :style="{ background: valueGradient }"
      aria-label="Brillo"
      @input="onValueInput"
    />
  </div>
</template>
