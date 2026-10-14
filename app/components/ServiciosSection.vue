<script setup>
import { servicios } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// Los servicios como un viaje en tercera persona por un mundo en perspectiva:
// el camino avanza hacia cada portal (un servicio). Al cruzarlo, delante se
// construye lo que el visitante obtiene, paso a
// paso según lo que incluye el servicio, y la recompensa vuela al inventario.
// Al final, con todo en el inventario, se invita a escribir.
// En pantallas angostas o con movimiento reducido se ve como grilla.
defineProps({ numero: Number });

const N = servicios.length;
const dos = (n) => String(n).padStart(2, "0");

const enEscena = ref(false);
const pista = ref(null);
const escenario = ref(null);
const mundo = ref(null);
const suelo = ref(null);
const destello = ref(null);

// Estado del juego (solo cambia en momentos puntuales)
const mision = ref(0); // servicio en curso; N = final
const pasos = ref(0); // objetivos cumplidos de la misión en curso (0..3)
const obtenidos = ref(0); // recompensas en el inventario

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);

// ---------- Fases de cada misión (fracción del tramo de scroll) ----------
const CRUCE = 0.42; // se llega al portal y se cruza
const APARECE = 0.13; // lo que obtiene se materializa
const OBJETIVOS = [0.58, 0.7, 0.82]; // cada objetivo cumplido
const OBTENIDO = 0.9; // la recompensa entra al inventario
const GUARDA = 0.93; // la recompensa vuela al inventario
const FINAL = 0.6; // largo del tramo final

function medirAvance() {
  const r = pista.value.getBoundingClientRect();
  return limitar(-r.top / (r.height - window.innerHeight));
}

// ---------- Bucle ----------

let lineal = 0; // posición en el viaje (misión + fracción), suavizada
let ancho = 1200;
let alto = 700;
let ultimoCuadro = 0;
let cuadro = null;
let visible = false;
const puntero = { x: 0, ox: 0 };

