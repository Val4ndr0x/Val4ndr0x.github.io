<script setup lang="ts">
import type { Task, TaskPriority } from '~/composables/useLists'
import { POINTS_PER_TASK } from '~/composables/useCompanion'
import { toDateKey } from '~/utils/calendarDate'

type Order = { task: Task; listId: string; listName: string }

const { lists, assignees, addTask, toggleTask, editTask, updateTaskMeta, setOrderStatus, deleteTask } = useLists()
const { clients, addClient } = useClients()
const { unlockedRecipes, announce } = useCafe()
const { play } = useSound()

const PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' }
const PRIORITY_DOT: Record<TaskPriority, string> = { low: 'bg-slate-300', medium: 'bg-amber-300', high: 'bg-rose-400' }
const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
const CUSTOMERS = ['🐱', '🐶', '🐰', '🐻', '🦊', '🐼', '🐨', '🐸', '🐷', '🐯']

const todayKey = computed(() => toDateKey(new Date()))


// Los pedidos más recientes van primero; el filtro separa los de clientes de los de lista.
type OrderFilter = 'all' | 'list' | 'client'
const filter = ref<OrderFilter>('all')

const allOrders = computed<Order[]>(() =>
  lists.value
    .flatMap((l) => l.tasks.filter((t) => !t.completed).map((task) => ({ task, listId: l.id, listName: l.name })))
    .sort((a, b) => b.task.createdAt - a.task.createdAt),
)

const clientCount = computed(() => allOrders.value.filter((o) => isClientName(o.task.assignee)).length)
const listCount = computed(() => allOrders.value.length - clientCount.value)

const orders = computed(() =>
  filter.value === 'all'
    ? allOrders.value
    : allOrders.value.filter((o) => isClientName(o.task.assignee) === (filter.value === 'client')),
)

const servedToday = computed(
  () =>
    lists.value
      .flatMap((l) => l.tasks)
      .filter((t) => t.completed && t.completedAt && toDateKey(new Date(t.completedAt)) === todayKey.value).length,
)

