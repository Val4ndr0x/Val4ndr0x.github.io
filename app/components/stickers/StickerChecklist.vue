<script setup lang="ts">
type Item = { id: string; label: string; checked: boolean }

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const title = computed({
  get: () => props.data.title ?? '',
  set: (v: string) => emit('update', { title: v }),
})
const items = computed<Item[]>(() => props.data.items ?? [])

const CHECK_ICONS = ['', '🥕', '🌸', '⭐', '💗']
const checkIcon = computed<string>(() => props.data.checkIcon ?? '')
function cycleCheckIcon() {
  emit('update', { checkIcon: CHECK_ICONS[(CHECK_ICONS.indexOf(checkIcon.value) + 1) % CHECK_ICONS.length] })
}

function setItems(next: Item[]) {
  emit('update', { items: next })
}

function addItem() {
  setItems([...items.value, { id: uuid(), label: '', checked: false }])
}
function updateLabel(id: string, label: string) {
  setItems(items.value.map((it) => (it.id === id ? { ...it, label } : it)))
}
function toggle(id: string) {
  setItems(items.value.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)))
}
function removeItem(id: string) {
  setItems(items.value.filter((it) => it.id !== id))
}
</script>

<template>
  <div class="relative w-full rounded-xl2 p-3 sm:p-4 group" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#f3e3d3' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>
    <div class="flex items-center gap-1.5 mb-2">
      <input
        v-model="title"
        type="text"
        placeholder="Rutina"
        class="text-sm font-semibold text-black/70 bg-transparent outline-none w-2/3"
      />
      <button
        type="button"
        class="w-6 h-6 rounded-full flex items-center justify-center text-xs text-black/40 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Cambiar icono de las casillas"
        @click="cycleCheckIcon"
      >
        {{ checkIcon || '☐' }}
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="item in items" :key="item.id" class="flex items-center gap-2">
        <input
          :value="item.label"
          type="text"
          placeholder="Actividad..."
          class="flex-1 bg-transparent outline-none text-sm text-black/70 placeholder-black/30 border-b border-dotted border-black/25"
          @input="updateLabel(item.id, ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="checkIcon"
          type="button"
          class="w-5 h-5 flex-shrink-0 flex items-center justify-center text-base leading-none transition-all"
          :class="item.checked ? '' : 'grayscale opacity-40'"
          @click="toggle(item.id)"
        >
          {{ checkIcon }}
        </button>
        <button
          v-else
          type="button"
          class="w-4 h-4 border border-black/30 rounded-sm flex-shrink-0 flex items-center justify-center"
          :class="item.checked ? 'bg-accent border-accent' : 'bg-white'"
          @click="toggle(item.id)"
        >
          <span v-if="item.checked" class="text-white text-[10px] leading-none">✓</span>
        </button>
        <button type="button" class="text-black/25 hover:text-danger text-xs" @click="removeItem(item.id)">✕</button>
      </div>
    </div>
    <button type="button" class="mt-2 text-xs text-black/50 font-medium" @click="addItem">
      + Agregar actividad
    </button>
  </div>
</template>
