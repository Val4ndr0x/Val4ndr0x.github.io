<script setup lang="ts">
import { useCalendar } from '~/composables/useCalendar'
import { fromDateKey, formatFullDate } from '~/utils/calendarDate'

const { dueAlarms, dismissAlarm, snoozeAlarm } = useCalendar()
</script>

<template>
  <div class="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:w-80 z-[60] flex flex-col gap-2 pointer-events-none">
    <div
      v-for="alarm in dueAlarms"
      :key="alarm.id"
      class="pointer-events-auto bg-surface border border-accent shadow-lg rounded-xl2 p-3.5 flex items-start gap-3"
    >
      <div class="w-9 h-9 rounded-full bg-accent-soft text-accent-deep flex items-center justify-center shrink-0">
        <AppIcon name="bell" :size="18" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-ink truncate">{{ alarm.title }}</p>
        <p class="text-xs text-muted">{{ alarm.time }} · {{ formatFullDate(fromDateKey(alarm.date)) }}</p>
        <p v-if="alarm.note" class="text-xs text-muted mt-1 line-clamp-2">{{ alarm.note }}</p>
        <div class="flex items-center gap-3 mt-2">
          <button type="button" class="text-xs font-semibold text-accent-deep" @click="snoozeAlarm(alarm.id, 5)">Posponer 5 min</button>
          <button type="button" class="text-xs font-semibold text-muted hover:text-ink" @click="dismissAlarm(alarm.id)">Descartar</button>
        </div>
      </div>
      <button
        type="button"
        class="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft shrink-0"
        @click="dismissAlarm(alarm.id)"
      >
        <AppIcon name="x" :size="13" />
      </button>
    </div>
  </div>
</template>