function animar(ahora) {
  const dt = Math.min((ahora - (ultimoCuadro || ahora)) / 1000, 0.1);
  ultimoCuadro = ahora;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  const objetivo = medirAvance() * (N + FINAL);
  lineal += (objetivo - lineal) * seguir(6);
  if (Math.abs(objetivo - lineal) < 0.0005) lineal = objetivo;
  puntero.ox += (puntero.x - puntero.ox) * seguir(4);

  const m = Math.min(Math.floor(lineal), N);
  const t = m < N ? lineal - m : 0;
  const tFinal = m >= N ? limitar((lineal - N) / FINAL) : 0;
  const andar = m < N ? limitar(t / CRUCE) : 1;

  // Cámara en tercera persona: el mundo gira un poco con el puntero
  mundo.value.style.transform = `rotateY(${(puntero.ox * 3).toFixed(2)}deg)`;

  // El suelo avanza solo mientras se vuela hacia el portal
  const distancia = Math.min(m, N) + andar;
  suelo.value.style.backgroundPosition = `0 ${(-distancia * 1600).toFixed(1)}px`;


  // Portales: el de la misión se acerca y se cruza; el siguiente espera al fondo
  mundo.value.querySelectorAll("[data-portal]").forEach((el) => {
    const i = +el.dataset.portal;
    let z;
    let o;
    if (i < m) {
      z = 400;
      o = 0;
    } else if (i === m) {
      z = -3200 + 3400 * andar;
      o = limitar((z + 4200) / 1000) * (1 - limitar((andar - 0.9) / 0.08));
    } else {
      // Los que vienen, pequeños en el horizonte (solo después de cruzar el actual)
      z = -3200 - (i - m) * 1400;
      o = m < N && andar >= 1 ? 0.5 * limitar((t - CRUCE) / 0.2) * (i === m + 1 ? 1 : 0) : 0;
    }
    el.style.transform = `translate3d(-50%, 0, ${z.toFixed(1)}px)`;
    el.style.opacity = o.toFixed(3);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
  });

  // Destello al cruzar
  const brillo = m < N ? Math.max(0, 1 - Math.abs(t - CRUCE) / 0.05) : 0;
  destello.value.style.opacity = (brillo * 0.5).toFixed(3);

  // Lo que obtiene: se materializa delante y luego vuela al inventario
  mundo.value.querySelectorAll("[data-entrega]").forEach((el) => {
    const i = +el.dataset.entrega;
    if (i !== m) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }
    const e = suave(limitar((t - CRUCE) / APARECE));
    const g = suave(limitar((t - GUARDA) / (1 - GUARDA)));
    const z = -1500 + 1300 * e;
    const x = -g * ancho * 0.36;
    const y = g * alto * 0.42;
    el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${(1 - g * 0.85).toFixed(3)})`;
    el.style.opacity = (e * (1 - g * 0.8)).toFixed(3);
    el.style.filter = e < 0.98 ? `blur(${((1 - e) * 12).toFixed(1)}px)` : "none";
    el.style.visibility = e < 0.01 || g > 0.99 ? "hidden" : "visible";
  });

  // Estado del juego
  const nuevosPasos = m < N ? OBJETIVOS.filter((p) => t >= p).length : 3;
  const nuevosObtenidos = m < N ? m + (t >= OBTENIDO ? 1 : 0) : N;
  if (m !== mision.value) mision.value = m;
  if (nuevosPasos !== pasos.value) pasos.value = nuevosPasos;
  if (nuevosObtenidos !== obtenidos.value) obtenidos.value = nuevosObtenidos;

  escenario.value.style.setProperty("--final", tFinal.toFixed(3));

  cuadro = visible ? requestAnimationFrame(animar) : null;
  if (!cuadro) ultimoCuadro = 0;
}

function alMoverPuntero(evento) {
  const r = escenario.value.getBoundingClientRect();
  puntero.x = ((evento.clientX - r.left) / r.width - 0.5) * 2;
}
function alSalirPuntero() {
  puntero.x = 0;
}

// ---------- Montaje ----------

let observador;
let redimension;
let consulta;

function medir() {
  ancho = escenario.value.offsetWidth;
  alto = escenario.value.offsetHeight;
}

function activar() {
  enEscena.value = consulta.matches && !reducirMovimiento();
  nextTick(() => {
    if (!enEscena.value) return;
    medir();
    lineal = medirAvance() * (N + FINAL);
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

  redimension = new ResizeObserver(() => enEscena.value && escenario.value?.offsetWidth && medir());
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
  <section id="servicios" class="seccion servicios">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Servicios"
      titulo="Lo que puedo"
      destacado="hacer por ti."
      intro="Desde la primera idea hasta el producto publicado."
    />

    <div ref="pista" class="servicios-pista" :class="{ 'en-escena': enEscena }" :style="{ '--misiones': N }">
      <!-- Escena: viaje en tercera persona -->
      <div
        v-if="enEscena"
        ref="escenario"
        class="servicios-escenario"
        :class="{ 'en-final': mision >= N }"
        :style="{ '--tono-mision': servicios[Math.min(mision, N - 1)].tono }"
        @pointermove="alMoverPuntero"
        @pointerleave="alSalirPuntero"
      >
        <div class="serv-cielo" aria-hidden="true"></div>

        <!-- Ciudad en el horizonte -->
        <svg class="serv-ciudad" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 200V150h40v-30h30v50h50V90h20v-20h30v20h20v110h40v-60h60v-40h30v100h40V60h50v140h30v-80h70v-30h20v110h50V100h30V70h40v130h60v-90h40v-40h30v40h20v90h50v-70h60v-60h40v130h30V80h20V50h40v150h60v-90h50v90h40v-120h30v-30h40v150h50v-70h70v-50h30v120h60v-100h40v100h50V140h40v60z"
          />
        </svg>

        <div ref="mundo" class="serv-mundo">
          <div ref="suelo" class="serv-suelo" aria-hidden="true"></div>

          <!-- Portales: uno por servicio -->
          <div
            v-for="(servicio, i) in servicios"
            :key="'portal-' + servicio.titulo"
            class="serv-portal"
            :data-portal="i"
            :style="{ '--tono-s': servicio.tono }"
            aria-hidden="true"
          >
            <div class="serv-portal-marco">
              <IconoLinea :nombre="servicio.icono" class="serv-portal-icono" />
              <span>{{ servicio.titulo }}</span>
            </div>
          </div>

          <!-- Lo que obtiene en cada misión, construido paso a paso -->
          <div
            v-for="(servicio, i) in servicios"
            :key="'entrega-' + servicio.titulo"
            class="serv-entrega"
            :class="[`serv-entrega--${i}`, `paso-${mision === i ? pasos : 0}`]"
            :data-entrega="i"
            :style="{ '--tono-s': servicio.tono }"
            aria-hidden="true"
          >
            <!-- Diseño UX/UI: flujos → wireframes → prototipo -->
            <div v-if="i === 0" class="ent-telefono">
              <div class="ent-flujo">
                <i></i><b></b><i></i><b></b><i></i>
              </div>
              <div class="ent-wire">
                <span class="w-img"></span>
                <span class="w-linea"></span>
                <span class="w-linea corta"></span>
                <span class="w-boton"></span>
              </div>
              <span class="ent-toque"></span>
            </div>

            <!-- Sitio web: diseño → móvil → publicado -->
            <div v-else-if="i === 1" class="ent-sitio">
              <div class="ent-navegador">
                <div class="ent-barra"><i></i><i></i><i></i><span>tusitio.com</span></div>
                <div class="ent-hero">
                  <span class="h-titulo"></span>
                  <span class="h-texto"></span>
                  <span class="h-boton"></span>
                </div>
              </div>
              <div class="ent-movil"><span></span><span></span><span></span></div>
              <span class="ent-publicado"><i></i>En línea</span>
            </div>

            <!-- Aplicación web: Vue/Nuxt → CRUD → base de datos -->
            <div v-else class="ent-app">
              <div class="ent-panel">
                <div class="ent-lateral"><span class="ent-logo">V</span><i></i><i></i><i></i></div>
                <div class="ent-tabla">
                  <span v-for="n in 4" :key="n" class="fila"><i></i><b></b><em>Editar</em></span>
                  <span class="ent-agregar">+ Agregar</span>
                </div>
              </div>
              <div class="ent-bd">
                <svg viewBox="0 0 40 48"><ellipse cx="20" cy="8" rx="16" ry="6" /><path d="M4 8v32c0 3.3 7.2 6 16 6s16-2.7 16-6V8" /><path d="M4 24c0 3.3 7.2 6 16 6s16-2.7 16-6" /></svg>
                <span>Conectada</span>
              </div>
            </div>
          </div>
        </div>

        <div ref="destello" class="serv-destello" aria-hidden="true"></div>

        <!-- HUD: misión en curso -->
        <div class="serv-mision" aria-live="polite">
          <Transition name="ficha" mode="out-in">
            <div v-if="mision < N" :key="mision">
              <p class="serv-mision-etiqueta">Misión {{ dos(mision + 1) }} / {{ dos(N) }}</p>
              <h3>{{ servicios[mision].titulo }}</h3>
              <p class="serv-mision-texto">{{ servicios[mision].descripcion }}</p>
              <ul>
                <li v-for="(item, j) in servicios[mision].incluye" :key="item" :class="{ hecho: pasos > j }">
                  <span class="serv-check" aria-hidden="true"></span>{{ item }}
                </li>
              </ul>
            </div>
            <div v-else key="final">
              <p class="serv-mision-etiqueta">Misiones completas</p>
              <h3>Todo listo</h3>
            </div>
          </Transition>
        </div>

        <!-- HUD: inventario -->
        <div class="serv-inventario">
          <p>Inventario</p>
          <div>
            <span
              v-for="(servicio, i) in servicios"
              :key="'slot-' + servicio.titulo"
              class="serv-slot"
              :class="{ lleno: obtenidos > i }"
              :style="{ '--tono-s': servicio.tono }"
              :title="servicio.titulo"
            >
              <IconoLinea :nombre="servicio.icono" />
            </span>
          </div>
        </div>

        <p class="serv-indicacion" :class="{ oculta: mision > 0 || pasos > 0 }" aria-hidden="true">
          Desplázate para avanzar
        </p>

        <!-- Final -->
        <div class="serv-final">
          <p class="serv-mision-etiqueta">Recompensa desbloqueada</p>
          <h3>Ya tienes lo que <span class="seccion-destacado">buscabas.</span></h3>
          <p>Diseño, sitio y aplicación: del primer boceto al producto en línea.</p>
          <a href="#contacto" class="serv-final-boton" :tabindex="mision >= N ? 0 : -1">Empecemos tu proyecto<span aria-hidden="true"> →</span></a>
        </div>
      </div>

      <!-- Grilla (pantallas angostas o movimiento reducido) -->
      <div v-else class="servicios-grid">
        <article
          v-for="servicio in servicios"
          :key="servicio.titulo"
          class="proyecto-tarjeta servicio-tarjeta"
          :style="{ '--tono': servicio.tono }"
        >
          <IconoLinea :nombre="servicio.icono" class="proyecto-icono" />
          <div class="proyecto-texto">
            <h3>{{ servicio.titulo }}</h3>
            <p class="proyecto-descripcion">{{ servicio.descripcion }}</p>
            <ul class="servicio-incluye">
              <li v-for="item in servicio.incluye" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
