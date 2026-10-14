<script setup>
import { proyectos } from "~/data/proyectos";
import { reducirMovimiento } from "~/utils/motion";

// Los proyectos como un mazo: la escena queda fija y con el scroll cada
// proyecto sube desde abajo y se apila sobre el anterior, que se encoge, se
// oscurece y queda asomando detrás. Hay una pausa en cada proyecto: primero
// se centra uno y después llega el siguiente. La imagen se mueve más lento
// que su tarjeta (parallax) y la tarjeta activa se inclina con el puntero.
// En pantallas angostas o con movimiento reducido se ve como grilla.
defineProps({ numero: Number });

const N = proyectos.length;
const dos = (n) => String(n).padStart(2, "0");
const dominio = (url) => url?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "";

const enEscena = ref(false);
const activa = ref(0);
const pista = ref(null);
const escenario = ref(null);

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);

// ---------- Recorrido ----------

// El primer 35% de cada tramo la cámara se queda quieta sobre el proyecto
const PAUSA = 0.35;
function laminaPara(avance) {
  const lineal = limitar(avance) * (N - 1);
  const k = Math.floor(lineal);
  return k + suave(limitar((lineal - k - PAUSA) / (1 - PAUSA)));
}

function medirAvance() {
  const r = pista.value.getBoundingClientRect();
  return limitar(-r.top / (r.height - window.innerHeight));
}

// ---------- Bucle ----------

let actual = 0; // lámina activa, con decimales y suavizada
let alto = 700;
let ultimoCuadro = 0;
let cuadro = null;
let visible = false;
const puntero = { x: 0, y: 0, ox: 0, oy: 0 };

