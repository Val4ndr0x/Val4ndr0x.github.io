<script setup lang="ts">
import { FLOOR_COLORS, FRIENDS, FURNITURE, FURNITURE_SLOTS, WALL_COLORS, requirementText, seasonFor, type FurnitureSlot } from '~/utils/casitaData'
import { CASITA_STYLES, type RoomPiece } from '~/utils/casitaStyles'
import { premiumBackdrop } from '~/utils/cafePremium'
import { STAGES } from '~/composables/useCompanionState'

const { character, companionName, level } = useCompanion()
const rewards = useRewards()
const { stage, mood, moodLabel } = useCompanionState()

const slot = ref<FurnitureSlot>('wall')
// Modo compra: al tocar un objeto de la casita se abre la tienda de ese tipo de objeto.
const shopping = ref(false)
// El panel de la tienda queda debajo de otras secciones (comida, estilos); sin este scroll
// solo se veía el brillo del objeto tocado y la tienda quedaba fuera de pantalla.
const shopPanelRef = ref<HTMLElement | null>(null)
function openShop(s: FurnitureSlot) {
  slot.value = s
  shopping.value = true
  useSound().play('pop')
  nextTick(() => shopPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
function closeShop() {
  shopping.value = false
  preview.value = {}
}
const glow = (s: FurnitureSlot) => (shopping.value && slot.value === s ? 'shop-glow' : '')
const slotLabel = computed(() => FURNITURE_SLOTS.find((x) => x.id === slot.value)?.label ?? '')
const season = seasonFor()

// Los muebles bloqueados solo se pueden probar: se ven en la casita pero no se guardan.
const preview = ref<Partial<Record<FurnitureSlot, string>>>({})
const trying = computed(() => FURNITURE.filter((f) => preview.value[f.slot] === f.id))
onBeforeUnmount(() => { preview.value = {} })

const { points, userName } = useCompanion()
const petRef = ref<{ el: HTMLElement | null; eat: (emoji: string) => void } | null>(null)
const petMsg = ref('')
let petMsgTimer: ReturnType<typeof setTimeout> | null = null
watch(petMsg, (m) => {
  if (!m) return
  if (petMsgTimer) clearTimeout(petMsgTimer)
  petMsgTimer = setTimeout(() => (petMsg.value = ''), 2500)
})
function onFed(item: { emoji: string; label: string; xp: number }) {
  petMsg.value = `¡Ñam! ${item.emoji} Gracias ${userName.value || 'amigo'} 💛 (+${item.xp} XP)`
}
const previewStyle = ref<string | null>(null)
const currentStyle = computed(() => CASITA_STYLES.find((x) => x.id === (previewStyle.value ?? rewards.activeStyle.value)) ?? null)
const tryingStyle = computed(() => CASITA_STYLES.find((x) => x.id === previewStyle.value) ?? null)
const wallBg = computed(() => currentStyle.value?.wall ?? rewards.wallColor.value)
const floorBg = computed(() => currentStyle.value?.floor ?? rewards.floorColor.value)
onBeforeUnmount(() => { previewStyle.value = null })

// Escenarios navegables con flechas: null = muebles sueltos.
const scenes = [null, ...CASITA_STYLES.map((x) => x.id)] as (string | null)[]
const sceneIndex = computed(() => Math.max(0, scenes.indexOf(previewStyle.value ?? rewards.activeStyle.value)))
const sceneLabel = computed(() => {
  const st = CASITA_STYLES.find((x) => x.id === scenes[sceneIndex.value])
  return st ? `${st.emoji} ${st.label}` : '🧺 Muebles sueltos'
})
function stepScene(dir: 1 | -1) {
  const id = scenes[(sceneIndex.value + dir + scenes.length) % scenes.length] ?? null
  if (!id) {
    previewStyle.value = null
    rewards.setStyle(null)
  } else if (rewards.ownedStyles.value.includes(id)) {
    previewStyle.value = null
    rewards.setStyle(id)
  } else {
    previewStyle.value = id
    useSound().play('pop')
  }
}

function toggleStyle(id: string) {
  if (rewards.ownedStyles.value.includes(id)) {
    previewStyle.value = null
    rewards.setStyle(id)
  } else {
    previewStyle.value = previewStyle.value === id ? null : id
    useSound().play('pop')
  }
}

// Un estilo puesto manda sobre los muebles sueltos, salvo lo que se esté probando.
const itemFor = (s: FurnitureSlot): RoomPiece | null => {
  const tried = preview.value[s]
  const loose = FURNITURE.find((f) => f.id === (tried ?? rewards.room.value[s])) ?? null
  if (tried) return loose
  return currentStyle.value?.items[s] ?? loose
}
const slotItems = computed(() => FURNITURE.filter((f) => f.slot === slot.value))

// Posiciones (en % del ancho) donde pasean los amigos.
const FRIEND_SPOTS = [22, 72, 36, 60, 14, 82, 46, 28, 66, 52]

const nextStage = computed(() => STAGES.find((s) => s.min > level.value) ?? null)

const allFriends = computed(() => {
  const owned = new Set(rewards.friends.value.map((f) => f.id))
  return [
    ...rewards.friends.value.map((f) => ({ ...f, owned: true })),
    ...FRIENDS.filter((f) => !owned.has(f.id)).map((f) => ({ ...f, owned: false })),
  ]
})

function pick(id: string) {
  if (!rewards.isFurnitureUnlocked(id)) {
    const next = { ...preview.value }
    if (next[slot.value] === id) delete next[slot.value]
    else next[slot.value] = id
    preview.value = next
    useSound().play('pop')
    return
  }
  const { [slot.value]: _p, ...rest } = preview.value
  preview.value = rest
  rewards.setRoomItem(slot.value, rewards.room.value[slot.value] === id ? null : id)
  useSound().play('pop')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-xl2 border border-border bg-surface p-3 flex items-center gap-3 flex-wrap">
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-ink text-sm">{{ companionName }} · {{ stage.label }} · Nivel {{ level }}</p>
        <p class="text-xs text-muted">{{ moodLabel }}<span v-if="nextStage"> · Crecerá a «{{ nextStage.label.toLowerCase() }}» en el nivel {{ nextStage.min }}</span></p>
      </div>
    </div>

    <!-- La habitación se queda fija arriba: así se ve cómo queda mientras eliges abajo. -->
    <div class="sticky top-2 z-20 flex flex-col gap-2 rounded-xl2 bg-base/90 backdrop-blur pb-1">
    <div class="room relative w-full aspect-[4/3] max-h-[36vh] sm:max-h-[380px] rounded-xl2 overflow-hidden border border-border select-none">
      <div class="absolute inset-x-0 top-0 h-[66%]" :style="{ backgroundColor: wallBg }">
        <div class="absolute inset-0 wall-shade" />
      </div>
      <div class="absolute inset-x-0 bottom-0 h-[34%] floor" :style="{ backgroundColor: floorBg }" />
      <div class="absolute inset-x-0 top-[66%] h-1.5 bg-black/10" />
      <svg v-if="currentStyle?.premium" class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 240" preserveAspectRatio="none" v-html="premiumBackdrop(currentStyle.id, 158)" />

      <span v-for="(d, i) in season.decor" :key="d" class="absolute top-2 text-xl float-slow" :style="{ left: i ? 'auto' : '4%', right: i ? '4%' : 'auto', animationDelay: `${i * 1.2}s` }">{{ d }}</span>

      <button v-if="!itemFor('wall')" type="button" class="slot-empty absolute top-[9%] left-[16%] w-12 h-12" :class="glow('wall')" aria-label="Decorar la pared" @click="openShop('wall')">＋</button>
      <span
        v-if="itemFor('wall')?.text"
        class="cursor-pointer absolute top-[6%] left-[16%] px-2 py-1.5 rounded-sm bg-[#f7efd9] border-y-4 border-[#6d4c3d] text-[#c0392b] font-bold leading-none drop-shadow text-[clamp(1.6rem,6vw,2.8rem)] [writing-mode:vertical-rl]"
        :class="glow('wall')"
        role="button"
        @click="openShop('wall')"
        style="font-family: 'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif"
      >{{ itemFor('wall')!.text }}</span>
      <span v-else-if="itemFor('wall')" class="cursor-pointer absolute top-[9%] left-[16%] text-[clamp(2.4rem,9vw,4.2rem)] leading-none drop-shadow" :class="glow('wall')" role="button" @click="openShop('wall')">{{ itemFor('wall')!.emoji }}</span>

      <div class="absolute top-[30%] right-[10%] w-[30%] cursor-pointer" :class="glow('shelf')" role="button" @click="openShop('shelf')">
        <span v-if="itemFor('shelf')" class="absolute -top-[clamp(1.8rem,6vw,3rem)] left-1/2 -translate-x-1/2 text-[clamp(1.6rem,6vw,2.8rem)] leading-none drop-shadow">{{ itemFor('shelf')!.emoji }}</span>
        <span v-else class="slot-empty absolute -top-9 left-1/2 -translate-x-1/2 w-9 h-9">＋</span>
        <div class="h-2 rounded bg-[#b98a5e] shadow" />
      </div>

      <span v-if="itemFor('left')" class="cursor-pointer absolute bottom-[30%] left-[5%] text-[clamp(3rem,12vw,5.5rem)] leading-none drop-shadow" :class="glow('left')" role="button" @click="openShop('left')">{{ itemFor('left')!.emoji }}</span>
      <button v-else type="button" class="slot-empty absolute bottom-[30%] left-[5%] w-14 h-14" :class="glow('left')" aria-label="Poner algo a la izquierda" @click="openShop('left')">＋</button>
      <span v-if="itemFor('right')" class="cursor-pointer absolute bottom-[26%] right-[4%] text-[clamp(3.4rem,13vw,6.2rem)] leading-none drop-shadow" :class="glow('right')" role="button" @click="openShop('right')">{{ itemFor('right')!.emoji }}</span>
      <button v-else type="button" class="slot-empty absolute bottom-[26%] right-[4%] w-14 h-14" :class="glow('right')" aria-label="Poner algo a la derecha" @click="openShop('right')">＋</button>

      <div v-if="itemFor('floor')?.rug" class="cursor-pointer absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[50%] h-[15%] rounded-[50%] border-4 border-white/50" :class="glow('floor')" role="button" :style="{ backgroundColor: itemFor('floor')!.rug }" @click="openShop('floor')" />
      <button v-else type="button" class="slot-empty absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[50%] h-[15%] !rounded-[50%]" :class="glow('floor')" aria-label="Poner una alfombra" @click="openShop('floor')">＋</button>

      <div class="absolute bottom-[11%] left-1/2 -translate-x-1/2 rounded-full" data-hl="pet">
        <PetInteractive v-if="character" ref="petRef" :character="character" :size="110" :mood="mood" @pet="petMsg = '¡Mimitos! 💗'" @hit="petMsg = $event >= 3 ? '¡Buaaa! Lo hiciste llorar 😭 Hazle mimos para consolarlo' : '¡Ay! Eso le dolió 😣'" @comfort="petMsg = 'Ya se siente mejor 🥹💗'" />
      </div>

      <span
        v-for="(f, i) in rewards.friends.value"
        :key="f.id"
        class="absolute hop"
        :style="{ left: `${FRIEND_SPOTS[i % FRIEND_SPOTS.length]}%`, bottom: `${8 + (i % 3) * 5}%`, animationDelay: `${i * 0.7}s` }"
        :title="f.label"
      >
        <img v-if="f.image" :src="f.image" :alt="f.label" class="w-9 h-9 sm:w-11 sm:h-11 object-contain" />
        <span v-else class="text-3xl sm:text-4xl leading-none">{{ f.emoji }}</span>
      </span>
    </div>

    <div class="flex items-center gap-2 rounded-xl2 border border-border bg-surface px-2 py-1.5">
      <button type="button" class="w-8 h-8 shrink-0 rounded-full bg-surface-soft text-ink text-lg leading-none hover:text-accent active:scale-95 transition" aria-label="Escenario anterior" @click="stepScene(-1)">‹</button>
      <div class="flex-1 min-w-0 text-center leading-tight">
        <p class="text-[10px] text-muted uppercase tracking-wide">Escenario {{ sceneIndex + 1 }}/{{ scenes.length }}</p>
        <p class="text-xs font-semibold text-ink truncate">{{ sceneLabel }}</p>
      </div>
      <button
        v-if="tryingStyle && points >= tryingStyle.cost"
        type="button"
        class="shrink-0 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold"
        @click="rewards.buyStyle(tryingStyle.id) && (previewStyle = null)"
      >Comprar ⭐ {{ tryingStyle.cost }}</button>
      <span v-else-if="tryingStyle" class="shrink-0 text-[11px] text-muted">🔒 Faltan ⭐ {{ tryingStyle.cost - points }}</span>
      <span v-else class="shrink-0 text-[11px] text-muted">✓ Puesto</span>
      <button type="button" class="w-8 h-8 shrink-0 rounded-full bg-surface-soft text-ink text-lg leading-none hover:text-accent active:scale-95 transition" aria-label="Escenario siguiente" @click="stepScene(1)">›</button>
    </div>
    </div>

    <div v-if="character" class="rounded-xl2 border border-border bg-surface p-3 flex flex-col gap-2">
      <p class="text-sm font-semibold text-ink">Dale de comer y mímalo</p>
      <p v-if="petMsg" class="text-xs text-accent font-semibold">{{ petMsg }}</p>
      <FoodTray :pet="petRef" @fed="onFed" @refuse="petMsg = $event" />
    </div>

    <div class="rounded-xl2 border border-border bg-surface p-3 flex flex-col gap-2">
      <p class="text-sm font-semibold text-ink">Estilos de casita</p>
      <p class="text-[11px] text-muted">Decoran toda la casita de una vez. Toca uno para verlo; si te alcanzan las ⭐, lo compras.</p>

      <div v-if="tryingStyle" class="flex items-center gap-2 bg-surface-soft border border-accent rounded-xl2 p-2.5 text-xs">
        <span class="flex-1 text-ink font-medium truncate">{{ tryingStyle.emoji }} {{ tryingStyle.label }} · solo una prueba</span>
        <button
          v-if="points >= tryingStyle.cost"
          type="button"
          class="px-3 py-1.5 rounded-full bg-accent text-white font-semibold"
          @click="rewards.buyStyle(tryingStyle.id) && (previewStyle = null)"
        >Comprar ⭐ {{ tryingStyle.cost }}</button>
        <span v-else class="text-muted">🔒 Te faltan ⭐ {{ tryingStyle.cost - points }}</span>
        <button type="button" class="px-2 py-1 text-muted hover:text-ink" @click="previewStyle = null">Quitar</button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex flex-col items-start gap-0.5 rounded-xl2 p-2.5 border-2 text-left text-[11px] transition-colors"
          :class="!rewards.activeStyle.value && !previewStyle ? 'border-accent bg-accent-soft/30' : 'border-transparent bg-surface-soft hover:border-accent/60'"
          @click="previewStyle = null; rewards.setStyle(null)"
        >
          <span class="text-ink font-medium">🧺 Muebles sueltos</span>
          <span class="text-muted">{{ !rewards.activeStyle.value ? '✓ Puesto' : 'Volver a mi decoración' }}</span>
        </button>
        <button
          v-for="st in CASITA_STYLES"
          :key="st.id"
          type="button"
          class="flex flex-col items-start gap-0.5 rounded-xl2 p-2.5 border-2 text-left text-[11px] transition-colors"
          :class="[
            rewards.activeStyle.value === st.id && !previewStyle ? 'border-accent bg-accent-soft/30' : previewStyle === st.id ? 'border-dashed border-accent bg-surface-soft' : 'border-transparent bg-surface-soft hover:border-accent/60',
            !rewards.ownedStyles.value.includes(st.id) && points < st.cost && 'opacity-60',
          ]"
          @click="toggleStyle(st.id)"
        >
          <span class="flex items-center gap-1.5 w-full">
            <span class="flex gap-0.5">
              <span v-for="c in [st.wall, st.floor, st.items.floor.rug]" :key="c" class="w-2.5 h-2.5 rounded-full border border-black/10" :style="{ backgroundColor: c }" />
            </span>
            <span class="text-ink font-medium truncate">{{ st.premium ? '💎' : '' }}{{ st.emoji }} {{ st.label }}</span>
          </span>
          <span class="text-muted leading-tight">{{ st.blurb }}</span>
          <span class="text-ink font-semibold">
            {{ rewards.activeStyle.value === st.id ? '✓ Puesto' : rewards.ownedStyles.value.includes(st.id) ? 'Poner' : previewStyle === st.id ? '👁 Probando' : points >= st.cost ? `⭐ ${st.cost}` : `🔒 ⭐ ${st.cost}` }}
          </span>
        </button>
      </div>
    </div>

    <p v-if="!shopping" class="text-xs text-muted text-center -mt-1">👆 Toca un objeto de la casita para ver y comprar los que combinan con él.</p>
    <div v-else ref="shopPanelRef" class="rounded-xl2 border-2 border-accent bg-surface p-3 flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <p class="flex-1 text-sm font-semibold text-ink">🛍️ Tienda · {{ slotLabel }}</p>
        <button type="button" class="px-3 py-1.5 rounded-full bg-surface-soft text-ink text-xs font-semibold hover:text-accent active:scale-95 transition" @click="closeShop">✕ Salir de la tienda</button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in FURNITURE_SLOTS"
          :key="s.id"
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          :class="slot === s.id ? 'bg-accent text-white' : 'bg-surface-soft text-muted hover:text-ink'"
          @click="slot = s.id"
        >
          {{ s.label }}
        </button>
      </div>

      <p v-if="trying.length" class="text-[11px] text-muted">
        Así se vería la casita con {{ trying.map((f) => f.label).join(', ') }}. Es solo una prueba: se guarda cuando lo desbloquees.
      </p>

      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <button
          v-for="f in slotItems"
          :key="f.id"
          type="button"
          class="relative flex flex-col items-center gap-1 rounded-xl2 p-2.5 border-2 text-center transition-colors"
          :class="[
            rewards.room.value[slot] === f.id ? 'border-accent bg-accent-soft/30' : 'border-transparent bg-surface-soft',
            rewards.isFurnitureUnlocked(f.id) ? 'hover:border-accent/60' : 'opacity-70',
            preview[slot] === f.id && '!border-dashed !border-accent',
          ]"
          :title="rewards.isFurnitureUnlocked(f.id) ? f.label : `Toca para probarlo · se desbloquea con ${requirementText(f.stat, f.goal)}`"
          @click="pick(f.id)"
        >
          <span v-if="f.rug" class="w-9 h-5 rounded-[50%] border-2 border-white/60" :style="{ backgroundColor: f.rug }" />
          <span v-else class="text-2xl leading-none">{{ f.emoji }}</span>
          <span class="text-[11px] text-ink leading-tight">{{ f.label }}</span>
          <span v-if="!rewards.isFurnitureUnlocked(f.id)" class="text-[10px] text-muted">{{ preview[slot] === f.id ? '👁 Probando · ' : '' }}🔒 {{ requirementText(f.stat, f.goal) }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2 flex-wrap text-xs text-muted">
        <span class="w-14">Paredes</span>
        <button
          v-for="c in WALL_COLORS"
          :key="c"
          type="button"
          class="w-6 h-6 rounded-full border-2"
          :class="rewards.wallColor.value === c ? 'border-accent' : 'border-border'"
          :style="{ backgroundColor: c }"
          :aria-label="`Pared ${c}`"
          @click="rewards.setWallColor(c)"
        />
      </div>
      <div class="flex items-center gap-2 flex-wrap text-xs text-muted">
        <span class="w-14">Piso</span>
        <button
          v-for="c in FLOOR_COLORS"
          :key="c"
          type="button"
          class="w-6 h-6 rounded-full border-2"
          :class="rewards.floorColor.value === c ? 'border-accent' : 'border-border'"
          :style="{ backgroundColor: c }"
          :aria-label="`Piso ${c}`"
          @click="rewards.setFloorColor(c)"
        />
      </div>
    </div>

    <div class="rounded-xl2 border border-border bg-surface p-3">
      <p class="text-sm font-semibold text-ink mb-2">Amigos de {{ companionName }} ({{ rewards.friends.value.length }}/{{ FRIENDS.length }} + visitantes)</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div
          v-for="f in allFriends"
          :key="f.id"
          :data-hl="`friend-${f.id}`"
          class="flex items-center gap-2 rounded-xl2 bg-surface-soft p-2"
          :class="f.owned ? '' : 'opacity-50'"
        >
          <span class="w-9 h-9 rounded-full bg-base flex items-center justify-center shrink-0">
            <img v-if="f.image" :src="f.image" :alt="f.label" class="w-6 h-6 object-contain" :class="f.owned ? '' : 'brightness-0 opacity-40'" />
            <span v-else class="text-xl leading-none" :class="f.owned ? '' : 'brightness-0 opacity-40'">{{ f.emoji }}</span>
          </span>
          <span class="min-w-0">
            <span class="block text-xs font-semibold text-ink truncate">{{ f.owned ? f.label : '???' }}</span>
            <span class="block text-[10px] text-muted leading-tight">{{ f.owned ? f.blurb : `🔒 ${requirementText(f.stat, f.goal)}` }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-glow {
  animation: shop-glow 1.3s ease-in-out infinite;
  z-index: 5;
}
.slot-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 2px dashed rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
}
@keyframes shop-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 3px #fff3a8) drop-shadow(0 0 8px #ffd54a);
  }
  50% {
    filter: drop-shadow(0 0 8px #fff3a8) drop-shadow(0 0 20px #ffb300);
  }
}
@media (prefers-reduced-motion: reduce) {
  .shop-glow {
    animation: none;
    filter: drop-shadow(0 0 8px #ffd54a);
  }
}
.wall-shade {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.06));
}
.floor {
  background-image: repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.07) 0 2px, transparent 2px 56px);
}
.hop {
  animation: hop 2.6s ease-in-out infinite;
}
.float-slow {
  animation: hop 5s ease-in-out infinite;
}
@keyframes hop {
  0%,
  70%,
  100% {
    transform: translateY(0);
  }
  80% {
    transform: translateY(-9px);
  }
  90% {
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hop,
  .float-slow {
    animation: none;
  }
}
</style>
