<script setup lang="ts">
import { useCalendar } from '~/composables/useCalendar'
import { buildMonthGrid, toDateKey, formatMonthYear, formatFullDate, addDays, daysInMonth, WEEKDAY_LABELS, isSameDay, occursOn } from '~/utils/calendarDate'

const { events, decorations, requestNotificationPermission, notificationPermission } = useCalendar()
const { colorForMonth, colorForYear, colorForDay } = useCalendarTheme()
const showTheme = ref(false)

const today = new Date()
type ViewMode = 'day' | 'week' | 'month' | 'year' | 'list'
const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Día' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
  { key: 'list', label: 'Lista' },
]

// Fecha de referencia: todas las vistas (día, semana, mes, año, lista) se calculan a partir de ella.
const cursor = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const viewMode = ref<ViewMode>('month')
const viewYear = computed(() => cursor.value.getFullYear())
const viewMonth = computed(() => cursor.value.getMonth())

const grid = computed(() => buildMonthGrid(viewYear.value, viewMonth.value))
const monthColor = computed(() => colorForMonth(viewMonth.value))
const yearColor = computed(() => colorForYear(viewYear.value))
const monthLabel = computed(() => formatMonthYear(viewYear.value, viewMonth.value))

const weekDays = computed(() => {
  const offset = (cursor.value.getDay() + 6) % 7 // la semana empieza en lunes
  const monday = addDays(cursor.value, -offset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
})
const monthDays = computed(() => Array.from({ length: daysInMonth(viewYear.value, viewMonth.value) }, (_, i) => new Date(viewYear.value, viewMonth.value, i + 1)))

const headerLabel = computed(() => {
  if (viewMode.value === 'year') return String(viewYear.value)
  if (viewMode.value === 'day') return formatFullDate(cursor.value)
  if (viewMode.value === 'week') {
    const [first, last] = [weekDays.value[0]!, weekDays.value[6]!]
    const fmt = (d: Date) => d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
    return `${fmt(first)} – ${fmt(last)}`
  }
  return monthLabel.value
})

const prevTitle = computed(() => ({ day: 'Día anterior', week: 'Semana anterior', month: 'Mes anterior', list: 'Mes anterior', year: 'Año anterior' })[viewMode.value])
const nextTitle = computed(() => ({ day: 'Día siguiente', week: 'Semana siguiente', month: 'Mes siguiente', list: 'Mes siguiente', year: 'Año siguiente' })[viewMode.value])

// Mueve meses/años conservando el día, ajustado al último día del mes destino (31 ene → 28 feb).
function shiftMonths(n: number) {
  const target = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + n, 1)
  const day = Math.min(cursor.value.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
  cursor.value = new Date(target.getFullYear(), target.getMonth(), day)
}

function step(dir: 1 | -1) {
  if (viewMode.value === 'day') cursor.value = addDays(cursor.value, dir)
  else if (viewMode.value === 'week') cursor.value = addDays(cursor.value, 7 * dir)
  else if (viewMode.value === 'year') shiftMonths(12 * dir)
  else shiftMonths(dir)
}

function goToday() {
  cursor.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function eventsFor(key: string) {
  return events.value.filter((e) => occursOn(e, key)).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
}

function decorationsFor(key: string) {
  return decorations.value.filter((d) => d.date === key)
}

function isCurrentMonth(d: Date) {
  return d.getMonth() === viewMonth.value
}

function isToday(d: Date) {
  return isSameDay(d, today)
}

const selectedDate = ref<string | null>(null)

function openDay(d: Date) {
  selectedDate.value = toDateKey(d)
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex items-center justify-between px-4 sm:px-6 py-2 gap-2 flex-wrap">
      <div class="flex items-center gap-1.5">
        <button type="button" class="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" :title="prevTitle" @click="step(-1)">
          <AppIcon name="arrow-left" :size="16" />
        </button>
        <h2
          class="text-base sm:text-lg font-bold text-black/75 min-w-40 sm:min-w-48 px-3 text-center rounded-full py-1 transition-colors"
          :style="{ backgroundColor: viewMode === 'month' ? monthColor : yearColor, boxShadow: `0 0 0 2px ${yearColor}` }"
        >{{ headerLabel }}</h2>
        <button type="button" class="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft rotate-180" :title="nextTitle" @click="step(1)">
          <AppIcon name="arrow-left" :size="16" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-surface-soft rounded-full p-0.5">
          <button
            v-for="mode in VIEW_MODES"
            :key="mode.key"
            type="button"
            class="text-xs font-semibold rounded-full px-2.5 sm:px-3 py-1.5 transition-colors"
            :class="viewMode === mode.key ? 'bg-surface text-ink shadow-sm' : 'text-muted'"
            @click="viewMode = mode.key"
          >{{ mode.label }}</button>
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft"
          title="Colores del calendario"
          @click="showTheme = true"
        >
          <AppIcon name="palette" :size="16" />
        </button>
        <button type="button" class="text-xs font-semibold text-accent-deep bg-accent-soft hover:bg-accent hover:text-white transition-colors rounded-full px-3 py-1.5" @click="goToday">
          Hoy
        </button>
        <button
          v-if="notificationPermission !== 'granted'"
          type="button"
          class="hidden sm:flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          title="Activar notificaciones del navegador para las alarmas"
          @click="requestNotificationPermission"
        >
          <AppIcon name="bell" :size="14" />
          Activar notificaciones
        </button>
      </div>
    </div>

    <CalendarYearView v-if="viewMode === 'year'" :year="viewYear" @open-day="openDay" />

    <CalendarAgendaView v-else-if="viewMode === 'day'" :days="[cursor]" @open-day="openDay" />
    <CalendarAgendaView v-else-if="viewMode === 'week'" :days="weekDays" @open-day="openDay" />
    <CalendarAgendaView v-else-if="viewMode === 'list'" :days="monthDays" hide-empty @open-day="openDay" />

    <template v-else>
    <div class="grid grid-cols-7 px-2 sm:px-4 text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wide">
      <div v-for="label in WEEKDAY_LABELS" :key="label" class="text-center py-1.5">{{ label }}</div>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-7 grid-rows-[repeat(6,minmax(64px,1fr))] gap-1 sm:gap-1.5 px-2 sm:px-4 pb-3 overflow-y-auto">
      <button
        v-for="d in grid"
        :key="d.getTime()"
        type="button"
        class="relative flex flex-col items-start p-1.5 sm:p-2 rounded-lg border text-left overflow-hidden min-h-[64px]"
        :class="[
          isCurrentMonth(d) ? 'border-transparent' : 'bg-surface-soft/40 border-transparent',
          isToday(d) ? 'ring-2 ring-accent' : '',
        ]"
        :style="isCurrentMonth(d) ? { backgroundColor: colorForDay(viewYear, viewMonth, d.getDate()) + 'B0', borderColor: yearColor } : undefined"
        @click="openDay(d)"
      >
        <span class="text-xs sm:text-sm font-semibold" :class="isCurrentMonth(d) ? 'text-ink' : 'text-muted'">{{ d.getDate() }}</span>

        <div class="mt-1 flex flex-col gap-0.5 w-full">
          <span
            v-for="event in eventsFor(toDateKey(d)).slice(0, 2)"
            :key="event.id"
            class="flex items-center gap-1 text-[10px] sm:text-[11px] truncate rounded px-1 py-0.5"
            :style="{ backgroundColor: event.color + '33' }"
          >
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: event.color }" />
            <AppIcon v-if="event.alarmEnabled" name="bell" :size="9" class="shrink-0" />
            <span class="truncate">{{ event.time ? `${event.time} ` : '' }}{{ event.title }}</span>
          </span>
          <span v-if="eventsFor(toDateKey(d)).length > 2" class="text-[10px] text-muted px-1">
            +{{ eventsFor(toDateKey(d)).length - 2 }} más
          </span>
        </div>

        <div v-if="decorationsFor(toDateKey(d)).length" class="absolute bottom-1 right-1 flex items-center -space-x-2">
          <template v-for="deco in decorationsFor(toDateKey(d)).slice(0, 3)" :key="deco.id">
            <img
              v-if="deco.kind === 'sticker'"
              :src="deco.src"
              :alt="deco.label"
              class="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow"
              :style="{ transform: `rotate(${deco.rotation}deg)` }"
            />
            <span
              v-else
              class="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border border-black/10 shadow-sm"
              :style="{ backgroundColor: deco.color, transform: `rotate(${deco.rotation}deg)` }"
            />
          </template>
          <span v-if="decorationsFor(toDateKey(d)).length > 3" class="text-[9px] text-muted bg-surface rounded-full px-1">
            +{{ decorationsFor(toDateKey(d)).length - 3 }}
          </span>
        </div>
      </button>
    </div>
    </template>

    <CalendarThemePanel v-if="showTheme" @close="showTheme = false" />
    <CalendarDayModal v-if="selectedDate" :date="selectedDate" @close="selectedDate = null" />
  </div>
</template>
