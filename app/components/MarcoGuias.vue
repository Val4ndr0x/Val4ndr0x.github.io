<script setup>
import { iniciarNavegacion, revelarSecciones } from "~/utils/motion";

// Marco de las páginas de guías: la misma barra, fondo y pie del portafolio,
// sin la pantalla de carga ni las escenas del modo inmersivo.
const raiz = ref(null);

onMounted(() => {
  iniciarNavegacion(raiz.value.querySelector("header"));
  revelarSecciones();
});
</script>

<template>
  <div ref="raiz" class="marco-guias">
    <AppHeader />
    <main class="container marco-guias-main">
      <div class="marco-guias-fondo" aria-hidden="true"></div>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
