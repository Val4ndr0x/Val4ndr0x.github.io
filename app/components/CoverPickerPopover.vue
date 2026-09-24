<script setup lang="ts">
import { BOOK_COVERS, BOOK_TEXTURES } from '~/utils/bookCovers'

import { imageFileToDataUrl } from '~/utils/imageFile'

const props = defineProps<{
  modelValue: string | null
  plainColor: string
  image?: string | null
  texture?: string
  clasp?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [cover: string | null]; 'set-image': [image: string | null]; 'set-texture': [texture: string | undefined, clasp: boolean]; close: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploadError.value = ''
  try {
    emit('set-image', await imageFileToDataUrl(file))
    emit('close')
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : 'No se pudo cargar la imagen'
  }
}

function pick(cover: string | null) {
  emit('update:modelValue', cover)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-4 border border-border max-h-[85vh]">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink">Elige una portada</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="w-full py-2.5 rounded-lg bg-accent-soft text-accent-deep font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-colors"
          @click="fileInput?.click()"
        >
          <AppIcon name="image" :size="16" /> Subir mi propia imagen
        </button>
        <button
          v-if="image"
          type="button"
          class="w-full py-2 rounded-lg text-xs text-danger hover:bg-surface-soft"
          @click="emit('set-image', null)"
        >
          Quitar imagen actual
        </button>
        <p v-if="uploadError" class="text-xs text-danger">{{ uploadError }}</p>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">Textura de la tapa</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in BOOK_TEXTURES"
            :key="t.id"
            type="button"
            class="flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
            :class="(texture ?? 'none') === t.id ? 'border-accent text-ink' : 'border-border text-muted hover:text-ink'"
            @click="emit('set-texture', t.id, !!clasp)"
          >
            <span class="w-5 h-5 rounded-full border border-border relative overflow-hidden" :style="{ backgroundColor: plainColor }">
              <span class="absolute inset-0" :style="{ backgroundImage: t.css }" />
              <span v-if="t.tint" class="absolute inset-0" :style="{ backgroundColor: t.tint }" />
            </span>
            {{ t.label }}
          </button>
        </div>
        <label class="flex items-center gap-2 text-xs text-ink cursor-pointer">
          <input type="checkbox" :checked="!!clasp" class="accent-[#ee8fb5]" @change="emit('set-texture', texture, ($event.target as HTMLInputElement).checked)" />
          Broche dorado 🔒
        </label>
      </div>

      <div class="overflow-y-auto grid grid-cols-3 gap-3">
        <div v-if="image" class="relative aspect-[3/4] rounded-xl2 overflow-hidden border-2 border-accent">
          <img :src="image" alt="Portada actual" class="w-full h-full object-cover" />
        </div>
        <button
          type="button"
          class="relative aspect-[3/4] rounded-xl2 overflow-hidden border-2 transition-transform hover:-translate-y-0.5 flex flex-col"
          :class="modelValue === null && !image ? 'border-accent' : 'border-border'"
          :style="{ backgroundColor: plainColor }"
          title="Sin portada"
          @click="pick(null)"
        >
          <div class="flex-1 flex items-center justify-center">
            <AppIcon name="book" :size="26" class="opacity-25" />
          </div>
          <span class="text-[11px] font-medium text-black/50 pb-1.5">Sin portada</span>
        </button>

        <button
          v-for="cover in BOOK_COVERS"
          :key="cover.id"
          type="button"
          class="relative aspect-[3/4] rounded-xl2 overflow-hidden border-2 transition-transform hover:-translate-y-0.5 flex items-center justify-center"
          :class="modelValue === cover.id && !image ? 'border-accent' : 'border-border'"
          :style="{ background: `linear-gradient(150deg, ${cover.gradient[0]}, ${cover.gradient[1]})` }"
          :title="cover.label"
          @click="pick(cover.id)"
        >
          <span class="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-white/70" />
          <span class="absolute bottom-3 right-2.5 w-1 h-1 rounded-full bg-white/60" />
          <img :src="cover.image" :alt="cover.label" class="w-[68%] object-contain drop-shadow-sm" />
        </button>
      </div>
    </div>
  </div>
</template>
