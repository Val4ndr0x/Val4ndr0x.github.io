<script setup lang="ts">
import { useCalendar } from '~/composables/useCalendar'
import { toDateKey, formatFullDate, isSameDay, occursOn } from '~/utils/calendarDate'

const props = defineProps<{ days: Date[]; hideEmpty?: boolean }>()
const emit = defineEmits<{ 'open-day': [d: Date] }>()

const { events, decorations } = useCalendar()
const today = new Date()

const rows = computed(() =>
  props.days
    .map((date) => {
      const key = toDateKey(date)
      return {
        date,
        key,
        events: events.value.filter((e) => occursOn(e, key)).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
        decorations: decorations.value.filter((d) => d.date === key),
      }
    })
    .filter((r) => !props.hideEmpty || r.events.length || r.decorations.length),
)
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pb-4 flex flex-col gap-3">
    <p v-if="!rows.length" class="text-center text-sm text-muted py-12">No hay eventos en este periodo.</p>

    <section
      v-for="row in rows"
      :key="row.key"
      class="rounded-xl2 border border-border bg-surface p-3 sm:p-4 cursor-pointer hover:border-accent transition-colors"
      :class="isSameDay(row.date, today) ? 'ring-2 ring-accent' : ''"
      @click="emit('open-day', row.date)"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-bold text-ink">
          {{ formatFullDate(row.date) }}
          <span v-if="isSameDay(row.date, today)" class="ml-1.5 text-[10px] font-semibold text-accent-deep bg-accent-soft rounded-full px-2 py-0.5">Hoy</span>
        </h3>
        <div v-if="row.decorations.length" class="flex items-center -space-x-1.5">
          <template v-for="deco in row.decorations.slice(0, 4)" :key="deco.id">
            <img v-if="deco.kind === 'sticker'" :src="deco.src" :alt="deco.label" class="w-6 h-6 object-contain drop-shadow" />
            <span v-else class="w-5 h-5 rounded-sm border border-black/10" :style="{ backgroundColor: deco.color }" />
          </template>
        </div>
      </div>

      <ul v-if="row.events.length" class="flex flex-col gap-1.5 list-none p-0 m-0">
        <li
          v-for="event in row.events"
          :key="event.id"
          class="flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-sm"
          :style="{ backgroundColor: event.color + '33' }"
        >
          <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: event.color }" />
          <span class="text-xs font-semibold text-muted w-12 shrink-0 mt-0.5">{{ event.time ?? 'Todo el día' }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-ink break-words">{{ event.title }}</span>
            <span v-if="event.note" class="block text-xs text-muted line-clamp-2">{{ event.note }}</span>
          </span>
          <AppIcon v-if="event.alarmEnabled" name="bell" :size="12" class="shrink-0 mt-1 text-muted" />
        </li>
      </ul>
      <p v-else class="text-xs text-muted">Sin eventos</p>
    </section>
  </div>
</template>
