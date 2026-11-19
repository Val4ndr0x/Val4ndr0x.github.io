<script setup>
// Cierre de la guía: mensaje final y botón para descargarla en PDF.
const props = defineProps({
  titulo: { type: String, required: true },
  destacado: { type: String, default: "" },
  texto: { type: String, default: "" },
  archivo: { type: String, required: true },
  mascota: { type: String, default: "" },
});
const nombre = computed(() => props.archivo.split("/").pop());
</script>

<template>
  <section class="guia-cierre guia-hoja-doc" aria-labelledby="guia-cierre-titulo">
    <img v-if="mascota" :src="mascota" alt="" class="guia-mascota guia-mascota--cierre" loading="lazy" />
    <h2 id="guia-cierre-titulo" class="guia-h2">
      {{ titulo }} <span v-if="destacado" class="guia-resalte">{{ destacado }}</span>
    </h2>
    <p v-if="texto" class="guia-intro">{{ texto }}</p>
    <slot />
    <div class="guia-cierre-acciones solo-pantalla">
      <a :href="archivo" :download="nombre" class="boton-principal guia-boton-pdf">
        <IconoLinea nombre="descargar" />Descargar la guía en PDF
      </a>
      <a href="/guias" class="boton-secundario">Ver más guías</a>
    </div>
  </section>
</template>
