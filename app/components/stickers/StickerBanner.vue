<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const VARIANTS = ['brush', 'hearts', 'confetti'] as const
type Variant = (typeof VARIANTS)[number]

const variant = computed<Variant>(() => ((VARIANTS as readonly string[]).includes(props.data.variant) ? props.data.variant : 'brush'))
const color = computed(() => (/^#[0-9a-fA-F]{6}$/.test(props.data.color) ? (props.data.color as string) : '#f4c6cf'))
const decor = computed<string>(() => props.data.decor ?? '')

const text = computed({
  get: () => props.data.text ?? '',
  set: (v: string) => emit('update', { text: v }),
})

const confetti =
  'radial-gradient(circle at 6% 30%, #f7b8cf 3px, transparent 3.5px), radial-gradient(circle at 18% 78%, #a9dcc3 2px, transparent 2.6px), radial-gradient(circle at 34% 18%, #f7e08a 2px, transparent 2.6px), radial-gradient(circle at 62% 84%, #cdb8ec 2px, transparent 2.6px), radial-gradient(circle at 78% 20%, #f7b8cf 2px, transparent 2.6px), radial-gradient(circle at 90% 68%, #f7e08a 3px, transparent 3.5px), radial-gradient(circle at 96% 22%, #a9dcc3 2px, transparent 2.6px)'

const brushDots = 'radial-gradient(rgba(255,255,255,.75) 2px, transparent 2.6px)'

function cycleVariant() {
  emit('update', { variant: VARIANTS[(VARIANTS.indexOf(variant.value) + 1) % VARIANTS.length] })
}
const showGallery = ref(false)
function pickDecor(image: string) {
  emit('update', { decor: image })
  showGallery.value = false
}
function clearDecor() {
  emit('update', { decor: '' })
  showGallery.value = false
}
</script>

<template>
  <div class="relative w-full group flex items-center justify-center min-h-[64px] px-16 py-2">
    <div v-if="variant === 'brush'" class="banner-brush absolute inset-0" :style="{ backgroundColor: color, backgroundImage: brushDots, backgroundSize: '14px 14px' }" />
    <div v-else-if="variant === 'confetti'" class="absolute inset-0 pointer-events-none" :style="{ backgroundImage: confetti }" />

    <span v-if="variant === 'hearts'" class="absolute left-3 text-lg leading-none select-none pointer-events-none" :style="{ color }">♥ ♥</span>
    <span v-if="variant === 'hearts'" class="absolute right-3 text-lg leading-none select-none pointer-events-none" :style="{ color }">♥ ♥</span>

    <img v-if="decor" :src="decor" alt="" class="absolute left-2 top-1/2 -translate-y-1/2 h-14 w-14 object-contain pointer-events-none select-none" draggable="false" />

    <input
      v-model="text"
      type="text"
      placeholder="Sección"
      class="relative w-full bg-transparent outline-none text-center text-lg font-semibold placeholder-black/30"
      :class="variant === 'brush' && 'text-black/75'"
      :style="variant === 'brush' ? undefined : { color: '#4a3b40' }"
    />

    <div class="absolute -top-2.5 right-6 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        class="h-6 px-1.5 rounded-full bg-white shadow border border-border text-black/50 text-[11px] font-semibold"
        title="Cambiar estilo del encabezado"
        @click="cycleVariant"
      >
        Estilo
      </button>
      <button
        type="button"
        class="h-6 px-1.5 rounded-full bg-white shadow border border-border text-black/50 text-[11px] font-semibold"
        title="Elegir sticker del banner"
        @click="showGallery = true"
      >
        Adorno
      </button>
    </div>
    <button
      type="button"
      class="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white shadow border border-border flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Quitar encabezado"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="12" />
    </button>

    <Teleport to="body">
      <StickerGallery v-if="showGallery" allow-clear @close="showGallery = false" @pick="pickDecor" @clear="clearDecor" />
    </Teleport>
  </div>
</template>

<style scoped>
.banner-brush {
  opacity: 0.95;
  clip-path: polygon(1% 18%, 6% 6%, 14% 12%, 24% 3%, 36% 10%, 48% 2%, 60% 9%, 72% 3%, 84% 11%, 94% 5%, 99% 20%, 100% 50%, 98% 80%, 93% 94%, 82% 88%, 70% 97%, 58% 90%, 46% 98%, 34% 91%, 22% 97%, 11% 89%, 4% 94%, 0 76%, 2% 46%);
}
</style>
