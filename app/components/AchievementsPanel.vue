<script setup lang="ts">
import { ACHIEVEMENTS, requirementText } from '~/utils/casitaData'

const rewards = useRewards()

const unlockedCount = computed(() => Object.keys(rewards.unlocked.value).length)

function progress(a: (typeof ACHIEVEMENTS)[number]) {
  return Math.min(100, Math.round((rewards.stats.value[a.stat] / a.goal) * 100))
}

const insignia = computed(() => rewards.insigniaDisplay.value)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-xl2 border border-border bg-surface p-3.5 flex items-center gap-3">
      <span class="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-2xl shrink-0">{{ insignia?.emoji ?? '🏅' }}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-ink">{{ unlockedCount }} de {{ ACHIEVEMENTS.length }} medallas</p>
        <p class="text-xs text-muted truncate">
          {{ insignia ? `Insignia: ${insignia.label}` : 'Toca una medalla ganada para ponerla junto al nombre de tu mascota.' }}
        </p>
      </div>
      <button v-if="insignia" type="button" class="text-xs font-semibold text-muted hover:text-ink" @click="rewards.setInsignia(null)">Quitar</button>
    </div>

    <div v-if="rewards.insigniaOptions.value.some((o) => !o.id.startsWith('ach:'))" class="flex flex-wrap gap-1.5">
      <button
        v-for="o in rewards.insigniaOptions.value.filter((x) => !x.id.startsWith('ach:'))"
        :key="o.id"
        type="button"
        class="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
        :class="rewards.insigniaDisplay.value?.id === o.id ? 'border-accent bg-accent-soft/30 text-ink' : 'border-border bg-surface-soft text-muted hover:text-ink'"
        @click="rewards.setInsignia(o.id)"
      >
        {{ o.emoji }} {{ o.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button
        v-for="a in ACHIEVEMENTS"
        :key="a.id"
        :data-hl="`ach-${a.id}`"
        type="button"
        class="text-left flex items-center gap-3 rounded-xl2 border-2 p-3 transition-colors"
        :class="[
          rewards.unlocked.value[a.id] ? 'bg-surface border-transparent hover:border-accent/60' : 'bg-surface-soft border-transparent opacity-70 cursor-default',
          rewards.insigniaDisplay.value?.id === `ach:${a.id}` ? '!border-accent' : '',
        ]"
        :disabled="!rewards.unlocked.value[a.id]"
        @click="rewards.setInsignia(`ach:${a.id}`)"
      >
        <span class="w-11 h-11 rounded-full bg-base flex items-center justify-center text-2xl shrink-0" :class="rewards.unlocked.value[a.id] ? '' : 'grayscale opacity-50'">{{ a.emoji }}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold text-ink truncate">{{ a.label }}</span>
          <span class="block text-[11px] text-muted leading-tight">{{ a.desc }}</span>
          <span v-if="!rewards.unlocked.value[a.id]" class="mt-1.5 flex items-center gap-2">
            <span class="flex-1 h-1.5 rounded-full bg-border overflow-hidden"><span class="block h-full bg-accent rounded-full" :style="{ width: `${progress(a)}%` }" /></span>
            <span class="text-[10px] text-muted shrink-0">{{ Math.min(rewards.stats.value[a.stat], a.goal) }}/{{ a.goal }}</span>
          </span>
          <span v-else class="block text-[10px] text-accent mt-0.5">¡Lograda! · {{ requirementText(a.stat, a.goal) }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
