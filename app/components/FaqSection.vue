<script setup>
import { preguntas } from "~/data/perfil";

defineProps({ numero: Number });
</script>

<template>
  <section id="faq" class="seccion faq">
    <SeccionCabecera :numero="numero" etiqueta="Preguntas frecuentes" titulo="Antes de" destacado="empezar." />

    <div class="faq-lista">
      <details v-for="item in preguntas" :key="item.pregunta" class="tarjeta-vidrio faq-item" name="faq">
        <summary>
          {{ item.pregunta }}
          <span class="faq-signo" aria-hidden="true"></span>
        </summary>
        <p>{{ item.respuesta }}</p>
      </details>
    </div>
  </section>
</template>
