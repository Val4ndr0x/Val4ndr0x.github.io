<script setup>
import { posts } from "~/data/perfil";

defineProps({ numero: Number });

const destacado = posts.find((p) => p.destacado) || posts[0];
const resto = posts.filter((p) => p !== destacado);

const formatoFecha = (fecha) =>
  new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
</script>

<template>
  <section id="blog" class="seccion blog">
    <SeccionCabecera :numero="numero" etiqueta="Blog" titulo="Ideas" destacado="escritas." />

    <a :href="destacado.enlace" class="tarjeta-vidrio blog-destacado">
      <span class="chip">{{ destacado.categoria }}</span>
      <h3>{{ destacado.titulo }}</h3>
      <p class="blog-meta">{{ formatoFecha(destacado.fecha) }} · {{ destacado.lectura }} de lectura</p>
    </a>

    <ul v-if="resto.length" class="blog-lista">
      <li v-for="post in resto" :key="post.titulo">
        <a :href="post.enlace">
          <span class="chip">{{ post.categoria }}</span>
          <span class="blog-titulo">{{ post.titulo }}</span>
          <span class="blog-meta">{{ formatoFecha(post.fecha) }} · {{ post.lectura }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
