<script setup lang="ts">
import { COLLECTIBLES, RARITY_COLOR, RARITY_LABEL, passCollectible, type Collectible } from '~/utils/casitaData'
import type { ChestPrize } from '~/composables/useRewards'
import { downloadEmojiSticker } from '~/utils/exportImage'

const rewards = useRewards()
const { burstFromEl, celebrate } = useConfetti()

const chestRef = ref<HTMLElement | null>(null)
const prize = ref<ChestPrize | null>(null)
const shaking = ref(false)

function open() {
  if (!rewards.canOpenChest.value || shaking.value) return
  shaking.value = true
  useSound().play('pop')
  window.setTimeout(() => {
    shaking.value = false
    prize.value = rewards.openChest()
    if (prize.value) {
      burstFromEl(chestRef.value, 'estrellas', 20)
      if (prize.value.collectible && (prize.value.collectible.rarity !== 'comun')) celebrate('estrellas')
    }
  }, 700)
}

const sets = computed(() => {
  const map = new Map<string, Collectible[]>()
  for (const item of COLLECTIBLES) map.set(item.set, [...(map.get(item.set) ?? []), item])
  return Array.from(map.entries())
})

const passOwned = computed(() =>
  Object.keys(rewards.collection.value)
    .map((id) => passCollectible(id))
    .filter((x): x is Collectible => !!x),
)

const total = COLLECTIBLES.length
const ownedBase = computed(() => COLLECTIBLES.filter((c) => rewards.collection.value[c.id]).length)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-xl2 border border-border bg-surface p-4 flex flex-col items-center gap-3 text-center">
      <button
        ref="chestRef"
        type="button"
        class="chest text-7xl leading-none"
        :class="[shaking ? 'chest-shake' : '', rewards.canOpenChest.value ? 'chest-ready' : 'opacity-50 grayscale']"
        :disabled="!rewards.canOpenChest.value"
        aria-label="Abrir cofrecito"
        @click="open"
      >
        {{ prize && !rewards.canOpenChest.value ? '🎊' : '🎁' }}
      </button>
      <p v-if="rewards.canOpenChest.value" class="text-sm font-semibold text-ink">¡Tu cofrecito diario está listo!</p>
      <p v-else class="text-sm font-semibold text-ink">Vuelve mañana por otro cofrecito 🌙</p>

      <div v-if="prize" class="prize flex items-center gap-2 rounded-full bg-accent-soft/40 border border-accent px-4 py-2">
        <span class="text-2xl leading-none">{{ prize.emoji }}</span>
        <span class="text-sm text-ink font-semibold">
          {{ prize.kind === 'sticker' ? (prize.isNew ? '¡Sticker nuevo! ' : 'Repetido: ') : '' }}{{ prize.label }}
        </span>
      </div>
      <p class="text-[11px] text-muted">También ganas un sticker sorpresa cada 7 tareas completadas.</p>
    </div>

    <div class="rounded-xl2 border border-border bg-surface p-3.5" data-hl="album">
      <p class="text-sm font-semibold text-ink mb-0.5">Álbum de stickers · {{ ownedBase }}/{{ total }}</p>
      <p class="text-[11px] text-muted mb-3">Los que consigas aparecen en «Mi colección» al agregar un sticker en tus libros. Toca uno para descargarlo (512×512, listo para WhatsApp).</p>

      <div v-for="[setName, items] in sets" :key="setName" class="mb-3 last:mb-0">
        <p class="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1.5">{{ setName }}</p>
        <div class="grid grid-cols-6 gap-1.5">
          <button
            v-for="it in items"
            :key="it.id"
            :data-hl="`sticker-${it.id}`"
            type="button"
            class="aspect-square rounded-xl2 flex flex-col items-center justify-center border-2 bg-surface-soft relative"
            :style="{ borderColor: rewards.collection.value[it.id] ? RARITY_COLOR[it.rarity] : 'transparent' }"
            :disabled="!rewards.collection.value[it.id]"
            :title="rewards.collection.value[it.id] ? `${it.label} · ${RARITY_LABEL[it.rarity]} — descargar` : 'Sin descubrir'"
            @click="downloadEmojiSticker(it.emoji, it.label)"
          >
            <span class="text-2xl leading-none" :class="rewards.collection.value[it.id] ? '' : 'brightness-0 opacity-25'">{{ it.emoji }}</span>
            <span v-if="(rewards.collection.value[it.id] ?? 0) > 1" class="absolute -top-1 -right-1 text-[9px] font-bold bg-accent text-white rounded-full px-1.5">×{{ rewards.collection.value[it.id] }}</span>
          </button>
        </div>
      </div>

      <div v-if="passOwned.length" class="mt-3">
        <p class="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1.5">Packs de temporada</p>
        <div class="grid grid-cols-6 gap-1.5">
          <button
            v-for="it in passOwned"
            :key="it.id"
            :data-hl="`sticker-${it.id}`"
            type="button"
            class="aspect-square rounded-xl2 flex items-center justify-center border-2 bg-surface-soft"
            :style="{ borderColor: RARITY_COLOR[it.rarity] }"
            :title="`${it.label} — descargar`"
            @click="downloadEmojiSticker(it.emoji, it.label)"
          >
            <span class="text-2xl leading-none">{{ it.emoji }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chest {
  transition: transform 0.2s;
}
.chest-ready {
  animation: chest-bob 1.8s ease-in-out infinite;
}
.chest-ready:hover {
  transform: scale(1.1);
}
.chest-shake {
  animation: chest-shake 0.7s ease-in-out;
}
.prize {
  animation: prize-pop 0.4s ease-out;
}
@keyframes chest-bob {
  50% {
    transform: translateY(-6px) rotate(-3deg);
  }
}
@keyframes chest-shake {
  0%,
  100% {
    transform: rotate(0);
  }
  15% {
    transform: rotate(-14deg) scale(1.1);
  }
  30% {
    transform: rotate(12deg) scale(1.15);
  }
  45% {
    transform: rotate(-10deg) scale(1.2);
  }
  60% {
    transform: rotate(8deg) scale(1.2);
  }
  80% {
    transform: rotate(-4deg) scale(1.25);
  }
}
@keyframes prize-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chest-ready,
  .chest-shake,
  .prize {
    animation: none;
  }
}
</style>