function animar(ahora) {
  const dt = Math.min((ahora - (ultimoCuadro || ahora)) / 1000, 0.1);
  ultimoCuadro = ahora;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  // Seguimiento críticamente amortiguado: llega sin pasarse ni rebotar
  const objetivo = laminaPara(medirAvance());
  actual += (objetivo - actual) * seguir(7);
  if (Math.abs(objetivo - actual) < 0.0005) actual = objetivo;
  puntero.ox += (puntero.x - puntero.ox) * seguir(5);
  puntero.oy += (puntero.y - puntero.oy) * seguir(5);

  const estilo = escenario.value.style;
  estilo.setProperty("--inc-x", (puntero.oy * -4).toFixed(2) + "deg");
  estilo.setProperty("--inc-y", (puntero.ox * 5).toFixed(2) + "deg");
  estilo.setProperty("--px", puntero.ox.toFixed(3));
  estilo.setProperty("--py", puntero.oy.toFixed(3));

  escenario.value.querySelectorAll("[data-lamina]").forEach((el) => {
    const i = +el.dataset.lamina;
    const rel = i - actual; // > 0: por llegar desde abajo; < 0: ya quedó detrás
    let y, s, rx, sombra, o, par;
    if (rel > 0) {
      // Sube desde abajo, inclinada hacia atrás, y se endereza al llegar
      const t = limitar(rel);
      y = t * alto * 1.02;
      s = 1;
      rx = t * 12;
      sombra = 0;
      o = 1;
      par = t;
    } else {
      // Detrás: se encoge, se oscurece y asoma por arriba
      const d = Math.min(-rel, 3);
      y = -d * 30;
      s = 1 - d * 0.055;
      rx = 0;
      sombra = Math.min(d, 1) * 0.55 + Math.max(d - 1, 0) * 0.15;
      o = 1 - limitar((d - 2.2) / 0.6);
      par = 0;
    }
    // Quieta al frente: sin transformación, para que el navegador la dibuje
    // nítida a resolución completa (una transformación la rasteriza borrosa)
    const enReposo = Math.abs(y) < 0.5 && Math.abs(rx) < 0.05 && Math.abs(s - 1) < 0.0005;
    el.style.transform = enReposo
      ? "none"
      : `translate3d(0, ${y.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    el.style.opacity = o.toFixed(3);
    el.style.visibility = rel > 1.01 || o < 0.01 ? "hidden" : "visible";
    el.style.setProperty("--sombra", sombra.toFixed(3));
    el.style.setProperty("--par", par.toFixed(3));
    el.classList.toggle("activa", Math.abs(rel) < 0.5);
  });

  const cercana = limitar(Math.round(actual), 0, N - 1);
  if (cercana !== activa.value) activa.value = cercana;

  cuadro = visible ? requestAnimationFrame(animar) : null;
  if (!cuadro) ultimoCuadro = 0;
}

function alMoverPuntero(evento) {
  const r = escenario.value.getBoundingClientRect();
  puntero.x = ((evento.clientX - r.left) / r.width - 0.5) * 2;
  puntero.y = ((evento.clientY - r.top) / r.height - 0.5) * 2;
}
function alSalirPuntero() {
  puntero.x = 0;
  puntero.y = 0;
}

// ---------- Montaje ----------

let observador;
let redimension;
let consulta;

function activar() {
  enEscena.value = consulta.matches && !reducirMovimiento();
  nextTick(() => {
    if (!enEscena.value) return;
    alto = escenario.value.offsetHeight;
    actual = laminaPara(medirAvance());
    if (visible && !cuadro) cuadro = requestAnimationFrame(animar);
  });
}

onMounted(() => {
  consulta = matchMedia("(min-width: 901px)");
  consulta.addEventListener("change", activar);
  activar();

  observador = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting && enEscena.value;
    if (visible && !cuadro) cuadro = requestAnimationFrame(animar);
  });
  observador.observe(pista.value);

  // También mide al terminar la pantalla de carga, que oculta la escena al montarse
  redimension = new ResizeObserver(() => {
    if (enEscena.value && escenario.value?.offsetHeight) alto = escenario.value.offsetHeight;
  });
  redimension.observe(pista.value);
});

onBeforeUnmount(() => {
  observador?.disconnect();
  redimension?.disconnect();
  consulta?.removeEventListener("change", activar);
  if (cuadro) cancelAnimationFrame(cuadro);
});
</script>

<template>
  <section id="mis-proyectos" class="proyectos">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Proyectos"
      titulo="Ideas que ya"
      destacado="son realidad."
      intro="Tiendas en línea, sitios web, aplicaciones y hasta tours 360°. Esto es lo que he construido."
    />

    <div ref="pista" class="proyectos-pista" :class="{ 'en-escena': enEscena }" :style="{ '--proyectos': N }">
      <!-- Escena: mazo de proyectos -->
      <div
        v-if="enEscena"
        ref="escenario"
        class="proyectos-escenario"
        @pointermove="alMoverPuntero"
        @pointerleave="alSalirPuntero"
      >
        <!-- Progreso del mazo -->
        <div class="proyectos-progreso" aria-hidden="true">
          <span class="proyectos-progreso-cuenta">{{ dos(activa + 1) }} <i>/ {{ dos(N) }}</i></span>
          <span class="proyectos-progreso-barra">
            <span
              v-for="(p, i) in proyectos"
              :key="p.nombre"
              :class="{ hecho: i < activa, activo: i === activa }"
              :style="{ '--tono': p.tono }"
            ></span>
          </span>
        </div>

        <article
          v-for="(proyecto, i) in proyectos"
          :key="proyecto.nombre"
          class="proyecto-lamina"
          :data-lamina="i"
          :style="{ '--tono': proyecto.tono, zIndex: i + 1 }"
          :aria-hidden="activa !== i"
        >
          <div class="lamina-contenido">
            <div class="lamina-texto">
              <span class="lamina-numero" aria-hidden="true">{{ dos(i + 1) }}</span>
              <p class="lamina-tipo">
                <IconoLinea :nombre="proyecto.icono" class="lamina-icono" />{{ proyecto.tipo }}
              </p>
              <h3>{{ proyecto.nombre }}</h3>
              <p class="lamina-descripcion">{{ proyecto.descripcion }}</p>
              <a
                v-if="proyecto.enlace"
                :href="proyecto.enlace"
                target="_blank"
                rel="noopener"
                class="lamina-enlace"
                :tabindex="activa === i ? 0 : -1"
                >Ver proyecto<span aria-hidden="true"> ↗</span></a
              >
            </div>

            <!-- Captura dentro de una ventana de navegador -->
            <div class="lamina-visual">
              <div class="lamina-navegador">
                <div class="lamina-barra" aria-hidden="true">
                  <i></i><i></i><i></i>
                  <span>{{ dominio(proyecto.enlace) || proyecto.nombre.toLowerCase() }}</span>
                </div>
                <div class="lamina-imagen">
                  <img :src="proyecto.imagen" :alt="`Vista de ${proyecto.nombre}`" loading="lazy" draggable="false" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Grilla (pantallas angostas o movimiento reducido) -->
      <div v-else class="proyectos-grid">
        <article
          v-for="proyecto in proyectos"
          :key="proyecto.nombre"
          class="proyecto-tarjeta"
          :class="{ 'proyecto-destacado': proyecto.destacado }"
          :style="{ '--tono': proyecto.tono }"
        >
          <img :src="proyecto.imagen" :alt="`Vista de ${proyecto.nombre}`" class="proyecto-captura" loading="lazy" />
          <IconoLinea :nombre="proyecto.icono" class="proyecto-icono" />

          <div class="proyecto-texto">
            <p class="proyecto-tipo">{{ proyecto.tipo }}</p>
            <h3>{{ proyecto.nombre }}</h3>
            <p class="proyecto-descripcion">{{ proyecto.descripcion }}</p>
            <a
              v-if="proyecto.enlace"
              :href="proyecto.enlace"
              target="_blank"
              rel="noopener"
              class="proyecto-enlace"
              >Ver proyecto<span aria-hidden="true"> ›</span></a
            >
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
