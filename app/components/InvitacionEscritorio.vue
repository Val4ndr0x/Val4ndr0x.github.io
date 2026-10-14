<script setup>
// Invitación al modo escritorio: el escritorio solo se ve al pulsar el botón
const modoEscritorio = useState("modoEscritorio", () => false);
</script>

<template>
  <section class="invitacion-escritorio" aria-labelledby="invitacion-titulo">
    <div class="invitacion-fondo" aria-hidden="true"></div>
    <div class="invitacion-contenido">
      <p class="seccion-etiqueta">Modo escritorio</p>
      <h2 id="invitacion-titulo" class="seccion-titulo">
        Mi CV,<br /><span class="seccion-destacado">como un escritorio.</span>
      </h2>
      <p class="seccion-intro">
        Abre cada parte de mi CV en su propia ventana: perfil, habilidades, proyectos,
        trayectoria, certificados y la consola.
      </p>
      <button type="button" class="boton-principal" @click="modoEscritorio = true">
        <IconoLinea nombre="escritorio" class="icono-pequeno" />Entrar al modo escritorio
      </button>
    </div>
  </section>
</template>
