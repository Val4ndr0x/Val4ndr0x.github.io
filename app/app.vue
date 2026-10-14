<script setup>
import {
  cerrarVisor,
  iniciarNavegacion,
  iniciarParallax,
  reducirMovimiento,
  revelarSecciones,
} from "~/utils/motion";
import { activarInmersivo, desactivarInmersivo, refrescarInmersivo } from "~/utils/inmersivo";
import { testimonios, posts } from "~/data/perfil";

// Orden de las secciones numeradas, como "(01) Sobre mí". Testimonios y Blog
// solo aparecen si tienen datos, y la numeración se ajusta sola.
const orden = [
  "sobreMi",
  "stack",
  "servicios",
  "proyectos",
  "proceso",
  "trayectoria",
  "credenciales",
  testimonios.length && "testimonios",
  posts.length && "blog",
  "faq",
  "contacto",
].filter(Boolean);
const num = (clave) => orden.indexOf(clave) + 1;

// Modo escritorio: lo abren el botón de la barra y la invitación de la página
const modoEscritorio = useState("modoEscritorio", () => false);

// Modo inmersivo: activado por defecto; el interruptor de la barra lo apaga
// y la elección se recuerda en este navegador
const inmersivo = useState("inmersivo", () => true);
watch(inmersivo, (activo) => {
  activo ? activarInmersivo() : desactivarInmersivo();
  try {
    localStorage.setItem("inmersivo", activo ? "1" : "0");
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
});

const cargador = ref(null);
const contenido = ref(null);
const scrollCont = ref(null);

let contenidoMostrado = false;
const siguienteCuadro = () => new Promise((listo) => requestAnimationFrame(() => listo()));

// Paso de la pantalla de carga a la página, sin cortes:
// 1. La página se monta debajo de la pantalla de carga (todavía tapada) y se
//    inician las escenas y las partículas.
// 2. Se esperan unos cuadros para que el navegador termine ese trabajo pesado.
// 3. Fundido cruzado solo con opacidad y escala (lo que la tarjeta gráfica
//    anima sin esfuerzo): la carga se desvanece y la página aparece.
async function mostrarContenido() {
  if (contenidoMostrado) return;
  contenidoMostrado = true;
  const loader = cargador.value.$el;
  const content = contenido.value;

  content.style.display = "block";
  content.style.transform = "none"; // Sin transform, para que position: fixed/sticky funcionen
  content.style.opacity = "0";
  revelarSecciones();
  refrescarInmersivo();
  iniciarParticulas();

  await siguienteCuadro();
  await siguienteCuadro();
  await new Promise((listo) => setTimeout(listo, 120));

  const duracion = reducirMovimiento() ? 1 : 950;
  const curva = "cubic-bezier(0.22, 1, 0.36, 1)";
  loader.style.willChange = "opacity, transform";
  const salida = loader.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(1.04)" },
    ],
    { duration: duracion, easing: curva, fill: "forwards" }
  );
  const entrada = content.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: duracion,
    delay: reducirMovimiento() ? 0 : 120,
    easing: curva,
    fill: "forwards",
  });
  salida.onfinish = () => {
    loader.style.display = "none";
    loader.style.willChange = "";
  };
  entrada.onfinish = () => {
    entrada.cancel();
    content.style.opacity = "";
  };
}

function iniciarParticulas() {
  if (typeof window.particlesJS === "undefined") {
    console.error("Error: particlesJS no está definido.");
    return;
  }
  window.particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#646464" },
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: "#00594f" },
      move: { enable: true, speed: 6 },
    },
    interactivity: {
      events: { onhover: { enable: true, mode: "repulse" } },
      resize: true,
    },
    retina_detect: true,
  });
}

// Si el cursor está sobre un elemento con scroll propio (ej. la consola)
// y aún puede desplazarse en esa dirección, se deja el scroll nativo
function puedeScrollInterno(elemento, deltaY) {
  while (elemento && elemento !== scrollCont.value) {
    const overflowY = getComputedStyle(elemento).overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && elemento.scrollHeight > elemento.clientHeight) {
      const arriba = deltaY < 0 && elemento.scrollTop > 0;
      const abajo = deltaY > 0 && elemento.scrollTop + elemento.clientHeight < elemento.scrollHeight - 1;
      if (arriba || abajo) return true;
    }
    elemento = elemento.parentElement;
  }
  return false;
}

function alGirarRueda(event) {
  if (puedeScrollInterno(event.target, event.deltaY)) return;
  event.preventDefault();
  window.scrollBy({
    top: event.deltaY * 0.6, // Cambia el valor para ajustar la velocidad
    behavior: "smooth",
  });
}

function alPresionarTecla(e) {
  if (e.key === "Escape") cerrarVisor();
}

onMounted(() => {
  try {
    if (localStorage.getItem("inmersivo") === "0") inmersivo.value = false;
  } catch {
    /* sin almacenamiento */
  }
  if (inmersivo.value) activarInmersivo();
  iniciarNavegacion(document.querySelector("header"));
  iniciarParallax();
  scrollCont.value.addEventListener("wheel", alGirarRueda, { passive: false });
  document.addEventListener("keydown", alPresionarTecla);
  // La pantalla de carga avisa al terminar su secuencia; por si algo falla,
  // la página se muestra igual a los 8 segundos
  setTimeout(mostrarContenido, 8000);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", alPresionarTecla);
});
</script>

<template>
  <PantallaCarga ref="cargador" @terminado="mostrarContenido" />

  <div class="content-loader" ref="contenido" style="display: none">
    <AppHeader />

    <main class="container">
      <div id="particles-js"></div>

      <figure class="bg-1" id="img-cl"><img src="/imagenes/Backfround.jpeg" /></figure>
      <figure class="bg-2"><img src="/imagenes/Letras2.png" alt="" id="letras3" /></figure>

      <div class="scroll-cont" ref="scrollCont">
        <HeroSection />
        <SobreMiSection :numero="num('sobreMi')" />
        <StackSection :numero="num('stack')" />
        <ServiciosSection :numero="num('servicios')" />
        <ProyectosSection :numero="num('proyectos')" />
        <ProcesoSection :numero="num('proceso')" />
        <TrayectoriaSection :numero="num('trayectoria')" />
        <CredencialesSection :numero="num('credenciales')" />
        <TestimoniosSection v-if="orden.includes('testimonios')" :numero="num('testimonios')" />
        <BlogSection v-if="orden.includes('blog')" :numero="num('blog')" />
        <FaqSection :numero="num('faq')" />
        <ContactoFormulario :numero="num('contacto')" />
        
        <!-- Zona para explorar: invitación al modo escritorio (la consola vive ahí) -->
        <InvitacionEscritorio />
      </div>
    </main>

    <AppFooter />
    <HudInmersivo v-if="inmersivo" />
  </div>

  <DesktopSection v-if="modoEscritorio" @cerrar="modoEscritorio = false" />
</template>
