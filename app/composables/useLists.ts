import { addDays, addMonths, toDateKey } from '~/utils/calendarDate'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | null
/** Estado del pedido en la cafetería: 'new' = recién llegado, 'preparing' = aprobado. */
export type OrderStatus = 'new' | 'preparing'

export type Task = {
  id: string
  text: string
  completed: boolean
  createdAt: number
  priority: TaskPriority
  /** 'YYYY-MM-DD', o null si no tiene fecha límite. */
  dueDate: string | null
  recurrence: TaskRecurrence
  /** Persona (p. ej. un cliente) a quien le toca completar la tarea; opcional. */
  assignee: string | null
  completedAt: number | null
  /** Evita clonar dos veces la siguiente ocurrencia si se destoggle/completa de nuevo. */
  recurrenceSpawned: boolean
  orderStatus: OrderStatus
}

export type TodoList = {
  id: string
  name: string
  category: string | null
  color: string
  sticker: string | null
  /** Clave de fuente (ver app/utils/fonts.ts) para el nombre y las tareas de la lista. */
  font?: string
  createdAt: number
  tasks: Task[]
}

export const CARD_COLORS = ['#f3d9df', '#f4e8cf', '#dbe9dd', '#dbe3f2', '#e8dbf2', '#f2dbe8']

const STORAGE_KEY = 'todo-lists-v1'

const lists = ref<TodoList[]>([])
let loaded = false

function seedTask(text: string, completed: boolean, now: number): Task {
  return {
    id: uuid(),
    text,
    completed,
    createdAt: now,
    priority: 'medium',
    dueDate: null,
    recurrence: null,
    assignee: null,
    completedAt: completed ? now : null,
    recurrenceSpawned: false,
    orderStatus: 'new',
  }
}

function seedDefault(): TodoList[] {
  const now = Date.now()
  return [
    {
      id: uuid(),
      name: 'Compras semanales',
      category: null,
      color: CARD_COLORS[0],
      sticker: null,
      createdAt: now,
      tasks: [
        seedTask('Comprar leche y pan', false, now),
        seedTask('Frutas y verduras', true, now),
      ],
    },
    {
      id: uuid(),
      name: 'Proyecto Nuxt',
      category: 'Work',
      color: CARD_COLORS[3],
      sticker: null,
      createdAt: now,
      tasks: [
        seedTask('Configurar Tailwind', true, now),
        seedTask('Diseñar pantalla principal', false, now),
        seedTask('Conectar con backend', false, now),
      ],
    },
  ]
}

