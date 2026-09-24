import type { TodoList } from '~/composables/useLists'
import { toDateKey, addDays } from '~/utils/calendarDate'

function allCompletedTasks(lists: TodoList[]) {
  return lists.flatMap((l) => l.tasks).filter((t) => t.completed && t.completedAt !== null)
}

export function completedOnDateKey(lists: TodoList[], key: string): number {
  return allCompletedTasks(lists).filter((t) => toDateKey(new Date(t.completedAt!)) === key).length
}

export function completedToday(lists: TodoList[]): number {
  return completedOnDateKey(lists, toDateKey(new Date()))
}

export function completedThisWeek(lists: TodoList[]): number {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7 // 0 = lunes
  const monday = addDays(today, -mondayOffset)
  const mondayKey = toDateKey(monday)
  return allCompletedTasks(lists).filter((t) => toDateKey(new Date(t.completedAt!)) >= mondayKey).length
}

const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function last7DaysCounts(lists: TodoList[]): { key: string; label: string; count: number }[] {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  return days.map((d) => {
    const key = toDateKey(d)
    return { key, label: WEEKDAY_SHORT[d.getDay()], count: completedOnDateKey(lists, key) }
  })
}
