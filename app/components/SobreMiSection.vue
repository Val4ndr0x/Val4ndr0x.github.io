<script setup>
import { sobreMi } from "~/data/perfil";
import { proyectos } from "~/data/proyectos";
import { reducirMovimiento } from "~/utils/motion";

// "Diseño y código, en un solo lugar" como escena: al hacer scroll un lienzo
// pasa de boceto a interfaz y luego se parte para mostrar el código que la
// construye. Con el puntero se mueve la división entre diseño y código.
defineProps({ numero: Number });

const cifras = sobreMi.cifras.map((c) => ({
  ...c,
  valor: c.valor === "proyectos" ? proyectos.length : c.valor,
}));
const palabras = sobreMi.manifiesto.split(" ");

// Código de la tarjeta que se ve en el lienzo
const codigo = [
  "<template>",
  '  <article class="tarjeta">',
  '    <img src="/dmk.png" alt="" />',
  "    <span>Nuevo</span>",
  "    <h3>{{ nombre }}</h3>",
  "    <p>{{ precio }}</p>",
  '    <button @click="agregar">',
  "      Agregar",
  "    </button>",
  "  </article>",
  "</template>",
  "<script setup>",
  'defineProps(["nombre", "precio"])',
  "const { agregar } = useCarrito()",
  "</" + "script>",
  "<style scoped>",
  ".tarjeta {",
  "  border-radius: 24px;",
  "  padding: 24px;",
  "}",
  "</style>",
];

// Resaltado de sintaxis mínimo (el texto es fijo, no viene del usuario)
const patron =
  /("[^"]*")|(<\/?[\w-]+|\/?>)|(\s[:@]?[\w-]+(?==))|(\{\{.*?\}\})|\b(const|computed|defineProps|Object)\b|([\w-]+(?=:\s))/g;
const clases = ["tk-cadena", "tk-etiqueta", "tk-atributo", "tk-interp", "tk-clave", "tk-prop"];
const escapar = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function resaltar(linea) {
  let html = "";
  let ultimo = 0;
  for (const m of linea.matchAll(patron)) {
    html += escapar(linea.slice(ultimo, m.index));
    const grupo = m.slice(1).findIndex(Boolean);
    html += `<span class="${clases[grupo]}">${escapar(m[0])}</span>`;
    ultimo = m.index + m[0].length;
  }
  return html + escapar(linea.slice(ultimo)) || " ";
}
const lineas = codigo.map(resaltar);

// ---------- Progreso según el scroll ----------

const seccion = ref(null);
const lienzo = ref(null);
const progreso = ref(0);
const division = ref(100); // % del lienzo que muestra el diseño
let divisionPuntero = null;

const entre = (a, b, p) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const encendidas = computed(() => Math.round(entre(0.02, 0.5, progreso.value) * palabras.length));
const interfaz = computed(() => entre(0.18, 0.42, progreso.value)); // boceto → interfaz
const lineasVisibles = computed(() => Math.round(entre(0.5, 0.86, progreso.value) * lineas.length));
const faseActiva = computed(() => (progreso.value < 0.33 ? 0 : progreso.value < 0.62 ? 1 : 2));
// Al final del recorrido el diseño ocupa el 46% y el código el resto
// (en pantallas angostas el código necesita más espacio)
const final = ref(46);
const divisionPorScroll = (p) => 100 - entre(0.48, 0.8, p) * (100 - final.value);

// La tarjeta se centra en la parte visible del diseño y se encoge si no cabe
const anchoLienzo = ref(540);
const escalaMaqueta = computed(() =>
  Math.min(1, Math.max(0.35, ((anchoLienzo.value * division.value) / 100 - 40) / 270))
);

function medir() {
  anchoLienzo.value = lienzo.value.offsetWidth;
  const r = seccion.value.getBoundingClientRect();
  const alto = window.innerHeight;
  // En escritorio la escena queda fija mientras se recorre la pista;
  // en pantallas angostas avanza mientras la sección cruza la pantalla
  const recorrido = matchMedia("(max-width: 900px)").matches
    ? (alto * 0.85 - r.top) / r.height
    : -r.top / (r.height - alto);
  progreso.value = Math.min(1, Math.max(0, recorrido));
}

