<script setup>
import { trayectoria, idiomas } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// La trayectoria como un viaje en el tiempo: la escena queda fija y el scroll
// la recorre de lado, del pasado al presente. Una línea de luz se dibuja con
// un cometa en la punta; cada hito se materializa al llegar el cometa, y
// detrás pasan los años y el polvo a distintas velocidades (parallax).
// En pantallas angostas o con movimiento reducido se ve como lista vertical.
defineProps({ numero: Number });

const filtros = [
  { clave: "todo", texto: "Todo" },
  { clave: "experiencia", texto: "Experiencia" },
  { clave: "educacion", texto: "Educación" },
  { clave: "certificado", texto: "Certificaciones" },
];
const nombreTipo = { experiencia: "Experiencia", educacion: "Educación", certificado: "Certificado" };
const tonoTipo = { experiencia: "#ff4060", educacion: "#ff9f0a", certificado: "#64d2ff" };

const activo = ref("todo");
const enEscena = ref(false);

// En la escena van del más antiguo al más reciente y no se quitan al filtrar
// (se atenúan), para que el recorrido no cambie de forma
const cronologico = [...trayectoria].reverse();
const hitos = computed(() => {
  if (enEscena.value) return cronologico;
  return activo.value === "todo" ? trayectoria : trayectoria.filter((h) => h.tipo === activo.value);
});
const coincide = (hito) => activo.value === "todo" || hito.tipo === activo.value;

const N = cronologico.length; // paradas: un hito cada una y "Hoy" al final

// Años gigantes del fondo: uno por grupo de hitos seguidos del mismo periodo
const etiqueta = (h) => (h.periodo === "En curso" ? "Hoy" : h.periodo);
const anios = cronologico.reduce((grupos, h, i) => {
  const ultimo = grupos.at(-1);
  if (ultimo && ultimo.texto === etiqueta(h)) ultimo.indices.push(i);
  else grupos.push({ texto: etiqueta(h), indices: [i] });
  return grupos;
}, []);

const pista = ref(null);
const escenario = ref(null);
const recorrido = ref(null);
const capaAnios = ref(null);
const capaLejos = ref(null);
const capaCerca = ref(null);
const trazo = ref(null);
const trazoBrillo = ref(null);
const cometa = ref(null);

const polvoLejos = ref([]);
const polvoCerca = ref([]);

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);

// ---------- Recorrido del scroll ----------

// Entre parada y parada hay una pausa: el primer 35% de cada tramo la cámara
// se queda quieta sobre el hito
const PAUSA = 0.35;
const INICIO = -0.3;
const LARGO = N - INICIO;
function camaraPara(avance) {
  const lineal = INICIO + avance * LARGO;
  const k = Math.floor(lineal);
  return k + suave(limitar((lineal - k - PAUSA) / (1 - PAUSA)));
}

function medirAvance() {
  const r = pista.value.getBoundingClientRect();
  return limitar(-r.top / (r.height - window.innerHeight));
}

// ---------- Geometría (en px de CSS de la escena) ----------

let ancho = 1200;
let alto = 700;
let centroY = 370;
let X = []; // x de cada parada dentro del recorrido
let muestras = []; // [x, largo, y, ángulo] a lo largo de la línea
let largoTotal = 1;

const ANIOS_FACTOR = 0.35;
const LEJOS_FACTOR = 0.6;
const CERCA_FACTOR = 1.5;

