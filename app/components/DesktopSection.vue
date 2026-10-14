<script setup>
import {
  RESORTE,
  abrirVentana,
  animar,
  cerrarVentana,
  escalaPagina,
} from "~/utils/motion";
import { perfil } from "~/data/perfil";

// Modo escritorio: vista a pantalla completa con el escritorio del portafolio.
// Cada parte del CV es un icono que abre su propia ventana.
const emit = defineEmits(["cerrar"]);

// Ventanas del CV. `ancho` y `alto` son el tamaño inicial.
const partesCV = [
  { clave: "cv", titulo: "CV completo", icono: "documento", tono: "#ff4060", ancho: 820 },
  { clave: "sobre", titulo: "Sobre mí", icono: "persona", tono: "#ff9f0a" },
  { clave: "stack", titulo: "Habilidades", icono: "app", tono: "#64d2ff" },
  { clave: "proyectos", titulo: "Proyectos", icono: "carpeta", tono: "#ffd60a", ancho: 780 },
  { clave: "trayectoria", titulo: "Trayectoria", icono: "reloj", tono: "#30d158" },
  { clave: "certificados", titulo: "Certificados", icono: "medalla", tono: "#bf5af2", ancho: 780 },
  { clave: "contacto", titulo: "Contacto", icono: "correo", tono: "#ff375f", ancho: 520, alto: 380 },
  { clave: "consola", titulo: "Consola", icono: "terminal", tono: "#8e8e93", ancho: 760, alto: 520 },
];

// Dock: accesos rápidos a las partes más usadas del CV
const dock = ["cv", "proyectos", "consola", "contacto"].map((clave) => partesCV.find((p) => p.clave === clave));

const raiz = ref(null);

// ---------- Ventanas ----------

// Estado por ventana: abierta, minimizada, posición y orden (z)
const ventanas = reactive({});
partesCV.forEach((p, i) => {
  ventanas[p.clave] = { abierta: false, minimizada: false, x: 230 + i * 28, y: 30 + i * 24, z: 20 };
});
const elementos = {};
const botonesBarra = {};
let zSiguiente = 21;

const abiertas = computed(() => partesCV.filter((p) => ventanas[p.clave].abierta));
const activa = computed(() => {
  const visibles = abiertas.value.filter((p) => !ventanas[p.clave].minimizada);
  return visibles.sort((a, b) => ventanas[b.clave].z - ventanas[a.clave].z)[0]?.clave;
});

function enfocar(clave) {
  ventanas[clave].z = zSiguiente++;
}

// En pantallas angostas la ventana ocupa todo el escritorio
function ajustarAlEscritorio(clave) {
  const parte = partesCV.find((p) => p.clave === clave);
  const area = raiz.value.querySelector(".desktop-main").getBoundingClientRect();
  const e = escalaPagina();
  const anchoArea = area.width / e;
  const altoArea = area.height / e - 47;
  const v = ventanas[clave];
  v.ancho = Math.min(parte.ancho || 700, anchoArea - 16);
  v.alto = Math.min(parte.alto || 560, altoArea - 16);
  v.x = Math.max(8, Math.min(v.x, anchoArea - v.ancho - 8));
  v.y = Math.max(8, Math.min(v.y, altoArea - v.alto - 8));
}

async function abrirParte(clave, evento) {
  const v = ventanas[clave];
  const origen = evento?.currentTarget;
  if (!v.abierta) {
    v.abierta = true;
    ajustarAlEscritorio(clave);
    await nextTick();
  }
  v.minimizada = false;
  enfocar(clave);
  abrirVentana(elementos[clave], origen);
}

function minimizar(clave) {
  const el = elementos[clave];
  apuntarA(el, botonesBarra[clave]);
  ventanas[clave].minimizada = true;
  cerrarVentana(el);
}

function cerrar(clave) {
  cerrarVentana(elementos[clave], () => {
    ventanas[clave].abierta = false;
    ventanas[clave].minimizada = false;
  });
}

