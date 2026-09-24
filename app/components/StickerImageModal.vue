<script setup lang="ts">
const emit = defineEmits<{ close: []; pick: [image: string | null] }>()

function onPick(image: string) {
  emit('pick', image)
}

function onClear() {
  emit('pick', null)
}
</script>

<template>
  <StickerGallery allow-clear @close="emit('close')" @pick="onPick" @clear="onClear" />
</template>
