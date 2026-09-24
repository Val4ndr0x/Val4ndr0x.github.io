<script setup lang="ts">
type Item = { id: string; text: string; checked: boolean }

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const items = computed<Item[]>(() => props.data.items ?? [])

function setItems(next: Item[]) {
  emit('update', { items: next })
}

function addItem() {
  setItems([...items.value, { id: uuid(), text: '', checked: false }])
}

function updateText(id: string, text: string) {
  setItems(items.value.map((it) => (it.id === id ? { ...it, text } : it)))
}

function toggle(id: string) {
  setItems(items.value.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)))
}

function removeItem(id: string) {
  setItems(items.value.filter((it) => it.id !== id))
}
</script>

<template>
  <div class="relative w-full h-full rounded-xl2 p-3 sm:p-4 group flex flex-col" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#ffffff' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <p class="text-sm font-semibold text-black/70 mb-2">{{ data.title || 'Lista de tareas' }}</p>

    <div class="flex flex-col gap-2 flex-1">
      <div v-for="item in items" :key="item.id" class="flex items-center gap-2 border-b border-black/10 pb-1">
        <button
          type="button"
          class="w-4 h-4 rounded-full border border-black/30 flex-shrink-0"
          :class="item.checked ? 'bg-accent border-accent' : ''"
          @click="toggle(item.id)"
        />
        <input
          :value="item.text"
          type="text"
          placeholder="Escribe aquí..."
          class="flex-1 bg-transparent outline-none text-sm text-black/70 placeholder-black/30"
          :class="item.checked ? 'line-through text-black/35' : ''"
          @input="updateText(item.id, ($event.target as HTMLInputElement).value)"
        />
        <button type="button" class="text-black/25 hover:text-danger text-xs" @click="removeItem(item.id)">✕</button>
      </div>
    </div>

    <button type="button" class="mt-2 text-xs text-accent-deep font-medium self-start" @click="addItem">
      + Agregar línea
    </button>
  </div>
</template>
