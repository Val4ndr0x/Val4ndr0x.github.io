<script setup>
// En el portafolio los enlaces saltan a cada sección; desde las guías llevan
// de vuelta al portafolio en esa sección. Las guías tienen su propia página.
const ruta = useRoute();
const enCasa = computed(() => ruta.path === "/");
const enGuias = computed(() => ruta.path.startsWith("/guias"));
const secciones = [
  { ancla: "#sobre-mi", texto: "Sobre mí" },
  { ancla: "#stack", texto: "Stack" },
  { ancla: "#servicios", texto: "Servicios" },
  { ancla: "#mis-proyectos", texto: "Proyectos" },
  { ancla: "#trayectoria", texto: "Trayectoria" },
];
const enlaces = computed(() => [
  ...secciones.map((s) => ({ href: enCasa.value ? s.ancla : `/${s.ancla}`, texto: s.texto })),
  { href: "/guias", texto: "Guías", actual: enGuias.value },
  { href: enCasa.value ? "#contacto" : "/#contacto", texto: "Contacto" },
]);

const modoEscritorio = useState("modoEscritorio", () => false);
const inmersivo = useState("inmersivo", () => true);
</script>

<template>
  <header>
    <div class="container">
      <nav>
        <ul>
          <a v-if="!enCasa" href="/" class="nav-logo" aria-label="Volver al portafolio"><img src="/imagenes/Dibujo.webp" alt="" id="imagennav" decoding="async" /></a>
          <img v-else src="/imagenes/Dibujo.webp" alt="" id="imagennav" decoding="async" />
          <li v-for="enlace in enlaces" :key="enlace.href">
            <a :href="enlace.href" :aria-current="enlace.actual ? 'page' : undefined">{{ enlace.texto }}</a>
          </li>
          <li v-if="enCasa" class="nav-escritorio">
            <button type="button" class="boton-escritorio" @click="modoEscritorio = true">
              <IconoLinea nombre="escritorio" />Modo escritorio
            </button>
          </li>
          <li v-if="enCasa" class="nav-inmersivo">
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