// La división sigue al puntero (o al scroll) con un poco de inercia
let cuadro = null;
function animarDivision() {
  const objetivo = divisionPuntero ?? divisionPorScroll(progreso.value);
  division.value += (objetivo - division.value) * 0.16;
  if (Math.abs(objetivo - division.value) < 0.05) division.value = objetivo;
  cuadro = requestAnimationFrame(animarDivision);
}

function alMoverPuntero(evento) {
  const r = lienzo.value.getBoundingClientRect();
  divisionPuntero = Math.min(96, Math.max(4, ((evento.clientX - r.left) / r.width) * 100));
}
function alSalirPuntero() {
  divisionPuntero = null;
}

// ---------- Cifras y "Ahora mismo" ----------

const mostradas = ref(cifras.map((c) => c.valor));
let contado = false;
function contar() {
  contado = true;
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min(1, (ahora - inicio) / 1200);
    const curva = 1 - Math.pow(1 - t, 4);
    mostradas.value = cifras.map((c) => Math.round(c.valor * curva));
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
watch(progreso, (p) => {
  if (!contado && p > 0.08) contar();
});

const estado = ref(0);
let rotacion;

let observador;
onMounted(() => {
  if (matchMedia("(max-width: 900px)").matches) final.value = 30;
  if (reducirMovimiento()) {
    progreso.value = 1;
    division.value = final.value;
    anchoLienzo.value = lienzo.value.offsetWidth;
    return;
  }
  mostradas.value = cifras.map(() => 0);
  medir();
  window.addEventListener("scroll", medir, { passive: true });
  window.addEventListener("resize", medir);
  rotacion = setInterval(() => (estado.value = (estado.value + 1) % sobreMi.ahoraMismo.length), 3200);

  // La animación de la división solo corre mientras la sección está a la vista
  observador = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting && !cuadro) animarDivision();
    if (!entrada.isIntersecting && cuadro) {
      cancelAnimationFrame(cuadro);
      cuadro = null;
    }
  });
  observador.observe(seccion.value);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", medir);
  window.removeEventListener("resize", medir);
  clearInterval(rotacion);
  observador?.disconnect();
  if (cuadro) cancelAnimationFrame(cuadro);
});
</script>

