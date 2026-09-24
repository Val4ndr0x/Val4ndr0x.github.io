import { combineDateTime, occursOn, toDateKey, type RecurrenceRule } from '~/utils/calendarDate'

export type CalendarEvent = {
  id: string
  /** 'YYYY-MM-DD' (fecha ancla; si es recurrente, las ocurrencias se calculan a partir de esta). */
  date: string
  /** 'HH:mm', o null para "todo el día" (sin alarma posible). */
  time: string | null
  title: string
  note: string
  color: string
  alarmEnabled: boolean
  alarmMinutesBefore: number
  recurrence: RecurrenceRule | null
  /** date-key de la última ocurrencia cuya alarma ya sonó, o null. */
  lastNotifiedOccurrence: string | null
  /** timestamp (ms) hasta el cual posponer la alarma, o null. */
  snoozeUntil: number | null
}

export type CalendarDecorationKind = 'sticker' | 'note'

export type CalendarDecoration = {
  id: string
  /** 'YYYY-MM-DD' */
  date: string
  kind: CalendarDecorationKind
  /** URL del sticker (kind 'sticker'). */
  src?: string
  label?: string
  /** Nota adhesiva (kind 'note'). */
  title?: string
  text?: string
  color?: string
  rotation: number
}

const EVENTS_KEY = 'todo-calendar-events-v1'
const DECOR_KEY = 'todo-calendar-decorations-v1'

export const EVENT_COLORS = ['#e8a2a0', '#f0c179', '#a8d3a0', '#8ec4e0', '#bfa8e0', '#eda0c4']
export const NOTE_COLORS = ['#fdeec9', '#eef0d9', '#dbe7f5', '#e6dbf0', '#fbe3ea', '#d9f0ea']

export const ALARM_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'A la hora' },
  { value: 5, label: '5 min antes' },
  { value: 10, label: '10 min antes' },
  { value: 15, label: '15 min antes' },
  { value: 30, label: '30 min antes' },
  { value: 60, label: '1 hora antes' },
]

const events = ref<CalendarEvent[]>([])
const decorations = ref<CalendarDecoration[]>([])
const dueAlarms = ref<CalendarEvent[]>([])
const notificationPermission = ref<NotificationPermission>('default')
let eventsLoaded = false
let decorLoaded = false

const RECURRENCE_FREQS = ['daily', 'weekly', 'monthly', 'yearly'] as const

function sanitizeRecurrence(raw: unknown): RecurrenceRule | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, any>
  if (!RECURRENCE_FREQS.includes(r.freq)) return null
  return { freq: r.freq, endDate: typeof r.endDate === 'string' ? r.endDate : null }
}

function sanitizeEvents(raw: unknown): CalendarEvent[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((e): e is Record<string, any> => !!e && typeof e === 'object' && typeof e.id === 'string' && typeof e.date === 'string')
    .map((e) => ({
      id: e.id,
      date: e.date,
      time: typeof e.time === 'string' ? e.time : null,
      title: typeof e.title === 'string' ? e.title : 'Evento',
      note: typeof e.note === 'string' ? e.note : '',
      color: typeof e.color === 'string' ? e.color : EVENT_COLORS[0],
      alarmEnabled: !!e.alarmEnabled,
      alarmMinutesBefore: typeof e.alarmMinutesBefore === 'number' ? e.alarmMinutesBefore : 0,
      recurrence: sanitizeRecurrence(e.recurrence),
      // Migración: los eventos viejos con notified:true no deben volver a sonar tras la actualización.
      lastNotifiedOccurrence:
        typeof e.lastNotifiedOccurrence === 'string' ? e.lastNotifiedOccurrence : e.notified === true ? e.date : null,
      snoozeUntil: typeof e.snoozeUntil === 'number' ? e.snoozeUntil : null,
    }))
}

function sanitizeDecorations(raw: unknown): CalendarDecoration[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((d): d is Record<string, any> => !!d && typeof d === 'object' && typeof d.id === 'string' && typeof d.date === 'string')
    .map((d) => ({
      id: d.id,
      date: d.date,
      kind: d.kind === 'note' ? 'note' : 'sticker',
      src: typeof d.src === 'string' ? d.src : undefined,
      label: typeof d.label === 'string' ? d.label : undefined,
      title: typeof d.title === 'string' ? d.title : undefined,
      text: typeof d.text === 'string' ? d.text : undefined,
      color: typeof d.color === 'string' ? d.color : undefined,
      rotation: typeof d.rotation === 'number' ? d.rotation : 0,
    })) as CalendarDecoration[]
}

function loadEvents() {
  if (eventsLoaded || !import.meta.client) return
  eventsLoaded = true
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    events.value = raw ? sanitizeEvents(JSON.parse(raw)) : []
  } catch {
    events.value = []
  }
}

function persistEvents() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.value))
  } catch {
    // ignore write failures (e.g. private browsing, cupo lleno)
  }
}

function loadDecorations() {
  if (decorLoaded || !import.meta.client) return
  decorLoaded = true
  try {
    const raw = localStorage.getItem(DECOR_KEY)
    decorations.value = raw ? sanitizeDecorations(JSON.parse(raw)) : []
  } catch {
    decorations.value = []
  }
}

function persistDecorations() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(DECOR_KEY, JSON.stringify(decorations.value))
  } catch {
    // ignore write failures
  }
}

function randomRotation(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return ((Math.abs(hash) % 900) / 100) - 4.5 // rango aprox. [-4.5, 4.5] grados
}

