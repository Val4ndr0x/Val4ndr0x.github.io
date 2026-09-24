<script setup lang="ts">
const router = useRouter()
const { books, addBook, deleteBook, setCover, setCoverImage, setBookTexture, getBook } = useBooks()

const showModal = ref(false)
const coverPickerBookId = ref<string | null>(null)
const coverPickerBook = computed(() => (coverPickerBookId.value ? getBook(coverPickerBookId.value).value : null))

function openBook(id: string) {
  router.push(`/books/${id}`)
}

function onCreate(name: string, cover: string | null, coverImage: string | null, templateId: string | null) {
  const id = addBook(name, cover, coverImage, templateId)
  showModal.value = false
  if (id) router.push(`/books/${id}`)
}

function onChangeCover(id: string) {
  coverPickerBookId.value = id
}

function onPickCover(cover: string | null) {
  if (coverPickerBookId.value) setCover(coverPickerBookId.value, cover)
}

function onSetCoverImage(image: string | null) {
  if (coverPickerBookId.value) setCoverImage(coverPickerBookId.value, image)
}
</script>

<template>
  <div class="flex">
    <AppSidebar />

    <div class="flex-1 min-w-0">
      <AppHeader title="Mis Libros" />

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 sm:p-6">
        <NewBookCard @click="showModal = true" />
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          @open="openBook"
          @delete="deleteBook"
          @change-cover="onChangeCover"
        />
      </div>
    </div>

    <FloatingAddButton @click="showModal = true" />

    <NewBookModal v-if="showModal" @close="showModal = false" @create="onCreate" />

    <CoverPickerPopover
      v-if="coverPickerBook"
      :model-value="coverPickerBook.cover"
      :plain-color="coverPickerBook.color"
      :image="coverPickerBook.coverImage"
      :texture="coverPickerBook.texture"
      :clasp="coverPickerBook.clasp"
      @set-texture="(t, c) => setBookTexture(coverPickerBook!.id, t, c)"
      @update:model-value="onPickCover"
      @set-image="onSetCoverImage"
      @close="coverPickerBookId = null"
    />
  </div>
</template>
