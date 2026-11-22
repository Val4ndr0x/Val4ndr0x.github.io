<script setup>
import { servicios } from "~/data/perfil";
import { reducirMovimiento, equipoLigero, desenfoque, medidorPista, crearBucle, acercar } from "~/utils/motion";

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
// La escena 3D solo existe en el DOM mientras la pista está a menos de una
// pantalla: lejos de ella se desmonta y suelta sus capas de la tarjeta
// gráfica (en un equipo de 2 GB esa memoria es la que se agota)
const cerca = ref(false);
// Equipo modesto: sin suelo, sin ciudad, sin sombras de luz y sin cámara
const ligero = ref(false);
const pista = ref(null);
const escenario = ref(null);
const mundo = ref(null);
const suelo = ref(null);
const destello = ref(null);
const final = ref(null);

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
// Punto de lectura de cada servicio: la información completa y lo que obtiene
// ya construido. Ahí hay un imán de scroll (scroll-snap por proximidad): si se
// baja rápido, el navegador proyecta el impulso y se detiene en el servicio
// más cercano en vez de pasarlo de largo
const LECTURA = 0.86;
const anclas = [...servicios.map((_, i) => i + LECTURA), N + FINAL].map((l) => l / (N + FINAL));
const ancla = []; // elementos de los imanes (no reactivo: solo se usan al hacer clic)

