<script setup>
// Portada de una guía: etiqueta, título con una parte destacada en el tono de
// la guía, resumen, chips y el índice numerado que salta a cada paso.
defineProps({
  etiqueta: { type: String, required: true },
  titulo: { type: String, required: true },
  destacado: { type: String, default: "" },
  resumen: { type: String, default: "" },
  chips: { type: Array, default: () => [] }, // textos cortos bajo el resumen
  indice: { type: Array, default: () => [] }, // [{ titulo, nota }]
  mascota: { type: String, default: "" }, // imagen de la mascota de Automata
});

const dos = (n) => String(n).padStart(2, "0");
</script>

<template>
  <div class="guia-portada-doc guia-hoja-doc">
    <p class="guia-ceja">{{ etiqueta }}</p>
    <h1 class="guia-h1">
      {{ titulo }}<template v-if="destacado"><br /><span class="guia-resalte">{{ destacado }}</span></template>
    </h1>
    <p v-if="resumen" class="guia-resumen" v-html="resumen"></p>

    <ul v-if="chips.length" class="guia-chips" aria-label="Contenido de la guía">
      <li v-for="chip in chips" :key="chip">{{ chip }}</li>
    </ul>

    <figure v-if="mascota" class="guia-avatar" aria-hidden="true">
      <span class="guia-avatar-halo"></span>
      <img :src="mascota" alt="" />
    </figure>

    <nav v-if="indice.length" class="guia-indice" aria-label="Índice">
      <a
        v-for="(item, i) in indice"
        :key="item.titulo"
        :href="`#paso-${dos(i + 1)}`"
        class="guia-indice-fila"
        :style="{ '--color': `var(--g-c${i + 1})` }"
      >
        <span class="guia-num">{{ dos(i + 1) }}</span>
        <span class="guia-indice-titulo">{{ item.titulo }}</span>
        <span class="guia-indice-nota">{{ item.nota }}</span>
      </a>
    </nav>
  </div>
</template>
