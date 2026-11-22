<script setup>
import {
  cerrarVisor,
  equipoLigero,
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
    // En un equipo modesto no hay partículas: el lienzo comparaba cada una con
    // todas en cada cuadro, justo lo que un procesador de 2 núcleos no aguanta
    if (!equipoLigero()) cuandoLibre(iniciarParticulas, { timeout: 1500 });
  };
}

// Partículas del fondo. Antes eran unas 180 (la densidad las multiplicaba
// según el tamaño del lienzo) a doble resolución, y las líneas entre ellas se
// calculan comparando cada una con todas: decenas de miles de cálculos por
// cuadro. Ahora son 45 a resolución normal, y se pausan mientras haces scroll
// (así el navegador solo mueve la página) y cuando la pestaña no se ve.
function iniciarParticulas() {
  if (typeof window.particlesJS === "undefined") {
    console.error("Error: particlesJS no está definido.");
    return;
  }
  window.particlesJS("particles-js", {
    particles: {
      number: { value: 45, density: { enable: false } },
      color: { value: "#87785e" }, // #646464 en sepia
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: "#534a3a" }, // #00594f en sepia
      move: { enable: true, speed: 4 },
    },
    interactivity: {
      events: { onhover: { enable: true, mode: "repulse" } },
      resize: true,
    },
    retina_detect: false,
  });

  const pjs = window.pJSDom?.[0]?.pJS;
  if (!pjs) return;
  let pausadas = false;
  const pausar = () => {
    if (pausadas) return;
    pausadas = true;
    pjs.particles.move.enable = false; // la librería deja de pedir cuadros
  };
  const reanudar = () => {
    if (!pausadas || document.hidden) return;
    pausadas = false;
    pjs.particles.move.enable = true;
    pjs.fn.vendors.draw();
  };
  let espera;
  window.addEventListener(
    "scroll",
    () => {
      pausar();
      clearTimeout(espera);
      espera = setTimeout(reanudar, 180);
    },
    { passive: true }
  );
  document.addEventListener("visibilitychange", () => (document.hidden ? pausar() : reanudar()));
}

// El scroll es el nativo del navegador: va en el hilo del compositor, sin
// esperar a JavaScript, y respeta la velocidad que tiene configurada cada
// persona (antes se interceptaba la rueda y bajaba más lento y con retraso).

function alPresionarTecla(e) {
  if (e.key === "Escape") cerrarVisor();
}

onMounted(() => {
  try {
    esMovil = matchMedia(MOVIL).matches;
    const guardado = localStorage.getItem("inmersivo");
    // En un equipo modesto empieza apagado, salvo que la persona lo haya encendido
    if (esMovil || guardado === "0" || (guardado === null && equipoLigero())) inmersivo.value = false;
  } catch {
    /* sin almacenamiento */
  }
  if (inmersivo.value) activarInmersivo();
  iniciarNavegacion(document.querySelector("header"));
  iniciarParallax();
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

      <figure class="bg-1" id="img-cl"><img src="/imagenes/Backfround.webp" alt="" decoding="async" /></figure>
      <figure class="bg-2"><img src="/imagenes/Letras2.webp" alt="" id="letras3" decoding="async" /></figure>

      <div class="scroll-cont">
        <HeroSection />
        <SobreMiSection :numero="num('sobreMi')" />
        <StackSection :numero="num('stack')" />
        <ServiciosSection :numero="num('servicios')" />
        <ProyectosSection :numero="num('proyectos')" />
        <ProcesoSection :numero="num('proceso')" />
        <TrayectoriaSection :numero="num('trayectoria')" />
        <CredencialesSection :numero="num('credenciales')" />
        <!-- Las guías viven en su propia página: /guias -->
        <!-- Carga diferida: el HTML llega ya armado, pero el JavaScript de estas
             secciones solo se descarga y se ejecuta cuando se acercan a la pantalla -->
        <LazyInvitacionGuias hydrate-on-visible />
        <LazyTestimoniosSection v-if="orden.includes('testimonios')" hydrate-on-visible :numero="num('testimonios')" />
        <LazyBlogSection v-if="orden.includes('blog')" hydrate-on-visible :numero="num('blog')" />
        <LazyFaqSection hydrate-on-visible :numero="num('faq')" />
        <LazyContactoFormulario hydrate-on-visible :numero="num('contacto')" />

        <!-- Zona para explorar: invitación al modo escritorio (la consola vive ahí) -->
        <LazyInvitacionEscritorio hydrate-on-visible />
      </div>
    </main>

    <LazyAppFooter hydrate-on-visible />
    <!-- Solo se descargan si se usan -->
    <LazyHudInmersivo v-if="inmersivo" />
  </div>

  <LazyDesktopSection v-if="modoEscritorio" @cerrar="modoEscritorio = false" />
</template>
