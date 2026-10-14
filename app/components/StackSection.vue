<script setup>
import { stack, niveles } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// El stack como un sistema orbital: yo en el centro y cada tecnología en un
// anillo según su nivel (más cerca, más dominio). Al hacer scroll las
// tecnologías salen del centro hacia su órbita.
defineProps({ numero: Number });

const tecnologias = stack.flatMap((g) => g.items.map((item) => ({ ...item, categoria: g.categoria })));

// Radio (proporción del tamaño de la órbita), velocidad y sentido de cada anillo
const anillos = [
  { nivel: "experto", r: 0.17, duracion: 50, sentido: "normal", desfase: 210 },
  { nivel: "avanzado", r: 0.32, duracion: 90, sentido: "reverse", desfase: -90 },
  { nivel: "aprendiendo", r: 0.46, duracion: 120, sentido: "normal", desfase: 25 },
].map((anillo) => {
  const items = tecnologias.filter((t) => t.nivel === anillo.nivel);
  return {
    ...anillo,
    items: items.map((t, i) => ({ ...t, angulo: anillo.desfase + (i * 360) / items.length })),
  };
});

// ---------- Categoría y tecnología seleccionadas ----------

const categorias = ["Todo", ...stack.map((g) => g.categoria)];
const activa = ref("Todo");
const seleccionada = ref(tecnologias.find((t) => t.nivel === "experto") || tecnologias[0]);

function seleccionar(tecnologia) {
  seleccionada.value = tecnologia;
}

// ---------- Rodar hasta la tecnología elegida ----------

// Al hacer clic, el anillo rueda hasta dejar la tecnología al frente (a la
// izquierda, mirando a la ficha; arriba cuando la órbita va debajo del texto)
// y el nodo da una vuelta sobre sí mismo, como una rueda.
const rodado = reactive(Object.fromEntries(anillos.map((a) => [a.nivel, 0])));
const vueltas = reactive({});

const anguloDe = (el) => parseFloat(getComputedStyle(el).rotate) || 0;

// Al rodar, otros nodos pasan (o se quedan) bajo el puntero quieto: no deben
// cambiar la selección hasta que el puntero se mueva de verdad
let puntoClic = null;

function alEntrar(tecnologia, evento) {
  if (puntoClic) {
    if (Math.hypot(evento.clientX - puntoClic.x, evento.clientY - puntoClic.y) < 10) return;
    puntoClic = null;
  }
  seleccionar(tecnologia);
}

function rodarHasta(tecnologia, anillo, evento) {
  seleccionar(tecnologia);
  // Con teclado el clic llega en (0, 0) y no hace falta bloquear el hover
  if (evento.detail) puntoClic = { x: evento.clientX, y: evento.clientY };
  const giro = evento.currentTarget.closest(".orbita-giro");
  const frente = matchMedia("(max-width: 900px)").matches ? -90 : 180;
  // Posición actual = giro continuo (animación) + lo ya rodado + su ángulo en el anillo
  const actual = anguloDe(giro) + rodado[anillo.nivel] + tecnologia.angulo;
  let delta = (((frente - actual) % 360) + 540) % 360 - 180;
  // Si ya está casi al frente, igual da una vuelta completa para que se note
  if (Math.abs(delta) < 30) delta += delta < 0 ? -360 : 360;
  rodado[anillo.nivel] += delta;
  vueltas[tecnologia.nombre] = (vueltas[tecnologia.nombre] || 0) + (delta < 0 ? -360 : 360);
}

// Al elegir una categoría se muestra su primera tecnología
watch(activa, (categoria) => {
  nextTick(moverIndicador);
  if (categoria !== "Todo" && seleccionada.value.categoria !== categoria) {
    seleccionada.value = tecnologias.find((t) => t.categoria === categoria);
  }
});

// Indicador que se desliza bajo la pestaña activa
const pestanas = ref(null);
const indicador = ref({ width: "0px", translate: "0px 0px", opacity: 0 });
function moverIndicador() {
  const boton = pestanas.value?.querySelector(`[data-categoria="${activa.value}"]`);
  if (!boton) return;
  indicador.value = { width: boton.offsetWidth + "px", translate: `${boton.offsetLeft}px 0px`, opacity: 1 };
}

// ---------- Montaje con el scroll e inclinación con el puntero ----------

const escena = ref(null);
const montaje = ref(0);
const inclinacion = ref({ x: 0, y: 0 });

function medir() {
  const r = escena.value.getBoundingClientRect();
  const alto = window.innerHeight;
  montaje.value = Math.min(1, Math.max(0, (alto - r.top) / (alto * 0.75)));
}

function alMoverPuntero(evento) {
  const r = escena.value.getBoundingClientRect();
  inclinacion.value = {
    x: -((evento.clientY - r.top) / r.height - 0.5) * 16,
    y: ((evento.clientX - r.left) / r.width - 0.5) * 16,
  };
}
function alSalirPuntero() {
  inclinacion.value = { x: 0, y: 0 };
}