function hash(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

const dishFor = (id: string) => unlockedRecipes.value[hash(id) % unlockedRecipes.value.length]
const customerFor = (id: string) => CUSTOMERS[hash(id) % CUSTOMERS.length]

function dueLabel(t: Task) {
  if (!t.dueDate) return null
  if (t.dueDate === todayKey.value) return 'Para hoy'
  if (t.dueDate < todayKey.value) return 'Atrasado'
  const [y, m, d] = t.dueDate.split('-')
  return `Para el ${d}/${m}/${y.slice(2)}`
}

function approve(o: Order) {
  setOrderStatus(o.listId, o.task.id, 'preparing')
  play('pop')
}

function deliver(o: Order) {
  const dish = dishFor(o.task.id)
  toggleTask(o.listId, o.task.id)
  play('coin', 0.15)
  announce(`¡Servido! ${dish.emoji} +${POINTS_PER_TASK} ⭐`)
}

const confirmingId = ref<string | null>(null)
function reject(o: Order) {
  if (confirmingId.value !== o.task.id) {
    confirmingId.value = o.task.id
    return
  }
  confirmingId.value = null
  deleteTask(o.listId, o.task.id)
}

// Edición de la información del pedido
const editingId = ref<string | null>(null)
const draft = reactive({ text: '', priority: 'medium' as TaskPriority, dueDate: '', assignee: '' })

function startEdit(o: Order) {
  editingId.value = o.task.id
  draft.text = o.task.text
  draft.priority = o.task.priority
  draft.dueDate = o.task.dueDate ?? ''
  draft.assignee = o.task.assignee ?? ''
}

function saveEdit(o: Order) {
  editTask(o.listId, o.task.id, draft.text)
  updateTaskMeta(o.listId, o.task.id, {
    priority: draft.priority,
    dueDate: draft.dueDate || null,
    assignee: draft.assignee.trim() || null,
  })
  editingId.value = null
}

// Nuevo pedido: se elige el tipo (de lista o de cliente) desde el botón "Agregar nuevo pedido"
type NewOrderMode = 'list' | 'client'
const menuOpen = ref(false)
const mode = ref<NewOrderMode | null>(null)
const newText = ref('')
const newAssignee = ref('') // responsable (pedido de lista)
const newClientId = ref('') // cliente existente; '' = escribir uno nuevo
const newClientName = ref('')
const newListId = ref('')
watch(
  lists,
  (l) => {
    if (!l.some((x) => x.id === newListId.value)) newListId.value = l[0]?.id ?? ''
  },
  { immediate: true, deep: false },
)

// Al elegir un cliente existente se toman sus datos de la tarjeta de Clientes (su pedido, si tiene).
watch(newClientId, (id) => {
  const c = clients.value.find((x) => x.id === id)
  if (c && !newText.value.trim()) newText.value = c.order
})

function chooseMode(m: NewOrderMode) {
  mode.value = m
  menuOpen.value = false
}

function closeForm() {
  mode.value = null
  newText.value = ''
  newAssignee.value = ''
  newClientId.value = ''
  newClientName.value = ''
}

const selectedClient = computed(() => clients.value.find((c) => c.id === newClientId.value) ?? null)
const canSubmit = computed(() => {
  if (!newText.value.trim() || !newListId.value) return false
  return mode.value === 'client' ? !!(selectedClient.value || newClientName.value.trim()) : true
})

function submitNew() {
  if (!canSubmit.value) return
  if (mode.value === 'client') {
    let name = selectedClient.value?.name ?? newClientName.value.trim()
    const existing = clients.value.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (existing) name = existing.name
    else addClient({ name, order: newText.value.trim(), deliveryDate: '', price: 0, paymentStatus: 'no_pagado', deposit: 0, sticker: null })
    addTask(newListId.value, newText.value, name)
  } else {
    addTask(newListId.value, newText.value, newAssignee.value.trim() || null)
  }
  play('pop')
  closeForm()
}

const isClientName = (name: string | null) => !!name && clients.value.some((c) => c.name.toLowerCase() === name.toLowerCase())
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-2">
      <div v-if="!mode" class="relative">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 bg-accent text-white rounded-full px-4 py-2.5 text-sm font-semibold hover:brightness-105 active:scale-95 transition"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon name="plus" :size="16" /> Agregar nuevo pedido
        </button>
        <div v-if="menuOpen" class="mt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            class="flex-1 bg-surface border border-border rounded-xl2 px-4 py-3 text-sm font-semibold text-ink hover:border-accent transition"
            @click="chooseMode('list')"
          >
            📋 Agregar pedido de lista
          </button>
          <button
            type="button"
            class="flex-1 bg-surface border border-border rounded-xl2 px-4 py-3 text-sm font-semibold text-ink hover:border-accent transition"
            @click="chooseMode('client')"
          >
            🧾 Agregar pedido de cliente
          </button>
        </div>
      </div>

      <form v-else class="bg-surface border border-border rounded-xl2 p-3 flex flex-col gap-2" @submit.prevent="submitNew">
        <p class="text-xs font-semibold text-muted">{{ mode === 'list' ? 'Pedido de lista' : 'Pedido de cliente' }}</p>
        <input
          v-model="newText"
          type="text"
          maxlength="120"
          placeholder="Pedido..."
          class="w-full bg-base text-ink placeholder-muted rounded-full px-4 py-2.5 text-sm outline-none border border-border focus:border-accent"
        />
        <div class="flex flex-wrap gap-2">
          <select
            v-model="newListId"
            class="flex-1 min-w-[8rem] bg-base text-ink rounded-full px-3 py-2.5 text-xs outline-none border border-border focus:border-accent"
            title="Mesa (lista) del pedido"
          >
            <option v-for="l in lists" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>

          <input
            v-if="mode === 'list'"
            v-model="newAssignee"
            type="text"
            list="cafe-assignees"
            maxlength="40"
            autocomplete="off"
            placeholder="Responsable (opcional)"
            class="flex-1 min-w-[10rem] bg-base text-ink placeholder-muted rounded-full px-4 py-2.5 text-sm outline-none border border-border focus:border-accent"
          />
          <template v-else>
            <select
              v-model="newClientId"
              class="flex-1 min-w-[10rem] bg-base text-ink rounded-full px-3 py-2.5 text-xs outline-none border border-border focus:border-accent"
              title="Cliente de la sección Clientes"
            >
              <option value="">➕ Cliente nuevo…</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <input
              v-if="!newClientId"
              v-model="newClientName"
              type="text"
              maxlength="40"
              autocomplete="off"
              placeholder="Nombre del cliente nuevo"
              class="basis-full bg-base text-ink placeholder-muted rounded-full px-4 py-2.5 text-sm outline-none border border-border focus:border-accent"
            />
          </template>
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            class="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:brightness-105 active:scale-95 transition disabled:opacity-40"
            :disabled="!canSubmit"
          >
            Agregar pedido
          </button>
          <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-ink transition" @click="closeForm">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="f in ([
          { id: 'all', label: 'Recientes', count: allOrders.length },
          { id: 'list', label: '📋 Listas', count: listCount },
          { id: 'client', label: '🧾 Clientes', count: clientCount },
        ] as { id: OrderFilter; label: string; count: number }[])"
        :key="f.id"
        type="button"
        class="px-3 py-1 rounded-full text-xs font-semibold border transition"
        :class="filter === f.id ? 'border-accent text-accent-deep bg-accent-soft' : 'border-border text-muted bg-surface'"
        @click="filter = f.id"
      >
        {{ f.label }} · {{ f.count }}
      </button>
    </div>

    <p class="text-xs text-muted">
      {{ orders.length }} {{ orders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes' }} · {{ servedToday }} servidos hoy
    </p>

    <p v-if="!orders.length" class="text-sm text-muted text-center py-8">
      No hay pedidos en la barra. ¡Buen momento para un café! ☕
    </p>

    <ul class="flex flex-col gap-2.5">
      <li
        v-for="o in orders"
        :key="o.task.id"
        class="bg-surface border rounded-xl2 p-3.5 flex flex-col gap-2.5"
        :class="o.task.orderStatus === 'preparing' ? 'border-accent' : 'border-border'"
      >
        <template v-if="editingId !== o.task.id">
          <div class="flex items-start gap-3">
            <span class="w-11 h-11 rounded-full bg-base border border-border flex items-center justify-center text-2xl shrink-0">
              {{ customerFor(o.task.id) }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink break-words">{{ o.task.text }}</p>
              <p class="text-xs text-muted mt-0.5">
                {{ o.task.assignee ? (isClientName(o.task.assignee) ? `Pide ${o.task.assignee}` : `Responsable: ${o.task.assignee}`) : 'Cliente de paso' }} · Mesa {{ o.listName }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ dishFor(o.task.id).emoji }} {{ dishFor(o.task.id).label }}
              </p>
            </div>
            <span
              class="shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1"
              :class="o.task.orderStatus === 'preparing' ? 'bg-accent-soft text-accent-deep' : 'bg-base text-muted border border-border'"
            >
              {{ o.task.orderStatus === 'preparing' ? 'En preparación' : 'Nuevo' }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border font-semibold"
              :class="isClientName(o.task.assignee) ? 'bg-accent-soft text-accent-deep border-accent' : 'bg-base border-border'"
            >
              {{ isClientName(o.task.assignee) ? '🧾 Clientes' : '📋 Listas' }}
            </span>
            <span class="inline-flex items-center gap-1 bg-base border border-border rounded-full px-2 py-0.5">
              <span class="w-1.5 h-1.5 rounded-full" :class="PRIORITY_DOT[o.task.priority]" />
              {{ PRIORITY_LABELS[o.task.priority] }}
            </span>
            <span
              v-if="dueLabel(o.task)"
              class="bg-base border rounded-full px-2 py-0.5"
              :class="dueLabel(o.task) === 'Atrasado' ? 'border-danger text-danger' : 'border-border'"
            >
              {{ dueLabel(o.task) }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="o.task.orderStatus === 'new'"
              type="button"
              class="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:brightness-105 active:scale-95 transition"
              @click="approve(o)"
            >
              Aprobar
            </button>
            <button
              v-else
              type="button"
              class="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:brightness-105 active:scale-95 transition"
              @click="deliver(o)"
            >
              Entregar · +{{ POINTS_PER_TASK }} ⭐
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full bg-base border border-border text-ink text-xs font-semibold hover:border-accent transition"
              @click="startEdit(o)"
            >
              Editar
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              :class="confirmingId === o.task.id ? 'bg-danger text-white' : 'text-muted hover:text-ink'"
              @click="reject(o)"
              @blur="confirmingId = null"
            >
              {{ confirmingId === o.task.id ? '¿Seguro?' : 'Rechazar' }}
            </button>
          </div>
        </template>

        <template v-else>
          <input
            v-model="draft.text"
            type="text"
            maxlength="120"
            class="w-full bg-base text-ink rounded-full px-4 py-2 text-sm outline-none border border-border focus:border-accent"
            @keyup.enter="saveEdit(o)"
            @keyup.esc="editingId = null"
          />
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="p in (['low', 'medium', 'high'] as TaskPriority[])"
              :key="p"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition"
              :class="draft.priority === p ? 'border-accent text-accent-deep bg-accent-soft' : 'border-border text-muted bg-base'"
              @click="draft.priority = p"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="PRIORITY_DOT[p]" />
              {{ PRIORITY_LABELS[p] }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <label class="flex items-center gap-2 text-xs text-muted">
              Para
              <input v-model="draft.dueDate" type="date" class="bg-base text-ink rounded-full px-3 py-1.5 text-xs outline-none border border-border focus:border-accent" />
            </label>
            <label class="flex items-center gap-2 text-xs text-muted flex-1 min-w-[10rem]">
              {{ isClientName(o.task.assignee) ? 'Cliente' : 'Responsable' }}
              <input
                v-model="draft.assignee"
                type="text"
                list="cafe-clients"
                maxlength="40"
                placeholder="Nombre"
                class="flex-1 min-w-0 bg-base text-ink rounded-full px-3 py-1.5 text-xs outline-none border border-border focus:border-accent"
              />
            </label>
          </div>
          <div class="flex gap-2">
            <button type="button" class="px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:brightness-105 transition" @click="saveEdit(o)">
              Guardar
            </button>
            <button type="button" class="px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-ink transition" @click="editingId = null">
              Cancelar
            </button>
          </div>
        </template>
      </li>
    </ul>

    <datalist id="cafe-assignees">
      <option v-for="a in assignees" :key="a" :value="a" />
    </datalist>
    <datalist id="cafe-clients">
      <option v-for="c in clients" :key="c.id" :value="c.name" />
    </datalist>
  </div>
</template>
