<script setup>
// Tarjeta de vidrio con un punto de color, título y una etiqueta opcional
// ("Obligatorio", "Opcional"…). Van dentro de un <div class="guia-rejilla">.
defineProps({
  titulo: { type: String, required: true },
  etiqueta: { type: String, default: "" },
  color: { type: String, default: "var(--g-tono)" },
  suave: { type: Boolean, default: false }, // etiqueta en verde (opcional)
});
</script>

<template>
  <article class="guia-tarjeta-doc" :style="{ '--color': color }">
    <header>
      <span class="guia-punto"></span>
      <h3>{{ titulo }}</h3>
      <span v-if="etiqueta" class="guia-etiqueta" :class="{ 'guia-etiqueta--suave': suave }">{{ etiqueta }}</span>
    </header>
    <div class="guia-tarjeta-cuerpo"><slot /></div>
  </article>
</template>
