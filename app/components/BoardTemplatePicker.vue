<script setup lang="ts">
import { BOARD_TEMPLATES, type BoardTemplate } from '~/utils/boardTemplates'
import { getNoteStyle, noteStyleCss } from '~/utils/noteStyles'

const emit = defineEmits<{ close: []; pick: [template: BoardTemplate] }>()

// Miniatura: cada elemento de la plantilla dibujado como un bloque de su color, en su posición relativa,
// ajustado (sin deformar) a un recuadro virtual de VW x VH.
const VW = 200
const VH = 130
const previews = BOARD_TEMPLATES.map((t) => {
  const items = t.build()
  const minX = Math.min(...items.map((i) => i.x))
  const minY = Math.min(...items.map((i) => i.y))
  const maxX = Math.max(...items.map((i) => i.x + i.width))
  const maxY = Math.max(...items.map((i) => i.y + i.height))
  const scale = Math.min((VW - 12) / (maxX - minX), (VH - 12) / (maxY - minY))
  const offX = (VW - (maxX - minX) * scale) / 2
  const offY = (VH - (maxY - minY) * scale) / 2
  return {
    template: t,
    boxes: items.map((i) => ({
      src: i.type === 'image' ? i.src : undefined,
      style: {
        left: `${((offX + (i.x - minX) * scale) / VW) * 100}%`,
        top: `${((offY + (i.y - minY) * scale) / VH) * 100}%`,
        width: `${((i.width * scale) / VW) * 100}%`,
        height: `${((i.height * scale) / VH) * 100}%`,
        ...(i.type === 'image'
          ? { transform: i.rotation ? `rotate(${i.rotation}deg)` : undefined }
          : { backgroundColor: i.data?.color ?? '#ffffff', ...noteStyleCss(getNoteStyle(i.data?.style)), ...(i.type === 'calendar' ? { outline: '1px solid rgba(201,138,166,.6)', outlineOffset: '-3px' } : {}) }),
      } as Record<string, string | undefined>,
    })),
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" @click.self="emit('close')">
    <div class="w-full sm:max-w-3xl bg-surface rounded-t-xl2 sm:rounded-xl2 p-5 flex flex-col gap-3 border border-border h-[85vh] sm:h-[80vh]">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-lg font-bold text-ink">Plantillas</h2>
          <p class="text-xs text-muted">Se agregan completas: primero las mueves juntas y al terminar cada elemento se mueve por separado.</p>
        </div>
        <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-1">
          <button
            v-for="p in previews"
            :key="p.template.id"
            type="button"
            class="flex flex-col gap-2 p-2.5 rounded-xl2 bg-surface-soft hover:bg-accent-soft transition-colors text-left"
            @click="emit('pick', p.template)"
          >
            <span class="relative block w-full rounded-lg bg-black/10 overflow-hidden" :style="{ aspectRatio: `${VW} / ${VH}` }">
              <template v-for="(b, i) in p.boxes" :key="i">
                <img v-if="b.src" :src="b.src" alt="" class="absolute object-contain" :style="b.style" />
                <span v-else class="absolute rounded-[2px] shadow-sm" :style="b.style" />
              </template>
            </span>
            <span class="flex items-center gap-1.5 text-sm font-semibold text-ink leading-tight"><span>{{ p.template.emoji }}</span>{{ p.template.label }}</span>
            <span class="text-[11px] text-muted leading-tight -mt-1">{{ p.template.blurb }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
