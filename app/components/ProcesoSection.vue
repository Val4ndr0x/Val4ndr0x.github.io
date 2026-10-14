<script setup>
import { proceso } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// El proceso como un viaje por el espacio: la escena queda fija y el scroll
// mueve una cámara hacia adelante. Cada paso llega desde el fondo, se detiene
// nítido en el centro y pasa junto a la cámara. Detrás, un campo de estrellas
// con perspectiva real que se estira con la velocidad del scroll.
// En pantallas angostas o con movimiento reducido se ve como una lista.
defineProps({ numero: Number });

const N = proceso.length;
const dos = (n) => String(n).padStart(2, "0");

const pista = ref(null);
const escenario = ref(null);
const lienzo = ref(null);
const pasos = ref([]);
const enEspacio = ref(false);
const activo = ref(0);

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);

// ---------- Recorrido ----------

// Posición de la cámara según el avance del scroll (0..1). Entre paso y paso
// hay una pausa: el primer 35% de cada tramo la cámara se queda quieta.
const PAUSA = 0.35;
const INICIO = -0.6;
const LARGO = N - 1 + 0.75;
function camaraPara(avance) {
  const lineal = INICIO + avance * LARGO;
  const k = Math.floor(lineal);
  return k + suave(limitar((lineal - k - PAUSA) / (1 - PAUSA)));
}
// Avance del scroll en el que el paso i queda al centro (mitad de su pausa)
const avancePara = (i) => (i + PAUSA / 2 - INICIO) / LARGO;

// ---------- Estado animado ----------

let camara = INICIO; // posición suavizada que se dibuja
let objetivo = INICIO;
let velocidad = 0; // pasos por segundo
let ultimoCuadro = 0;
const inclinacion = { x: 0, y: 0, ox: 0, oy: 0 };
let cuadro = null;
let visible = false;

function medirAvance() {
  const r = pista.value.getBoundingClientRect();
  return limitar(-r.top / (r.height - window.innerHeight));
}

// Cada paso según su distancia a la cámara (rel > 0: adelante; < 0: ya pasó)
function colocarPasos() {
  pasos.value.forEach((el, i) => {
    const rel = i - camara;
    const lado = i % 2 ? 1 : -1;
    let z, o, b;
    if (rel >= 0) {
      // El que viene se ve tenue a lo lejos y toma presencia al acercarse
      z = -rel * 1400;
      o = 1 - limitar(rel / 1.1) * 0.75 - limitar((rel - 1.1) / 0.6) * 0.25;
      b = Math.min(rel * 8, 14);
    } else {
      // Al pasar, se acerca rápido y se desvanece (los objetos grandes en
      // movimiento van semitransparentes)
      z = -rel * 900;
      o = 1 - limitar(-rel / 0.45);
      b = Math.min(-rel * 22, 14);
    }
    // El camino se curva: los pasos lejanos esperan a un lado y se centran al llegar
    const x = lado * Math.min(Math.abs(rel), 1.6) * anchoCss * 0.6;
    const y = Math.max(rel, 0) * altoCss * -0.12;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
    el.style.opacity = o.toFixed(3);
    el.style.filter = b > 0.2 ? `blur(${b.toFixed(1)}px)` : "none";
    el.style.zIndex = String(100 - i);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
  });
  activo.value = limitar(Math.round(camara), 0, N - 1);
}

// ---------- Campo de estrellas ----------

const ESTRELLAS = 360;
const PROFUNDIDAD = 3000; // px de recorrido por paso en el campo de estrellas
let estrellas = [];
let ctx = null;
let ancho = 0;
let alto = 0;
let ppp = 1;
// Tamaño de la escena en px de CSS (sin el zoom de --escala), para los pasos
let anchoCss = 1200;
let altoCss = 800;

function crearEstrellas() {
  estrellas = Array.from({ length: ESTRELLAS }, () => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: Math.random(), // 0 = junto a la cámara, 1 = al fondo
    t: Math.random(), // tamaño relativo
  }));
}

