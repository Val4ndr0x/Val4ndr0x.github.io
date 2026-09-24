<script setup lang="ts">
import { DECOR, DECOR_ART, DECOR_SLOTS, SLOT_BOX } from '~/utils/cafeDecor'
import { CAFE_STYLES } from '~/utils/cafeStyles'
import type { DecorSlot } from '~/utils/cafeDecor'

const props = defineProps<{ onlySlot?: DecorSlot | null }>()
const emit = defineEmits<{ exit: [] }>()

const { owned, placed, preview, buyDecor, toggleDecor, previewDecor, clearPreview, ownedStyles, activeStyle, previewStyle, previewStyleToggle, buyStyle, setStyle } = useCafe()
const { points } = useCompanion()

// Por defecto se ven todas las piezas; con el filtro solo las tuyas o las que te alcanzan.
const onlyAffordable = ref(false)
const canUse = (id: string, cost: number) => owned.value.includes(id) || points.value >= cost

const slots = computed(() =>
  DECOR_SLOTS.map((s) => ({
    ...s,
    items: DECOR.filter((d) => d.slot === s.id && (!onlyAffordable.value || canUse(d.id, d.cost))),
  })).filter((s) => s.items.length && (!props.onlySlot || s.id === props.onlySlot)),
)
const slotLabel = computed(() => DECOR_SLOTS.find((s) => s.id === props.onlySlot)?.label ?? '')

function exit() {
  clearPreview()
  emit('exit')
}

// Lo que se está probando sin tenerlo: se ve en la escena pero no se guarda.
const trying = computed(() => DECOR.filter((d) => preview.value[d.slot] === d.id))
const tryingStyle = computed(() => CAFE_STYLES.find((x) => x.id === previewStyle.value) ?? null)
onBeforeUnmount(clearPreview)

