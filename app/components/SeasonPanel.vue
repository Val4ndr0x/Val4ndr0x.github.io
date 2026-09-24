<script setup lang="ts">
import { PASS_TIERS, seasonFor } from '~/utils/casitaData'
import { downloadWallpaper } from '~/utils/exportImage'
import { isLightColor } from '~/utils/color'

const rewards = useRewards()
const cute = useCuteTheme()
const { character, companionName, level } = useCompanion()
const { burstFromEl } = useConfetti()

const season = seasonFor()
const maxTasks = PASS_TIERS[PASS_TIERS.length - 1]!.tasks
const progressPct = computed(() => Math.min(100, Math.round((rewards.tasksThisMonth.value / maxTasks) * 100)))

function claim(i: number, e: Event) {
  if (rewards.claimTier(i)) burstFromEl(e.currentTarget as Element, 'estrellas', 18)
}

function claimWelcome(e: Event) {
  if (rewards.claimWelcome()) burstFromEl(e.currentTarget as Element, 'corazones', 22)
}

function wallpaper() {
  downloadWallpaper({
    bg: season.theme.bg,
    accent: season.theme.accent,
    emoji: season.emoji,
    name: companionName.value || 'Mi mascota',
    caption: `${season.name} · Nivel ${level.value}`,
    sprite: character.value ? { src: character.value.sprite, frameWidth: character.value.frameWidth, frameHeight: character.value.frameHeight } : undefined,
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <section v-if="!rewards.welcome.value" class="rounded-xl2 border-2 border-dashed border-accent bg-accent-soft/20 p-4 flex items-center gap-3">
      <span class="text-4xl leading-none">🎀</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-ink">Pack de bienvenida</p>
        <p class="text-xs text-muted">3 stickers para tu álbum y la insignia de miembro fundador.</p>
      </div>
      <button type="button" class="shrink-0 px-4 py-2 rounded-full bg-accent text-white text-xs font-semibold" @click="claimWelcome">Reclamar</button>
    </section>

    <section class="rounded-xl2 border border-border bg-surface p-4">
      <div class="flex items-center gap-3 mb-3">
        <span class="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0" :style="{ backgroundColor: season.theme.bg }">{{ season.emoji }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-ink">Pase de temporada · {{ season.name }}</p>
          <p class="text-xs text-muted">{{ rewards.tasksThisMonth.value }} tareas este mes. Se renueva cada mes con un tema, stickers y un visitante nuevos.</p>
        </div>
      </div>

      <div class="h-2 rounded-full bg-border overflow-hidden mb-4"><div class="h-full bg-accent rounded-full transition-[width]" :style="{ width: `${progressPct}%` }" /></div>

      <ol class="flex flex-col gap-2">
        <li v-for="(t, i) in PASS_TIERS" :key="t.kind" :data-hl="`tier-${i}`" class="flex items-center gap-3 rounded-xl2 bg-surface-soft px-3 py-2.5">
          <span class="w-9 h-9 rounded-full bg-base flex items-center justify-center text-lg shrink-0">
            {{ t.kind === 'theme' ? '🎨' : t.kind === 'stickers' ? season.stickers[0]!.emoji : t.kind === 'friend' ? season.friend.emoji : season.insignia.emoji }}
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-ink">{{ t.label }}</span>
            <span class="block text-[11px] text-muted">
              <template v-if="t.kind === 'theme'">Tema «{{ season.theme.label }}»</template>
              <template v-else-if="t.kind === 'stickers'">{{ season.stickers.map((s) => `${s.emoji} ${s.label}`).join(' · ') }}</template>
              <template v-else-if="t.kind === 'friend'">{{ season.friend.label }} visita la casita</template>
              <template v-else>«{{ season.insignia.label }}»</template>
              · {{ t.tasks }} tareas
            </span>
          </span>
          <span v-if="rewards.isClaimed(i)" class="text-xs font-semibold text-accent">✔ Reclamado</span>
          <button
            v-else
            type="button"
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            :class="rewards.tasksThisMonth.value >= t.tasks ? 'bg-accent text-white' : 'bg-border text-muted cursor-not-allowed'"
            :disabled="rewards.tasksThisMonth.value < t.tasks"
            @click="claim(i, $event)"
          >
            {{ rewards.tasksThisMonth.value >= t.tasks ? 'Reclamar' : `${rewards.tasksThisMonth.value}/${t.tasks}` }}
          </button>
        </li>
      </ol>
    </section>

    <section v-if="rewards.seasonThemes.value.length" class="rounded-xl2 border border-border bg-surface p-4">
      <p class="text-sm font-bold text-ink mb-2">Mis temas de temporada</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in rewards.seasonThemes.value"
          :key="t.id"
          type="button"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
          :class="cute.activeThemeId.value === t.id ? 'border-accent text-ink' : 'border-border text-muted hover:text-ink'"
          :style="{ backgroundColor: t.bg }"
          @click="cute.selectTheme(t.id)"
        >
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: t.accent }" />
          <span :style="{ color: isLightColor(t.bg) ? '#2b2830' : '#f5f5f7' }" :class="cute.activeThemeId.value === t.id ? 'font-bold' : ''">{{ t.emoji }} {{ t.label }}</span>
        </button>
      </div>
    </section>

    <section class="rounded-xl2 border border-border bg-surface p-4 flex items-center gap-3">
      <span class="text-3xl leading-none">🖼️</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-ink">Fondo de pantalla</p>
        <p class="text-xs text-muted">Descarga un fondo vertical con tu mascota y los colores del mes.</p>
      </div>
      <button type="button" class="shrink-0 px-4 py-2 rounded-full bg-accent text-white text-xs font-semibold" @click="wallpaper">Descargar</button>
    </section>
  </div>
</template>
