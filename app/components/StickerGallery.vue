<script setup lang="ts">
import { STICKER_IMAGE_OPTIONS, STICKER_CATEGORIES } from '~/utils/stickerOptions'

withDefaults(defineProps<{ allowClear?: boolean }>(), { allowClear: false })
const emit = defineEmits<{ close: []; pick: [image: string, label: string]; clear: [] }>()

const search = ref('')
const activeCategory = ref<string | null>(null)

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const filteredStickers = computed(() => {
  const q = normalize(search.value.trim())
  return STICKER_IMAGE_OPTIONS.filter((opt) => {
    const matchesCategory = !activeCategory.value || opt.category === activeCategory.value
    const matchesSearch = !q || normalize(opt.label).includes(q)
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60]" @click.self="emit('close')">
    <div class="w-full sm:max-w-lg bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-3 border border-border h-[85vh] sm:h-[75vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Buscar stickers</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="relative shrink-0">
        <AppIcon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar sticker..."
          class="w-full pl-9 pr-3 py-2 rounded-xl2 bg-surface-soft text-sm text-ink placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div class="flex flex-wrap gap-1.5 shrink-0">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="!activeCategory ? 'bg-accent text-white' : 'bg-surface-soft text-muted hover:text-ink'"
          @click="activeCategory = null"
        >
          Todas
        </button>
        <button
          v-for="cat in STICKER_CATEGORIES"
          :key="cat"
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="cat === activeCategory ? 'bg-accent text-white' : 'bg-surface-soft text-muted hover:text-ink'"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="grid grid-cols-4 gap-2.5 pb-1">
          <button
            v-if="allowClear"
            type="button"
            class="aspect-square rounded-xl2 flex items-center justify-center text-sm text-muted border-2 border-border hover:border-accent bg-surface transition-colors"
            title="Sin sticker"
            @click="emit('clear')"
          >
            Ø
          </button>
          <button
            v-for="opt in filteredStickers"
            :key="opt.image"
            type="button"
            class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl2 bg-surface-soft hover:bg-accent-soft hover:text-accent-deep text-ink transition-colors text-center"
            :title="opt.label"
            @click="emit('pick', opt.image!, opt.label)"
          >
            <img :src="opt.image" :alt="opt.label" class="w-9 h-9 object-contain" />
            <span class="text-[11px] font-medium leading-tight line-clamp-1">{{ opt.label }}</span>
          </button>
        </div>
        <p v-if="filteredStickers.length === 0" class="text-sm text-muted text-center py-8">No se encontraron stickers.</p>
      </div>
    </div>
  </div>
</template>