function sanitize(raw: unknown): TodoList[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((l): l is Record<string, any> => !!l && typeof l === 'object' && typeof l.id === 'string')
    .map((l) => ({
      id: l.id,
      name: typeof l.name === 'string' ? l.name : 'Sin título',
      category: typeof l.category === 'string' ? l.category : null,
      color: typeof l.color === 'string' ? l.color : CARD_COLORS[0],
      sticker: typeof l.sticker === 'string' ? l.sticker : null,
      font: typeof l.font === 'string' ? l.font : undefined,
      createdAt: typeof l.createdAt === 'number' ? l.createdAt : Date.now(),
      tasks: Array.isArray(l.tasks)
        ? l.tasks
            .filter((t: any) => !!t && typeof t === 'object' && typeof t.id === 'string')
            .map((t: any) => ({
              id: t.id,
              text: typeof t.text === 'string' ? t.text : '',
              completed: !!t.completed,
              createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
              priority: (['low', 'medium', 'high'] as const).includes(t.priority) ? t.priority : 'medium',
              dueDate: typeof t.dueDate === 'string' ? t.dueDate : null,
              recurrence: (['daily', 'weekly', 'monthly'] as const).includes(t.recurrence) ? t.recurrence : null,
              assignee: typeof t.assignee === 'string' && t.assignee.trim() ? t.assignee.trim() : null,
              completedAt: typeof t.completedAt === 'number' ? t.completedAt : null,
              recurrenceSpawned: !!t.recurrenceSpawned,
              orderStatus: t.orderStatus === 'preparing' ? 'preparing' : 'new',
            }))
        : [],
    }))
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    lists.value = raw ? sanitize(JSON.parse(raw)) : seedDefault()
  } catch {
    lists.value = seedDefault()
  }
  if (!lists.value.length) lists.value = seedDefault()
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists.value))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useLists() {
  load()

  const categories = computed(() => {
    const set = new Set<string>()
    for (const l of lists.value) if (l.category) set.add(l.category)
    return Array.from(set)
  })

  /** Responsables ya usados en tareas, para sugerirlos sin mezclarlos con la lista de clientes. */
  const assignees = computed(() => {
    const set = new Set<string>()
    for (const l of lists.value) for (const t of l.tasks) if (t.assignee) set.add(t.assignee)
    return Array.from(set)
  })

  function nextColor() {
    return CARD_COLORS[lists.value.length % CARD_COLORS.length]
  }

  function addList(name: string, category: string | null = null) {
    const trimmed = name.trim()
    if (!trimmed) return
    const list: TodoList = {
      id: uuid(),
      name: trimmed,
      category: category?.trim() || null,
      color: nextColor(),
      sticker: null,
      createdAt: Date.now(),
      tasks: [],
    }
    lists.value.unshift(list)
    persist()
    return list.id
  }

  function setListSticker(id: string, sticker: string | null) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    list.sticker = sticker
    persist()
  }

  function setListFont(id: string, font: string) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    list.font = font
    persist()
  }

  function editList(id: string, input: { name: string; category: string | null; color: string }) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    const name = input.name.trim()
    if (!name) return
    list.name = name
    list.category = input.category?.trim() || null
    list.color = input.color
    persist()
  }

  function renameList(id: string, name: string) {
    const list = lists.value.find((l) => l.id === id)
    const trimmed = name.trim()
    if (!list || !trimmed) return
    list.name = trimmed
    persist()
  }

  function deleteList(id: string) {
    lists.value = lists.value.filter((l) => l.id !== id)
    persist()
  }

  function getList(id: string) {
    return computed(() => lists.value.find((l) => l.id === id) ?? null)
  }

  function addTask(listId: string, text: string, assignee: string | null = null) {
    const trimmed = text.trim()
    if (!trimmed) return
    const list = lists.value.find((l) => l.id === listId)
    if (!list) return
    const id = uuid()
    list.tasks.unshift({
      id,
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority: 'medium',
      dueDate: null,
      recurrence: null,
      assignee: assignee?.trim() || null,
      completedAt: null,
      recurrenceSpawned: false,
      orderStatus: 'new',
    })
    persist()
    return id
  }

  function updateTaskMeta(listId: string, taskId: string, patch: Partial<Pick<Task, 'priority' | 'dueDate' | 'recurrence' | 'assignee'>>) {
    const list = lists.value.find((l) => l.id === listId)
    const task = list?.tasks.find((t) => t.id === taskId)
    if (!task) return
    Object.assign(task, patch)
    persist()
  }

  function editTask(listId: string, taskId: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const list = lists.value.find((l) => l.id === listId)
    const task = list?.tasks.find((t) => t.id === taskId)
    if (!task) return
    task.text = trimmed
    persist()
  }

  function nextDueDate(fromKey: string, recurrence: TaskRecurrence): string | null {
    if (!recurrence) return null
    const base = new Date(`${fromKey}T00:00:00`)
    if (recurrence === 'daily') return toDateKey(addDays(base, 1))
    if (recurrence === 'weekly') return toDateKey(addDays(base, 7))
    return toDateKey(addMonths(base, 1))
  }

  function toggleTask(listId: string, taskId: string) {
    const list = lists.value.find((l) => l.id === listId)
    const task = list?.tasks.find((t) => t.id === taskId)
    if (!task || !list) return

    const wasCompleted = task.completed
    task.completed = !task.completed

    if (!wasCompleted && task.completed) {
      task.completedAt = Date.now()
      useCompanion().awardTaskCompletion()
      usePointsLedger().record(task.id, task.assignee, POINTS_PER_TASK)

      if (task.recurrence && !task.recurrenceSpawned) {
        const fromKey = task.dueDate ?? toDateKey(new Date())
        list.tasks.unshift({
          id: uuid(),
          text: task.text,
          completed: false,
          createdAt: Date.now(),
          priority: task.priority,
          dueDate: nextDueDate(fromKey, task.recurrence),
          recurrence: task.recurrence,
          assignee: task.assignee,
          completedAt: null,
          recurrenceSpawned: false,
          orderStatus: 'new',
        })
        task.recurrenceSpawned = true
      }
    } else if (wasCompleted && !task.completed) {
      task.completedAt = null
      task.orderStatus = 'new'
    }

    persist()
  }

  function setOrderStatus(listId: string, taskId: string, status: OrderStatus) {
    const list = lists.value.find((l) => l.id === listId)
    const task = list?.tasks.find((t) => t.id === taskId)
    if (!task) return
    task.orderStatus = status
    persist()
  }

  function deleteTask(listId: string, taskId: string) {
    const list = lists.value.find((l) => l.id === listId)
    if (!list) return
    list.tasks = list.tasks.filter((t) => t.id !== taskId)
    persist()
  }

  function clearCompleted(listId: string) {
    const list = lists.value.find((l) => l.id === listId)
    if (!list) return
    list.tasks = list.tasks.filter((t) => !t.completed)
    persist()
  }

  return {
    lists,
    categories,
    assignees,
    addList,
    setListSticker,
    setListFont,
    editList,
    renameList,
    deleteList,
    getList,
    addTask,
    editTask,
    updateTaskMeta,
    toggleTask,
    setOrderStatus,
    deleteTask,
    clearCompleted,
  }
}
