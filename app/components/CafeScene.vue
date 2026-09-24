<script setup lang="ts">
import { DECOR_ART, DECOR_SLOTS, SLOT_BOX } from '~/utils/cafeDecor'
import type { DecorSlot } from '~/utils/cafeDecor'
import { premiumBackdrop } from '~/utils/cafePremium'
import { DEFAULT_DINING, diningArt } from '~/utils/cafeDining'

defineProps<{ showSlots?: boolean; activeSlot?: DecorSlot | null }>()
const emit = defineEmits<{ pick: [slot: DecorSlot] }>()

const { shown: placed, theme, currentStyle, rain, flash, cafeLevel, toggleRain } = useCafe()
const { character } = useCompanion()
const { lists } = useLists()
const { sfxOn, musicOn, toggleSfx, toggleMusic } = useSound()

const pending = computed(() => lists.value.reduce((n, l) => n + l.tasks.filter((t) => !t.completed).length, 0))
const bubble = computed(() => {
  if (flash.value) return flash.value
  if (pending.value > 0) return `${pending.value} ${pending.value === 1 ? 'pedido esperando' : 'pedidos esperando'}`
  return '¡Todo servido! ☕'
})

// Ventana: el cielo sigue la hora real.
const hour = ref(new Date().getHours() + new Date().getMinutes() / 60)
let clock: ReturnType<typeof setInterval> | null = null
const phase = computed<'night' | 'dawn' | 'day' | 'dusk'>(() => {
  const h = hour.value
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17.5) return 'day'
  if (h >= 17.5 && h < 20) return 'dusk'
  return 'night'
})
const SKY = {
  night: ['#1b2540', '#33426b'],
  dawn: ['#f2b9a6', '#fbe3c4'],
  day: ['#a9d6f2', '#e4f3fb'],
  dusk: ['#f09a72', '#a985c4'],
} as const
const sky = computed(() => SKY[phase.value])
const STARS = [[276, 44], [292, 68], [312, 38], [330, 82], [346, 50], [284, 96], [322, 62], [352, 100], [302, 108]]
const RAIN_DROPS = Array.from({ length: 14 }, (_, i) => ({ x: 268 + ((i * 37) % 92), delay: (i * 0.23) % 1.4 }))

// El compañero escala con el ancho de la escena.
// Parallax suave: las capas se desplazan distinto según el puntero, para dar profundidad.
const tilt = ref({ x: 0, y: 0 })
function onMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  tilt.value = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 }
}
const layer = (dx: number, dy: number) => ({ transform: `translate(${tilt.value.x * dx}px, ${tilt.value.y * dy}px) scale(1.04)` })

const wrap = ref<HTMLElement | null>(null)
const spriteSize = ref(120)
let observer: ResizeObserver | null = null

onMounted(() => {
  clock = setInterval(() => {
    const d = new Date()
    hour.value = d.getHours() + d.getMinutes() / 60
  }, 60_000)
  if (wrap.value) {
    const fit = () => {
      spriteSize.value = Math.round((wrap.value!.clientWidth * 0.6) * 0.55)
    }
    fit()
    observer = new ResizeObserver(fit)
    observer.observe(wrap.value)
  }
})
onUnmounted(() => {
  if (clock) clearInterval(clock)
  observer?.disconnect()
})

const FLOOR_LINES = Array.from({ length: 17 }, (_, i) => -300 + i * 50)
const FLOOR_ROWS = [178, 188, 200, 214, 230, 248, 270, 296, 324]

// Comedor: tres mesas; los clientes sentados son los pedidos pendientes (uno por silla).
const TABLE_X = [48, 155, 262]
const diningSet = computed(() => placed.value.dining ?? DEFAULT_DINING)
const tables = computed(() => {
  const n = Math.min(pending.value, 6)
  return TABLE_X.map((x, i) => {
    const seat = (k: number) => (n > i * 2 + k ? i * 2 + k : null)
    return { x, html: diningArt(diningSet.value, [seat(0), seat(1)]) }
  })
})

