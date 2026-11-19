<script setup>
import { automata } from "~/data/creador";
import { perfil } from "~/data/perfil";

// "¿Quién está detrás de @automata.ofi?": deja claro que Automata es tu canal
// y qué haces. Va en /guias y al final de cada guía (también en el PDF).
</script>

<template>
  <aside class="guia-autor" aria-labelledby="guia-autor-titulo">
    <img :src="automata.mascota" alt="" class="guia-autor-mascota" loading="lazy" />
    <div class="guia-autor-texto">
      <p class="guia-ceja">¿Quién está detrás de {{ automata.usuario }}?</p>
      <h2 id="guia-autor-titulo" class="guia-autor-titulo">
        Soy yo, <span class="guia-resalte">{{ perfil.nombre }}</span>.
      </h2>
      <p class="guia-autor-rol">{{ perfil.cargo }} · Val4ndr0x</p>
      <p class="guia-autor-desc">{{ automata.queHago }}</p>
      <div class="guia-autor-acciones solo-pantalla">
        <a :href="automata.enlace" target="_blank" rel="noopener noreferrer" class="boton-secundario">
          <IconoLinea nombre="instagram" />Seguir a {{ automata.usuario }}
        </a>
        <a href="/" class="guia-autor-portafolio">Ver mi portafolio<IconoLinea nombre="flecha" /></a>
      </div>
      <p class="guia-autor-enlaces solo-impresion">
        instagram.com/automata.ofi · val4ndr0x.github.io
      </p>
    </div>
  </aside>
</template>
