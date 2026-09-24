<script setup lang="ts">
const props = defineProps<{ data: Record<string, any> }>()
const emit = defineEmits<{ update: [data: Record<string, any>]; remove: [] }>()

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

function currentYm() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const ym = computed<string>(() => (/^\d{4}-\d{2}$/.test(props.data.ym) ? props.data.ym : currentYm()))
const year = computed(() => Number(ym.value.slice(0, 4)))
const month = computed(() => Number(ym.value.slice(5, 7)) - 1)
const cells = computed<Record<string, string>>(() => props.data.cells ?? {})
const accent = computed<string>(() => props.data.accent || '#c98aa6')

function shiftMonth(delta: number) {
  const d = new Date(year.value, month.value + delta, 1)
  emit('update', { ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
}

// Semana desde el lunes: días vacíos antes del 1 y después del último, para completar filas de 7.
const days = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const lead = (first.getDay() + 6) % 7
  const count = new Date(year.value, month.value + 1, 0).getDate()
  const total = Math.ceil((lead + count) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const day = i - lead + 1
    return day >= 1 && day <= count ? { day, key: `${ym.value}-${String(day).padStart(2, '0')}` } : null
  })
})

function setCell(key: string, text: string) {
  emit('update', { cells: { ...cells.value, [key]: text } })
}
</script>

<template>
  <div class="relative w-full h-full rounded-xl2 p-3 group flex flex-col gap-1.5" :class="data.color !== 'transparent' && 'shadow-sm'" :style="{ backgroundColor: data.color || '#ffffff' }">
    <button
      type="button"
      class="absolute top-1.5 right-1.5 z-[1] w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="emit('remove')"
    >
      <AppIcon name="x" :size="14" />
    </button>

    <div class="flex items-center justify-center gap-3 shrink-0">
      <button type="button" class="w-6 h-6 rounded-full text-black/40 hover:bg-black/5" title="Mes anterior" @click="shiftMonth(-1)">‹</button>
      <p class="text-base font-bold min-w-[8.5rem] text-center" :style="{ color: accent }">{{ MONTHS[month] }} {{ year }}</p>
      <button type="button" class="w-6 h-6 rounded-full text-black/40 hover:bg-black/5" title="Mes siguiente" @click="shiftMonth(1)">›</button>
    </div>

    <div class="grid grid-cols-7 gap-1 shrink-0">
      <span v-for="w in WEEKDAYS" :key="w" class="text-center text-[10px] font-bold tracking-wide" :style="{ color: accent }">{{ w }}</span>
    </div>

    <div class="grid grid-cols-7 gap-1 flex-1 min-h-0" :style="{ gridAutoRows: '1fr' }">
      <template v-for="(d, i) in days" :key="i">
        <div v-if="d" class="relative rounded-lg border min-h-0 overflow-hidden" :style="{ borderColor: accent + '99' }">
          <span
            class="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full text-[9px] leading-[15px] text-center font-semibold text-black/55 pointer-events-none"
            :style="{ backgroundColor: accent + '33' }"
          >
            {{ d.day }}
          </span>
          <textarea
            :value="cells[d.key] ?? ''"
            class="w-full h-full bg-transparent outline-none resize-none text-[10px] leading-tight text-black/70 p-1 pt-3.5"
            @input="setCell(d.key, ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div v-else class="rounded-lg border border-dashed border-black/10 opacity-60" />
      </template>
    </div>
  </div>
</template>
