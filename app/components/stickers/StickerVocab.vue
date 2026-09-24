<script setup lang="ts">
import StickerFrame from './StickerFrame.vue'

type Kind = 'noun' | 'verb' | 'adj' | 'adv'
type Entry = { id: string; word: string; meaning: string; example: string; kind: Kind | null }

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const MAX_ENTRIES = 12
const KINDS: { key: Kind; label: string }[] = [
  { key: 'noun', label: 'Sustantivo' },
  { key: 'verb', label: 'Verbo' },
  { key: 'adj', label: 'Adjetivo' },
  { key: 'adv', label: 'Adverbio' },
]

const entries = computed<Entry[]>(() => (Array.isArray(props.data.entries) ? props.data.entries : []))

function set(next: Entry[]) {
  emit('update', { entries: next })
}
function patch(id: string, change: Partial<Entry>) {
  set(entries.value.map((e) => (e.id === id ? { ...e, ...change } : e)))
}
function add() {
  if (entries.value.length >= MAX_ENTRIES) return
  set([...entries.value, { id: uuid(), word: '', meaning: '', example: '', kind: null }])
}
function remove(id: string) {
  set(entries.value.filter((e) => e.id !== id))
}
function toggleKind(e: Entry, kind: Kind) {
  patch(e.id, { kind: e.kind === kind ? null : kind })
}
</script>

<template>
  <StickerFrame :color="data.color" fallback="#eaf1f8" @remove="emit('remove')">
    <div class="flex items-center gap-2 mb-2.5">
      <span class="text-xl leading-none">⭐</span>
      <p class="text-base font-semibold text-black/75 tracking-wide">Vocabulario</p>
      <span class="ml-auto text-xs text-black/40">{{ entries.length }} {{ entries.length === 1 ? 'palabra' : 'palabras' }}</span>
    </div>

    <div class="flex flex-col gap-2">
      <div v-for="e in entries" :key="e.id" class="group/vocab relative rounded-2xl bg-white/70 border border-black/10 px-3 py-2">
        <button
          type="button"
          class="absolute top-1 right-1.5 text-black/25 hover:text-danger text-xs opacity-0 group-hover/vocab:opacity-100 focus:opacity-100"
          aria-label="Quitar palabra"
          @click="remove(e.id)"
        >
          ✕
        </button>

        <label class="flex items-baseline gap-2 mb-1">
          <span class="w-[4.5rem] shrink-0 text-[11px] text-black/45">Palabra:</span>
          <input
            :value="e.word"
            type="text"
            maxlength="40"
            class="flex-1 min-w-0 bg-transparent outline-none text-sm font-semibold text-black/80 border-b border-black/20 pb-px"
            @input="patch(e.id, { word: ($event.target as HTMLInputElement).value })"
          />
        </label>
        <label class="flex items-baseline gap-2 mb-1">
          <span class="w-[4.5rem] shrink-0 text-[11px] text-black/45">Significado:</span>
          <input
            :value="e.meaning"
            type="text"
            maxlength="90"
            class="flex-1 min-w-0 bg-transparent outline-none text-sm text-black/70 border-b border-black/10 pb-px"
            @input="patch(e.id, { meaning: ($event.target as HTMLInputElement).value })"
          />
        </label>
        <label class="flex items-baseline gap-2 mb-1.5">
          <span class="w-[4.5rem] shrink-0 text-[11px] text-black/45 leading-tight">Ejemplo:</span>
          <input
            :value="e.example"
            type="text"
            maxlength="140"
            class="flex-1 min-w-0 bg-transparent outline-none text-sm italic text-black/65 border-b border-dotted border-black/20 pb-px"
            @input="patch(e.id, { example: ($event.target as HTMLInputElement).value })"
          />
        </label>

        <div class="flex flex-wrap gap-1">
          <button
            v-for="k in KINDS"
            :key="k.key"
            type="button"
            class="px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors"
            :class="e.kind === k.key ? 'bg-accent text-white border-accent' : 'bg-white/50 text-black/45 border-black/10 hover:bg-white'"
            @click="toggleKind(e, k.key)"
          >
            {{ k.label }}
          </button>
        </div>
      </div>
    </div>

    <button v-if="entries.length < MAX_ENTRIES" type="button" class="mt-2 text-xs font-semibold text-black/50 hover:text-black/80" @click="add">＋ Agregar palabra</button>
  </StickerFrame>
</template>
