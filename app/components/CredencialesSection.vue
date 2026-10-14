<script setup>
import {
  medallas,
  certificados,
  categoriasInsignias,
  imagenMedalla,
  verificarMedalla,
  formatoFecha,
} from "~/data/insignias";
import { abrirVisor, reducirMovimiento } from "~/utils/motion";

// Certificados e insignias en una sola sección, con el mismo lenguaje que
// el resto de la página. Reemplaza a las antiguas Medallas y Certificados.
defineProps({ numero: Number });

const filtros = ["Todas", ...categoriasInsignias];
const activo = ref("Todas");
const visibles = computed(() =>
  activo.value === "Todas" ? medallas : medallas.filter((m) => m.categoria === activo.value)
);

function ampliar(evento) {
  const img = evento.currentTarget.querySelector("img");
  if (img) abrirVisor(img);
}

// La tarjeta se inclina un poco hacia el puntero
function inclinar(evento) {
  const el = evento.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (evento.clientX - r.left) / r.width - 0.5;
  const y = (evento.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--rx", `${-y * 6}deg`);
  el.style.setProperty("--ry", `${x * 8}deg`);
  el.style.setProperty("--luz-x", `${(x + 0.5) * 100}%`);
  el.style.setProperty("--luz-y", `${(y + 0.5) * 100}%`);
}
function soltar(evento) {
  evento.currentTarget.style.setProperty("--rx", "0deg");
  evento.currentTarget.style.setProperty("--ry", "0deg");
}

// ---------- Insignias: anillo orbital ----------
// Al llegar, todas las insignias vuelan juntas desde posiciones dispersas y
// forman un anillo 3D. Con el scroll el anillo gira y trae cada una al frente
// (con una pausa en cada una); también se puede arrastrar: al soltar conserva
// el impulso y se detiene en la insignia más cercana a donde iba.
// En pantallas angostas o con movimiento reducido se ve la grilla.

const M = medallas.length;
const PASO = 360 / M;
const enEscena = ref(false);
const frente = ref(0);
const medallaFrente = computed(() => medallas[frente.value]);

const pista = ref(null);
const escenario = ref(null);
const anillo = ref(null);
const fondo = ref(null);

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);
const normalizar = (g) => ((((g + 180) % 360) + 360) % 360) - 180;

// Posición dispersa de cada insignia antes de ensamblarse (fija, sin azar,
// para que el servidor y el navegador coincidan)
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const dispersas = medallas.map((_, i) => ({
  x: hash(i) - 0.5,
  y: hash(i + 10) - 0.5,
  z: hash(i + 20),
  giro: (hash(i + 30) - 0.5) * 540,
}));

// Giro según el scroll: una parada por insignia, con pausa en cada una. El
// scroll solo recorre las primeras 4 y luego la página sigue; las demás se
// alcanzan arrastrando o con clic
const PARADAS_SCROLL = Math.min(4, M);
const PAUSA = 0.4;
function giroPorScroll(avance) {
  const lineal = limitar(avance) * (PARADAS_SCROLL - 1);
  const k = Math.floor(lineal);
  return -(k + suave(limitar((lineal - k - PAUSA) / (1 - PAUSA)))) * PASO;
}

let giro = 0; // grados, suavizado
let arrastre = 0; // grados que suma el arrastre (objetivo)
let ensamblado = 0;
let ancho = 1200;
let alto = 700;
let ultimoCuadro = 0;
let cuadro = null;
let visible = false;
const puntero = { x: 0, y: 0, ox: 0, oy: 0 };

function medirScroll() {
  const r = pista.value.getBoundingClientRect();
  const altoVentana = window.innerHeight;
  return {
    entrada: limitar(1 - r.top / altoVentana), // 1 cuando la escena llega arriba
    avance: limitar(-r.top / (r.height - altoVentana)),
  };
}

