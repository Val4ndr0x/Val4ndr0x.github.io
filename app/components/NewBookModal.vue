<script setup lang="ts">
import { BOOK_COVERS } from '~/utils/bookCovers'
import { getBookTemplate, type BookTemplate } from '~/utils/bookTemplates'

import { imageFileToDataUrl } from '~/utils/imageFile'

const emit = defineEmits<{ close: []; create: [name: string, cover: string | null, coverImage: string | null, templateId: string | null] }>()

const name = ref('')
const cover = ref<string | null>(BOOK_COVERS[0]?.id ?? null)
const coverImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const templateId = ref<string | null>(null)
const showTemplates = ref(false)
const template = computed(() => getBookTemplate(templateId.value))

function pickTemplate(t: BookTemplate) {
  templateId.value = t.id
  showTemplates.value = false
}

function pickCover(id: string | null) {
  cover.value = id
  coverImage.value = null
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploadError.value = ''
  try {
    coverImage.value = await imageFileToDataUrl(file)
    cover.value = null
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'No se pudo cargar la imagen'
  }
}

function submit() {
  if (!name.value.trim()) return
  emit('create', name.value, cover.value, coverImage.value, templateId.value)
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" @click.self="emit('close')">
    <form
      class="w-full max-w-sm bg-surface rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[90vh] overflow-y-auto"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-bold text-ink">Nuevo libro</h2>

      <label class="flex flex-col gap-1.5 text-sm text-muted">
        Nombre
        <input
          v-model="name"
          type="text"
          autofocus
          placeholder="p. ej. Mi diario 2026"
          class="bg-surface-soft text-ink placeholder-muted rounded-lg px-3.5 py-2.5 outline-none border border-border focus:border-accent"
        />
      </label>

      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted">Portada</span>
        <div class="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            class="relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-surface-soft flex items-center justify-center transition-transform hover:-translate-y-0.5"
            :class="cover === null && !coverImage ? 'border-accent' : 'border-border'"
            title="Sin portada"
            @click="pickCover(null)"
          >
            <AppIcon name="book" :size="18" class="opacity-30" />
          </button>
          <button
            type="button"
            class="relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-surface-soft flex items-center justify-center transition-transform hover:-translate-y-0.5"
            :class="coverImage ? 'border-accent' : 'border-dashed border-border'"
            title="Subir mi imagen"
            @click="fileInput?.click()"
          >
            <img v-if="coverImage" :src="coverImage" alt="Portada propia" class="absolute inset-0 w-full h-full object-cover" />
            <AppIcon v-else name="image" :size="18" class="text-muted" />
          </button>
          <button
            v-for="c in BOOK_COVERS"
            :key="c.id"
            type="button"
            class="relative aspect-[3/4] rounded-lg overflow-hidden border-2 flex items-center justify-center transition-transform hover:-translate-y-0.5"
            :class="cover === c.id && !coverImage ? 'border-accent' : 'border-border'"
            :style="{ background: `linear-gradient(150deg, ${c.gradient[0]}, ${c.gradient[1]})` }"
            :title="c.label"
            @click="pickCover(c.id)"
          >
            <img :src="c.image" :alt="c.label" class="w-[70%] object-contain" />
          </button>
        </div>
      </div>

      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
      <p v-if="uploadError" class="text-xs text-danger -mt-1">{{ uploadError }}</p>

      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted">Páginas</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-soft border border-border hover:border-accent text-left text-ink"
            @click="showTemplates = true"
          >
            <AppIcon name="template" :size="16" class="text-accent shrink-0" />
            <span class="text-sm truncate">{{ template ? template.label : 'Hoja en blanco' }}</span>
          </button>
          <button v-if="template" type="button" class="px-3 py-2.5 rounded-lg text-sm text-muted hover:text-ink" @click="templateId = null">
            Quitar
          </button>
        </div>
        <p class="text-xs text-muted">Empieza en blanco o con una plantilla de páginas ya armadas.</p>
      </div>

      <div class="flex gap-2 justify-end mt-1">
        <button type="button" class="px-4 py-2 rounded-lg text-muted hover:text-ink" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-accent text-white font-semibold">
          Crear
        </button>
      </div>
    </form>

    <BookTemplatePicker v-if="showTemplates" :allow-single-page="false" all-label="Usar esta plantilla" @pick-all="pickTemplate" @close="showTemplates = false" />
  </div>
</template>
