<script setup lang="ts">
import type { TodoList } from '~/composables/useLists'

const props = defineProps<{ list: TodoList }>()
const emit = defineEmits<{ open: [id: string]; edit: [id: string]; delete: [id: string] }>()

const menuOpen = ref(false)

const total = computed(() => props.list.tasks?.length ?? 0)
const completed = computed(() => props.list.tasks?.filter((t) => t.completed).length ?? 0)
const progressLabel = computed(() =>
  total.value === 0 ? 'Sin tareas' : `${completed.value}/${total.value} completadas`
)
const progressRatio = computed(() => (total.value === 0 ? 0 : completed.value / total.value))

function onEdit() {
  menuOpen.value = false
  emit('edit', props.list.id)
}

function onDelete() {
  menuOpen.value = false
  if (!confirm(`¿Eliminar la lista "${props.list.name}"? Esta acción no se puede deshacer.`)) return
  emit('delete', props.list.id)
}
</script>

<template>
  <div
    class="relative flex flex-col justify-between aspect-[3/4] rounded-[22px] p-4 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all"
    :style="{ backgroundColor: list.color }"
    @click="emit('open', list.id)"
  >
    <img
      v-if="list.sticker"
      :src="list.sticker"
      alt=""
      class="absolute -top-4 -right-3 w-14 h-14 object-contain drop-shadow-md rotate-[12deg] pointer-events-none select-none"
    />

    <div class="flex items-start justify-between">
      <span class="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center text-black/60">
        <AppIcon name="checklist" :size="17" />
      </span>
      <button
        type="button"
        class="w-7 h-7 rounded-full flex items-center justify-center text-black/50 hover:bg-black/10"
        @click.stop="menuOpen = !menuOpen"
      >
        <AppIcon name="dots" :size="16" />
      </button>

      <div
        v-if="menuOpen"
        class="absolute top-11 right-3 bg-white dark:bg-surface text-black/80 dark:text-ink rounded-lg shadow-lg text-sm overflow-hidden z-10 border border-black/5 dark:border-border"
        @click.stop
      >
        <button type="button" class="block w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-surface-soft" @click="onEdit">
          Editar lista
        </button>
        <button type="button" class="block w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-surface-soft text-danger" @click="onDelete">
          Eliminar lista
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-bold text-black/80 leading-tight line-clamp-2" :style="{ fontFamily: fontFamilyFor(list.font) }">{{ list.name }}</span>
      <span v-if="list.category" class="self-start px-2 py-0.5 rounded-full bg-white/70 text-[10px] font-semibold text-black/55">{{ list.category }}</span>
      <div class="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
        <div class="h-full bg-black/40 rounded-full transition-[width]" :style="{ width: `${progressRatio * 100}%` }" />
      </div>
      <span class="text-xs text-black/55">{{ progressLabel }}</span>
    </div>
  </div>
</template>