function ajustarLienzo() {
  const c = lienzo.value;
  const r = c.getBoundingClientRect();
  ppp = Math.min(window.devicePixelRatio || 1, 2);
  ancho = r.width;
  alto = r.height;
  c.width = Math.round(ancho * ppp);
  c.height = Math.round(alto * ppp);
  ctx = c.getContext("2d");
  anchoCss = escenario.value.offsetWidth;
  altoCss = escenario.value.offsetHeight;
}

let camaraEstrellas = 0;
function dibujarEstrellas(paso) {
  if (!ctx) return;
  ctx.setTransform(ppp, 0, 0, ppp, 0, 0);
  ctx.clearRect(0, 0, ancho, alto);
  camaraEstrellas += paso;
  const tono = proceso[activo.value].tono;
  const cx = ancho / 2 + inclinacion.oy * 14;
  const cy = alto / 2 - inclinacion.ox * 14;
  const foco = Math.max(ancho, alto) * 0.28;
  // Estela proporcional a la velocidad: el movimiento rápido se lee como rastro
  const estela = limitar(Math.abs(velocidad) * 0.1, 0, 0.3);

  for (const e of estrellas) {
    // Profundidad relativa a la cámara, repetida para un campo infinito
    let z = (((e.z - camaraEstrellas / PROFUNDIDAD) % 1) + 1) % 1;
    z = 0.02 + z * 0.98;
    const px = cx + (e.x * foco) / z;
    const py = cy + (e.y * foco) / z;
    if (px < -20 || px > ancho + 20 || py < -20 || py > alto + 20) continue;
    const brillo = limitar((1 - z) * 1.6) * limitar(z * 8);
    const r = (0.6 + e.t * 1.6) * (1.5 - z) * (ancho / anchoCss);

    ctx.globalAlpha = estela > 0.01 ? brillo * 0.7 : brillo;
    ctx.strokeStyle = e.t > 0.85 ? tono : "#f5f5f7";
    ctx.fillStyle = ctx.strokeStyle;
    if (estela > 0.01) {
      const zAtras = Math.min(1, z + estela * Math.sign(velocidad));
      ctx.lineWidth = r * 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(cx + (e.x * foco) / zAtras, cy + (e.y * foco) / zAtras);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- Bucle ----------

function animar(ahora) {
  // Todo depende del tiempo real, no de los cuadros: igual a 60 o 120 Hz
  const dt = Math.min((ahora - (ultimoCuadro || ahora)) / 1000, 0.1);
  ultimoCuadro = ahora;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  objetivo = camaraPara(medirAvance());
  // Seguimiento críticamente amortiguado: llega sin pasarse ni rebotar
  const antes = camara;
  camara += (objetivo - camara) * seguir(7.5);
  if (Math.abs(objetivo - camara) < 0.0005) camara = objetivo;
  velocidad = dt > 0 ? (camara - antes) / dt : 0;

  inclinacion.ox += (inclinacion.x - inclinacion.ox) * seguir(5);
  inclinacion.oy += (inclinacion.y - inclinacion.oy) * seguir(5);
  // Inclinación de la escena y desplazamiento por capas (cada capa a su profundidad)
  const estilo = escenario.value.style;
  estilo.setProperty("--inc-x", inclinacion.ox.toFixed(3) + "deg");
  estilo.setProperty("--inc-y", inclinacion.oy.toFixed(3) + "deg");
  estilo.setProperty("--px", (inclinacion.oy / 8).toFixed(4));
  estilo.setProperty("--py", (-inclinacion.ox / 6).toFixed(4));

  colocarPasos();
  // Las estrellas avanzan siempre un poco (deriva) y mucho más con el scroll
  dibujarEstrellas((velocidad * PROFUNDIDAD + 36) * dt);
  cuadro = visible ? requestAnimationFrame(animar) : null;
  if (!cuadro) ultimoCuadro = 0;
}

function alMoverPuntero(evento) {
  const r = escenario.value.getBoundingClientRect();
  inclinacion.x = -((evento.clientY - r.top) / r.height - 0.5) * 6;
  inclinacion.y = ((evento.clientX - r.left) / r.width - 0.5) * 8;
}
function alSalirPuntero() {
  inclinacion.x = 0;
  inclinacion.y = 0;
}

// Saltar a un paso desde el riel
function irA(i) {
  const r = pista.value.getBoundingClientRect();
  const recorrido = r.height - window.innerHeight;
  window.scrollTo({ top: window.scrollY + r.top + avancePara(i) * recorrido, behavior: "smooth" });
}

// ---------- Montaje ----------

let observador;
let redimension;
let consulta;

function activar() {
  enEspacio.value = consulta.matches && !reducirMovimiento();
  if (!enEspacio.value) {
    // Solo lo que pone la animación (el color del paso lo pone Vue)
    pasos.value.forEach((el) =>
      ["transform", "opacity", "filter", "z-index", "visibility"].forEach((p) => el.style.removeProperty(p))
    );
    return;
  }
  nextTick(() => {
    ajustarLienzo();
    camara = objetivo = camaraPara(medirAvance());
    colocarPasos();
  });
}

onMounted(() => {
  crearEstrellas();
  consulta = matchMedia("(min-width: 901px)");
  consulta.addEventListener("change", activar);
  activar();

  // Solo se anima mientras la escena está a la vista
  observador = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting && enEspacio.value;
    if (visible && !cuadro) cuadro = requestAnimationFrame(animar);
  });
  observador.observe(pista.value);

  // Se vuelve a medir cuando la escena cambia de tamaño (también al terminar
  // la pantalla de carga, que la tiene oculta al montarse)
  redimension = new ResizeObserver(() => enEspacio.value && ajustarLienzo());
  redimension.observe(escenario.value);
});

onBeforeUnmount(() => {
  observador?.disconnect();
  redimension?.disconnect();
  consulta?.removeEventListener("change", activar);
  if (cuadro) cancelAnimationFrame(cuadro);
});
</script>

<template>
  <section id="proceso" class="seccion proceso">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Proceso"
      titulo="Cómo trabajamos"
      destacado="juntos."
    />

    <div ref="pista" class="proceso-pista" :class="{ 'en-espacio': enEspacio }" :style="{ '--pasos': N }">
      <div
        ref="escenario"
        class="proceso-escenario"
        :style="{ '--tono': proceso[activo].tono }"
        @pointermove="alMoverPuntero"
        @pointerleave="alSalirPuntero"
      >
        <canvas ref="lienzo" class="proceso-estrellas" aria-hidden="true"></canvas>
        <div class="proceso-halo" aria-hidden="true"></div>

        <ol class="proceso-lista">
          <li
            v-for="(paso, i) in proceso"
            :key="paso.titulo"
            ref="pasos"
            class="proceso-paso"
            :class="{ activo: enEspacio && activo === i }"
            :style="{ '--tono-paso': paso.tono }"
            :aria-current="enEspacio && activo === i ? 'step' : undefined"
          >
            <span class="proceso-fondo-numero" aria-hidden="true">{{ dos(i + 1) }}</span>
            <span class="proceso-numero">{{ dos(i + 1) }}</span>
            <p class="proceso-contador" aria-hidden="true">Paso {{ dos(i + 1) }} / {{ dos(N) }}</p>
            <h3>{{ paso.titulo }}</h3>
            <p class="proceso-texto">{{ paso.texto }}</p>
            <ul class="proceso-entregables" aria-label="Entregables">
              <li v-for="(e, j) in paso.entregables" :key="e" :style="{ '--j': j }">{{ e }}</li>
            </ul>
          </li>
        </ol>

        <!-- Riel de progreso: dónde estoy y a dónde puedo ir -->
        <nav v-if="enEspacio" class="proceso-riel" aria-label="Pasos del proceso">
          <button
            v-for="(paso, i) in proceso"
            :key="paso.titulo"
            type="button"
            :class="{ activo: activo === i, hecho: activo > i }"
            :style="{ '--tono-paso': paso.tono }"
            @click="irA(i)"
          >
            <span class="proceso-riel-punto"></span>
            <span class="proceso-riel-nombre">{{ paso.titulo }}</span>
          </button>
        </nav>
      </div>
    </div>
  </section>
</template>
