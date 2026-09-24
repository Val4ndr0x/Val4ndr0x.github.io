export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function combineDateTime(dateKey: string, time: string | null): Date {
  const base = fromDateKey(dateKey)
  if (!time) return base
  const [h, min] = time.split(':').map(Number)
  base.setHours(h ?? 0, min ?? 0, 0, 0)
  return base
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export type RecurrenceRule = {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  /** 'YYYY-MM-DD', o null para "sin fin". */
  endDate: string | null
}

/** ¿El evento (con fecha ancla `event.date`) tiene una ocurrencia en `dateKey`? */
export function occursOn(event: { date: string; recurrence: RecurrenceRule | null }, dateKey: string): boolean {
  if (dateKey < event.date) return false
  if (!event.recurrence) return event.date === dateKey
  if (event.recurrence.endDate && dateKey > event.recurrence.endDate) return false

  if (event.recurrence.freq === 'daily') return true

  const anchor = fromDateKey(event.date)
  const target = fromDateKey(dateKey)

  if (event.recurrence.freq === 'weekly') {
    const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86400000)
    return diffDays % 7 === 0
  }

  // monthly / yearly: mismo día del mes (clampeado a meses cortos), y mismo mes para 'yearly'.
  if (event.recurrence.freq === 'yearly' && target.getMonth() !== anchor.getMonth()) return false

  const expectedDay = Math.min(anchor.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
  return target.getDate() === expectedDay
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Cuadrícula de 42 días (6 semanas), empezando en lunes, que cubre el mes indicado. */
export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const firstWeekday = (first.getDay() + 6) % 7 // 0 = lunes
  const gridStart = new Date(year, month, 1 - firstWeekday)
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
}

const MONTH_LABELS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAY_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatMonthYear(year: number, month: number): string {
  return `${capitalize(MONTH_LABELS[month] ?? '')} ${year}`
}

export function formatFullDate(d: Date): string {
  return `${capitalize(WEEKDAY_FULL[d.getDay()] ?? '')}, ${d.getDate()} de ${MONTH_LABELS[d.getMonth()]}`
}
