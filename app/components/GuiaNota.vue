<script setup>
// Recuadro de truco o aviso: empieza con una palabra en negrita del tono.
defineProps({ titulo: { type: String, default: "Truco:" } });
</script>

<template>
  <aside class="guia-nota">
    <p><strong>{{ titulo }}</strong> <slot /></p>
  </aside>
</template>