// Ir directo a un servicio desde el índice, sin tener que volver con el scroll
function irA(i) {
  ancla[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
}

let medidor = null;
const medirAvance = () => medidor.avance();

// ---------- Bucle ----------

let lineal = 0; // posición en el viaje (misión + fracción), suavizada
let ancho = 1200;
let alto = 700;
let visible = false;
let portales = [];
let entregas = [];
let ultimoFinal = -1;
const puntero = { x: 0, ox: 0 };
const bucle = crearBucle(animar);

function animar(dt) {
  if (!mundo.value) return false;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  const objetivo = medirAvance() * (N + FINAL);
  // Respuesta rápida (~0.25 s): el viaje sigue al scroll sin sentirse pegajoso
  lineal = acercar(lineal, objetivo, seguir(10));
  puntero.ox = acercar(puntero.ox, puntero.x, seguir(4), 0.001);

  const m = Math.min(Math.floor(lineal), N);
  const t = m < N ? lineal - m : 0;
  const tFinal = m >= N ? limitar((lineal - N) / FINAL) : 0;
  const andar = m < N ? limitar(t / CRUCE) : 1;

  // Cámara en tercera persona: el mundo gira un poco con el puntero
  if (!ligero.value) mundo.value.style.transform = `rotateY(${(puntero.ox * 3).toFixed(2)}deg)`;

  // El suelo avanza solo mientras se vuela hacia el portal
  if (suelo.value) {
    const distancia = Math.min(m, N) + andar;
    // La rejilla se repite cada 200px: desplazarla 0–200px con transform se ve
    // igual que mover el fondo, pero sin repintar el plano gigante del suelo
    const desfase = (distancia * 1600) % 200;
    suelo.value.style.transform = `translate3d(0, ${(-desfase).toFixed(1)}px, 0)`;
  }


  // Portales: el de la misión se acerca y se cruza; el siguiente espera al fondo
  portales.forEach(({ el, i }) => {
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
  // Tenue: es un acento, no debe robarle la mirada a la información
  destello.value.style.opacity = (brillo * 0.28).toFixed(3);

  // Lo que obtiene: se materializa delante y luego vuela al inventario
  entregas.forEach(({ el, i }) => {
    if (i !== m) {
      if (el.style.visibility !== "hidden") {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
      return;
    }
    const e = suave(limitar((t - CRUCE) / APARECE));
    const g = suave(limitar((t - GUARDA) / (1 - GUARDA)));
    // Sin desenfoque: llega desde el fondo y se aclara (solo transform y opacity,
    // que el compositor mueve sin repintar)
    const z = -1500 + 1300 * e;
    const x = -g * ancho * 0.5;
    const y = g * alto * 0.42;
    el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${(1 - g * 0.85).toFixed(3)})`;
    el.style.opacity = (e * (1 - g * 0.8)).toFixed(3);
    el.style.visibility = e < 0.01 || g > 0.99 ? "hidden" : "visible";
  });

  // Estado del juego
  const nuevosPasos = m < N ? OBJETIVOS.filter((p) => t >= p).length : 3;
  const nuevosObtenidos = m < N ? m + (t >= OBTENIDO ? 1 : 0) : N;
  if (m !== mision.value) mision.value = m;
  if (nuevosPasos !== pasos.value) pasos.value = nuevosPasos;
  if (nuevosObtenidos !== obtenidos.value) obtenidos.value = nuevosObtenidos;

  // Final: se escribe en el propio elemento. Antes era una variable en el
  // escenario, que obligaba a recalcular los estilos de toda la escena
  if (tFinal !== ultimoFinal) {
    ultimoFinal = tFinal;
    const f = suave(tFinal);
    final.value.style.opacity = f.toFixed(3);
    final.value.style.transform = `translate3d(-50%, ${((1 - f) * 30).toFixed(1)}px, 0) scale(${(0.96 + f * 0.04).toFixed(4)})`;
    final.value.style.filter = desenfoque((1 - f) * 8);
  }

  // Quieto: el bucle se duerme hasta el próximo scroll o movimiento del puntero
  return lineal !== objetivo || puntero.ox !== puntero.x;
}

function alMoverPuntero(evento) {
  if (ligero.value) return;
  const r = escenario.value.getBoundingClientRect();
  puntero.x = ((evento.clientX - r.left) / r.width - 0.5) * 2;
  bucle.despertar();
}
function alSalirPuntero() {
  puntero.x = 0;
  bucle.despertar();
}

// ---------- Montaje ----------

let observador;
let observadorCerca;
let redimension;
let consulta;

function medir() {
  ancho = escenario.value.offsetWidth;
  alto = escenario.value.offsetHeight;
}

// Toma las piezas de la escena recién montada
function preparar() {
  if (!mundo.value) {
    portales = [];
    entregas = [];
    return;
  }
  medir();
  const lista = (atributo) =>
    [...mundo.value.querySelectorAll(`[data-${atributo}]`)].map((el) => ({ el, i: +el.dataset[atributo] }));
  portales = lista("portal");
  entregas = lista("entrega");
  ultimoFinal = -1;
  lineal = medirAvance() * (N + FINAL);
  bucle.despertar();
}

function activar() {
  enEscena.value = consulta.matches && !reducirMovimiento();
  nextTick(() => {
    if (!enEscena.value) {
      visible = false;
      bucle.activar(false);
      return;
    }
    medidor.invalidar();
    preparar();
    bucle.activar(visible);
  });
}

watch(cerca, () => nextTick(preparar));

onMounted(() => {
  medidor = medidorPista(pista.value);
  ligero.value = equipoLigero();
  consulta = matchMedia("(min-width: 901px)");
  consulta.addEventListener("change", activar);
  activar();

  // Arranca un poco antes de que la escena asome (ver ProyectosSection)
  observador = new IntersectionObserver(
    ([entrada]) => {
      visible = entrada.isIntersecting && enEscena.value;
      bucle.activar(visible);
    },
    { rootMargin: "25% 0px" }
  );
  observador.observe(pista.value);

  observadorCerca = new IntersectionObserver(
    ([entrada]) => {
      cerca.value = entrada.isIntersecting;
      // El imán de scroll solo existe mientras se está cerca de esta escena
      document.documentElement.classList.toggle("iman-servicios", cerca.value && enEscena.value);
    },
    { rootMargin: "100% 0px" }
  );
  observadorCerca.observe(pista.value);

  redimension = new ResizeObserver(() => enEscena.value && escenario.value?.offsetWidth && medir());
  redimension.observe(pista.value);
});

onBeforeUnmount(() => {
  observador?.disconnect();
  observadorCerca?.disconnect();
  document.documentElement.classList.remove("iman-servicios");
  redimension?.disconnect();
  consulta?.removeEventListener("change", activar);
  bucle.detener();
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
      <!-- Escena: viaje en tercera persona (montada solo cerca de la pantalla) -->
      <template v-if="enEscena">
      <span
        v-for="(p, i) in anclas"
        :key="'ancla-' + i"
        :ref="(el) => (ancla[i] = el)"
        class="serv-ancla"
        :style="{ '--p': p }"
        aria-hidden="true"
      ></span>
      <div
        v-if="cerca"
        ref="escenario"
        class="servicios-escenario"
        :class="{ 'en-final': mision >= N, ligero }"
        :style="{ '--tono': servicios[Math.min(mision, N - 1)].tono }"
        @pointermove="alMoverPuntero"
        @pointerleave="alSalirPuntero"
      >
        <div class="serv-cielo" aria-hidden="true">
          <!-- Un resplandor por misión: se funden con opacity (compositor) en vez
               de animar un color que repintaba todo el mundo en cada cuadro -->
          <span
            v-for="(servicio, i) in servicios"
            :key="'brillo-' + servicio.titulo"
            class="serv-brillo"
            :class="{ activo: Math.min(mision, N - 1) === i }"
            :style="{ '--tono-s': servicio.tono }"
          ></span>
        </div>

        <!-- Ciudad en el horizonte -->
        <svg v-if="!ligero" class="serv-ciudad" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 200V150h40v-30h30v50h50V90h20v-20h30v20h20v110h40v-60h60v-40h30v100h40V60h50v140h30v-80h70v-30h20v110h50V100h30V70h40v130h60v-90h40v-40h30v40h20v90h50v-70h60v-60h40v130h30V80h20V50h40v150h60v-90h50v90h40v-120h30v-30h40v150h50v-70h70v-50h30v120h60v-100h40v100h50V140h40v60z"
          />
        </svg>

        <div ref="mundo" class="serv-mundo">
          <div v-if="!ligero" class="serv-suelo" aria-hidden="true"><div ref="suelo" class="serv-suelo-rejilla"></div></div>

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

        <!-- Información del servicio: lo principal de la escena -->
        <div class="serv-mision">
          <!-- Índice: saber dónde estás y saltar a cualquier servicio -->
          <nav class="serv-indice" aria-label="Servicios">
            <button
              v-for="(servicio, i) in servicios"
              :key="'indice-' + servicio.titulo"
              type="button"
              :class="{ activo: mision === i, visto: obtenidos > i }"
              :style="{ '--tono-s': servicio.tono }"
              :aria-current="mision === i ? 'step' : undefined"
              @click="irA(i)"
            >
              <span>{{ dos(i + 1) }}</span>{{ servicio.titulo }}
            </button>
          </nav>
          <Transition name="ficha-serv" mode="out-in">
            <div v-if="mision < N" :key="mision" aria-live="polite">
              <p class="serv-mision-etiqueta">Servicio {{ dos(mision + 1) }} / {{ dos(N) }}</p>
              <h3>{{ servicios[mision].titulo }}</h3>
              <p class="serv-mision-texto">{{ servicios[mision].descripcion }}</p>
              <ul>
                <li v-for="(item, j) in servicios[mision].incluye" :key="item" :class="{ hecho: pasos > j }">
                  <span class="serv-check" aria-hidden="true"></span>{{ item }}
                </li>
              </ul>
            </div>
            <div v-else key="final">
              <p class="serv-mision-etiqueta">Servicios completos</p>
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
        <div ref="final" class="serv-final">
          <p class="serv-mision-etiqueta">Recompensa desbloqueada</p>
          <h3>Ya tienes lo que <span class="seccion-destacado">buscabas.</span></h3>
          <p>Diseño, sitio y aplicación: del primer boceto al producto en línea.</p>
          <a href="#contacto" class="serv-final-boton" :tabindex="mision >= N ? 0 : -1">Empecemos tu proyecto<span aria-hidden="true"> →</span></a>
        </div>
      </div>
      </template>

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
