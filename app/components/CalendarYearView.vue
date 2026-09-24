<script setup lang="ts">
import { useCalendar } from '~/composables/useCalendar'
import { buildMonthGrid, toDateKey, occursOn, isSameDay } from '~/utils/calendarDate'
import { blobPath } from '~/utils/blobPath'
import { hsvToRgb, mixHex, rgbToHex, rgbToHsv, hexToRgb } from '~/utils/color'
import { MONTH_NAMES } from '~/composables/useCalendarTheme'

const props = defineProps<{ year: number }>()
const emit = defineEmits<{ 'open-day': [d: Date] }>()

const { events } = useCalendar()
const { colorForMonth, colorForYear, colorForDay, activeTemplate, stickerForMonth } = useCalendarTheme()
const yearColor = computed(() => colorForYear(props.year))
const monthFont = computed(() => activeTemplate.value?.font ?? null)
const isDarkTemplate = computed(() => !!activeTemplate.value?.dark)
// Plantillas cute (con stickers): tarjeta pastel sólida por mes, números sobre fondo liso, como un calendario impreso.
const isCute = computed(() => !!activeTemplate.value?.stickers)

const today = new Date()

/** Título de mes en las plantillas cute: sin fondo, con el tono del mes oscurecido (o aclarado en plantillas oscuras). */
function titleColor(month: number) {
  const base = colorForMonth(month)
  if (isDarkTemplate.value) return mixHex(base, '#ffffff', 0.55)
  // Tono del mes más vivo y medio: legible tanto sobre fondo claro como oscuro.
  const { h } = rgbToHsv(hexToRgb(base))
  return rgbToHex(hsvToRgb(h, 0.5, 0.85))
}
const blobs = Array.from({ length: 12 }, (_, m) => blobPath(m + 1))

const MONTH_LABELS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const months = computed(() => MONTH_LABELS_SHORT.map((label, m) => ({ month: m, label, grid: buildMonthGrid(props.year, m) })))

/** Set de date-keys con al menos una ocurrencia, calculado una sola vez por año visible. */
const datesWithEvents = computed(() => {
  const set = new Set<string>()
  const start = new Date(props.year, 0, 1)
  const end = new Date(props.year, 11, 31)
  for (const event of events.value) {
    if (!event.recurrence) {
      if (event.date >= toDateKey(start) && event.date <= toDateKey(end)) set.add(event.date)
      continue
    }
    // Recurrente: recorrer los días del año visible y probar occursOn (acotado a 366 iteraciones).
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d)
      if (occursOn(event, key)) set.add(key)
    }
  }
  return set
})

function isCurrentMonth(d: Date, m: number) {
  return d.getMonth() === m
}

function isToday(d: Date) {
  return isSameDay(d, today)
}
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pb-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="m in months" :key="m.month">
        <h3
          v-if="isCute"
          class="flex items-center justify-center gap-1.5 text-2xl leading-tight mb-1"
          :style="{ color: titleColor(m.month), fontFamily: monthFont ?? undefined }"
        >
          <span>{{ MONTH_NAMES[m.month] }}</span>
          <img v-if="stickerForMonth(m.month)" :src="stickerForMonth(m.month)!" alt="" class="w-12 h-12 -my-1 object-contain drop-shadow-sm" />
        </h3>
        <div
          class="relative"
          :class="isCute ? 'p-7 sm:p-8' : 'border p-2.5 shadow-sm rounded-xl2'"
          :style="isCute ? undefined : { backgroundColor: colorForMonth(m.month) + '40', borderColor: yearColor }"
        >
          <svg v-if="isCute" class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path :d="blobs[m.month]" :fill="colorForMonth(m.month)" />
          </svg>
          <h3
            v-if="!isCute"
            class="flex items-center justify-center gap-1 text-xs font-semibold text-center mb-1.5 rounded-full py-0.5"
            :style="{ backgroundColor: colorForMonth(m.month), color: isDarkTemplate ? '#fff' : 'rgb(0 0 0 / 0.75)', fontFamily: monthFont ?? undefined }"
          >
            <span>{{ m.label }}</span>
          </h3>
          <div class="relative grid grid-cols-7 gap-[2px]">
            <button
              v-for="d in m.grid"
              :key="d.getTime()"
              type="button"
              class="relative aspect-square flex items-center justify-center rounded text-[9px] sm:text-[10px]"
              :class="[
                isCurrentMonth(d, m.month) ? (isDarkTemplate ? 'text-white hover:bg-white/10' : isCute ? 'text-black/75 hover:bg-white/50' : 'text-ink hover:bg-surface-soft') : isCute ? 'text-black/20' : 'text-muted/40',
                isToday(d) ? 'ring-1 ring-accent font-bold' : '',
              ]"
              :style="isCurrentMonth(d, m.month) && !isCute ? { backgroundColor: colorForDay(year, m.month, d.getDate()) + 'B0' } : undefined"
              @click="emit('open-day', d)"
            >
              {{ d.getDate() }}
              <span
                v-if="datesWithEvents.has(toDateKey(d))"
                class="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
