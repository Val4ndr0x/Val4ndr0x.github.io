<script setup>
// Cabecera común de las secciones: etiqueta numerada "(01) Sobre mí",
// título grande con una parte destacada en el acento y una intro opcional.
defineProps({
  numero: { type: Number, default: null },
  etiqueta: { type: String, required: true },
  titulo: { type: String, required: true },
  destacado: { type: String, default: "" },
  intro: { type: String, default: "" },
  alineacion: { type: String, default: "centro" }, // "centro" | "izquierda"
});

const dos = (n) => String(n).padStart(2, "0");
</script>

<template>
  <div class="seccion-cabecera" :class="`seccion-cabecera--${alineacion}`">
    <p class="seccion-etiqueta">
      <span v-if="numero" class="seccion-numero">({{ dos(numero) }})</span>
      {{ etiqueta }}
    </p>
    <h2 class="seccion-titulo">
      {{ titulo }}<template v-if="destacado"><br /><span class="seccion-destacado">{{ destacado }}</span></template>
    </h2>
    <p v-if="intro" class="seccion-intro">{{ intro }}</p>
  </div>
</template>