function playAlarmSound() {
  if (!import.meta.client) return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    const beepAt = (start: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + 0.32)
    }
    beepAt(0)
    beepAt(0.4)
    beepAt(0.8)
  } catch {
    // Web Audio no disponible; la alarma seguirá mostrando el banner igual.
  }
}

export function useCalendar() {
  loadEvents()
  loadDecorations()
  if (import.meta.client && 'Notification' in window) {
    notificationPermission.value = Notification.permission
  }

  function eventsForDate(date: string) {
    return computed(() =>
      events.value
        .filter((e) => occursOn(e, date))
        .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    )
  }

  function decorationsForDate(date: string) {
    return computed(() => decorations.value.filter((d) => d.date === date))
  }

  function addEvent(input: { date: string; time: string | null; title: string; note?: string; color?: string; alarmEnabled?: boolean; alarmMinutesBefore?: number; recurrence?: RecurrenceRule | null }) {
    const event: CalendarEvent = {
      id: uuid(),
      date: input.date,
      time: input.time,
      title: input.title.trim() || 'Evento',
      note: input.note ?? '',
      color: input.color ?? EVENT_COLORS[0],
      alarmEnabled: !!input.alarmEnabled && !!input.time,
      alarmMinutesBefore: input.alarmMinutesBefore ?? 0,
      recurrence: input.recurrence ?? null,
      lastNotifiedOccurrence: null,
      snoozeUntil: null,
    }
    events.value.push(event)
    persistEvents()
    return event.id
  }

  function updateEvent(id: string, patch: Partial<Omit<CalendarEvent, 'id'>>) {
    const event = events.value.find((e) => e.id === id)
    if (!event) return
    Object.assign(event, patch)
    if (!event.time) event.alarmEnabled = false
    // Cualquier cambio relevante reactiva la alarma para la nueva fecha/hora.
    event.lastNotifiedOccurrence = null
    event.snoozeUntil = null
    persistEvents()
  }

  function removeEvent(id: string) {
    events.value = events.value.filter((e) => e.id !== id)
    dueAlarms.value = dueAlarms.value.filter((e) => e.id !== id)
    persistEvents()
  }

  function addDecoration(input: { date: string; kind: CalendarDecorationKind; src?: string; label?: string; title?: string; text?: string; color?: string }) {
    const id = uuid()
    const decoration: CalendarDecoration = { id, rotation: randomRotation(id), ...input }
    decorations.value.push(decoration)
    persistDecorations()
    return id
  }

  function updateDecoration(id: string, patch: Partial<Omit<CalendarDecoration, 'id'>>) {
    const decoration = decorations.value.find((d) => d.id === id)
    if (!decoration) return
    Object.assign(decoration, patch)
    persistDecorations()
  }

  function removeDecoration(id: string) {
    decorations.value = decorations.value.filter((d) => d.id !== id)
    persistDecorations()
  }

  function requestNotificationPermission() {
    if (!import.meta.client || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => {
        notificationPermission.value = p
      })
    } else {
      notificationPermission.value = Notification.permission
    }
  }

  /** Revisa qué alarmas deben sonar ahora. Se llama periódicamente desde un plugin cliente. */
  function checkAlarms(now: Date = new Date()) {
    if (!import.meta.client) return
    let changed = false
    const todayKey = toDateKey(now)
    for (const event of events.value) {
      if (!event.alarmEnabled || !event.time) continue
      if (!occursOn(event, todayKey)) continue
      if (event.lastNotifiedOccurrence === todayKey) continue
      if (event.snoozeUntil && now.getTime() < event.snoozeUntil) continue

      const eventAt = combineDateTime(todayKey, event.time)
      const alarmAt = new Date(eventAt.getTime() - event.alarmMinutesBefore * 60000)
      if (now.getTime() < alarmAt.getTime()) continue

      changed = true
      // Si la app estuvo cerrada y ya pasó más de una hora del evento, no molestar con una alarma vieja.
      if (now.getTime() - eventAt.getTime() > 60 * 60000) {
        event.lastNotifiedOccurrence = todayKey
        continue
      }

      event.lastNotifiedOccurrence = todayKey
      event.snoozeUntil = null
      // Copia con `date` = fecha de la ocurrencia de hoy, para que el banner muestre la fecha correcta en eventos recurrentes.
      dueAlarms.value.push({ ...event, date: todayKey })

      if (notificationPermission.value === 'granted' && 'Notification' in window) {
        try {
          new Notification(event.title || 'Recordatorio', {
            body: event.note || eventAt.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
            tag: event.id,
          })
        } catch {
          // ignore
        }
      }
      playAlarmSound()
    }
    if (changed) persistEvents()
  }

  function dismissAlarm(id: string) {
    dueAlarms.value = dueAlarms.value.filter((e) => e.id !== id)
  }

  function snoozeAlarm(id: string, minutes = 5) {
    const event = events.value.find((e) => e.id === id)
    if (event) {
      event.lastNotifiedOccurrence = null
      event.snoozeUntil = Date.now() + minutes * 60000
      persistEvents()
    }
    dismissAlarm(id)
  }

  return {
    events,
    decorations,
    eventsForDate,
    decorationsForDate,
    addEvent,
    updateEvent,
    removeEvent,
    addDecoration,
    updateDecoration,
    removeDecoration,
    checkAlarms,
    dueAlarms,
    dismissAlarm,
    snoozeAlarm,
    requestNotificationPermission,
    notificationPermission,
  }
}
