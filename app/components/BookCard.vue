<script setup lang="ts">
import type { Book } from '~/composables/useBooks'
import { getBookCover, getBookTexture } from '~/utils/bookCovers'

const props = defineProps<{ book: Book }>()
const emit = defineEmits<{ open: [id: string]; delete: [id: string]; 'change-cover': [id: string] }>()

const menuOpen = ref(false)
const cover = computed(() => getBookCover(props.book.cover))
const texture = computed(() => getBookTexture(props.book.texture))

function onDelete() {
  menuOpen.value = false
  emit('delete', props.book.id)
}

function onChangeCover() {
  menuOpen.value = false
  emit('change-cover', props.book.id)
}
</script>

<template>
  <div class="book relative aspect-[3/4] cursor-pointer" @click="emit('open', book.id)">
    <!-- hoja de páginas visible detrás de la tapa -->
    <div class="book-pages absolute inset-y-[3px] right-0 left-2 rounded-r-lg" />

    <div class="book-cover relative h-full flex flex-col rounded-l-[4px] rounded-r-xl overflow-hidden mr-[5px]">
      <template v-if="book.coverImage">
        <img :src="book.coverImage" :alt="book.name" class="absolute inset-0 w-full h-full object-cover" draggable="false" />
        <div class="flex-1" />
      </template>

      <template v-else-if="cover">
        <div class="absolute inset-0" :style="{ background: `linear-gradient(150deg, ${cover.gradient[0]}, ${cover.gradient[1]})` }" />
        <span class="absolute top-3 left-7 w-2 h-2 rounded-full bg-white/70" />
        <span class="absolute top-7 left-10 w-1 h-1 rounded-full bg-white/60" />
        <span class="absolute bottom-16 right-4 w-1.5 h-1.5 rounded-full bg-white/60" />
        <div class="flex-1 flex items-center justify-center relative pl-3">
          <img :src="cover.image" :alt="cover.label" class="w-[58%] object-contain drop-shadow-md" />
        </div>
      </template>

      <template v-else>
        <div class="absolute inset-0" :style="{ backgroundColor: book.color }" />
        <div class="absolute inset-0 bg-gradient-to-br from-white/25 to-black/15" />
        <div class="flex-1 flex items-center justify-center relative pl-3">
          <AppIcon name="book" :size="44" class="text-white/70" />
        </div>
      </template>

      <!-- textura de la tapa (tela, cuero…) -->
      <template v-if="texture">
        <div v-if="texture.tint" class="absolute inset-0 pointer-events-none mix-blend-multiply" :style="{ backgroundColor: texture.tint }" />
        <div class="absolute inset-0 pointer-events-none" :style="{ backgroundImage: texture.css }" />
      </template>

      <!-- lomo -->
      <div class="book-spine absolute left-0 top-0 h-full w-4 pointer-events-none" />

      <!-- etiqueta -->
      <div class="relative ml-5 mr-2.5 mb-3 px-2.5 py-2 rounded-md bg-white/85 backdrop-blur-sm shadow-sm">
        <span class="font-semibold text-black/80 text-sm leading-tight line-clamp-2 block" :style="{ fontFamily: fontFamilyFor(book.font) }">{{ book.name }}</span>
        <span class="block text-xs text-black/50 mt-0.5">{{ book.pages?.length ?? 0 }} {{ (book.pages?.length ?? 0) === 1 ? 'página' : 'páginas' }}</span>
      </div>

      <!-- broche dorado -->
      <div v-if="book.clasp" class="book-clasp absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />

      <!-- marcapáginas -->
      <div class="book-ribbon absolute top-0 right-5 w-3 h-7 pointer-events-none" />
    </div>

    <button
      type="button"
      class="absolute top-2 right-3 w-7 h-7 rounded-full flex items-center justify-center text-black/55 bg-white/60 backdrop-blur-sm hover:bg-white/85 z-10"
      @click.stop="menuOpen = !menuOpen"
    >
      <AppIcon name="dots" :size="16" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute top-10 right-3 bg-surface text-ink rounded-lg shadow-lg text-sm overflow-hidden z-20 border border-border"
      @click.stop
    >
      <button type="button" class="block w-full text-left px-4 py-2 hover:bg-surface-soft whitespace-nowrap" @click="onChangeCover">
        Cambiar portada
      </button>
      <button type="button" class="block w-full text-left px-4 py-2 hover:bg-surface-soft text-danger" @click="onDelete">
        Eliminar libro
      </button>
    </div>
  </div>
</template>

<style scoped>
.book {
  transition: transform 0.2s ease;
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.18));
}
.book:hover {
  transform: translateY(-4px) rotate(-1deg);
}
.book-pages {
  background: repeating-linear-gradient(to bottom, #fbfaf6 0 2px, #e4e0d6 2px 3px);
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.book-spine {
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.08) 55%, transparent),
    linear-gradient(to right, transparent 70%, rgba(255, 255, 255, 0.35) 78%, transparent 86%);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.2);
}
.book-clasp {
  width: 14px;
  height: 46px;
  border-radius: 8px 0 0 8px;
  background:
    radial-gradient(circle at 40% 50%, #fff3c4 0 3px, #b8862d 3.5px 5px, transparent 5.5px),
    linear-gradient(to right, #e8c66b, #a97a22);
  box-shadow: -1px 1px 3px rgba(0, 0, 0, 0.35), inset 1px 0 0 rgba(255, 255, 255, 0.45);
}
.book-ribbon {
  background: #e5566d;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}
</style>
