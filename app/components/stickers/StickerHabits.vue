<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

type Habit = { id: string; name: string; days: boolean[] }

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MAX_HABITS = 6

const habits = computed<Habit[]>(() => (Array.isArray(props.data.habits) ? props.data.habits : []))

const percent = computed(() => {
  const total = habits.value.length * 7
  if (!total) return 0
  return Math.round((habits.value.reduce((acc, h) => acc + h.days.filter(Boolean).length, 0) / total) * 100)
})

// Carita según cuánto llevas cumplido de la semana.
const face = computed(() => (percent.value >= 85 ? '🤩' : percent.value >= 60 ? '😊' : percent.value >= 30 ? '🙂' : percent.value > 0 ? '😐' : '😴'))

function set(next: Habit[]) {
  emit('update', { habits: next })
}
function add() {
  if (habits.value.length >= MAX_HABITS) return
  set([...habits.value, { id: uuid(), name: '', days: Array(7).fill(false) }])
}
function rename(id: string, name: string) {
  set(habits.value.map((h) => (h.id === id ? { ...h, name } : h)))
}
function toggle(id: string, day: number) {
  set(habits.value.map((h) => (h.id === id ? { ...h, days: h.days.map((d, i) => (i === day ? !d : d)) } : h)))
}
function removeHabit(id: string) {
  set(habits.value.filter((h) => h.id !== id))
}
</script>

<template>
  <StickerFrame :color="data.color" fallback="#e6dbf0" @remove="emit('remove')">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-2xl leading-none">{{ face }}</span>
      <p class="text-sm font-semibold text-black/70">Hábitos <span class="font-normal text-black/50">· {{ percent }}% de la semana</span></p>
    </div>

    <div class="flex items-center gap-1 pl-[6.5rem] sm:pl-32 mb-1">
      <span v-for="d in DAYS" :key="d" class="flex-1 text-center text-[10px] font-semibold text-black/45 min-w-0">{{ d }}</span>
    </div>

    <div v-for="h in habits" :key="h.id" class="group/habit flex items-center gap-1 mb-1">
      <input
        :value="h.name"
        type="text"
        maxlength="24"
        placeholder="Hábito"
        class="w-[6.5rem] sm:w-32 bg-transparent outline-none text-xs text-black/70 placeholder-black/30 shrink-0"
        @input="rename(h.id, ($event.target as HTMLInputElement).value)"
      />
      <span v-for="(done, i) in h.days" :key="i" class="flex-1 min-w-0 flex justify-center">
        <button
          type="button"
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-colors"
          :class="done ? 'bg-accent text-white' : 'bg-white/60 text-transparent hover:bg-white'"
          :aria-label="`${h.name || 'Hábito'} ${DAYS[i]}`"
          @click="toggle(h.id, i)"
        >
          ✓
        </button>
      </span>
      <button type="button" class="text-black/25 hover:text-danger text-xs px-0.5 opacity-0 group-hover/habit:opacity-100 focus:opacity-100" aria-label="Quitar hábito" @click="removeHabit(h.id)">✕</button>
    </div>

    <button v-if="habits.length < MAX_HABITS" type="button" class="mt-1 text-xs font-semibold text-black/50 hover:text-black/80" @click="add">＋ Agregar hábito</button>
  </StickerFrame>
</template>
