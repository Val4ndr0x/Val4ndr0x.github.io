<script setup>
import { testimonios } from "~/data/perfil";

defineProps({ numero: Number });

const actual = ref(0);
const total = testimonios.length;

function mover(paso) {
  actual.value = (actual.value + paso + total) % total;
}

function alPresionarTecla(e) {
  if (e.key === "ArrowLeft") mover(-1);
  if (e.key === "ArrowRight") mover(1);
}
</script>

<template>
  <section id="testimonios" class="seccion testimonios">
    <SeccionCabecera :numero="numero" etiqueta="Testimonios" titulo="Lo que dicen" destacado="de mí." />

    <div
      class="testimonios-mazo"
      tabindex="0"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Testimonios. Usa las flechas para cambiar."
      @keydown="alPresionarTecla"
    >
      <figure
        v-for="(t, i) in testimonios"
        :key="t.nombre"
        class="tarjeta-vidrio testimonio"
        :style="{ '--pos': (i - actual + total) % total }"
        :aria-hidden="i !== actual"
      >
        <IconoLinea nombre="comillas" class="testimonio-comillas" />
        <blockquote>{{ t.texto }}</blockquote>
        <figcaption>
          <strong>{{ t.nombre }}</strong>
          <span>{{ t.cargo }}</span>
          <span v-if="t.proyecto" class="chip">Proyecto: {{ t.proyecto }}</span>
          <a v-if="t.enlace" :href="t.enlace" target="_blank" rel="noopener" class="enlace-acento">LinkedIn ›</a>
        </figcaption>
      </figure>
    </div>

    <div class="testimonios-controles">
      <button type="button" class="boton-circular" aria-label="Anterior" @click="mover(-1)">‹</button>
      <span class="testimonios-puntos">
        <span v-for="(t, i) in testimonios" :key="t.nombre" :class="{ activo: i === actual }"></span>
      </span>
      <button type="button" class="boton-circular" aria-label="Siguiente" @click="mover(1)">›</button>
    </div>
  </section>
</template>
