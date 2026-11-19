<script setup>
// Recuadro de truco o aviso: empieza con una palabra en negrita del tono.
// Con `mascota`, la mascota de Automata aparece al lado (como en los PDF).
defineProps({
  titulo: { type: String, default: "Truco:" },
  mascota: { type: String, default: "" }, // ruta en public/imagenes/automata
});
</script>

<template>
  <div class="guia-nota-fila" :class="{ 'con-mascota': mascota }">
    <aside class="guia-nota">
      <p><strong>{{ titulo }}</strong> <slot /></p>
    </aside>
    <img v-if="mascota" :src="mascota" alt="" class="guia-mascota" loading="lazy" />
  </div>
</template>
