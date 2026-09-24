export type PaymentStatus = 'pagado' | 'no_pagado' | 'abono'

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pagado: 'Pagó',
  no_pagado: 'No pagó',
  abono: 'Abonó',
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'nequi' | 'daviplata' | 'otro'

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; emoji: string }> = {
  efectivo: { label: 'Efectivo', emoji: '💵' },
  transferencia: { label: 'Transferencia', emoji: '🏦' },
  tarjeta: { label: 'Tarjeta', emoji: '💳' },
  nequi: { label: 'Nequi', emoji: '📱' },
  daviplata: { label: 'Daviplata', emoji: '📲' },
  otro: { label: 'Otro', emoji: '✨' },
}

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === 'string' && v in PAYMENT_METHODS
}

export type Client = {
  id: string
  name: string
  /** Categoría del cliente (p. ej. tipo de negocio); null si no tiene. */
  category: string | null
  order: string
  deliveryDate: string
  /** Precio total del producto. */
  price: number
  paymentStatus: PaymentStatus
  /** Monto ya pagado (abono). Con 'pagado' equivale al precio; con 'no_pagado' es 0. */
  deposit: number
  /** Método con el que se pagó (o abonó); null si aún no se sabe. */
  paymentMethod: PaymentMethod | null
  sticker: string | null
  delivered: boolean
  color: string
  createdAt: number
}

export type ClientInput = {
  name: string
  category?: string | null
  order: string
  deliveryDate: string
  price: number
  paymentStatus: PaymentStatus
  deposit: number
  paymentMethod?: PaymentMethod | null
  sticker: string | null
}

export function amountPaid(client: Pick<Client, 'price' | 'paymentStatus' | 'deposit'>) {
  if (client.paymentStatus === 'pagado') return client.price
  if (client.paymentStatus === 'no_pagado') return 0
  return Math.min(client.deposit, client.price > 0 ? client.price : client.deposit)
}

export function amountDue(client: Pick<Client, 'price' | 'paymentStatus' | 'deposit'>) {
  return Math.max(0, client.price - amountPaid(client))
}

function normalizePayment(input: Pick<ClientInput, 'price' | 'paymentStatus' | 'deposit'>) {
  const price = Number.isFinite(input.price) && input.price > 0 ? input.price : 0
  const status: PaymentStatus = (['pagado', 'no_pagado', 'abono'] as const).includes(input.paymentStatus) ? input.paymentStatus : 'no_pagado'
  let deposit = Number.isFinite(input.deposit) && input.deposit > 0 ? input.deposit : 0
  if (status === 'pagado') deposit = price
  else if (status === 'no_pagado') deposit = 0
  return { price, paymentStatus: status, deposit }
}

export const CLIENT_COLORS = ['#fbe4ec', '#fff3d6', '#e0f5e9', '#e2ecfb', '#f2e6fb', '#fde8e2']

const STORAGE_KEY = 'todo-clients-v1'

const clients = ref<Client[]>([])
let loaded = false

function sanitize(raw: unknown): Client[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((c): c is Record<string, any> => !!c && typeof c === 'object' && typeof c.id === 'string')
    .map((c) => ({
      id: c.id,
      name: typeof c.name === 'string' ? c.name : 'Sin nombre',
      category: typeof c.category === 'string' && c.category.trim() ? c.category.trim() : null,
      order: typeof c.order === 'string' ? c.order : '',
      deliveryDate: typeof c.deliveryDate === 'string' ? c.deliveryDate : '',
      ...normalizePayment({
        price: typeof c.price === 'number' ? c.price : 0,
        deposit: typeof c.deposit === 'number' ? c.deposit : 0,
        // Clientes guardados antes de existir el estado de pago: con abono previo se consideran "abonó".
        paymentStatus: ['pagado', 'no_pagado', 'abono'].includes(c.paymentStatus)
          ? c.paymentStatus
          : typeof c.deposit === 'number' && c.deposit > 0 ? 'abono' : 'no_pagado',
      }),
      paymentMethod: isPaymentMethod(c.paymentMethod) ? c.paymentMethod : null,
      sticker: typeof c.sticker === 'string' ? c.sticker : null,
      delivered: !!c.delivered,
      color: typeof c.color === 'string' ? c.color : CLIENT_COLORS[0],
      createdAt: typeof c.createdAt === 'number' ? c.createdAt : Date.now(),
    }))
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    clients.value = raw ? sanitize(JSON.parse(raw)) : []
  } catch {
    clients.value = []
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients.value))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useClients() {
  load()

  const categories = computed(() => {
    const set = new Set<string>()
    for (const c of clients.value) if (c.category) set.add(c.category)
    return Array.from(set)
  })

  function nextColor() {
    return CLIENT_COLORS[clients.value.length % CLIENT_COLORS.length]
  }

  function addClient(input: ClientInput) {
    const name = input.name.trim()
    if (!name) return
    const client: Client = {
      id: uuid(),
      name,
      category: input.category?.trim() || null,
      order: input.order.trim(),
      deliveryDate: input.deliveryDate,
      ...normalizePayment(input),
      paymentMethod: isPaymentMethod(input.paymentMethod) ? input.paymentMethod : null,
      sticker: input.sticker,
      delivered: false,
      color: nextColor(),
      createdAt: Date.now(),
    }
    clients.value.unshift(client)
    persist()
    return client.id
  }

  function updateClient(id: string, input: ClientInput) {
    const client = clients.value.find((c) => c.id === id)
    if (!client) return
    const name = input.name.trim()
    if (!name) return
    client.name = name
    client.category = input.category?.trim() || null
    client.order = input.order.trim()
    client.deliveryDate = input.deliveryDate
    Object.assign(client, normalizePayment(input))
    client.paymentMethod = isPaymentMethod(input.paymentMethod) ? input.paymentMethod : null
    client.sticker = input.sticker
    persist()
  }

  function renameClient(id: string, name: string) {
    const client = clients.value.find((c) => c.id === id)
    const trimmed = name.trim()
    if (!client || !trimmed) return
    client.name = trimmed
    persist()
  }

  function deleteClient(id: string) {
    clients.value = clients.value.filter((c) => c.id !== id)
    persist()
  }

  function toggleDelivered(id: string) {
    const client = clients.value.find((c) => c.id === id)
    if (!client) return
    client.delivered = !client.delivered
    persist()
  }

  return {
    clients,
    categories,
    addClient,
    updateClient,
    renameClient,
    deleteClient,
    toggleDelivered,
  }
}