// Botón de la barra de tareas: restaura, enfoca o minimiza
function alPulsarBarra(clave, evento) {
  const v = ventanas[clave];
  if (v.minimizada) abrirParte(clave, evento);
  else if (activa.value === clave) minimizar(clave);
  else enfocar(clave);
}

// Hace que la ventana se encoja hacia `destino` (el botón de la barra)
function apuntarA(ventana, destino) {
  if (!destino) return;
  const e = escalaPagina();
  const v = ventana.getBoundingClientRect();
  const d = destino.getBoundingClientRect();
  ventana.style.transformOrigin = `${(d.left + d.width / 2 - v.left) / e}px ${(d.top + d.height / 2 - v.top) / e}px`;
}

// Arrastrar desde la barra de título
let arrastre = null;
function empezarArrastre(clave, evento) {
  if (evento.button !== 0 || evento.target.closest("button")) return;
  enfocar(clave);
  const v = ventanas[clave];
  arrastre = { clave, x: evento.clientX, y: evento.clientY, vx: v.x, vy: v.y };
  evento.currentTarget.setPointerCapture(evento.pointerId);
}
function moverArrastre(evento) {
  if (!arrastre) return;
  const e = escalaPagina();
  const v = ventanas[arrastre.clave];
  v.x = arrastre.vx + (evento.clientX - arrastre.x) / e;
  v.y = Math.max(0, arrastre.vy + (evento.clientY - arrastre.y) / e);
}
function terminarArrastre() {
  arrastre = null;
}

// ---------- Reloj ----------

const hora = ref("");
const horaCorta = ref("");
const fecha = ref("");
const dia = ref("");
let reloj;

function actualizarReloj() {
  const ahora = new Date();
  const dos = (n) => String(n).padStart(2, "0");
  hora.value = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`;
  horaCorta.value = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`;
  fecha.value = ahora.toLocaleDateString("es-ES", { year: "numeric", month: "numeric", day: "numeric" });
  dia.value = ahora.toLocaleDateString("es-ES", { weekday: "long" });
}

// ---------- Entrar y salir del modo escritorio ----------

function salir() {
  animar(
    raiz.value,
    { opacity: "0", scale: "1.04", filter: "blur(12px)" },
    RESORTE.suave,
    () => emit("cerrar")
  );
}

// Escape cierra la ventana activa; si no hay ninguna, sale del modo escritorio
function alPresionarTecla(e) {
  if (e.key !== "Escape" || document.querySelector(".visor")) return;
  if (activa.value) cerrar(activa.value);
  else salir();
}

onMounted(() => {
  actualizarReloj();
  reloj = setInterval(actualizarReloj, 1000);
  document.documentElement.style.overflow = "hidden";
  document.addEventListener("keydown", alPresionarTecla);

  const el = raiz.value;
  el.style.opacity = "0";
  el.style.scale = "0.96";
  el.style.filter = "blur(16px)";
  animar(el, { opacity: "1", scale: "1", filter: "blur(0px)" });
});

onBeforeUnmount(() => {
  clearInterval(reloj);
  document.documentElement.style.overflow = "";
  document.removeEventListener("keydown", alPresionarTecla);
});
</script>

