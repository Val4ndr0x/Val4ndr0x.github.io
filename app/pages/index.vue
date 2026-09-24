<script setup lang="ts">
import type { TodoList } from '~/composables/useLists'

const router = useRouter()
const { lists, categories, addList, editList, deleteList } = useLists()

const activeCategory = ref('todos')
const search = ref('')
const showModal = ref(false)
const editingList = ref<TodoList | null>(null)

const tabs = computed(() => ['todos', ...categories.value])

const visibleLists = computed(() => {
  let result = lists.value
  if (activeCategory.value !== 'todos') {
    result = result.filter((l) => l.category === activeCategory.value)
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    result = result.filter((l) => l.name.toLowerCase().includes(q))
  }
  return result
})

function openList(id: string) {
  router.push(`/list/${id}`)
}

function openCreate() {
  editingList.value = null
  showModal.value = true
}

function openEdit(id: string) {
  editingList.value = lists.value.find((l) => l.id === id) ?? null
  showModal.value = true
}

function onCreate(name: string, category: string | null) {
  const id = addList(name, category)
  showModal.value = false
  if (id) router.push(`/list/${id}`)
}

function onSaveEdit(input: { name: string; category: string | null; color: string }) {
  if (editingList.value) editList(editingList.value.id, input)
  showModal.value = false
  editingList.value = null
}

function onCloseModal() {
  showModal.value = false
  editingList.value = null
}

function onDeleteList(id: string) {
  deleteList(id)
}
</script>

<template>
  <div class="flex">
    <AppSidebar />

    <div class="flex-1 min-w-0">
      <AppHeader title="Todas las listas" searchable search-placeholder="Buscar listas..." v-model:search-model="search" />

      <div class="hero-panel mx-3 sm:mx-6 mb-6 rounded-[28px] p-4 sm:p-6">
        <div class="flex items-center justify-between mb-3 px-0.5">
          <p class="text-sm font-medium text-black/55 dark:text-ink/70">
            📋 {{ lists.length }} {{ lists.length === 1 ? 'lista' : 'listas' }}
          </p>
        </div>

        <div class="flex items-center gap-2 pb-4 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            :class="activeCategory === tab
              ? 'bg-white dark:bg-surface-soft text-black/75 dark:text-ink shadow-sm'
              : 'text-black/45 dark:text-muted hover:text-black/70 dark:hover:text-ink hover:bg-white/50 dark:hover:bg-surface-soft/50'"
            @click="activeCategory = tab"
          >
            {{ tab === 'todos' ? 'todos' : tab }}
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <NewListCard @click="openCreate" />
          <ListCard
            v-for="list in visibleLists"
            :key="list.id"
            :list="list"
            @open="openList"
            @edit="openEdit"
            @delete="onDeleteList"
          />
        </div>

        <p v-if="!visibleLists.length && search" class="text-center text-black/45 dark:text-muted text-sm py-8">
          No se encontraron listas para "{{ search }}"
        </p>
      </div>
    </div>

    <FloatingAddButton @click="openCreate" />

    <NewListModal v-if="showModal" :list="editingList" @close="onCloseModal" @create="onCreate" @save="onSaveEdit" />
  </div>
</template>

<style>
.hero-panel {
  background: linear-gradient(135deg, #eaf1fb 0%, #fdeef4 45%, #fff6e2 100%);
}

.dark .hero-panel {
  background: linear-gradient(135deg, #1c1c21 0%, #201f26 55%, #1a1e24 100%);
}
</style>