function medir() {
  const esc = escenario.value;
  ancho = esc.offsetWidth;
  alto = esc.offsetHeight;
  centroY = alto * 0.5;
  const paso = limitar(ancho * 0.36, 420, 600);
  const inicio = ancho / 2;
  X = Array.from({ length: N + 1 }, (_, i) => inicio + i * paso);
  const anchoRecorrido = X[N] + ancho;
  recorrido.value.style.width = anchoRecorrido + "px";

  // Línea: entra desde la izquierda y ondula entre hito y hito
  const A = Math.min(70, alto * 0.08);
  const fin = X[N] - 250;
  let d = `M ${X[0] - ancho * 0.7} ${centroY} C ${X[0] - ancho * 0.35} ${centroY} ${X[0] - paso / 2} ${centroY + A} ${X[0]} ${centroY}`;
  for (let i = 0; i < N; i++) {
    const a = X[i];
    const b = i === N - 1 ? fin : X[i + 1];
    const s = i % 2 ? 1 : -1;
    d += ` C ${a + (b - a) / 2} ${centroY + s * A} ${b - (b - a) / 2} ${centroY - s * A} ${b} ${centroY}`;
  }
  const svg = trazo.value.ownerSVGElement;
  svg.setAttribute("viewBox", `0 0 ${anchoRecorrido} ${alto}`);
  svg.setAttribute("width", anchoRecorrido);
  svg.setAttribute("height", alto);
  svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));

  largoTotal = trazo.value.getTotalLength();
  muestras = [];
  const cuantas = 600;
  for (let i = 0; i <= cuantas; i++) {
    const largo = (largoTotal * i) / cuantas;
    const p = trazo.value.getPointAtLength(largo);
    const q = trazo.value.getPointAtLength(Math.min(largoTotal, largo + 2));
    muestras.push([p.x, largo, p.y, Math.atan2(q.y - p.y, q.x - p.x)]);
  }
  [trazo.value, trazoBrillo.value].forEach((p) => p.style.setProperty("--largo", largoTotal));
  svg.querySelector(".tray-fin").setAttribute("cx", fin);
  svg.querySelector(".tray-fin").setAttribute("cy", centroY);

  // Hitos, nodos y destino
  recorrido.value.querySelectorAll("[data-parada]").forEach((el) => {
    const i = +el.dataset.parada;
    el.style.left = (i === N ? fin : X[i]) + "px";
    el.style.setProperty("--centro-y", centroY + "px");
  });
  recorrido.value.querySelector(".idiomas").style.left = fin + 60 + "px";

  // Años: cada uno queda centrado cuando la cámara está sobre su grupo
  capaAnios.value.querySelectorAll("[data-anio]").forEach((el) => {
    const g = anios[+el.dataset.anio];
    const medio = g.indices.reduce((s, i) => s + X[i], 0) / g.indices.length;
    el.style.left = ancho / 2 + (medio - ancho / 2) * ANIOS_FACTOR + "px";
  });

  if (!polvoLejos.value.length) crearPolvo(anchoRecorrido);
}

// Polvo en dos capas: lejos (pequeño, tenue) y cerca (grande, desenfocado)
function crearPolvo(anchoRecorrido) {
  const tonos = Object.values(tonoTipo);
  const crear = (cuantos, factor, min, max) =>
    Array.from({ length: cuantos }, () => ({
      x: -ancho + Math.random() * (anchoRecorrido * factor + ancho * 2),
      y: Math.random() * 100,
      t: min + Math.random() * (max - min),
      tono: Math.random() < 0.3 ? tonos[Math.floor(Math.random() * tonos.length)] : "#f5f5f7",
    }));
  polvoLejos.value = crear(70, LEJOS_FACTOR, 1, 2.5);
  polvoCerca.value = crear(16, CERCA_FACTOR, 4, 9);
}

// Punto de la línea en una x dada (búsqueda binaria en las muestras)
function enLinea(x) {
  let a = 0;
  let b = muestras.length - 1;
  while (b - a > 1) {
    const m = (a + b) >> 1;
    if (muestras[m][0] < x) a = m;
    else b = m;
  }
  const [x0, l0, y0, g0] = muestras[a];
  const [x1, l1, y1] = muestras[b];
  const t = x1 === x0 ? 0 : limitar((x - x0) / (x1 - x0));
  return { largo: l0 + (l1 - l0) * t, y: y0 + (y1 - y0) * t, angulo: g0 };
}

// x de la cámara para una parada (con decimales)
function xPara(k) {
  if (k <= 0) return X[0] + k * (X[1] - X[0]);
  if (k >= N) return X[N];
  const i = Math.floor(k);
  return X[i] + (X[i + 1] - X[i]) * (k - i);
}

// ---------- Bucle ----------

let camara = INICIO;
let velocidad = 0;
let ultimoCuadro = 0;
let cuadro = null;
let visible = false;
const puntero = { y: 0, oy: 0 };

