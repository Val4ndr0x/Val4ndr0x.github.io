<script setup>
const enlaces = [
  { href: "#sobre-mi", texto: "Sobre mí" },
  { href: "#stack", texto: "Stack" },
  { href: "#servicios", texto: "Servicios" },
  { href: "#mis-proyectos", texto: "Proyectos" },
  { href: "#trayectoria", texto: "Trayectoria" },
  { href: "#contacto", texto: "Contacto" },
];

const modoEscritorio = useState("modoEscritorio", () => false);
const inmersivo = useState("inmersivo", () => true);
</script>

<template>
  <header>
    <div class="container">
      <nav>
        <ul>
          <img src="/imagenes/Dibujo.png" alt="" id="imagennav" />
          <li v-for="enlace in enlaces" :key="enlace.href">
            <a :href="enlace.href">{{ enlace.texto }}</a>
          </li>
          <li class="nav-escritorio">
            <button type="button" class="boton-escritorio" @click="modoEscritorio = true">
              <IconoLinea nombre="escritorio" />Modo escritorio
            </button>
          </li>
          <li class="nav-inmersivo">
            <button
              type="button"
              role="switch"
              class="interruptor-inmersivo"
              :aria-checked="inmersivo"
              title="Activa o desactiva las animaciones guiadas por el scroll"
              @click="inmersivo = !inmersivo"
            >
              <span class="interruptor-pista"><span class="interruptor-bola"></span></span>
              Inmersivo
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
