<script setup lang="ts">
import { useCalendar, EVENT_COLORS, NOTE_COLORS, ALARM_OPTIONS, type CalendarEvent } from '~/composables/useCalendar'
import { fromDateKey, formatFullDate } from '~/utils/calendarDate'

const props = defineProps<{ date: string }>()
const emit = defineEmits<{ close: [] }>()

const { eventsForDate, decorationsForDate, addEvent, updateEvent, removeEvent, addDecoration, updateDecoration, removeDecoration, requestNotificationPermission, notificationPermission } = useCalendar()

const events = eventsForDate(props.date)
const decorations = decorationsForDate(props.date)

const dayLabel = computed(() => formatFullDate(fromDateKey(props.date)))

const newTitle = ref('')
const showAddForm = ref(false)

function submitNewEvent() {
  if (!newTitle.value.trim()) return
  addEvent({ date: props.date, time: null, title: newTitle.value, color: EVENT_COLORS[events.value.length % EVENT_COLORS.length] })
  newTitle.value = ''
  showAddForm.value = false
}

function onTimeChange(id: string, value: string) {
  updateEvent(id, { time: value || null })
}

function toggleAllDay(id: string, isAllDay: boolean) {
  updateEvent(id, { time: isAllDay ? null : '09:00' })
}

function toggleAlarm(id: string, current: boolean, hasTime: boolean) {
  if (!hasTime) return
  if (!current && notificationPermission.value === 'default') requestNotificationPermission()
  updateEvent(id, { alarmEnabled: !current })
}

const RECURRENCE_LABELS: Record<'daily' | 'weekly' | 'monthly' | 'yearly', string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

function onRecurrenceChange(id: string, value: string) {
  if (!value) {
    updateEvent(id, { recurrence: null })
    return
  }
  updateEvent(id, { recurrence: { freq: value as keyof typeof RECURRENCE_LABELS, endDate: null } })
}

function onRecurrenceEndDateChange(id: string, event: CalendarEvent, endDate: string) {
  if (!event.recurrence) return
  updateEvent(id, { recurrence: { freq: event.recurrence.freq, endDate: endDate || null } })
}

function onRemoveEvent(event: CalendarEvent) {
  if (event.recurrence && !confirm('Este evento se repite. Eliminarlo borra toda la serie, no solo este día. ¿Continuar?')) return
  removeEvent(event.id)
}

const showStickerPicker = ref(false)

function pickSticker(image: string, label: string) {
  addDecoration({ date: props.date, kind: 'sticker', src: image, label })
  showStickerPicker.value = false
}

function addNote() {
  addDecoration({ date: props.date, kind: 'note', title: '', text: '', color: NOTE_COLORS[decorations.value.length % NOTE_COLORS.length] })
}

