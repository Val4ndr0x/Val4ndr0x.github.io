<script setup>
// Un paso de la guía: ceja "01 · Antes de empezar", título con parte
// destacada y el contenido. En el PDF cada paso empieza en una hoja nueva.
const props = defineProps({
  numero: { type: Number, required: true },
  etiqueta: { type: String, required: true },
  titulo: { type: String, required: true },
  destacado: { type: String, default: "" },
  intro: { type: String, default: "" },
});
const dos = (n) => String(n).padStart(2, "0");
</script>

<template>
  <section :id="`paso-${dos(props.numero)}`" class="guia-paso guia-hoja-doc" :style="{ '--color': `var(--g-c${props.numero})` }">
    <p class="guia-ceja"><span class="guia-num guia-num--chico">{{ dos(numero) }}</span>{{ etiqueta }}</p>
    <h2 class="guia-h2">
      {{ titulo }} <span v-if="destacado" class="guia-resalte">{{ destacado }}</span>
    </h2>
    <p v-if="intro" class="guia-intro" v-html="intro"></p>
    <slot />
  </section>
</template>
