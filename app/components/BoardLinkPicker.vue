<script setup lang="ts">
import type { BoardRefKind } from '~/composables/useBoard'

const emit = defineEmits<{ close: []; pick: [kind: BoardRefKind, id: string] }>()

const { lists } = useLists()
const { books } = useBooks()
const { clients } = useClients()

const tab = ref<BoardRefKind>('list')

const TABS: { id: BoardRefKind; label: string }[] = [
  { id: 'list', label: 'Listas' },
  { id: 'book', label: 'Libros' },
  { id: 'client', label: 'Clientes' },
]

const options = computed(() => {
  if (tab.value === 'list') return lists.value.map((l) => ({ id: l.id, name: l.name, color: l.color, detail: `${l.tasks.length} tareas` }))
  if (tab.value === 'book') return books.value.map((b) => ({ id: b.id, name: b.name, color: b.color, detail: `${b.pages.length} páginas` }))
  return clients.value.map((c) => ({ id: c.id, name: c.name, color: c.color, detail: c.order || 'Sin pedido' }))
})
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[70]" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[85vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Agregar al tablero</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-1 bg-base rounded-full p-1">
        <button
          v-for="t in TABS"
          :key="t.id"
          type="button"
          class="py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="tab === t.id ? 'bg-accent text-white' : 'text-muted hover:text-ink'"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="overflow-y-auto flex flex-col gap-2 min-h-[8rem]">
        <button
          v-for="o in options"
          :key="o.id"
          type="button"
          class="flex items-center gap-3 rounded-xl2 border border-border p-3 text-left hover:border-accent transition-colors"
          @click="emit('pick', tab, o.id)"
        >
          <span class="w-8 h-8 rounded-full shrink-0 border border-black/10" :style="{ backgroundColor: o.color }" />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-ink truncate">{{ o.name }}</span>
            <span class="block text-xs text-muted truncate">{{ o.detail }}</span>
          </span>
        </button>
        <p v-if="!options.length" class="text-sm text-muted text-center py-8">Todavía no hay nada en esta sección.</p>
      </div>
    </div>
  </div>
</template>