// Se vuelve a medir cuando las pestañas cambian de tamaño (también al
// terminar la pantalla de carga, que las tiene ocultas al montarse)
let observadorPestanas;

onMounted(() => {
  observadorPestanas = new ResizeObserver(moverIndicador);
  observadorPestanas.observe(pestanas.value);
  if (reducirMovimiento()) {
    montaje.value = 1;
    return;
  }
  medir();
  window.addEventListener("scroll", medir, { passive: true });
  window.addEventListener("resize", medir);
});

onBeforeUnmount(() => {
  observadorPestanas?.disconnect();
  window.removeEventListener("scroll", medir);
  window.removeEventListener("resize", medir);
});
</script>

<template>
  <section id="stack" class="seccion stack-orbital">
    <div class="stack-escena">
      <!-- Relato: cabecera, categorías y detalle de la tecnología -->
      <div class="stack-relato">
        <SeccionCabecera
          :numero="numero"
          etiqueta="Stack"
          titulo="Herramientas para"
          destacado="diseñar y construir."
          alineacion="izquierda"
        />

        <div ref="pestanas" class="pestanas" role="tablist" aria-label="Categorías del stack">
          <span class="pestanas-indicador" :style="indicador"></span>
          <button
            v-for="categoria in categorias"
            :key="categoria"
            type="button"
            role="tab"
            class="pestana"
            :class="{ activa: activa === categoria }"
            :aria-selected="activa === categoria"
            :data-categoria="categoria"
            @click="activa = categoria"
          >
            {{ categoria }}
          </button>
        </div>

        <Transition name="detalle" mode="out-in">
          <article
            :key="seleccionada.nombre"
            class="tarjeta-vidrio stack-detalle"
            :style="{ '--tono': seleccionada.color, '--nivel': niveles[seleccionada.nivel].color }"
            aria-live="polite"
          >
            <span class="stack-detalle-sigla">{{ seleccionada.sigla }}</span>
            <div class="stack-detalle-texto">
              <p class="hito-meta">{{ seleccionada.categoria }}</p>
              <h3>{{ seleccionada.nombre }}</h3>
              <p class="stack-detalle-uso">{{ seleccionada.detalle }}</p>
              <div class="stack-medidor">
                <span
                  v-for="n in 3"
                  :key="n"
                  :class="{ lleno: n <= niveles[seleccionada.nivel].valor }"
                ></span>
                <strong>{{ niveles[seleccionada.nivel].texto }}</strong>
              </div>
            </div>
          </article>
        </Transition>

        <ul class="stack-leyenda" aria-label="Anillos de la órbita">
          <li v-for="(nivel, clave) in niveles" :key="clave" :style="{ '--tono': nivel.color }">
            <span class="chip-punto"></span>{{ nivel.texto }}
          </li>
          <li class="stack-leyenda-nota">Más cerca del centro, más dominio</li>
        </ul>
      </div>

      <!-- Órbita -->
      <div
        ref="escena"
        class="orbita-escena"
        @pointermove="alMoverPuntero"
        @pointerleave="alSalirPuntero"
      >
        <div
          class="orbita"
          :class="{ filtrando: activa !== 'Todo' }"
          :style="{
            '--montaje': montaje,
            '--inc-x': inclinacion.x + 'deg',
            '--inc-y': inclinacion.y + 'deg',
          }"
        >
          <div class="orbita-centro">
            <img src="/imagenes/Dibujo.png" alt="Andrés Valencia" />
          </div>

          <div
            v-for="anillo in anillos"
            :key="anillo.nivel"
            class="orbita-anillo"
            :style="{
              '--r': anillo.r,
              '--duracion': anillo.duracion + 's',
              '--sentido': anillo.sentido,
              '--sentido-inverso': anillo.sentido === 'normal' ? 'reverse' : 'normal',
              '--tono-anillo': niveles[anillo.nivel].color,
            }"
          >
            <span class="orbita-trazo" aria-hidden="true"></span>
            <span class="orbita-etiqueta" aria-hidden="true">{{ niveles[anillo.nivel].texto }}</span>

            <div class="orbita-giro" :style="{ '--rodar': rodado[anillo.nivel] + 'deg' }">
              <div
                v-for="t in anillo.items"
                :key="t.nombre"
                class="orbita-brazo"
                :class="{
                  activo: seleccionada.nombre === t.nombre,
                  'en-categoria': activa === t.categoria,
                }"
                :style="{ '--angulo': t.angulo + 'deg', '--tono': t.color, '--vuelta': (vueltas[t.nombre] || 0) + 'deg' }"
              >
                <span class="orbita-linea" aria-hidden="true"></span>
                <button
                  type="button"
                  class="orbita-nodo"
                  :aria-label="`${t.nombre}: ${niveles[t.nivel].texto}`"
                  :aria-pressed="seleccionada.nombre === t.nombre"
                  @pointerenter="alEntrar(t, $event)"
                  @focus="seleccionar(t)"
                  @click="rodarHasta(t, anillo, $event)"
                >
                  <span class="orbita-nodo-giro">{{ t.sigla }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
