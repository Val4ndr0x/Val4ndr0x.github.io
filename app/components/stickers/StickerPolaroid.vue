<script setup lang="ts">
import { imageFileToDataUrl } from '~/utils/imageFile'

const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')

const caption = computed({
  get: () => props.data.caption ?? '',
  set: (v: string) => emit('update', { caption: v }),
})

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  try {
    emit('update', { src: await imageFileToDataUrl(file, 700, 0.8) })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar la foto'
  }
}
</script>

<template>
  <div class="relative group w-full">
    <div class="polaroid bg-white p-2 pb-3">
      <button type="button" class="block w-full aspect-square bg-[#f1ece4] overflow-hidden relative" :title="data.src ? 'Cambiar foto' : 'Subir foto'" @click="fileInput?.click()">
        <img v-if="data.src" :src="data.src" alt="Foto" class="w-full h-full object-cover" draggable="false" />
        <span v-else class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-black/35">
          <span class="text-3xl leading-none">📷</span>
          <span class="text-[11px] font-medium">Subir foto</span>
        </span>
      </button>
      <input
        v-model="caption"
        type="text"
        maxlength="40"
        placeholder="Escribe algo lindo…"
        class="mt-2 w-full bg-transparent outline-none text-center text-sm text-black/70 placeholder-black/30"
      />
      <p v-if="error" class="text-[10px] text-danger text-center">{{ error }}</p>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
    <button
      type="button"
      class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar polaroid"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.polaroid {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.12);
}
</style>