function handle(id: string) {
  if (owned.value.includes(id)) toggleDecor(id)
  else previewDecor(id)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="onlySlot" class="flex items-center gap-2 rounded-xl2 border-2 border-accent bg-surface p-3">
      <p class="flex-1 text-sm font-semibold text-ink">🛍️ Tienda · {{ slotLabel }}</p>
      <button type="button" class="px-3 py-1.5 rounded-full bg-surface-soft text-ink text-xs font-semibold hover:text-accent active:scale-95 transition" @click="exit">✕ Salir de la tienda</button>
    </div>
    <p v-else class="text-xs text-muted">
      Toca una pieza del café para ver y comprar las que combinan con ella. También puedes verlo todo aquí abajo.
    </p>

    <div class="flex items-center gap-1.5 text-[11px]">
      <button
        type="button"
        class="px-3 py-1 rounded-full border transition"
        :class="!onlyAffordable ? 'border-accent bg-accent-soft/30 text-ink' : 'border-border text-muted'"
        @click="onlyAffordable = false"
      >Ver todo</button>
      <button
        type="button"
        class="px-3 py-1 rounded-full border transition"
        :class="onlyAffordable ? 'border-accent bg-accent-soft/30 text-ink' : 'border-border text-muted'"
        @click="onlyAffordable = true"
      >Solo las que me alcanzan</button>
    </div>

    <div v-if="tryingStyle" class="sticky top-2 z-10 flex items-center gap-2 bg-surface border border-accent rounded-xl2 p-3 shadow text-xs">
      <span class="flex-1 text-ink font-medium truncate">{{ tryingStyle.emoji }} {{ tryingStyle.label }} · solo una prueba</span>
      <button
        v-if="points >= tryingStyle.cost"
        type="button"
        class="px-3 py-1.5 rounded-full bg-accent text-white font-semibold"
        @click="buyStyle(tryingStyle.id)"
      >Comprar ⭐ {{ tryingStyle.cost }}</button>
      <span v-else class="text-muted">🔒 Te faltan ⭐ {{ tryingStyle.cost - points }}</span>
      <button type="button" class="px-2 py-1 text-muted hover:text-ink" @click="previewStyleToggle(tryingStyle.id)">Quitar</button>
    </div>

    <div v-if="trying.length" class="sticky top-2 z-10 flex flex-col gap-1.5 bg-surface border border-accent rounded-xl2 p-3 shadow">
      <p class="text-[11px] text-muted">Así se vería el café. Solo lo que compres se queda; lo demás es una prueba.</p>
      <div v-for="d in trying" :key="d.id" class="flex items-center gap-2 text-xs">
        <span class="flex-1 text-ink font-medium truncate">{{ d.label }}</span>
        <button
          v-if="points >= d.cost"
          type="button"
          class="px-3 py-1.5 rounded-full bg-accent text-white font-semibold"
          @click="buyDecor(d.id)"
        >Comprar ⭐ {{ d.cost }}</button>
        <span v-else class="text-muted">🔒 Te faltan ⭐ {{ d.cost - points }}</span>
        <button type="button" class="px-2 py-1 text-muted hover:text-ink" @click="previewDecor(d.id)">Quitar</button>
      </div>
    </div>

    <section v-if="!onlySlot" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-ink">Estilos completos</h3>
      <p class="text-[11px] text-muted">Decoran todo el café de una vez. Toca uno para verlo; si te alcanza, lo compras.</p>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex flex-col items-start gap-0.5 bg-surface border rounded-xl2 p-2.5 text-left text-[11px] active:scale-95 transition"
          :class="!activeStyle && !previewStyle ? 'border-accent' : 'border-border hover:border-accent'"
          @click="setStyle(null)"
        >
          <span class="text-ink font-medium">🧺 Piezas sueltas</span>
          <span class="text-muted">{{ !activeStyle ? '✓ Puesto' : 'Volver a la decoración propia' }}</span>
        </button>
        <button
          v-for="st in CAFE_STYLES"
          :key="st.id"
          type="button"
          class="flex flex-col items-start gap-0.5 bg-surface border rounded-xl2 p-2.5 text-left text-[11px] active:scale-95 transition"
          :class="[
            activeStyle === st.id && !previewStyle ? 'border-accent' : previewStyle === st.id ? 'border-dashed border-accent' : 'border-border hover:border-accent',
            !ownedStyles.includes(st.id) && points < st.cost && 'opacity-60',
          ]"
          @click="ownedStyles.includes(st.id) ? setStyle(st.id) : previewStyleToggle(st.id)"
        >
          <span class="flex items-center gap-1.5 w-full">
            <span class="flex gap-0.5">
              <span v-for="c in [st.theme.wall, st.theme.floor, st.theme.bar]" :key="c" class="w-2.5 h-2.5 rounded-full border border-black/10" :style="{ backgroundColor: c }" />
            </span>
            <span class="text-ink font-medium truncate">{{ st.premium ? '💎' : '' }}{{ st.emoji }} {{ st.label }}</span>
          </span>
          <span class="text-muted leading-tight">{{ st.blurb }}</span>
          <span class="text-ink font-semibold">
            {{ activeStyle === st.id ? '✓ Puesto' : ownedStyles.includes(st.id) ? 'Poner' : previewStyle === st.id ? '👁 Probando' : points >= st.cost ? `⭐ ${st.cost}` : `🔒 ⭐ ${st.cost}` }}
          </span>
        </button>
      </div>
    </section>

    <section v-for="s in slots" :id="`decor-${s.id}`" :key="s.id" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-ink">{{ s.label }}</h3>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="d in s.items"
          :key="d.id"
          type="button"
          class="flex flex-col items-center gap-1 bg-surface border rounded-xl2 py-2.5 px-1 text-[11px] active:scale-95 transition"
          :class="[
            placed[d.slot] === d.id ? 'border-accent' : 'border-border hover:border-accent',
            preview[d.slot] === d.id && 'border-dashed border-accent',
            !canUse(d.id, d.cost) && 'opacity-60',
          ]"
          @click="handle(d.id)"
        >
          <span class="w-full h-14 flex items-center justify-center">
            <svg
              :viewBox="SLOT_BOX[d.slot].vb"
              class="max-w-full max-h-full"
              :style="{ aspectRatio: SLOT_BOX[d.slot].vb.split(' ').slice(2).join('/'), height: '100%' }"
              aria-hidden="true"
              v-html="DECOR_ART[d.id]"
            />
          </span>
          <span class="text-ink font-medium text-center leading-tight">{{ d.label }}</span>
          <span class="text-muted">
            {{ placed[d.slot] === d.id ? '✓ Puesto' : owned.includes(d.id) ? 'Poner' : preview[d.slot] === d.id ? '👁 Probando' : points >= d.cost ? `⭐ ${d.cost}` : `🔒 ⭐ ${d.cost}` }}
          </span>
        </button>
      </div>
    </section>
  </div>
</template>