<template>
  <section id="sobre-mi" ref="seccion" class="seccion sobre-inmersiva">
    <div class="sobre-escena">
      <!-- Relato: título, manifiesto y fases -->
      <div class="sobre-relato">
        <SeccionCabecera
          :numero="numero"
          etiqueta="Sobre mí"
          :titulo="sobreMi.titulo"
          :destacado="sobreMi.tituloDestacado"
          alineacion="izquierda"
        />

        <p class="sobre-manifiesto" :aria-label="sobreMi.manifiesto">
          <!-- El espacio va aparte: Vue quita los que quedan junto a las etiquetas -->
          <template v-for="(palabra, i) in palabras" :key="i">
            <span aria-hidden="true" :class="{ encendida: i < encendidas }">{{ palabra }}</span>{{ " " }}
          </template>
        </p>

        <ol class="sobre-fases">
          <li
            v-for="(fase, i) in sobreMi.fases"
            :key="fase.fase"
            :class="{ activa: faseActiva === i, hecha: faseActiva > i }"
          >
            <span class="sobre-fase-numero">0{{ i + 1 }}</span>
            <div>
              <p class="sobre-fase-titulo">{{ fase.fase }} <span>· {{ fase.valor }}</span></p>
              <p class="sobre-fase-texto">{{ fase.texto }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Lienzo: diseño a la izquierda de la división, código a la derecha -->
      <div class="sobre-lienzo-marco">
        <div
          ref="lienzo"
          class="lienzo"
          :style="{ '--division': division + '%', '--interfaz': interfaz, '--escala-maqueta': escalaMaqueta }"
          @pointermove="alMoverPuntero"
          @pointerleave="alSalirPuntero"
        >
          <div class="lienzo-pestanas" aria-hidden="true">
            <span :class="{ activa: division >= 50 }"><IconoLinea nombre="pincel" />tarjeta.fig</span>
            <span :class="{ activa: division < 50 }"><IconoLinea nombre="terminal" />Tarjeta.vue</span>
          </div>

          <div class="lienzo-area">
            <!-- Código (debajo) -->
            <div class="capa-codigo" aria-hidden="true">
              <ol>
                <li
                  v-for="(linea, i) in lineas"
                  :key="i"
                  :class="{ visible: i < lineasVisibles, cursor: i === lineasVisibles - 1 }"
                  v-html="linea"
                ></li>
              </ol>
            </div>

            <!-- Diseño (encima, recortado por la división) -->
            <div class="capa-diseno">
              <div class="maqueta">
                <!-- Boceto: bloques grises con medidas -->
                <div class="maqueta-boceto" aria-hidden="true">
                  <span class="boceto-imagen"></span>
                  <span class="boceto-linea corta"></span>
                  <span class="boceto-linea"></span>
                  <span class="boceto-linea media"></span>
                  <span class="boceto-boton"></span>
                </div>

                <!-- Interfaz terminada -->
                <article class="maqueta-ui">
                  <div class="ui-imagen">
                    <img src="/imagenes/DMKLOGO.png" alt="" />
                    <span class="ui-etiqueta">Nuevo</span>
                  </div>
                  <p class="ui-marca">DMK Sport</p>
                  <h3>Camiseta de entrenamiento</h3>
                  <p class="ui-precio">$ 89.900</p>
                  <span class="ui-boton">Agregar</span>
                </article>

                <!-- Capa de edición: selección, medidas y guías -->
                <div class="maqueta-seleccion" aria-hidden="true">
                  <i v-for="n in 8" :key="n" class="tirador"></i>
                  <span class="medida medida-ancho">280</span>
                  <span class="medida medida-relleno">24</span>
                  <span class="nombre-capa">Tarjeta / Producto</span>
                </div>

                <span class="guia guia-vertical" aria-hidden="true"></span>
                <span class="guia guia-horizontal" aria-hidden="true"></span>
                <span class="cursor-compartido" aria-hidden="true">
                  <svg viewBox="0 0 16 16"><path d="M2 1l11 6-5 1.5L6 14z" /></svg>
                  <span>Andrés</span>
                </span>
              </div>
            </div>

            <!-- División que se arrastra con el puntero -->
            <div class="lienzo-division" :class="{ 'en-borde': division > 97 }" aria-hidden="true">
              <span class="lienzo-tirador">
                <span>Diseño</span><span>Código</span>
              </span>
            </div>
          </div>

          <!-- Barra de estado del editor: "Ahora mismo" -->
          <div class="lienzo-estado">
            <span class="punto-vivo"></span>
            <Transition name="estado" mode="out-in">
              <span :key="estado" class="lienzo-estado-texto">
                <strong>{{ sobreMi.ahoraMismo[estado].etiqueta }}</strong>
                {{ sobreMi.ahoraMismo[estado].texto }}
              </span>
            </Transition>
            <span class="lienzo-estado-fase">{{ sobreMi.fases[faseActiva].fase }}</span>
          </div>
        </div>

        <!-- Cifras como paneles del inspector -->
        <dl class="inspector">
          <div v-for="(cifra, i) in cifras" :key="cifra.texto" class="inspector-panel" :class="`inspector-${i}`">
            <dt>{{ cifra.texto }}</dt>
            <dd>{{ mostradas[i] }}{{ cifra.sufijo }}</dd>
          </div>
        </dl>

        <p class="sobre-pista-texto" aria-hidden="true">Mueve el puntero sobre el lienzo para comparar diseño y código</p>
      </div>
    </div>

  </section>
</template>