const slotIds = DECOR_SLOTS.map((s) => s.id)
const FRONT = ['counter', 'pet', 'cornerL', 'cornerR']
const backSlots = slotIds.filter((s) => !FRONT.includes(s) && s !== 'dining')
const frontSlots = slotIds.filter((s) => FRONT.includes(s))
</script>

<template>
  <div
    ref="wrap"
    class="relative w-full rounded-xl2 overflow-hidden border border-border select-none"
    style="aspect-ratio: 400 / 340"
    @pointermove="onMove"
    @pointerleave="tilt = { x: 0, y: 0 }"
  >
    <!-- Fondo: pared, suelo, ventana y decoración de atrás -->
    <svg viewBox="0 0 400 340" class="absolute inset-0 w-full h-full cafe-layer" :style="layer(-5, -3)" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cafe-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="sky[0]" />
          <stop offset="1" :stop-color="sky[1]" />
        </linearGradient>
        <clipPath id="cafe-window"><rect x="266" y="30" width="92" height="84" rx="4" /></clipPath>
        <linearGradient id="cafe-wallshade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity="0.16" />
          <stop offset="0.3" stop-color="#fff" stop-opacity="0.05" />
          <stop offset="0.7" stop-color="#fff" stop-opacity="0.05" />
          <stop offset="1" stop-color="#000" stop-opacity="0.16" />
        </linearGradient>
        <linearGradient id="cafe-floorshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000" stop-opacity="0.22" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0" />
          <stop offset="1" stop-color="#fff" stop-opacity="0.16" />
        </linearGradient>
        <linearGradient id="cafe-bartop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="1" stop-color="#fff" stop-opacity="0.05" />
        </linearGradient>
        <linearGradient id="cafe-barfront" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity="0.22" />
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.1" />
          <stop offset="1" stop-color="#000" stop-opacity="0.22" />
        </linearGradient>
        <radialGradient id="cafe-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity="0.35" />
        </radialGradient>
        <radialGradient id="cafe-glow">
          <stop offset="0" stop-color="#ffd98a" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffd98a" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Habitación en perspectiva: pared de fondo, techo, paredes laterales y suelo con tablones que convergen -->
      <rect width="400" height="170" :style="{ fill: theme?.wall ?? 'rgb(var(--c-surface-soft))' }" />
      <rect y="120" width="400" height="52" :style="{ fill: theme?.wainscot ?? 'rgb(var(--c-surface))' }" />
      <path d="M0 120H400" style="stroke: rgb(var(--c-border))" stroke-width="2" />
      <path d="M0 0H400L384 16H16Z" fill="#000" opacity="0.16" />
      <path d="M0 0L16 16V170L0 184Z" fill="#000" opacity="0.13" />
      <path d="M400 0L384 16V170L400 184Z" fill="#000" opacity="0.13" />
      <rect x="16" y="16" width="368" height="154" fill="url(#cafe-wallshade)" />
      <rect y="170" width="400" height="170" :style="{ fill: theme?.floor ?? 'color-mix(in srgb, rgb(var(--c-border)) 55%, rgb(var(--c-surface)))' }" />
      <rect y="170" width="400" height="170" fill="url(#cafe-floorshade)" />
      <g style="stroke: rgb(var(--c-border))" stroke-width="1.2" opacity="0.55">
        <path v-for="x in FLOOR_LINES" :key="x" :d="`M${200 + (x - 200) * 0.32} 170L${200 + (x - 200) * 1.8} 340`" />
        <path v-for="y in FLOOR_ROWS" :key="y" :d="`M0 ${y}H400`" />
      </g>
      <rect y="162" width="400" height="9" fill="#000" opacity="0.12" />
      <rect y="162" width="400" height="2" fill="#fff" opacity="0.25" />
      <rect y="171" width="400" height="6" fill="#000" opacity="0.18" />
      <g v-if="currentStyle?.premium" v-html="premiumBackdrop(currentStyle.id, 170)" />

      <!-- Ventana -->
      <g>
        <rect x="266" y="30" width="92" height="84" rx="4" fill="url(#cafe-sky)" />
        <g clip-path="url(#cafe-window)">
          <template v-if="phase === 'night'">
            <circle v-for="(s, i) in STARS" :key="i" :cx="s[0]" :cy="s[1]" r="1.4" fill="#fff8e0" class="cafe-twinkle" :style="{ animationDelay: `${(i % 4) * 0.6}s` }" />
            <circle cx="336" cy="52" r="9" fill="#f5f0d0" />
            <circle cx="341" cy="49" r="8" :fill="sky[0]" />
          </template>
          <template v-else-if="phase === 'day'">
            <circle cx="338" cy="54" r="10" fill="#fff3b0" />
            <ellipse cx="296" cy="64" rx="16" ry="6" fill="#fff" opacity="0.85" />
            <ellipse cx="308" cy="60" rx="10" ry="5" fill="#fff" opacity="0.85" />
          </template>
          <template v-else>
            <circle :cx="phase === 'dawn' ? 292 : 340" cy="104" r="12" :fill="phase === 'dawn' ? '#ffe7a8' : '#ffd08a'" />
          </template>
          <template v-if="rain">
            <rect x="266" y="30" width="92" height="84" fill="#7f8fa8" opacity="0.28" />
            <line v-for="(d, i) in RAIN_DROPS" :key="i" :x1="d.x" y1="24" :x2="d.x - 3" y2="36" stroke="#dfeaf7" stroke-width="1.4" stroke-linecap="round" class="cafe-rain" :style="{ animationDelay: `${d.delay}s` }" />
          </template>
        </g>
        <!-- Cortinas y marco -->
        <path d="M258 26H280Q274 70 278 116H258Z" fill="#f4c3d8" opacity="0.9" />
        <path d="M366 26H344Q350 70 346 116H366Z" fill="#f4c3d8" opacity="0.9" />
        <path d="M266 30H358V38H274V114H266Z" fill="#000" opacity="0.14" />
        <rect x="266" y="30" width="92" height="84" rx="4" fill="none" style="stroke: rgb(var(--c-border))" stroke-width="4" />
        <path d="M312 30V114M266 72H358" style="stroke: rgb(var(--c-border))" stroke-width="2.5" />
        <rect x="260" y="112" width="104" height="7" rx="3" style="fill: rgb(var(--c-border))" />
      </g>

      <!-- Brillo cálido de la lámpara al caer la tarde -->
      <circle v-if="placed.light && (phase === 'night' || phase === 'dusk')" cx="200" cy="34" r="120" fill="url(#cafe-glow)" :opacity="phase === 'night' ? 1 : 0.5" />

      <template v-for="slot in backSlots" :key="slot">
        <svg
          v-if="placed[slot]"
          :x="SLOT_BOX[slot].x"
          :y="SLOT_BOX[slot].y"
          :width="SLOT_BOX[slot].w"
          :height="SLOT_BOX[slot].h"
          :viewBox="SLOT_BOX[slot].vb"
          :preserveAspectRatio="SLOT_BOX[slot].par"
          :class="[slot === 'light' ? 'cafe-sway' : '', 'cursor-pointer pointer-events-auto cafe-item', activeSlot === slot && 'shop-glow']"
          overflow="visible"
          role="button"
          @click="emit('pick', slot)"
          v-html="DECOR_ART[placed[slot]!]"
        />
        <g v-else-if="showSlots" class="cursor-pointer" :class="activeSlot === slot && 'shop-glow'" @click="emit('pick', slot)">
          <rect :x="SLOT_BOX[slot].x" :y="SLOT_BOX[slot].y" :width="SLOT_BOX[slot].w" :height="SLOT_BOX[slot].h" rx="8" fill="transparent" style="stroke: rgb(var(--c-muted))" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.7" />
          <text :x="SLOT_BOX[slot].x + SLOT_BOX[slot].w / 2" :y="SLOT_BOX[slot].y + SLOT_BOX[slot].h / 2 + 5" text-anchor="middle" font-size="16" style="fill: rgb(var(--c-muted))">+</text>
        </g>
      </template>
    </svg>

    <!-- El compañero, detrás de la barra -->
    <CompanionAvatar
      v-if="character"
      :character="character"
      :size="spriteSize"
      class="absolute cafe-layer"
      :style="{ left: '50%', top: '18.5%', transform: `translate(calc(-50% + ${tilt.x * 2}px), ${tilt.y}px)`, filter: 'drop-shadow(0 6px 5px rgba(0,0,0,.28))' }"
    />

    <!-- Frente: barra y lo que va encima -->
    <svg viewBox="0 0 400 340" class="absolute inset-0 w-full h-full pointer-events-none cafe-layer" :style="layer(6, 3)" preserveAspectRatio="xMidYMid slice">
      <!-- Barra en 3D: sombra en el suelo, frente con paneles, cara superior y borde -->
      <ellipse cx="200" cy="241" rx="130" ry="9" fill="#000" opacity="0.25" />
      <path d="M96 184H304V240H96Z" :style="{ fill: `color-mix(in srgb, ${theme?.bar ?? '#ee8fb5'} 28%, rgb(var(--c-surface)))` }" />
      <path d="M96 184H304V240H96Z" fill="url(#cafe-barfront)" />
      <g style="stroke: rgb(var(--c-border))" stroke-width="1.4" opacity="0.7" fill="none">
        <path v-for="x in [124, 152, 180, 208, 236, 264, 292]" :key="x" :d="`M${x} 192V232`" />
        <rect x="100" y="190" width="200" height="46" rx="3" />
      </g>
      <path d="M96 232H304V240H96Z" fill="#000" opacity="0.2" />
      <path d="M86 176L100 168H300L314 176V184H86Z" :fill="theme?.bar ?? '#ee8fb5'" />
      <path d="M86 176L100 168H300L314 176Z" fill="url(#cafe-bartop)" />
      <path d="M86 184H314" stroke="#000" stroke-width="2" opacity="0.22" />
      <path d="M100 168H300" stroke="#fff" stroke-width="1.6" opacity="0.6" />
      <template v-for="slot in frontSlots" :key="slot">
        <svg
          v-if="placed[slot]"
          :x="SLOT_BOX[slot].x"
          :y="SLOT_BOX[slot].y"
          :width="SLOT_BOX[slot].w"
          :height="SLOT_BOX[slot].h"
          :viewBox="SLOT_BOX[slot].vb"
          :preserveAspectRatio="SLOT_BOX[slot].par"
          :class="['cursor-pointer pointer-events-auto cafe-item', activeSlot === slot && 'shop-glow']"
          overflow="visible"
          role="button"
          @click="emit('pick', slot)"
          v-html="DECOR_ART[placed[slot]!]"
        />
        <g v-else-if="showSlots" class="cursor-pointer pointer-events-auto" :class="activeSlot === slot && 'shop-glow'" @click="emit('pick', slot)">
          <rect :x="SLOT_BOX[slot].x" :y="SLOT_BOX[slot].y" :width="SLOT_BOX[slot].w" :height="SLOT_BOX[slot].h" rx="8" fill="transparent" style="stroke: rgb(var(--c-muted))" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.7" />
          <text :x="SLOT_BOX[slot].x + SLOT_BOX[slot].w / 2" :y="SLOT_BOX[slot].y + SLOT_BOX[slot].h / 2 + 5" text-anchor="middle" font-size="16" style="fill: rgb(var(--c-muted))">+</text>
        </g>
      </template>
      <!-- Comedor: mesas con sillas; los clientes sentados son los pedidos pendientes -->
      <ellipse v-for="t in tables" :key="`sh${t.x}`" :cx="t.x + 45" cy="328" rx="34" ry="5" fill="#000" opacity="0.2" />
      <svg
        v-for="t in tables"
        :key="t.x"
        :x="t.x"
        y="256"
        width="90"
        height="72"
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMax meet"
        overflow="visible"
        role="button"
        :class="['cursor-pointer pointer-events-auto cafe-item', activeSlot === 'dining' && 'shop-glow']"
        @click="emit('pick', 'dining')"
        v-html="t.html"
      />
      <g v-if="showSlots && !placed.dining" class="pointer-events-none">
        <text x="200" y="250" text-anchor="middle" font-size="9" style="fill: rgb(var(--c-muted))">Toca una mesa para cambiar el comedor</text>
      </g>
      <rect x="0" y="0" width="400" height="340" fill="url(#cafe-vignette)" />
    </svg>

    <!-- Globo de diálogo -->
    <div
      class="absolute left-1/2 top-[4.2%] -translate-x-1/2 max-w-[70%] bg-surface border border-border text-ink text-[11px] sm:text-xs font-semibold rounded-full px-3 py-1 shadow-lg whitespace-nowrap overflow-hidden text-ellipsis"
    >
      {{ bubble }}
    </div>

    <!-- Nivel y controles ambientales -->
    <div class="absolute left-2.5 top-2.5 bg-surface/90 border border-border rounded-full px-3 py-1 text-[11px] font-semibold text-ink">
      Nivel {{ cafeLevel }}
    </div>
    <div class="absolute right-2.5 bottom-2.5 flex gap-1.5">
      <button
        type="button"
        class="w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center transition-colors"
        :class="rain ? 'text-accent' : 'text-muted hover:text-ink'"
        :title="rain ? 'Quitar la lluvia' : 'Poner lluvia'"
        @click="toggleRain"
      >
        <AppIcon name="rain" :size="16" />
      </button>
      <button
        type="button"
        class="w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center transition-colors"
        :class="musicOn ? 'text-accent' : 'text-muted hover:text-ink'"
        :title="musicOn ? 'Apagar la música' : 'Música del café'"
        @click="toggleMusic"
      >
        <AppIcon name="music" :size="16" />
      </button>
      <button
        type="button"
        class="w-8 h-8 rounded-full bg-surface/90 border border-border flex items-center justify-center transition-colors"
        :class="sfxOn ? 'text-accent' : 'text-muted hover:text-ink'"
        :title="sfxOn ? 'Silenciar efectos' : 'Activar efectos'"
        @click="toggleSfx"
      >
        <AppIcon :name="sfxOn ? 'volume' : 'volume-off'" :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.cafe-layer {
  transition: transform 0.18s ease-out;
  will-change: transform;
}
:deep(.cafe-bob) {
  animation: cafe-bob 3.4s ease-in-out infinite;
}
@keyframes cafe-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.2px); }
}
:deep(.cafe-steam) {
  animation: cafe-steam 2.4s ease-in-out infinite;
}
@keyframes cafe-steam {
  0%, 100% { opacity: 0.2; transform: translateY(1px); }
  50% { opacity: 0.9; transform: translateY(-2px); }
}
.cafe-item {
  filter: drop-shadow(1.5px 3px 2px rgba(0, 0, 0, 0.32));
  transition: filter 0.2s;
}
.cafe-item:hover {
  filter: drop-shadow(1.5px 3px 2px rgba(0, 0, 0, 0.32)) brightness(1.08);
}
@media (prefers-reduced-motion: reduce) {
  .cafe-layer { transition: none; }
}
.shop-glow {
  animation: shop-glow 1.3s ease-in-out infinite;
}
@keyframes shop-glow {
  0%, 100% { filter: drop-shadow(0 0 2px #fff3a8) drop-shadow(0 0 5px #ffd54a); }
  50% { filter: drop-shadow(0 0 5px #fff3a8) drop-shadow(0 0 12px #ffb300); }
}
@media (prefers-reduced-motion: reduce) {
  .shop-glow { animation: none; filter: drop-shadow(0 0 5px #ffd54a); }
}
.cafe-twinkle {
  animation: cafe-twinkle 2.6s ease-in-out infinite;
}
@keyframes cafe-twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
.cafe-rain {
  animation: cafe-rain 0.9s linear infinite;
}
@keyframes cafe-rain {
  from { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  to { transform: translateY(96px); opacity: 0.3; }
}
.cafe-sway {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: cafe-sway 5s ease-in-out infinite;
}
@keyframes cafe-sway {
  0%, 100% { transform: rotate(-1.4deg); }
  50% { transform: rotate(1.4deg); }
}
</style>
