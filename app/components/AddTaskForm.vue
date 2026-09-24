<script setup lang="ts">
const emit = defineEmits<{ add: [text: string, assignee: string | null] }>()

const { assignees } = useLists()

const text = ref('')
const assignee = ref('')
const showAssignee = ref(false)

function submit() {
  if (!text.value.trim()) return
  emit('add', text.value, assignee.value.trim() || null)
  text.value = ''
  assignee.value = ''
}
</script>

<template>
  <form class="relative z-10 flex flex-wrap gap-2 my-4" @submit.prevent="submit">
    <input
      v-model="text"
      type="text"
      placeholder="Agregar una tarea..."
      autocomplete="off"
      class="flex-1 min-w-0 px-4 py-3.5 rounded-2xl border border-border bg-surface/90 backdrop-blur-sm text-ink placeholder-muted text-base outline-none focus:border-accent transition-colors"
    />
    <button
      type="button"
      class="px-3.5 rounded-2xl border border-border bg-surface/90 backdrop-blur-sm transition-colors"
      :class="showAssignee || assignee ? 'text-accent border-accent' : 'text-muted hover:text-ink'"
      title="Asignar un responsable (opcional)"
      aria-label="Asignar un responsable"
      @click="showAssignee = !showAssignee"
    >
      <AppIcon name="user" :size="18" />
    </button>
    <button
      type="submit"
      class="add-star-btn px-5 rounded-2xl bg-[#f4a8c4] text-white text-xl font-semibold active:scale-95 hover:bg-[#ef8fb5] transition-all"
      aria-label="Agregar tarea"
    >
      +
    </button>
    <div v-if="showAssignee || assignee" class="basis-full">
      <input
        v-model="assignee"
        type="text"
        list="task-assignee-options"
        placeholder="Responsable de completarla (opcional)"
        maxlength="40"
        autocomplete="off"
        class="w-full px-4 py-2.5 rounded-2xl border border-border bg-surface/90 backdrop-blur-sm text-ink placeholder-muted text-sm outline-none focus:border-accent transition-colors"
      />
      <datalist id="task-assignee-options">
        <option v-for="a in assignees" :key="a" :value="a" />
      </datalist>
    </div>
  </form>
</template>

<style scoped>
.add-star-btn {
  box-shadow: 0 0 0 rgba(244, 168, 196, 0.6);
}

.add-star-btn:hover {
  box-shadow: 0 0 16px rgba(244, 168, 196, 0.6);
}
</style>
