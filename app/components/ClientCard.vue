<script setup lang="ts">
import type { Client } from '~/composables/useClients'
import { amountDue, amountPaid, PAYMENT_LABELS, PAYMENT_METHODS } from '~/composables/useClients'

const props = defineProps<{ client: Client }>()
const emit = defineEmits<{ open: [id: string]; delete: [id: string]; toggleDelivered: [id: string] }>()

const menuOpen = ref(false)

const formattedDate = computed(() => {
  if (!props.client.deliveryDate) return 'Sin fecha'
  const d = new Date(`${props.client.deliveryDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
})

const money = (n: number) => `$${n.toLocaleString('es')}`
const paymentSummary = computed(() => {
  const c = props.client
  if (c.paymentStatus === 'pagado') return 'Sin deuda'
  if (c.paymentStatus === 'no_pagado') return c.price > 0 ? `Debe ${money(c.price)}` : 'Sin pago'
  return `${money(amountPaid(c))}${c.price > 0 ? ` · falta ${money(amountDue(c))}` : ''}`
})
const paymentChip = computed(() =>
  props.client.paymentStatus === 'pagado'
    ? 'bg-emerald-600/85 text-white'
    : props.client.paymentStatus === 'abono'
      ? 'bg-amber-500/85 text-white'
      : 'bg-rose-500/80 text-white',
)

function onDelete() {
  menuOpen.value = false
  if (!confirm(`¿Eliminar a "${props.client.name}"? Esta acción no se puede deshacer.`)) return
  emit('delete', props.client.id)
}
</script>

<template>
  <div
    class="relative flex flex-col gap-2.5 rounded-[22px] p-4 pt-5 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition-all"
    :style="{ backgroundColor: client.color }"
    @click="emit('open', client.id)"
  >
    <img
      v-if="client.sticker"
      :src="client.sticker"
      alt=""
      class="absolute -top-4 -right-3 w-14 h-14 object-contain drop-shadow-md rotate-[12deg] pointer-events-none select-none"
    />

    <button
      type="button"
      class="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-black/40 hover:bg-black/10"
      @click.stop="menuOpen = !menuOpen"
    >
      <AppIcon name="dots" :size="16" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute top-10 right-2 bg-white dark:bg-surface text-black/80 dark:text-ink rounded-lg shadow-lg text-sm overflow-hidden z-10 border border-black/5 dark:border-border"
      @click.stop
    >
      <button type="button" class="block w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-surface-soft text-danger" @click="onDelete">
        Eliminar cliente
      </button>
    </div>

    <div class="flex items-center gap-2 pr-6">
      <span class="w-8 h-8 shrink-0 rounded-full bg-white/70 flex items-center justify-center text-black/60">
        <AppIcon name="user" :size="16" />
      </span>
      <span class="font-bold text-black/80 leading-tight line-clamp-1">{{ client.name }}</span>
    </div>
    <span v-if="client.category" class="self-start -mt-1 px-2 py-0.5 rounded-full bg-white/70 text-[10px] font-semibold text-black/55">{{ client.category }}</span>

    <p class="text-sm text-black/65 leading-snug line-clamp-2 min-h-[2.5em]">
      {{ client.order || 'Sin detalle del pedido' }}
    </p>

    <div class="flex flex-col gap-1.5 mt-1 text-xs text-black/60">
      <span class="flex items-center gap-1.5">
        <AppIcon name="calendar" :size="14" />
        {{ formattedDate }}
      </span>
      <span class="flex items-center gap-1.5">
        <AppIcon name="coin" :size="14" />
        Total: {{ money(client.price) }}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="paymentChip">{{ PAYMENT_LABELS[client.paymentStatus] }}</span>
        <span class="truncate">{{ paymentSummary }}</span>
      </span>
      <span v-if="client.paymentMethod && client.paymentStatus !== 'no_pagado'" class="flex items-center gap-1.5">
        <AppIcon name="coin" :size="14" />
        {{ PAYMENT_METHODS[client.paymentMethod].emoji }} {{ PAYMENT_METHODS[client.paymentMethod].label }}
      </span>
    </div>

    <button
      type="button"
      class="self-start mt-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
      :class="client.delivered ? 'bg-emerald-600/85 text-white' : 'bg-white/70 text-black/55 hover:bg-white'"
      @click.stop="emit('toggleDelivered', client.id)"
    >
      {{ client.delivered ? '✓ Entregado' : 'Pendiente' }}
    </button>
  </div>
</template>
