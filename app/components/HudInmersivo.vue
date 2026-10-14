<script setup>
// HUD del modo inmersivo, al estilo del Animus de Assassin's Creed: barra de
// sincronización con una marca por sección, secuencia actual, esquinas de
// visor y un barrido de escaneo al cambiar de sección.

const SECCIONES = [
  { id: "about", nombre: "Inicio" },
  { id: "sobre-mi", nombre: "Sobre mí" },
  { id: "stack", nombre: "Stack" },
  { id: "servicios", nombre: "Servicios" },
  { id: "mis-proyectos", nombre: "Proyectos" },
  { id: "proceso", nombre: "Proceso" },
  { id: "trayectoria", nombre: "Trayectoria" },
  { id: "credenciales", nombre: "Credenciales" },
  { id: "testimonios", nombre: "Testimonios" },
  { id: "blog", nombre: "Blog" },
  { id: "faq", nombre: "Preguntas" },
  { id: "contacto", nombre: "Contacto" },
];

const sincronizacion = ref(0);
const marcas = ref([]); // { id, nombre, posicion (0..1) }
const actual = ref(0);
const barrido = ref(0); // cambia de valor para repetir la animación de escaneo

function medirMarcas() {
  const doc = document.documentElement;
  const recorrido = doc.scrollHeight - doc.clientHeight;
  const raiz = document.body.getBoundingClientRect().top;
  const e = parseFloat(getComputedStyle(doc).getPropertyValue("--escala")) || 1;
  marcas.value = SECCIONES.map((s) => ({ ...s, el: document.getElementById(s.id) }))
    .filter((s) => s.el)
    .map((s) => ({
      id: s.id,
      nombre: s.nombre,
      posicion: Math.min(1, ((s.el.getBoundingClientRect().top - raiz) / e) / recorrido),
    }));
}

function alHacerScroll() {
  const doc = document.documentElement;
  const recorrido = doc.scrollHeight - doc.clientHeight;
  sincronizacion.value = recorrido > 0 ? doc.scrollTop / recorrido : 0;

  // Sección actual: la que ocupa la línea al 45% de la pantalla
  const linea = window.innerHeight * 0.45;
  let indice = 0;
  marcas.value.forEach((m, i) => {
    const el = document.getElementById(m.id);
    if (el && el.getBoundingClientRect().top <= linea) indice = i;
  });
  if (indice !== actual.value) {
    actual.value = indice;
    barrido.value++;
  }
}

function ir(marca) {
  document.getElementById(marca.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const porcentaje = computed(() => String(Math.round(sincronizacion.value * 100)).padStart(3, "0"));
const dos = (n) => String(n).padStart(2, "0");

let observador;
onMounted(() => {
  medirMarcas();
  alHacerScroll();
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  window.addEventListener("resize", medirMarcas);
  observador = new ResizeObserver(() => {
    medirMarcas();
    alHacerScroll();
  });
  observador.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", alHacerScroll);
  window.removeEventListener("resize", medirMarcas);
  observador?.disconnect();
});
</script>

<template>
  <div class="hud">
    <!-- Esquinas del visor y textura de escaneo -->
    <div class="hud-marco" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="hud-lineas" aria-hidden="true"></div>
    <div :key="barrido" class="hud-barrido" aria-hidden="true"></div>

    <!-- Barra de sincronización -->
    <nav class="hud-sincro" aria-label="Secciones">
      <div class="hud-sincro-pista">
        <div class="hud-sincro-relleno" :style="{ scale: `1 ${sincronizacion}` }"></div>
      </div>
      <button
        v-for="(marca, i) in marcas"
        :key="marca.id"
        type="button"
        class="hud-marca"
        :class="{ activa: i === actual, sincronizada: i < actual }"
        :style="{ top: marca.posicion * 100 + '%' }"
        :aria-label="`Ir a ${marca.nombre}`"
        @click="ir(marca)"
      >
        <span class="hud-marca-rombo"></span>
        <span class="hud-marca-nombre">{{ marca.nombre }}</span>
      </button>
    </nav>

    <!-- Lectura de la secuencia -->
    <div class="hud-lectura" aria-hidden="true">
      <p class="hud-lectura-sincro">Sincronización <strong>{{ porcentaje }}%</strong></p>
      <!-- La clave hace que la animación de entrada se repita en cada sección -->
      <p :key="actual" class="hud-lectura-secuencia">
        Secuencia {{ dos(actual + 1) }} <span>//</span> {{ marcas[actual]?.nombre }}
      </p>
    </div>
  </div>
</template>
