<script setup lang="ts">
import { CARD_COLORS, type TodoList } from '~/composables/useLists'

const props = defineProps<{ list?: TodoList | null }>()
const emit = defineEmits<{
  close: []
  create: [name: string, category: string | null]
  save: [input: { name: string; category: string | null; color: string }]
}>()

const isEdit = computed(() => !!props.list)

const name = ref(props.list?.name ?? '')
const category = ref(props.list?.category ?? '')
const color = ref(props.list?.color ?? CARD_COLORS[0])
const showColorPicker = ref(false)

function submit() {
  if (!name.value.trim()) return
  if (isEdit.value) {
    emit('save', { name: name.value, category: category.value || null, color: color.value })
  } else {
    emit('create', name.value, category.value || null)
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" @click.self="emit('close')">
    <form
      class="w-full sm:max-w-sm bg-[#fff8f3] dark:bg-surface rounded-t-[26px] sm:rounded-[26px] p-5 flex flex-col gap-4"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-bold text-black/80 dark:text-ink">{{ isEdit ? 'Editar lista' : 'Nueva lista ✨' }}</h2>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Nombre
        <input
          v-model="name"
          type="text"
          autofocus
          placeholder="p. ej. Viaje a la playa"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Categoría (opcional)
        <input
          v-model="category"
          type="text"
          placeholder="p. ej. Work"
          class="bg-white dark:bg-surface-soft text-black/80 dark:text-ink placeholder-black/30 dark:placeholder-muted rounded-xl px-3.5 py-2.5 outline-none border border-black/10 dark:border-border focus:border-black/30 dark:focus:border-accent"
        />
      </label>

      <div v-if="isEdit" class="flex flex-col gap-1.5 text-sm font-medium text-black/60 dark:text-muted">
        Color
        <button
          type="button"
          class="w-10 h-10 rounded-full border border-black/10 dark:border-border"
          :style="{ backgroundColor: color }"
          @click="showColorPicker = true"
        />
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

    <ColorPickerPopover
      v-if="showColorPicker"
      title="Color de la lista"
      :model-value="color"
      :presets="CARD_COLORS"
      @update:model-value="color = $event"
      @close="showColorPicker = false"
    />
  </div>
</template>