<template>
  <Teleport to="body">
    <section id="desktop" ref="raiz" class="modo-escritorio" aria-label="Modo escritorio">
      <div class="desktop-main">
        <div class="desktop-icons">
          <div
            v-for="parte in partesCV"
            :key="parte.clave"
            class="shortcut"
            role="button"
            tabindex="0"
            @click="abrirParte(parte.clave, $event)"
            @keydown.enter="abrirParte(parte.clave, $event)"
          >
            <span class="shortcut-app" :style="{ '--tono': parte.tono }">
              <IconoLinea :nombre="parte.icono" />
            </span>
            <span>{{ parte.titulo }}</span>
          </div>
        </div>

        <div class="widget">
          <div class="time">{{ hora }}</div>
          <div class="date">{{ fecha }}</div>
          <div class="day">{{ dia }}</div>
          <div class="buttons">
            <button><i class="fas fa-broom"></i></button>
            <button><i class="fas fa-search"></i></button>
            <button><i class="fas fa-folder"></i></button>
            <button><i class="fas fa-eye"></i></button>
            <button><i class="fas fa-chevron-right"></i></button>
          </div>
          <div class="todo">{{ perfil.disponibilidad }}</div>
        </div>

        <p class="escritorio-pista">Abre cada icono para ver esa parte de mi CV</p>

        <!-- Ventanas del CV -->
        <template v-for="parte in partesCV" :key="parte.clave">
          <div
            v-if="ventanas[parte.clave].abierta"
            :ref="(el) => (elementos[parte.clave] = el)"
            class="ventana"
            :class="{ 'ventana-activa': activa === parte.clave }"
            :style="{
              left: ventanas[parte.clave].x + 'px',
              top: ventanas[parte.clave].y + 'px',
              width: ventanas[parte.clave].ancho + 'px',
              height: ventanas[parte.clave].alto + 'px',
              zIndex: ventanas[parte.clave].z,
              '--tono': parte.tono,
            }"
            role="dialog"
            :aria-label="parte.titulo"
            @pointerdown="enfocar(parte.clave)"
          >
            <div
              class="ventana-barra"
              @pointerdown="empezarArrastre(parte.clave, $event)"
              @pointermove="moverArrastre"
              @pointerup="terminarArrastre"
              @pointercancel="terminarArrastre"
            >
              <span class="ventana-semaforo">
                <button type="button" class="semaforo-cerrar" aria-label="Cerrar" @click="cerrar(parte.clave)"></button>
                <button type="button" class="semaforo-minimizar" aria-label="Minimizar" @click="minimizar(parte.clave)"></button>
              </span>
              <span class="ventana-titulo">
                <IconoLinea :nombre="parte.icono" class="ventana-titulo-icono" />{{ parte.titulo }}
              </span>
            </div>
            <div class="ventana-cuerpo" :class="{ 'ventana-cuerpo--consola': parte.clave === 'consola' }">
              <ConsolaTerminal v-if="parte.clave === 'consola'" en-ventana />
              <CvContenido v-else :parte="parte.clave" />
            </div>
          </div>
        </template>

        <div class="taskbar">
          <div class="icons dock">
            <button
              v-for="parte in dock"
              :key="parte.clave"
              type="button"
              class="dock-icono"
              :style="{ '--tono': parte.tono }"
              :aria-label="parte.titulo"
              :title="parte.titulo"
              @click="abrirParte(parte.clave, $event)"
            >
              <span class="shortcut-app"><IconoLinea :nombre="parte.icono" /></span>
              <i v-if="ventanas[parte.clave].abierta" class="dock-punto" aria-hidden="true"></i>
            </button>
          </div>

          <div class="barra-ventanas">
            <button
              v-for="parte in abiertas"
              :key="parte.clave"
              :ref="(el) => (botonesBarra[parte.clave] = el)"
              type="button"
              class="barra-ventana"
              :class="{ activa: activa === parte.clave, minimizada: ventanas[parte.clave].minimizada }"
              :style="{ '--tono': parte.tono }"
              @click="alPulsarBarra(parte.clave, $event)"
            >
              <IconoLinea :nombre="parte.icono" />{{ parte.titulo }}
            </button>
          </div>

          <div class="time-date">
            <span>{{ horaCorta }}</span>
            <span>{{ fecha }}</span>
          </div>
          <button type="button" class="salir-escritorio" @click="salir">
            <IconoLinea nombre="salir" />Salir
          </button>
        </div>
      </div>
    </section>
  </Teleport>
</template>
