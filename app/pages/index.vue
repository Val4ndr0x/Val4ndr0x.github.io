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
// y la elección se recuerda en este navegador. En móvil no se usa: las
// escenas guiadas por el scroll ya se muestran como contenido normal, así que
// solo quedaría un efecto leve que gasta batería (el interruptor se oculta en
// main.css)
const inmersivo = useState("inmersivo", () => true);
const MOVIL = "(max-width: 900px)";
let esMovil = false;
watch(inmersivo, (activo) => {
  activo ? activarInmersivo() : desactivarInmersivo();
  if (esMovil) return; // no pisa la elección guardada para la computadora
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
let preparacion = null;
const siguienteCuadro = () => new Promise((listo) => requestAnimationFrame(() => listo()));

// La página se arma debajo de la pantalla de carga (tapada y sin scroll)
// mientras la barra avanza, no después: así el trabajo pesado de maquetar
// todas las secciones e iniciar escenas y partículas ya está hecho cuando la
// barra termina.
function prepararContenido() {
  if (preparacion) return preparacion;
  preparacion = (async () => {
    const content = contenido.value;
    document.documentElement.style.overflow = "hidden";
    content.style.display = "block";
    content.style.transform = "none"; // Sin transform, para que position: fixed/sticky funcionen
    content.style.opacity = "0";
    refrescarInmersivo();
    await siguienteCuadro();
    await siguienteCuadro();
  })();
  return preparacion;
}

// Paso de la pantalla de carga a la página, sin cortes: fundido cruzado solo
// con opacidad y escala (lo que la tarjeta gráfica anima sin esfuerzo).
async function mostrarContenido() {
  if (contenidoMostrado) return;
  contenidoMostrado = true;
  const loader = cargador.value.$el;
  const content = contenido.value;

  await prepararContenido();
  document.documentElement.style.overflow = "";
  // Las secciones se materializan durante el fundido, no ocultas detrás
  revelarSecciones();

  const duracion = reducirMovimiento() ? 1 : 650;
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
    delay: reducirMovimiento() ? 0 : 60,
    easing: curva,
    fill: "forwards",
  });
  // Si se llegó con un ancla (ej. /#contacto desde una guía), se salta a esa
  // sección: el navegador no pudo hacerlo mientras la página estaba oculta
  if (location.hash) {
    try {
      document.querySelector(decodeURIComponent(location.hash))?.scrollIntoView();
    } catch {
      /* ancla que no es un selector válido */
    }
  }
  salida.onfinish = () => {
    loader.style.display = "none";
    loader.style.willChange = "";
  };
  entrada.onfinish = () => {
    entrada.cancel();
    content.style.opacity = "";
    // Las partículas del fondo son decoración y su arranque bloquea casi un
    // segundo: se inician cuando la página ya se ve y el navegador está libre
    const cuandoLibre = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    cuandoLibre(iniciarParticulas, { timeout: 1500 });
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
    esMovil = matchMedia(MOVIL).matches;
    if (esMovil || localStorage.getItem("inmersivo") === "0") inmersivo.value = false;
  } catch {
    /* sin almacenamiento */
  }
  if (inmersivo.value) activarInmersivo();
  iniciarNavegacion(document.querySelector("header"));
  iniciarParallax();
  scrollCont.value.addEventListener("wheel", alGirarRueda, { passive: false });
  document.addEventListener("keydown", alPresionarTecla);
  // Deja pintar un cuadro de la pantalla de carga y arma la página detrás
  requestAnimationFrame(() => setTimeout(prepararContenido, 0));
  // Si ya vio la pantalla de carga en esta visita (ej. vuelve desde una
  // guía), no se repite: la página aparece en cuanto está lista
  try {
    if (sessionStorage.getItem("cargaVista")) prepararContenido().then(mostrarContenido);
    sessionStorage.setItem("cargaVista", "1");
  } catch {
    /* sin almacenamiento */
  }
  // La pantalla de carga avisa al terminar su secuencia; por si algo falla,
  // la página se muestra igual a los 5 segundos
  setTimeout(mostrarContenido, 5000);
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
        <!-- Las guías viven en su propia página: /guias -->
        <InvitacionGuias />
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
