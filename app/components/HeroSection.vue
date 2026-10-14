<script setup>
import { perfil, contacto } from "~/data/perfil";
import fotoAndres1 from "~/assets/andres1.jpg";
import fotoAndres2 from "~/assets/andres2.jpg";
import { descargarCvPdf } from "~/utils/cvPdf";

const generandoCv = ref(false);
async function descargarCv() {
  generandoCv.value = true;
  try {
    await descargarCvPdf();
  } finally {
    generandoCv.value = false;
  }
}

// Retrato con glitch: andres2 por defecto; al pasar el puntero (o tocar en
// móvil) una ráfaga de glitch lo convierte en andres1
const capas = [
  { clave: "a", src: fotoAndres2, alt: "Andrés Valencia programando" },
  { clave: "b", src: fotoAndres1, alt: "Andrés Valencia" },
];
const transformado = ref(false);
const rafaga = ref(false); // ráfaga de glitch mientras cambia de foto
let finRafaga;
function cambiar(valor) {
  if (transformado.value === valor) return;
  transformado.value = valor;
  // Reinicia la ráfaga aunque la anterior no haya terminado
  rafaga.value = false;
  requestAnimationFrame(() => (rafaga.value = true));
  clearTimeout(finRafaga);
  finRafaga = setTimeout(() => (rafaga.value = false), 520);
}
// Con mouse o lápiz cambia al pasar por encima; con el dedo, con cada toque
const alEntrar = (e) => e.pointerType !== "touch" && cambiar(true);
const alSalir = (e) => e.pointerType !== "touch" && cambiar(false);
const alTocar = (e) => e.pointerType === "touch" && cambiar(!transformado.value);

const hora = ref("");
let reloj;
function actualizarHora() {
  hora.value = new Date().toLocaleTimeString("es-CO", {
    timeZone: perfil.zonaHoraria,
    hour: "2-digit",
    minute: "2-digit",
  });
}
onMounted(() => {
  actualizarHora();
  reloj = setInterval(actualizarHora, 15000);
});
onBeforeUnmount(() => {
  clearInterval(reloj);
  clearTimeout(finRafaga);
});
</script>

<template>
  <section id="about" class="about-section">
    <figure class="profile">
      <div
        class="profile-image perfil-glitch"
        :class="{ transformado, rafaga }"
        tabindex="0"
        role="img"
        :aria-label="transformado ? capas[1].alt : capas[0].alt"
        @pointerenter="alEntrar"
        @pointerleave="alSalir"
        @pointerup="alTocar"
        @focus="cambiar(true)"
        @blur="cambiar(false)"
      >
        <!-- Cada capa: la foto y dos copias (roja y cian) que se separan en el glitch -->
        <div v-for="capa in capas" :key="capa.clave" class="pg-capa" :class="`pg-${capa.clave}`" aria-hidden="true">
          <img :src="capa.src" alt="" class="pg-foto" draggable="false" />
          <img :src="capa.src" alt="" class="pg-foto pg-rojo" draggable="false" />
          <img :src="capa.src" alt="" class="pg-foto pg-cian" draggable="false" />
        </div>
        <span class="pg-barrido" aria-hidden="true"></span>
      </div>
    </figure>
    <div class="about-text">
      <a v-if="perfil.disponible" href="#contacto" class="insignia-estado">
        <span class="punto-vivo"></span>{{ perfil.disponibilidad }}
      </a>
      <h2 class="about-text-welcome">Hi There!</h2>
      <br />

      <!-- Vue elimina los espacios entre etiquetas; este conserva "I´m Andrés Valencia" -->
      <h2 class="about-text-welcome-2">I´m</h2>{{ " " }}
      <h2 class="about-text-welcome-2 hero-nombre">Andrés <span class="hero-apellido">Valencia</span></h2>
      <p class="about-text-welcome">
        Designer
        <span style="color: rgb(238, 127, 0); font-weight: bold">UX </span>/
        <span style="color: rgb(0, 190, 48); font-weight: bold">UI</span>
        & developer web
      </p>

      <p class="hero-datos">
        <span>{{ perfil.ciudad }}</span>
        <span v-if="hora">{{ hora }} hora local</span>
      </p>

      <div class="hero-acciones">
        <a href="#contacto" class="boton-principal">Contrátame</a>
        <a href="#mis-proyectos" class="boton-secundario">Ver proyectos</a>
        <button type="button" class="boton-secundario boton-cv" :disabled="generandoCv" @click="descargarCv">
          <IconoLinea nombre="descargar" />{{ generandoCv ? "Generando…" : "Descargar CV" }}
        </button>
        <a :href="`mailto:${contacto.correo}`" class="hero-correo" aria-label="Escríbeme un correo" title="Escríbeme un correo">
          <IconoLinea nombre="correo" />
        </a>
      </div>
    </div>
  </section>
</template>