function animar(ahora) {
  const dt = Math.min((ahora - (ultimoCuadro || ahora)) / 1000, 0.1);
  ultimoCuadro = ahora;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  // Seguimiento críticamente amortiguado (sin rebote), igual a 60 o 120 Hz
  const objetivo = camaraPara(medirAvance());
  const antes = camara;
  camara += (objetivo - camara) * seguir(7);
  if (Math.abs(objetivo - camara) < 0.0005) camara = objetivo;
  velocidad = dt > 0 ? (camara - antes) / dt : 0;
  puntero.oy += (puntero.y - puntero.oy) * seguir(4);

  const camX = xPara(camara);
  const tx = ancho / 2 - camX;
  const py = puntero.oy;

  // Capas a distinta velocidad: lo lejano se mueve menos
  recorrido.value.style.transform = `translate3d(${tx.toFixed(1)}px, ${(py * 6).toFixed(1)}px, 0)`;
  capaAnios.value.style.transform = `translate3d(${(tx * ANIOS_FACTOR).toFixed(1)}px, ${(py * -10).toFixed(1)}px, 0)`;
  capaLejos.value.style.transform = `translate3d(${(tx * LEJOS_FACTOR).toFixed(1)}px, ${(py * -4).toFixed(1)}px, 0)`;
  capaCerca.value.style.transform = `translate3d(${(tx * CERCA_FACTOR).toFixed(1)}px, ${(py * 18).toFixed(1)}px, 0)`;

  // La línea se dibuja hasta la cámara; el cometa va en la punta
  const punto = enLinea(camX);
  const dibujado = Math.min(punto.largo, largoTotal);
  trazo.value.style.strokeDashoffset = largoTotal - dibujado;
  trazoBrillo.value.style.strokeDashoffset = largoTotal - dibujado;
  const terminado = camX >= X[N] - 250;
  const cola = 1 + Math.min(Math.abs(velocidad) * 2.2, 3.5);
  cometa.value.style.transform = `translate3d(${Math.min(camX, X[N] - 250).toFixed(1)}px, ${punto.y.toFixed(1)}px, 0) rotate(${punto.angulo}rad)`;
  cometa.value.style.setProperty("--cola", terminado ? 0.6 : cola.toFixed(2));

  // Cada parada se materializa al acercarse el cometa
  recorrido.value.querySelectorAll("[data-tarjeta]").forEach((el) => {
    const i = +el.dataset.tarjeta;
    const llegada = suave(limitar((camara - i + 0.55) / 0.5));
    const foco = 1 - limitar(Math.abs(camara - i));
    const lado = el.classList.contains("abajo") ? 1 : -1;
    const giro = limitar(i - camara, -1, 1) * -14;
    el.style.transform =
      `translate3d(0, ${((1 - llegada) * lado * -40).toFixed(1)}px, 0) ` +
      `rotateY(${giro.toFixed(2)}deg) scale(${(0.88 + 0.12 * llegada).toFixed(4)})`;
    el.style.opacity = (llegada * (0.5 + 0.5 * foco)).toFixed(3);
    el.style.filter = llegada < 0.98 ? `blur(${((1 - llegada) * 14).toFixed(1)}px)` : "none";
    el.style.visibility = llegada < 0.01 ? "hidden" : "visible";
    el.classList.toggle("en-foco", foco > 0.6);
  });
  recorrido.value.querySelectorAll(".tray-nodo").forEach((el) => {
    el.classList.toggle("encendido", camara >= +el.dataset.parada - 0.15);
  });

  // Solo se ve el año de la parte del recorrido en la que estás
  capaAnios.value.querySelectorAll("[data-anio]").forEach((el) => {
    const g = anios[+el.dataset.anio];
    const ultimo = g.texto === "Hoy" ? N : g.indices.at(-1);
    const distancia = Math.max(g.indices[0] - camara, camara - ultimo, 0);
    el.style.opacity = (1 - limitar(distancia / 0.6)).toFixed(3);
  });

  cuadro = visible ? requestAnimationFrame(animar) : null;
  if (!cuadro) ultimoCuadro = 0;
}

