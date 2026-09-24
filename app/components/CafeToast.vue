<script setup lang="ts">
import type { Recipe } from '~/utils/cafeRecipes'

const { stats, checkUnlocks } = useCafe()
const { play } = useSound()

const toast = ref<Recipe | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

function run() {
  const fresh = checkUnlocks()
  if (!fresh.length) return
  toast.value = fresh[fresh.length - 1]
  play('unlock', 0.4)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    toast.value = null
  }, 4200)
}

onMounted(run)
watch(stats, run)
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <Transition name="cafe-toast">
    <div
      v-if="toast"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] flex items-center gap-3 bg-surface border border-accent rounded-full pl-3 pr-5 py-2 shadow-lg"
    >
      <span class="w-9 h-9 rounded-full bg-base border border-border flex items-center justify-center text-xl shrink-0">{{ toast.emoji }}</span>
      <div class="min-w-0">
        <p class="text-[11px] text-muted leading-tight">Nueva receta desbloqueada</p>
        <p class="text-sm font-semibold text-ink leading-tight truncate">{{ toast.label }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cafe-toast-enter-active,
.cafe-toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.cafe-toast-enter-from,
.cafe-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}
</style>