function cycleNoteColor(id: string, current: string | undefined) {
  const idx = NOTE_COLORS.indexOf(current ?? NOTE_COLORS[0])
  updateDecoration(id, { color: NOTE_COLORS[(idx + 1) % NOTE_COLORS.length] })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" @click.self="emit('close')">
    <div class="w-full sm:max-w-lg bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[88vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">{{ dayLabel }}</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="overflow-y-auto flex flex-col gap-6 -mr-1 pr-1">
        <!-- Eventos -->
        <section class="flex flex-col gap-2.5">
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide px-0.5">Eventos</h3>

          <div v-if="!events.length && !showAddForm" class="text-sm text-muted px-0.5">Sin eventos este día.</div>

          <div v-for="event in events" :key="event.id" class="rounded-xl2 border border-border bg-surface-soft p-3 flex flex-col gap-2.5">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: event.color }" />
              <input
                :value="event.title"
                type="text"
                placeholder="Título del evento"
                class="flex-1 min-w-0 bg-transparent outline-none text-sm font-semibold text-ink"
                @input="updateEvent(event.id, { title: ($event.target as HTMLInputElement).value })"
              />
              <button type="button" class="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface" @click="onRemoveEvent(event)">
                <AppIcon name="x" :size="14" />
              </button>
            </div>

            <p v-if="event.recurrence" class="text-xs text-muted -mt-1">
              🔁 Se repite {{ RECURRENCE_LABELS[event.recurrence.freq].toLowerCase() }} — editar o eliminar afecta a toda la serie.
            </p>

            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="color in EVENT_COLORS"
                :key="color"
                type="button"
                class="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                :class="event.color === color ? 'border-accent' : 'border-transparent'"
                :style="{ backgroundColor: color }"
                @click="updateEvent(event.id, { color })"
              />
            </div>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <label class="flex items-center gap-1.5 text-muted">
                <input type="checkbox" :checked="!event.time" @change="toggleAllDay(event.id, ($event.target as HTMLInputElement).checked)" />
                Todo el día
              </label>
              <input
                v-if="event.time"
                type="time"
                :value="event.time"
                class="bg-surface text-ink rounded-lg px-2 py-1 outline-none border border-border focus:border-accent text-sm tabular-nums"
                @change="onTimeChange(event.id, ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                :class="event.alarmEnabled ? 'bg-accent-soft text-accent-deep' : 'bg-surface text-muted hover:text-ink'"
                :disabled="!event.time"
                :title="!event.time ? 'Agrega una hora para activar la alarma' : 'Activar/desactivar alarma'"
                @click="toggleAlarm(event.id, event.alarmEnabled, !!event.time)"
              >
                <AppIcon :name="event.alarmEnabled ? 'bell' : 'bell-off'" :size="14" />
                Alarma
              </button>
              <select
                v-if="event.alarmEnabled"
                :value="event.alarmMinutesBefore"
                class="bg-surface text-ink rounded-lg px-2 py-1.5 outline-none border border-border focus:border-accent text-xs"
                @change="updateEvent(event.id, { alarmMinutesBefore: Number(($event.target as HTMLSelectElement).value) })"
              >
                <option v-for="opt in ALARM_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>

            <div class="flex items-center gap-2 flex-wrap text-xs">
              <span class="text-muted">Repetir</span>
              <select
                :value="event.recurrence?.freq ?? ''"
                class="bg-surface text-ink rounded-lg px-2 py-1.5 outline-none border border-border focus:border-accent"
                @change="onRecurrenceChange(event.id, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">Nunca</option>
                <option v-for="(label, freq) in RECURRENCE_LABELS" :key="freq" :value="freq">{{ label }}</option>
              </select>
              <label v-if="event.recurrence" class="flex items-center gap-1.5 text-muted">
                Hasta
                <input
                  type="date"
                  :value="event.recurrence.endDate ?? ''"
                  class="bg-surface text-ink rounded-lg px-2 py-1 outline-none border border-border focus:border-accent"
                  @change="onRecurrenceEndDateChange(event.id, event, ($event.target as HTMLInputElement).value)"
                />
              </label>
            </div>
          </div>

          <div v-if="showAddForm" class="rounded-xl2 border border-dashed border-border p-3 flex items-center gap-2">
            <input
              v-model="newTitle"
              type="text"
              autofocus
              placeholder="Nuevo evento..."
              class="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink"
              @keyup.enter="submitNewEvent"
            />
            <button type="button" class="text-xs font-semibold text-accent-deep px-2 py-1" @click="submitNewEvent">Agregar</button>
            <button type="button" class="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="showAddForm = false">
              <AppIcon name="x" :size="14" />
            </button>
          </div>
          <button
            v-else
            type="button"
            class="flex items-center gap-1.5 text-sm font-medium text-accent-deep px-0.5 py-1 self-start"
            @click="showAddForm = true"
          >
            <AppIcon name="plus" :size="16" />
            Agregar evento
          </button>

          <p v-if="notificationPermission === 'denied'" class="text-xs text-muted px-0.5">
            Las notificaciones del navegador están bloqueadas: la alarma sonará y se mostrará en la app mientras esté abierta, pero no como notificación del sistema.
          </p>
        </section>

        <!-- Stickers y notas pegajosas -->
        <section class="flex flex-col gap-2.5">
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide px-0.5">Stickers y notas pegajosas</h3>

          <div v-if="decorations.length" class="flex flex-wrap gap-3">
            <div v-for="deco in decorations" :key="deco.id" class="relative">
              <template v-if="deco.kind === 'sticker'">
                <img :src="deco.src" :alt="deco.label" class="w-14 h-14 object-contain drop-shadow" :style="{ transform: `rotate(${deco.rotation}deg)` }" />
              </template>
              <template v-else>
                <div
                  class="w-32 rounded-md p-2 flex flex-col gap-1 shadow-sm"
                  :style="{ backgroundColor: deco.color || NOTE_COLORS[0], transform: `rotate(${deco.rotation}deg)` }"
                >
                  <input
                    :value="deco.title"
                    type="text"
                    placeholder="Título"
                    class="bg-transparent outline-none text-xs font-semibold text-black/70"
                    @input="updateDecoration(deco.id, { title: ($event.target as HTMLInputElement).value })"
                  />
                  <textarea
                    :value="deco.text"
                    rows="2"
                    placeholder="Escribe..."
                    class="bg-transparent outline-none text-xs text-black/70 placeholder-black/35 resize-none"
                    @input="updateDecoration(deco.id, { text: ($event.target as HTMLTextAreaElement).value })"
                  />
                  <button type="button" class="self-start w-3.5 h-3.5 rounded-full border border-black/20" :style="{ backgroundColor: deco.color }" title="Cambiar color" @click="cycleNoteColor(deco.id, deco.color)" />
                </div>
              </template>
              <button
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/50"
                @click="removeDecoration(deco.id)"
              >
                <AppIcon name="x" :size="11" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" class="flex items-center gap-1.5 text-sm font-medium text-accent-deep px-0.5 py-1" @click="showStickerPicker = true">
              <AppIcon name="sticker" :size="16" />
              Sticker
            </button>
            <button type="button" class="flex items-center gap-1.5 text-sm font-medium text-accent-deep px-0.5 py-1" @click="addNote">
              <AppIcon name="plus" :size="16" />
              Nota adhesiva
            </button>
          </div>
        </section>
      </div>

      <StickerGallery v-if="showStickerPicker" @close="showStickerPicker = false" @pick="pickSticker" />
    </div>
  </div>
</template>
