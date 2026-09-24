<script setup lang="ts">
</script>

<template>
  <div class="flex h-[calc(100dvh-4rem)] sm:h-screen overflow-hidden">
    <AppSidebar />

    <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
      <AppHeader title="Calendario" />
      <div class="flex-1 min-h-0">
        <CalendarView />
      </div>
    </div>
  </div>
</template>
