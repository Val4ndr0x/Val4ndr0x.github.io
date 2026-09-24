<script setup lang="ts">
import type { DecorSlot } from '~/utils/cafeDecor'

type Tab = 'pedidos' | 'decoracion' | 'recetas'
const TABS: { id: Tab; label: string }[] = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'decoracion', label: 'Decoración' },
  { id: 'recetas', label: 'Recetario' },
]

const { points } = useCompanion()
const tab = ref<Tab>('pedidos')
// Modo compra: al tocar una pieza del café se abre la tienda de ese tipo de pieza.
const shopSlot = ref<DecorSlot | null>(null)

function pickSlot(slot: DecorSlot) {
  tab.value = 'decoracion'
  shopSlot.value = slot
  useSound().play('pop')
}

function exitShop() {
  shopSlot.value = null
  tab.value = 'pedidos'
}

watch(tab, (t) => {
  if (t !== 'decoracion') shopSlot.value = null
})
</script>

<template>
  <div class="flex">
    <AppSidebar />

    <div class="flex-1 min-w-0">
      <AppHeader title="Café" />
      <main class="px-4 sm:px-6 pb-10 max-w-3xl flex flex-col gap-4">
        <CafeScene :show-slots="tab === 'decoracion'" :active-slot="shopSlot" @pick="pickSlot" />

        <div class="flex items-center gap-2">
          <div class="flex flex-1 gap-1 bg-surface border border-border rounded-full p-1">
            <button
              v-for="t in TABS"
              :key="t.id"
              type="button"
              class="flex-1 py-1.5 rounded-full text-xs font-semibold transition"
              :class="tab === t.id ? 'bg-accent text-white' : 'text-muted hover:text-ink'"
              @click="tab = t.id"
            >
              {{ t.label }}
            </button>
          </div>
          <span class="shrink-0 bg-surface border border-border rounded-full px-3 py-2 text-xs font-semibold text-ink">⭐ {{ points }}</span>
        </div>

        <CafeOrders v-if="tab === 'pedidos'" />
        <CafeDecorShop v-else-if="tab === 'decoracion'" :only-slot="shopSlot" @exit="exitShop" />
        <CafeRecipeBook v-else />
      </main>
    </div>
  </div>
</template>
