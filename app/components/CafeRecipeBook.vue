<script setup lang="ts">
import { REQ_LABELS, recipeEffect } from '~/utils/cafeRecipes'

const { recipes, announce } = useCafe()
const { feed, hunger, thirst, points } = useCompanion()
const { play } = useSound()
const unlockedCount = computed(() => recipes.value.filter((r) => r.unlocked).length)

type RecipeRow = (typeof recipes.value)[number]
const selectedId = ref<string | null>(null)
const selected = computed(() => recipes.value.find((r) => r.id === selectedId.value) ?? null)
const effect = computed(() => (selected.value ? recipeEffect(selected.value) : null))
const need = computed(() => (effect.value?.kind === 'drink' ? thirst.value : hunger.value))

function open(r: RecipeRow) {
  selectedId.value = r.id
}

function giveToCompanion() {
  if (!selected.value || !effect.value) return
  if (feed(`receta-${selected.value.id}`)) {
    play('pop')
    announce(`${selected.value.emoji} ¡Ñam! +${effect.value.xp} XP para el compañero`)
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-xs text-muted">
      {{ unlockedCount }} de {{ recipes.length }} recetas desbloqueadas. Las recetas se ganan sirviendo pedidos, con rachas y subiendo de nivel.
      Tócalas para verlas de cerca; las desbloqueadas también sirven de comida para el compañero.
    </p>

    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <li v-for="r in recipes" :key="r.id">
        <button
          type="button"
          class="w-full text-left bg-surface border border-border rounded-xl2 p-3.5 flex items-center gap-3 hover:border-accent transition"
          :class="r.unlocked ? '' : 'opacity-70'"
          @click="open(r)"
        >
          <span
            class="w-12 h-12 rounded-full bg-base border border-border flex items-center justify-center text-2xl shrink-0"
            :class="r.unlocked ? '' : 'grayscale opacity-50'"
          >
            {{ r.unlocked ? r.emoji : '🔒' }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink truncate">{{ r.unlocked ? r.label : '???' }}</p>
            <p v-if="r.unlocked" class="text-xs text-muted">{{ r.description }}</p>
            <template v-else>
              <p class="text-xs text-muted">{{ r.current }}/{{ r.target }} {{ REQ_LABELS[r.req.type] }}</p>
              <div class="h-1.5 w-full rounded-full bg-border overflow-hidden mt-1.5">
                <div class="h-full bg-accent rounded-full transition-[width]" :style="{ width: `${Math.round((r.current / r.target) * 100)}%` }" />
              </div>
            </template>
          </div>
        </button>
      </li>
    </ul>

    <div
      v-if="selected && effect"
      class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      @click.self="selectedId = null"
    >
      <div class="w-full sm:max-w-sm bg-surface rounded-t-3xl sm:rounded-3xl p-5 flex flex-col items-center text-center gap-3 max-h-[90vh] overflow-y-auto">
        <span
          class="w-32 h-32 rounded-full bg-base border border-border flex items-center justify-center text-7xl"
          :class="selected.unlocked ? '' : 'grayscale opacity-50'"
        >
          {{ selected.unlocked ? selected.emoji : '🔒' }}
        </span>

        <template v-if="selected.unlocked">
          <h3 class="text-lg font-bold text-ink">{{ selected.label }}</h3>
          <p class="text-sm text-muted">{{ selected.description }}</p>

          <div class="w-full text-left">
            <p class="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Ingredientes</p>
            <ul class="flex flex-wrap gap-1.5">
              <li v-for="i in selected.ingredients" :key="i" class="text-xs bg-base border border-border rounded-full px-2.5 py-1 text-ink">{{ i }}</li>
            </ul>
          </div>

          <div class="w-full grid grid-cols-3 gap-2 text-xs">
            <div class="bg-base border border-border rounded-xl py-2">
              <p class="text-muted">{{ effect.kind === 'food' ? 'Comida' : 'Bebida' }}</p>
              <p class="font-semibold text-ink">+{{ effect.restore }}</p>
            </div>
            <div class="bg-base border border-border rounded-xl py-2">
              <p class="text-muted">XP</p>
              <p class="font-semibold text-ink">+{{ effect.xp }}</p>
            </div>
            <div class="bg-base border border-border rounded-xl py-2">
              <p class="text-muted">Costo</p>
              <p class="font-semibold text-ink">⭐ {{ effect.cost }}</p>
            </div>
          </div>
          <p class="text-[11px] text-muted">
            {{ effect.kind === 'food' ? 'Comida' : 'Bebida' }} actual del compañero: {{ need }}/100
          </p>

          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:brightness-105 active:scale-95 transition disabled:opacity-40"
            :disabled="points < effect.cost"
            @click="giveToCompanion"
          >
            {{ points < effect.cost ? 'No te alcanzan las estrellas' : 'Dársela al compañero' }}
          </button>
        </template>

        <template v-else>
          <h3 class="text-lg font-bold text-ink">Receta bloqueada</h3>
          <p class="text-sm text-muted">Te falta: {{ selected.current }}/{{ selected.target }} {{ REQ_LABELS[selected.req.type] }}</p>
          <div class="h-2 w-full rounded-full bg-border overflow-hidden">
            <div class="h-full bg-accent rounded-full" :style="{ width: `${Math.round((selected.current / selected.target) * 100)}%` }" />
          </div>
        </template>

        <button type="button" class="text-xs font-semibold text-muted hover:text-ink transition" @click="selectedId = null">Cerrar</button>
      </div>
    </div>
  </div>
</template>