function alMoverPuntero(evento) {
  const r = escenario.value.getBoundingClientRect();
  puntero.y = ((evento.clientY - r.top) / r.height - 0.5) * 2;
}
function alSalirPuntero() {
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
    medir();
    camara = camaraPara(medirAvance());
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
  <section id="trayectoria" class="seccion trayectoria">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Trayectoria"
      titulo="Dónde he"
      destacado="crecido."
    />

    <div v-if="!enEscena" class="filtros" role="group" aria-label="Filtrar trayectoria">
      <button
        v-for="filtro in filtros"
        :key="filtro.clave"
        type="button"
        class="chip chip-boton"
        :class="{ activo: activo === filtro.clave }"
        :aria-pressed="activo === filtro.clave"
        @click="activo = filtro.clave"
      >
        {{ filtro.texto }}
      </button>
    </div>

    <div ref="pista" class="trayectoria-pista" :class="{ 'en-escena': enEscena }" :style="{ '--paradas': N + 1 }">
      <div ref="escenario" class="trayectoria-escenario" @pointermove="alMoverPuntero" @pointerleave="alSalirPuntero">
        <!-- Capas lejanas: años y polvo -->
        <div ref="capaAnios" class="tray-capa tray-anios" aria-hidden="true">
          <span v-for="(g, i) in anios" :key="g.texto" :data-anio="i">{{ g.texto }}</span>
        </div>
        <div ref="capaLejos" class="tray-capa" aria-hidden="true">
          <i
            v-for="(p, i) in polvoLejos"
            :key="i"
            class="tray-polvo"
            :style="{ left: p.x + 'px', top: p.y + '%', width: p.t + 'px', background: p.tono }"
          ></i>
        </div>

        <div ref="recorrido" class="trayectoria-cuerpo">
          <!-- Línea de luz: ruta pendiente, brillo y trazo -->
          <svg v-if="enEscena" class="tray-linea" aria-hidden="true">
            <defs>
              <linearGradient id="tray-degradado" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stop-color="#ff9f0a" />
                <stop offset="0.5" stop-color="#ff4060" />
                <stop offset="1" stop-color="#64d2ff" />
              </linearGradient>
              <filter id="tray-desenfoque" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <path class="tray-ruta" />
            <path ref="trazoBrillo" class="tray-trazo-brillo" filter="url(#tray-desenfoque)" />
            <path ref="trazo" class="tray-trazo" />
            <circle class="tray-fin" r="7" />
          </svg>
          <span v-if="enEscena" ref="cometa" class="tray-cometa" aria-hidden="true"></span>

          <template v-if="enEscena">
            <span
              v-for="(hito, i) in hitos"
              :key="'nodo-' + hito.titulo"
              class="tray-nodo"
              :class="{ atenuado: !coincide(hito) }"
              :data-parada="i"
              :style="{ '--tono-hito': tonoTipo[hito.tipo] }"
              aria-hidden="true"
            ></span>
          </template>

          <ol class="linea-tiempo" :class="{ visible: true }">
            <TransitionGroup :name="enEscena ? '' : 'aparecer'">
              <li
                v-for="(hito, i) in hitos"
                :key="hito.titulo"
                class="hito"
                :class="[`hito--${hito.tipo}`, { abajo: i % 2 === 1, atenuado: !coincide(hito) }]"
                :data-parada="enEscena ? i : undefined"
                :data-tarjeta="enEscena ? i : undefined"
                :style="{ '--tono-hito': tonoTipo[hito.tipo] }"
              >
                <span class="hito-marca" aria-hidden="true"></span>
                <div class="tarjeta-vidrio hito-tarjeta">
                  <p class="hito-meta">
                    <span>{{ nombreTipo[hito.tipo] }}</span> · {{ hito.periodo }}
                    <span v-if="hito.actual" class="insignia-actual"><span class="punto-vivo"></span>Actual</span>
                  </p>
                  <h3>{{ hito.titulo }}</h3>
                  <p class="hito-lugar">{{ hito.lugar }}</p>
                  <ul v-if="hito.puntos" class="hito-puntos">
                    <li v-for="punto in hito.puntos" :key="punto">{{ punto }}</li>
                  </ul>
                  <ul v-if="hito.chips" class="hito-chips">
                    <li v-for="chip in hito.chips" :key="chip" class="chip">{{ chip }}</li>
                  </ul>
                </div>
              </li>
            </TransitionGroup>
          </ol>

          <!-- Destino: hoy -->
          <aside class="tarjeta-vidrio idiomas" :data-tarjeta="enEscena ? N : undefined">
            <p v-if="enEscena" class="idiomas-hoy"><span class="punto-vivo"></span>Hoy</p>
            <h3>Idiomas</h3>
            <ul>
              <li v-for="item in idiomas" :key="item.idioma">
                <span>{{ item.idioma }}</span>
                <span class="chip">{{ item.nivel }}</span>
              </li>
            </ul>
            <p class="idiomas-nota">Mis certificados e insignias están justo debajo.</p>
            <a href="#credenciales" class="enlace-acento">Ver credenciales<span aria-hidden="true"> ›</span></a>
          </aside>
        </div>

        <!-- Capa cercana: polvo grande y desenfocado que pasa rápido -->
        <div ref="capaCerca" class="tray-capa tray-capa-cerca" aria-hidden="true">
          <i
            v-for="(p, i) in polvoCerca"
            :key="i"
            class="tray-polvo"
            :style="{ left: p.x + 'px', top: p.y + '%', width: p.t + 'px', background: p.tono }"
          ></i>
        </div>

      </div>
    </div>
  </section>
</template>
