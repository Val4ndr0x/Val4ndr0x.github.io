<script setup lang="ts">
import type { BoardRefKind } from '~/composables/useBoard'
import { amountDue, PAYMENT_LABELS } from '~/composables/useClients'
import { getBookCover } from '~/utils/bookCovers'
import { isLightColor } from '~/utils/color'

const props = defineProps<{ kind: BoardRefKind; refId: string }>()

const { lists } = useLists()
const { books } = useBooks()
const { clients } = useClients()

const list = computed(() => (props.kind === 'list' ? lists.value.find((l) => l.id === props.refId) ?? null : null))
const book = computed(() => (props.kind === 'book' ? books.value.find((b) => b.id === props.refId) ?? null : null))
const client = computed(() => (props.kind === 'client' ? clients.value.find((c) => c.id === props.refId) ?? null : null))

const KIND_LABEL: Record<BoardRefKind, string> = { list: 'Lista', book: 'Libro', client: 'Cliente' }

const color = computed(() => list.value?.color ?? book.value?.color ?? client.value?.color ?? '#f3d9df')
const ink = computed(() => (isLightColor(color.value) ? '#1f1d24' : '#ffffff'))
const bookCover = computed(() => getBookCover(book.value?.cover))

const listProgress = computed(() => {
  const tasks = list.value?.tasks ?? []
  return { done: tasks.filter((t) => t.completed).length, total: tasks.length }
})
</script>

<template>
  <div
    class="relative w-full h-full rounded-xl2 overflow-hidden shadow-lg flex flex-col select-none"
    :style="{ backgroundColor: color, color: ink }"
  >
    <template v-if="book?.coverImage">
      <img :src="book.coverImage" :alt="book.name" class="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable="false" />
    </template>
    <template v-else-if="book && bookCover">
      <div class="absolute inset-0" :style="{ background: `linear-gradient(150deg, ${bookCover.gradient[0]}, ${bookCover.gradient[1]})` }" />
      <div class="relative flex-1 flex items-center justify-center min-h-0 p-2">
        <img :src="bookCover.image" :alt="bookCover.label" class="max-h-full max-w-[70%] object-contain drop-shadow" draggable="false" />
      </div>
    </template>

    <div v-if="list || client || (book && !book.coverImage && !bookCover)" class="relative flex-1 min-h-0 p-3 flex flex-col gap-1">
      <span class="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">{{ KIND_LABEL[kind] }}</span>

      <template v-if="list">
        <p class="font-bold leading-tight line-clamp-2 pr-8">{{ list.name }}</p>
        <p class="text-xs opacity-70 mt-auto">{{ listProgress.done }}/{{ listProgress.total }} tareas hechas</p>
        <img v-if="list.sticker" :src="list.sticker" alt="" class="absolute top-2 right-2 w-9 h-9 object-contain drop-shadow pointer-events-none" draggable="false" />
      </template>

      <template v-else-if="client">
        <p class="font-bold leading-tight line-clamp-1 pr-8">{{ client.name }}</p>
        <p class="text-xs opacity-70 line-clamp-2">{{ client.order || 'Sin detalle del pedido' }}</p>
        <div class="mt-auto flex flex-wrap items-center gap-1 text-[10px] font-semibold">
          <span class="px-1.5 py-0.5 rounded-full bg-black/10">{{ PAYMENT_LABELS[client.paymentStatus] }}</span>
          <span v-if="amountDue(client) > 0" class="px-1.5 py-0.5 rounded-full bg-black/10">Falta ${{ amountDue(client).toLocaleString('es') }}</span>
          <span v-if="client.delivered" class="px-1.5 py-0.5 rounded-full bg-black/10">Entregado</span>
        </div>
        <img v-if="client.sticker" :src="client.sticker" alt="" class="absolute top-2 right-2 w-9 h-9 object-contain drop-shadow pointer-events-none" draggable="false" />
      </template>

      <template v-else-if="book">
        <AppIcon name="book" :size="28" class="opacity-30 mx-auto mt-2" />
      </template>
    </div>

    <div v-if="book" class="relative px-3 py-2 bg-white/80 backdrop-blur-sm text-black/80 mt-auto">
      <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-black/45">Libro</p>
      <p class="text-sm font-semibold leading-tight line-clamp-1">{{ book.name }}</p>
    </div>
  </div>
</template>
