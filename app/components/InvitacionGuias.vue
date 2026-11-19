<script setup>
import { guias } from "~/data/creador";

// Acceso compacto a /guias desde el portafolio: las guías completas viven en
// su propia página para no recargar el CV.
const publicadas = guias.filter((g) => g.slug).length;
</script>

<template>
  <section class="seccion invitacion-guias" aria-labelledby="invitacion-guias-titulo">
    <a href="/guias" class="tarjeta-vidrio invitacion-guias-tarjeta">
      <span class="invitacion-guias-icono" aria-hidden="true"><IconoLinea nombre="descargar" /></span>
      <span class="invitacion-guias-texto">
        <span class="seccion-etiqueta">Guías gratis</span>
        <span id="invitacion-guias-titulo" class="invitacion-guias-titulo">Aprende conmigo, paso a paso.</span>
        <span class="invitacion-guias-sub">
          {{ publicadas }} {{ publicadas === 1 ? "guía publicada" : "guías publicadas" }} · lee en línea o descarga el PDF
        </span>
      </span>
      <span class="boton-principal invitacion-guias-boton">Ver guías<IconoLinea nombre="flecha" /></span>
    </a>
  </section>
</template>
