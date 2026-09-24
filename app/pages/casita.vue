<script setup lang="ts">
type Tab = 'casita' | 'logros' | 'cofre' | 'mimos' | 'enfoque' | 'temporada'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'casita', label: 'Casita', emoji: '🏡' },
  { id: 'logros', label: 'Medallas', emoji: '🏅' },
  { id: 'cofre', label: 'Cofre', emoji: '🎁' },
  { id: 'mimos', label: 'Mimos', emoji: '💌' },
  { id: 'enfoque', label: 'Enfoque', emoji: '🍅' },
  { id: 'temporada', label: 'Temporada', emoji: '🌸' },
]

const route = useRoute()
const tab = ref<Tab>(TABS.some((t) => t.id === route.query.tab) ? (route.query.tab as Tab) : 'casita')
const { syncStage } = useCompanionState()
const rewards = useRewards()

// Viene de un aviso de recompensa: cambia de pestaña, se desplaza al premio y lo hace pulsar.
let hlTimer: ReturnType<typeof setTimeout> | null = null

function showTarget() {
  const q = route.query
  if (TABS.some((t) => t.id === q.tab)) tab.value = q.tab as Tab
  const hl = typeof q.hl === 'string' ? q.hl : null
  if (!hl) return
  let tries = 0
  const find = () => {
    const el = document.querySelector<HTMLElement>(`[data-hl="${hl}"]`)
    if (!el) {
      if (++tries < 8) hlTimer = setTimeout(find, 150)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('hl-pulse')
    void el.offsetWidth
    el.classList.add('hl-pulse')
    hlTimer = setTimeout(() => el.classList.remove('hl-pulse'), 5000)
  }
  if (hlTimer) clearTimeout(hlTimer)
  hlTimer = setTimeout(find, 250)
}

watch(() => route.query.t, showTarget)

onMounted(() => {
  syncStage()
  rewards.checkAchievements()
  if (route.query.hl) showTarget()
})
onUnmounted(() => {
  if (hlTimer) clearTimeout(hlTimer)
})
</script>

<template>
  <div class="flex">
    <AppSidebar />

    <div class="flex-1 min-w-0 max-w-[760px] mx-auto w-full">
      <AppHeader title="Mi casita" />

      <div class="px-4 sm:px-6 pb-8 flex flex-col gap-4">
        <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            v-for="t in TABS"
            :key="t.id"
            type="button"
            class="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors"
            :class="tab === t.id ? 'bg-accent text-white' : 'bg-surface text-muted hover:text-ink'"
            @click="tab = t.id"
          >
            <span class="text-sm leading-none">{{ t.emoji }}</span>
            {{ t.label }}
            <span v-if="t.id === 'cofre' && rewards.canOpenChest.value" class="w-2 h-2 rounded-full bg-danger" />
          </button>
        </div>

        <CasitaRoom v-if="tab === 'casita'" />
        <AchievementsPanel v-else-if="tab === 'logros'" />
        <ChestCollection v-else-if="tab === 'cofre'" />
        <KeepsakesPanel v-else-if="tab === 'mimos'" />
        <FocusPanel v-else-if="tab === 'enfoque'" />
        <SeasonPanel v-else />
      </div>
    </div>
  </div>
</template>
