<script setup lang="ts">
import { NAV_ICON_DEFAULT, NAV_ICON_MAX, NAV_ICON_MIN } from '~/composables/useNavSize'
import { AMBIENT_FX, CONFETTI_KINDS, CURSORS } from '~/composables/useCuteTheme'
import { isLightColor } from '~/utils/color'
const emit = defineEmits<{ close: [] }>()
const { isDark, toggleDark } = useTheme()
const { bgColor, setBgColor, presets } = useAppTheme()
const cute = useCuteTheme()
const { burst } = useConfetti()

function pickConfetti(id: (typeof CONFETTI_KINDS)[number]['id']) {
  cute.setConfetti(id)
  if (id !== 'ninguno') burst(window.innerWidth / 2, window.innerHeight / 2, id === 'aleatorio' ? undefined : id, 12)
}

const { sfxOn, musicOn, toggleSfx, toggleMusic } = useSound()
const { iconSize, setIconSize } = useNavSize()
const showWheel = ref(false)
const WHEEL_START = '#f8e1ea'
const customActive = computed(() => !!bgColor.value && !presets.some((p) => p.color?.toLowerCase() === bgColor.value?.toLowerCase()))
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" @click.self="emit('close')">
    <div class="w-full sm:max-w-sm bg-[#fff8f3] dark:bg-surface rounded-t-[26px] sm:rounded-[26px] p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-black/80 dark:text-ink">Configuración</h2>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-black/40 dark:text-muted hover:bg-black/5 dark:hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 rounded-xl2 border border-black/10 dark:border-border p-3.5">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shrink-0">
            <AppIcon name="moon" :size="18" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Modo oscuro</p>
            <p class="text-xs text-black/45 dark:text-muted">Deja toda la app oscura, siempre.</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="isDark"
          class="relative w-12 h-7 rounded-full shrink-0 transition-colors"
          :class="isDark ? 'bg-accent' : 'bg-black/15 dark:bg-surface-soft'"
          @click="toggleDark"
        >
          <span
            class="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
            :class="isDark ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 rounded-xl2 border border-black/10 dark:border-border p-3.5">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shrink-0">
            <AppIcon name="volume" :size="18" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Efectos de sonido</p>
            <p class="text-xs text-black/45 dark:text-muted">Campanita al completar y monedas al servir.</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="sfxOn"
          class="relative w-12 h-7 rounded-full shrink-0 transition-colors"
          :class="sfxOn ? 'bg-accent' : 'bg-black/15 dark:bg-surface-soft'"
          @click="toggleSfx"
        >
          <span
            class="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
            :class="sfxOn ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="flex items-center justify-between gap-3 rounded-xl2 border border-black/10 dark:border-border p-3.5">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shrink-0">
            <AppIcon name="music" :size="18" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Música del café</p>
            <p class="text-xs text-black/45 dark:text-muted">Melodía suave de fondo (se apaga al recargar).</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          :aria-checked="musicOn"
          class="relative w-12 h-7 rounded-full shrink-0 transition-colors"
          :class="musicOn ? 'bg-accent' : 'bg-black/15 dark:bg-surface-soft'"
          @click="toggleMusic"
        >
          <span
            class="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
            :class="musicOn ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="rounded-xl2 border border-black/10 dark:border-border p-3.5 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shrink-0">
            <AppIcon name="board" :size="18" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Tamaño de los iconos</p>
            <p class="text-xs text-black/45 dark:text-muted">De la barra de navegación ({{ iconSize }} px).</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <AppIcon name="checklist" :size="NAV_ICON_MIN" class="text-black/45 dark:text-muted shrink-0" />
          <input
            type="range"
            :min="NAV_ICON_MIN"
            :max="NAV_ICON_MAX"
            step="1"
            :value="iconSize"
            class="flex-1 accent-[#f4a8c4]"
            @input="setIconSize(Number(($event.target as HTMLInputElement).value))"
          />
          <AppIcon name="checklist" :size="NAV_ICON_MAX" class="text-black/45 dark:text-muted shrink-0" />
        </div>
        <button
          v-if="iconSize !== NAV_ICON_DEFAULT"
          type="button"
          class="self-start text-xs font-semibold text-black/50 dark:text-muted hover:text-black/80 dark:hover:text-ink"
          @click="setIconSize(NAV_ICON_DEFAULT)"
        >
          Restablecer
        </button>
      </div>

      <div class="rounded-xl2 border border-black/10 dark:border-border p-3.5 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-lg shrink-0">🎀</span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Temas con encanto</p>
            <p class="text-xs text-black/45 dark:text-muted">Cambian el fondo y el color de acento.</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in cute.themes.value"
            :key="t.id"
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
            :class="!cute.auto.value && cute.themeId.value === t.id ? 'border-accent' : 'border-black/10 dark:border-border'"
            :style="{ backgroundColor: t.bg ?? '#131316' }"
            @click="cute.selectTheme(t.id)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: t.accent ?? '#ee8fb5' }" />
            <span :style="{ color: t.bg && isLightColor(t.bg) ? '#2b2830' : '#f5f5f7' }">{{ t.emoji }} {{ t.label }}</span>
          </button>
        </div>
        <label class="flex items-center justify-between gap-3 text-xs text-black/60 dark:text-muted">
          <span>🕐 Cambiar según la hora (amanecer, tarde y noche)</span>
          <button
            type="button"
            role="switch"
            :aria-checked="cute.auto.value"
            class="relative w-10 h-6 rounded-full shrink-0 transition-colors"
            :class="cute.auto.value ? 'bg-accent' : 'bg-black/15 dark:bg-surface-soft'"
            @click="cute.setAuto(!cute.auto.value)"
          >
            <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform" :class="cute.auto.value ? 'translate-x-4' : 'translate-x-0'" />
          </button>
        </label>
      </div>

      <div class="rounded-xl2 border border-black/10 dark:border-border p-3.5 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-lg shrink-0">✨</span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Ambiente, cursor y confeti</p>
            <p class="text-xs text-black/45 dark:text-muted">Detalles suaves para que la app se sienta tuya.</p>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-semibold text-black/50 dark:text-muted mb-1.5">Fondo animado</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="f in AMBIENT_FX"
              :key="f.id"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              :class="cute.fx.value === f.id ? 'bg-accent text-white' : 'bg-black/5 dark:bg-surface-soft text-black/60 dark:text-muted'"
              @click="cute.setFx(f.id)"
            >
              {{ f.emoji }} {{ f.label }}
            </button>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-semibold text-black/50 dark:text-muted mb-1.5">Cursor</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="c in CURSORS"
              :key="c.id"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              :class="cute.cursor.value === c.id ? 'bg-accent text-white' : 'bg-black/5 dark:bg-surface-soft text-black/60 dark:text-muted'"
              @click="cute.setCursor(c.id)"
            >
              {{ c.emoji }} {{ c.label }}
            </button>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-semibold text-black/50 dark:text-muted mb-1.5">Confeti al completar tareas</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="k in CONFETTI_KINDS"
              :key="k.id"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              :class="cute.confetti.value === k.id ? 'bg-accent text-white' : 'bg-black/5 dark:bg-surface-soft text-black/60 dark:text-muted'"
              @click="pickConfetti(k.id)"
            >
              {{ k.emoji }} {{ k.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-xl2 border border-black/10 dark:border-border p-3.5 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-black/5 dark:bg-surface-soft flex items-center justify-center text-black/60 dark:text-ink shrink-0">
            <AppIcon name="palette" :size="18" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-black/80 dark:text-ink text-sm">Color de fondo</p>
            <p class="text-xs text-black/45 dark:text-muted">Elige un pastel o crea el tuyo con la rueda.</p>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2.5">
          <button
            v-for="p in presets"
            :key="p.id"
            type="button"
            class="flex flex-col items-center gap-1"
            :title="p.label"
            @click="setBgColor(p.color)"
          >
            <span
              class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
              :class="(bgColor ?? null) === p.color || bgColor?.toLowerCase() === p.color?.toLowerCase() ? 'border-accent' : 'border-black/10 dark:border-border'"
              :style="{ backgroundColor: p.color ?? '#131316' }"
            />
            <span class="text-[10px] text-black/50 dark:text-muted leading-none">{{ p.label }}</span>
          </button>
          <button type="button" class="flex flex-col items-center gap-1" title="Personalizado" @click="showWheel = true">
            <span
              class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
              :class="customActive ? 'border-accent' : 'border-black/10 dark:border-border'"
              :style="{ background: customActive && bgColor ? bgColor : 'conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }"
            />
            <span class="text-[10px] text-black/50 dark:text-muted leading-none">Rueda</span>
          </button>
        </div>
      </div>
    </div>

    <ColorPickerPopover
      v-if="showWheel"
      title="Color de fondo"
      :model-value="bgColor ?? WHEEL_START"
      :presets="presets.filter((p) => p.color).map((p) => p.color as string)"
      @update:model-value="setBgColor"
      @close="showWheel = false"
    />
  </div>
</template>
