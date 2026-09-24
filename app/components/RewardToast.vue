<script setup lang="ts">
const { toasts, dismissToast } = useRewards()
const router = useRouter()

// Al tocar el aviso se abre la casita en la pestaña del premio y se señala dónde está.
function go(t: (typeof toasts.value)[number]) {
  dismissToast(t.id)
  if (!t.target) return
  router.push({ path: '/casita', query: { tab: t.target.tab, ...(t.target.hl ? { hl: t.target.hl } : {}), t: String(Date.now()) } })
}

const current = computed(() => toasts.value[0] ?? null)
let timer: ReturnType<typeof setTimeout> | null = null

// Se muestra de a una: al terminar la actual pasa a la siguiente.
watch(
  current,
  (t) => {
    if (timer) clearTimeout(timer)
    if (!t) return
    timer = setTimeout(() => dismissToast(t.id), 3400)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <Transition name="reward-toast" mode="out-in">
    <button
      v-if="current"
      :key="current.id"
      type="button"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[65] max-w-[92vw] flex items-center gap-3 bg-surface border border-accent rounded-full pl-3 pr-5 py-2 shadow-lg text-left"
      @click="go(current)"
    >
      <span class="w-9 h-9 rounded-full bg-base border border-border flex items-center justify-center text-xl shrink-0">{{ current.emoji }}</span>
      <span class="min-w-0">
        <span class="block text-[11px] text-muted leading-tight">{{ current.title }}</span>
        <span class="block text-sm font-semibold text-ink leading-tight truncate">{{ current.text }}</span>
        <span v-if="current.target" class="block text-[10px] text-accent leading-tight">Toca para verlo →</span>
      </span>
    </button>
  </Transition>
</template>

<style scoped>
.reward-toast-enter-active,
.reward-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.reward-toast-enter-from,
.reward-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}
</style>
