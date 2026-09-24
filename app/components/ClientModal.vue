<script setup lang="ts">
import type { Client, ClientInput, PaymentMethod, PaymentStatus } from '~/composables/useClients'
import { PAYMENT_LABELS, PAYMENT_METHODS } from '~/composables/useClients'
import { STICKER_IMAGE_OPTIONS, STICKER_CATEGORIES } from '~/utils/stickerOptions'

const props = defineProps<{ client?: Client | null }>()
const emit = defineEmits<{ close: []; save: [input: ClientInput] }>()

const { categories } = useClients()
const name = ref(props.client?.name ?? '')
const category = ref(props.client?.category ?? '')
const order = ref(props.client?.order ?? '')
const deliveryDate = ref(props.client?.deliveryDate ?? '')
const price = ref(props.client?.price ?? 0)
const paymentStatus = ref<PaymentStatus>(props.client?.paymentStatus ?? 'no_pagado')
const paymentMethod = ref<PaymentMethod | null>(props.client?.paymentMethod ?? null)
const deposit = ref(props.client?.deposit ?? 0)
const remaining = computed(() => Math.max(0, (Number(price.value) || 0) - (Number(deposit.value) || 0)))
const sticker = ref<string | null>(props.client?.sticker ?? null)

const activeCategory = ref(
  STICKER_IMAGE_OPTIONS.find((opt) => opt.image === sticker.value)?.category ?? STICKER_CATEGORIES[0] ?? '',
)
const visibleStickers = computed(() => STICKER_IMAGE_OPTIONS.filter((opt) => opt.category === activeCategory.value))

const isEdit = computed(() => !!props.client)

function submit() {
  if (!name.value.trim()) return
  emit('save', {
    name: name.value,
    category: category.value.trim() || null,
    order: order.value,
    deliveryDate: deliveryDate.value,
    price: Number(price.value) || 0,
    paymentStatus: paymentStatus.value,
    deposit: Number(deposit.value) || 0,
    paymentMethod: paymentMethod.value,
    sticker: sticker.value,
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" @click.self="emit('close')">
    <form
      class="w-full sm:max-w-md bg-[#fff8f3] dark:bg-surface rounded-t-[26px] sm:rounded-[26px] p-5 flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
      @submit.prevent="submit"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-black/80 dark:text-ink">{{ isEdit ? 'Editar cliente' : 'Nuevo cliente' }} 🌸</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-black/40 dark:text-muted hover:bg-black/5 dark:hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Cliente
        <input
          v-model="name"
          type="text"
          autofocus
          placeholder="Nombre del cliente"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Categoría (opcional)
        <input
          v-model="category"
          type="text"
          list="client-category-options"
          maxlength="40"
          placeholder="p. ej. Pastelería, Empresa, Familia"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
        <datalist id="client-category-options">
          <option v-for="c in categories" :key="c" :value="c" />
        </datalist>
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        ¿Qué pidió?
        <textarea
          v-model="order"
          rows="2"
          placeholder="p. ej. Torta de chocolate para 20 personas"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent resize-none"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Fecha de entrega
        <input
          v-model="deliveryDate"
          type="date"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Precio total del producto
        <input
          v-model.number="price"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
      </label>

      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium text-black/60 dark:text-muted">Pago</span>
        <div class="grid grid-cols-3 gap-1.5 bg-black/5 dark:bg-surface-soft rounded-full p-1">
          <button
            v-for="(label, key) in PAYMENT_LABELS"
            :key="key"
            type="button"
            class="py-1.5 rounded-full text-xs font-semibold transition-colors"
            :class="paymentStatus === key ? 'bg-[#f4a8c4] text-white shadow-sm' : 'text-black/50 dark:text-muted hover:text-black/80 dark:hover:text-ink'"
            @click="paymentStatus = key"
          >
            {{ label }}
          </button>
        </div>

        <div v-if="paymentStatus !== 'no_pagado'" class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-black/60 dark:text-muted">Método de pago</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(m, key) in PAYMENT_METHODS"
              :key="key"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              :class="paymentMethod === key ? 'bg-[#f4a8c4] text-white shadow-sm' : 'bg-black/5 dark:bg-surface-soft text-black/55 dark:text-muted hover:text-black/80 dark:hover:text-ink'"
              @click="paymentMethod = paymentMethod === key ? null : key"
            >
              {{ m.emoji }} {{ m.label }}
            </button>
          </div>
        </div>

        <label v-if="paymentStatus === 'abono'" class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
          ¿Cuánto ha abonado?
          <input
            v-model.number="deposit"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
          />
          <span v-if="price > 0" class="text-xs font-normal text-black/45 dark:text-muted">Falta por pagar: ${{ remaining.toLocaleString('es') }}</span>
        </label>
      </div>

      <div>
        <span class="block text-sm font-medium text-black/60 dark:text-muted mb-2">Sticker</span>
        <div class="flex gap-1.5 overflow-x-auto pb-1 mb-2 -mx-0.5 px-0.5">
          <button
            v-for="cat in STICKER_CATEGORIES"
            :key="cat"
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            :class="cat === activeCategory ? 'bg-black/80 dark:bg-accent text-white' : 'bg-black/5 dark:bg-surface-soft text-black/50 dark:text-muted hover:text-black/80 dark:hover:text-ink'"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <button
            type="button"
            class="w-12 h-12 rounded-xl2 flex items-center justify-center text-xs text-black/45 dark:text-muted border-2 transition-colors"
            :class="sticker === null ? 'border-black/50 dark:border-accent bg-white dark:bg-surface-soft' : 'border-black/10 dark:border-border bg-white/60 dark:bg-surface-soft/60 hover:bg-white dark:hover:bg-surface-soft'"
            title="Sin sticker"
            @click="sticker = null"
          >
            Ø
          </button>
          <button
            v-for="opt in visibleStickers"
            :key="opt.image"
            type="button"
            class="w-12 h-12 rounded-xl2 flex items-center justify-center border-2 transition-colors bg-white dark:bg-surface-soft"
            :class="sticker === opt.image ? 'border-black/50 dark:border-accent' : 'border-black/10 dark:border-border hover:border-black/25 dark:hover:border-muted'"
            :title="opt.label"
            @click="sticker = opt.image!"
          >
            <img :src="opt.image" :alt="opt.label" class="w-8 h-8 object-contain" />
          </button>
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-1">
        <button type="button" class="px-4 py-2 rounded-lg text-black/50 dark:text-muted hover:text-black/80 dark:hover:text-ink" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-[#f4a8c4] text-white font-semibold hover:bg-[#ef8fb5] transition-colors">
          {{ isEdit ? 'Guardar' : 'Crear' }}
        </button>
      </div>
    </form>
  </div>
</template>