function animar(ahora) {
  const dt = Math.min((ahora - (ultimoCuadro || ahora)) / 1000, 0.1);
  ultimoCuadro = ahora;
  const seguir = (rapidez) => 1 - Math.exp(-rapidez * dt);

  const { entrada, avance } = medirScroll();
  const objetivo = giroPorScroll(avance) + arrastre;
  // Mientras se arrastra el anillo sigue al dedo 1:1; si no, llega amortiguado
  giro = arrastrando ? objetivo : giro + (objetivo - giro) * seguir(7);
  ensamblado += (suave(limitar((entrada - 0.35) / 0.6)) - ensamblado) * seguir(6);
  puntero.ox += (puntero.x - puntero.ox) * seguir(4);
  puntero.oy += (puntero.y - puntero.oy) * seguir(4);

  const R = limitar(ancho * 0.3, 260, 500);
  const a = ensamblado;
  escenario.value.style.setProperty("--ensamblado", a.toFixed(3));
  anillo.value.style.transform = `rotateX(${(-14 + puntero.oy * 6).toFixed(2)}deg) rotateY(${(puntero.ox * 8).toFixed(2)}deg)`;
  fondo.value.style.translate = `${(puntero.ox * -30).toFixed(1)}px ${(puntero.oy * -20).toFixed(1)}px`;

  let masCerca = 0;
  let menorDistancia = 999;
  anillo.value.querySelectorAll("[data-insignia]").forEach((el) => {
    const i = +el.dataset.insignia;
    const theta = normalizar(i * PASO + giro);
    const rad = (theta * Math.PI) / 180;
    const delante = (Math.cos(rad) + 1) / 2; // 1 al frente, 0 atrás
    if (Math.abs(theta) < menorDistancia) {
      menorDistancia = Math.abs(theta);
      masCerca = i;
    }
    // En el anillo
    const ax = Math.sin(rad) * R;
    const az = Math.cos(rad) * R - R;
    // Dispersa: alrededor de la pantalla y por delante de la cámara
    const d = dispersas[i];
    const dx = d.x * ancho * 1.5;
    const dy = d.y * alto * 1.3;
    const dz = 300 + d.z * 500;
    const x = dx + (ax - dx) * a;
    const y = dy * (1 - a);
    const z = dz + (az - dz) * a;
    el.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) ` +
      `rotateX(${(14 - puntero.oy * 6).toFixed(2)}deg) rotateZ(${(d.giro * (1 - a)).toFixed(1)}deg) ` +
      `scale(${(0.7 + 0.3 * delante).toFixed(3)})`;
    // Solo el arco frontal: se desvanecen entre 50° y 85° del frente, así nunca
    // hay más de 4 a la vista (3 en reposo, 4 mientras gira)
    const arco = 1 - suave(limitar((Math.abs(theta) - 50) / 35));
    // Durante el ensamblaje llegan todas; al terminar quedan solo las del frente
    const presencia = arco + (1 - arco) * (1 - a);
    el.style.opacity = (a * presencia * (0.55 + 0.45 * delante)).toFixed(3);
    const desenfoque = (1 - delante) * 3 + (1 - a) * 10;
    el.style.filter = desenfoque > 0.3 ? `blur(${desenfoque.toFixed(1)}px)` : "none";
    el.style.visibility = a * presencia < 0.01 ? "hidden" : "visible";
    el.style.zIndex = String(Math.round(delante * 100));
    el.classList.toggle("al-frente", delante > 0.97 && a > 0.95);
  });
  if (masCerca !== frente.value) frente.value = masCerca;

  cuadro = visible ? requestAnimationFrame(animar) : null;
  if (!cuadro) ultimoCuadro = 0;
}

// ---------- Arrastre con impulso ----------

let arrastrando = false;
let inicioX = 0;
let arrastreInicial = 0;
let movido = 0;
let historial = [];

function alPresionar(evento) {
  if (evento.button !== 0) return;
  arrastrando = true;
  movido = 0;
  inicioX = evento.clientX;
  arrastreInicial = arrastre;
  historial = [{ x: evento.clientX, t: performance.now() }];
}

function alMover(evento) {
  const r = escenario.value.getBoundingClientRect();
  puntero.x = ((evento.clientX - r.left) / r.width - 0.5) * 2;
  puntero.y = ((evento.clientY - r.top) / r.height - 0.5) * 2;
  if (!arrastrando) return;
  const dx = evento.clientX - inicioX;
  movido = Math.max(movido, Math.abs(dx));
  // Pasada la histéresis, el anillo sigue al puntero 1:1 (en grados). La
  // captura empieza recién aquí para que un clic siga llegando a la insignia
  if (movido > 6) {
    if (!escenario.value.hasPointerCapture(evento.pointerId)) escenario.value.setPointerCapture(evento.pointerId);
    arrastre = arrastreInicial + (dx / r.width) * 160;
  }
  historial.push({ x: evento.clientX, t: performance.now() });
  if (historial.length > 6) historial.shift();
}

function alSoltar(evento) {
  if (!arrastrando) return;
  arrastrando = false;
  if (movido <= 6) return;
  // Velocidad al soltar (grados/s) y proyección del impulso, como el scroll de iOS
  const r = escenario.value.getBoundingClientRect();
  const a = historial[0];
  const b = historial.at(-1);
  const segundos = Math.max((b.t - a.t) / 1000, 0.001);
  const velocidad = ((b.x - a.x) / r.width) * 160 / segundos;
  const proyectado = arrastre + (velocidad / 1000) * 0.99 / (1 - 0.99);
  const base = giroPorScroll(medirScroll().avance);
  arrastre = Math.round((base + proyectado) / PASO) * PASO - base;
  escenario.value.releasePointerCapture?.(evento.pointerId);
}

function alSalir() {
  puntero.x = 0;
  puntero.y = 0;
}

// Clic: la del frente se amplía; otra, rueda hasta el frente
function elegir(i, evento) {
  if (movido > 6) return;
  if (i === frente.value) {
    ampliar(evento);
    return;
  }
  arrastre += -normalizar(i * PASO + giro);
}

// Con el teclado: flechas para girar
function alTeclear(evento) {
  if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
  evento.preventDefault();
  arrastre += evento.key === "ArrowLeft" ? PASO : -PASO;
}

// ---------- Montaje ----------

let observador;
let redimension;
let consulta;

function activar() {
  enEscena.value = consulta.matches && !reducirMovimiento();
  nextTick(() => {
    if (!enEscena.value) return;
    ancho = escenario.value.offsetWidth;
    alto = escenario.value.offsetHeight;
    if (visible && !cuadro) cuadro = requestAnimationFrame(animar);
  });
}

onMounted(() => {
  consulta = matchMedia("(min-width: 901px)");
  consulta.addEventListener("change", activar);
  activar();

  // Arranca un poco antes de llegar, para que el ensamblaje se vea entero
  observador = new IntersectionObserver(
    ([entrada]) => {
      visible = entrada.isIntersecting && enEscena.value;
      if (visible && !cuadro) cuadro = requestAnimationFrame(animar);
    },
    { rootMargin: "50% 0px" }
  );
  observador.observe(pista.value);

  redimension = new ResizeObserver(() => {
    if (!enEscena.value || !escenario.value?.offsetWidth) return;
    ancho = escenario.value.offsetWidth;
    alto = escenario.value.offsetHeight;
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
  <section id="credenciales" class="seccion credenciales">
    <!-- El ángel del diseño original queda como textura de fondo -->
    <img src="/imagenes/falloutang.png" alt="" id="credencialesAngel" class="credenciales-angel" aria-hidden="true" />

    <SeccionCabecera
      :numero="numero"
      etiqueta="Credenciales"
      titulo="Aprendizaje que"
      destacado="se puede verificar."
      intro="Diplomados, certificados e insignias digitales que respaldan mi formación."
    />

    <!-- Certificados -->
    <h3 class="credenciales-subtitulo">
      Certificados <span class="credenciales-cuenta">{{ certificados.length }}</span>
    </h3>
    <div class="certificados-grid">
      <article
        v-for="cert in certificados"
        :key="cert.src"
        class="tarjeta-vidrio certificado"
        @pointermove="inclinar"
        @pointerleave="soltar"
      >
        <button type="button" class="certificado-marco" :aria-label="`Ampliar ${cert.titulo}`" @click="ampliar">
          <img :src="cert.src" :alt="cert.titulo" loading="lazy" />
          <span class="certificado-ampliar" aria-hidden="true">Ampliar</span>
        </button>
        <div class="certificado-texto">
          <p class="hito-meta">{{ cert.emisor }} · {{ cert.anio }}</p>
          <h4>{{ cert.titulo }}</h4>
        </div>
      </article>
    </div>

    <!-- Insignias -->
    <div ref="pista" class="insignias-pista" :class="{ 'en-escena': enEscena }" :style="{ '--insignias': PARADAS_SCROLL }">
      <div
        v-if="enEscena"
        ref="escenario"
        class="insignias-escenario"
        tabindex="0"
        aria-label="Insignias digitales: arrastra o usa las flechas para girar"
        @pointerdown="alPresionar"
        @pointermove="alMover"
        @pointerup="alSoltar"
        @pointercancel="alSoltar"
        @pointerleave="alSalir"
        @keydown="alTeclear"
      >
        <!-- Categoría de la insignia del frente, gigante al fondo -->
        <div ref="fondo" class="insignias-fondo" aria-hidden="true">
          <Transition name="fondo-categoria">
            <span :key="medallaFrente.categoria">{{ medallaFrente.categoria }}</span>
          </Transition>
        </div>
        <div class="insignias-suelo" aria-hidden="true"></div>

        <header class="insignias-cabecera-escena">
          <p class="insignias-etiqueta">
            <span class="insignias-etiqueta-cuenta">{{ M }}</span> Insignias digitales · Badgr
          </p>
          <h3 class="insignias-titulo">Cada logro, <span class="seccion-destacado">verificable.</span></h3>
        </header>

        <div class="insignias-orbita">
          <div ref="anillo" class="insignias-anillo">
            <button
              v-for="(medalla, i) in medallas"
              :key="medalla.id"
              type="button"
              class="insignia-orbital"
              :data-insignia="i"
              :aria-label="i === frente ? `Ampliar ${medalla.nombre}` : `Traer al frente: ${medalla.nombre}`"
              @click="elegir(i, $event)"
            >
              <img :src="imagenMedalla(medalla.id)" :alt="medalla.nombre" draggable="false" />
            </button>
          </div>
        </div>

        <!-- Ficha de la insignia del frente -->
        <div class="insignias-ficha" aria-live="polite">
          <Transition name="ficha" mode="out-in">
            <div :key="medallaFrente.id">
              <p class="hito-meta">
                {{ String(frente + 1).padStart(2, "0") }} / {{ String(M).padStart(2, "0") }} ·
                {{ medallaFrente.categoria }} · {{ formatoFecha(medallaFrente.fecha) }}
              </p>
              <h4>{{ medallaFrente.nombre }}</h4>
              <p class="insignia-nivel">{{ medallaFrente.nivel }}</p>
              <a :href="verificarMedalla(medallaFrente.id)" target="_blank" rel="noopener" class="insignia-verificar">
                Verificar en Badgr<span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </Transition>
          <p class="insignias-pista-texto" aria-hidden="true">Arrastra para girar · clic para ampliar</p>
        </div>
      </div>

      <template v-else>
        <div class="insignias-cabecera">
          <h3 class="credenciales-subtitulo">
            Insignias digitales <span class="credenciales-cuenta">{{ medallas.length }}</span>
          </h3>
          <div class="filtros" role="group" aria-label="Filtrar insignias">
            <button
              v-for="filtro in filtros"
              :key="filtro"
              type="button"
              class="chip chip-boton"
              :class="{ activo: activo === filtro }"
              :aria-pressed="activo === filtro"
              @click="activo = filtro"
            >
              {{ filtro }}
            </button>
          </div>
        </div>

        <TransitionGroup name="aparecer" tag="div" class="insignias-grid">
          <article
            v-for="medalla in visibles"
            :key="medalla.id"
            class="tarjeta-vidrio insignia"
            @pointermove="inclinar"
            @pointerleave="soltar"
          >
            <button type="button" class="insignia-imagen" :aria-label="`Ampliar ${medalla.nombre}`" @click="ampliar">
              <img :src="imagenMedalla(medalla.id)" :alt="medalla.nombre" loading="lazy" />
            </button>
            <p class="hito-meta">{{ medalla.categoria }} · {{ formatoFecha(medalla.fecha) }}</p>
            <h4>{{ medalla.nombre }}</h4>
            <p class="insignia-nivel">{{ medalla.nivel }}</p>
            <a :href="verificarMedalla(medalla.id)" target="_blank" rel="noopener" class="insignia-verificar">
              Verificar en Badgr<span aria-hidden="true"> ↗</span>
            </a>
          </article>
        </TransitionGroup>
      </template>
    </div>

    <p class="credenciales-emisor">Insignias emitidas por el {{ medallas[0].emisor }}.</p>
  </section>
</template>
