<script setup>
import { redes, guias, categoriasGuias } from "~/data/creador";

// Página /guias: tus canales arriba y, debajo, la biblioteca de guías con un
// control segmentado (como el de iOS) para filtrar por categoría. Cada guía
// publicada abre su propia página (/guias/<slug>) y se puede bajar en PDF.
// Las tarjetas siguen al puntero con un brillo suave y responden al
// presionarlas; al filtrar, las que quedan se reacomodan con un resorte.
defineProps({ numero: Number });

// ---------- Filtro ----------

const categoria = ref("Todas");
const visibles = computed(() =>
  categoria.value === "Todas" ? guias : guias.filter((g) => g.categoria === categoria.value)
);
const disponibles = guias.filter((g) => g.archivo).length;
const rutaGuia = (g) => `/guias/${g.slug}`;

// Solo se muestran las categorías que tienen guías (más "Todas")
const categorias = categoriasGuias.filter(
  (c) => c === "Todas" || guias.some((g) => g.categoria === c)
);

// La píldora del control segmentado se desliza hasta el botón activo
const segmentado = ref(null);
const pildora = ref({ x: 0, ancho: 0, lista: false });

function moverPildora() {
  const cont = segmentado.value;
  if (!cont) return;
  const boton = cont.querySelector(`[data-cat="${categoria.value}"]`);
  if (!boton) return;
  pildora.value = { x: boton.offsetLeft, ancho: boton.offsetWidth, lista: true };
}

// En móvil el control se desplaza de lado: el botón activo queda a la vista.
// Solo mueve el control (scrollIntoView movería toda la página).
function mostrarActivo() {
  const cont = segmentado.value;
  const boton = cont?.querySelector(`[data-cat="${categoria.value}"]`);
  if (!boton) return;
  const izq = boton.offsetLeft - 8;
  const der = boton.offsetLeft + boton.offsetWidth + 8;
  if (izq < cont.scrollLeft) cont.scrollTo({ left: izq, behavior: "smooth" });
  else if (der > cont.scrollLeft + cont.clientWidth) cont.scrollTo({ left: der - cont.clientWidth, behavior: "smooth" });
}

function elegir(c) {
  categoria.value = c;
  nextTick(() => {
    moverPildora();
    mostrarActivo();
  });
}

// Flechas izquierda/derecha para moverse entre categorías con el teclado
function alTeclado(e) {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  e.preventDefault();
  const i = categorias.indexOf(categoria.value);
  const sig = (i + (e.key === "ArrowRight" ? 1 : -1) + categorias.length) % categorias.length;
  elegir(categorias[sig]);
  segmentado.value.querySelector(`[data-cat="${categorias[sig]}"]`)?.focus();
}

// ---------- Brillo que sigue al puntero ----------
// Se escribe en variables CSS una vez por cuadro, en porcentaje del tamaño de
// la tarjeta (así no importa el zoom de la página).

let pendiente = null;
function alMoverPuntero(e) {
  const el = e.currentTarget;
  const x = e.clientX;
  const y = e.clientY;
  if (pendiente) cancelAnimationFrame(pendiente);
  pendiente = requestAnimationFrame(() => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(((x - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(((y - r.top) / r.height) * 100).toFixed(1)}%`);
    pendiente = null;
  });
}

const degradado = (tonos) => `linear-gradient(135deg, ${tonos.join(", ")})`;
const nombreArchivo = (ruta) => ruta.split("/").pop();

let observador = null;
onMounted(() => {
  moverPildora();
  // Si cambia el tamaño (zoom, rotación), la píldora se recoloca
  observador = new ResizeObserver(moverPildora);
  observador.observe(segmentado.value);
});
onBeforeUnmount(() => observador?.disconnect());
</script>

<template>
  <section id="guias" class="seccion guias">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Guías gratis"
      titulo="Aprende conmigo,"
      destacado="paso a paso."
      intro="Comparto lo que aprendo en mis redes y lo convierto en guías gratuitas para que puedas dominar cada skill a tu ritmo."
    />

    <!-- Redes -->
    <ul class="redes-grid" aria-label="Mis redes">
      <li v-for="red in redes" :key="red.red">
        <a
          :href="red.enlace"
          target="_blank"
          rel="noopener noreferrer"
          class="tarjeta-vidrio red-tarjeta"
          :style="{ '--grad': degradado(red.tonos), '--tono': red.tonos[1] }"
          @pointermove="alMoverPuntero"
        >
          <span class="red-icono"><IconoLinea :nombre="red.icono" /></span>
          <span class="red-nombre">{{ red.red }}</span>
          <span class="red-usuario">{{ red.usuario }}</span>
          <span class="red-texto">{{ red.texto }}</span>
          <span class="red-accion">
            {{ red.accion }}
            <IconoLinea nombre="flecha" />
          </span>
        </a>
      </li>
    </ul>

    <!-- Quién está detrás de Automata -->
    <GuiaAutor class="guia-autor--biblioteca" />

    <!-- Biblioteca de guías -->
    <div class="guias-barra">
      <div>
        <h3 class="guias-titulo">Biblioteca de guías</h3>
        <p class="guias-conteo">
          {{ guias.length }} guías · {{ disponibles }} {{ disponibles === 1 ? "lista" : "listas" }} para leer y descargar · PDF gratis
        </p>
      </div>

      <div
        ref="segmentado"
        class="segmentado"
        role="tablist"
        aria-label="Filtrar guías por categoría"
        @keydown="alTeclado"
      >
        <span
          class="segmentado-pildora"
          :class="{ lista: pildora.lista }"
          :style="{ translate: `${pildora.x}px 0`, width: `${pildora.ancho}px` }"
          aria-hidden="true"
        ></span>
        <button
          v-for="c in categorias"
          :key="c"
          type="button"
          role="tab"
          class="segmentado-boton"
          :data-cat="c"
          :aria-selected="categoria === c"
          :tabindex="categoria === c ? 0 : -1"
          @click="elegir(c)"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <TransitionGroup tag="ul" name="guia" class="guias-grid" role="tabpanel">
      <li v-for="guia in visibles" :key="guia.titulo" class="guia-item">
        <article
          class="tarjeta-vidrio guia-tarjeta"
          :class="{ 'guia-pronto': !guia.slug }"
          :style="{ '--tono': guia.tono }"
          @pointermove="alMoverPuntero"
        >
          <!-- Portada: un documento que flota sobre su color -->
          <div class="guia-portada" aria-hidden="true">
            <template v-if="guia.mascota">
              <span class="guia-mascota-halo"></span>
              <img :src="guia.mascota" alt="" class="guia-mascota-portada" loading="lazy" decoding="async" />
            </template>
            <template v-else>
              <span class="guia-hoja guia-hoja--atras"></span>
              <span class="guia-hoja">
                <IconoLinea :nombre="guia.icono" />
                <span class="guia-lineas"><i></i><i></i><i></i></span>
              </span>
            </template>
            <span class="guia-formato">PDF</span>
          </div>

          <div class="guia-cuerpo">
            <div class="guia-meta">
              <span class="chip"><span class="chip-punto"></span>{{ guia.categoria }}</span>
              <span class="guia-nivel">{{ guia.nivel }}</span>
            </div>
            <h3>
              <a v-if="guia.slug" :href="rutaGuia(guia)" class="guia-enlace">{{ guia.titulo }}</a>
              <template v-else>{{ guia.titulo }}</template>
            </h3>
            <p class="guia-descripcion">{{ guia.descripcion }}</p>

            <div class="guia-acciones">
              <a v-if="guia.slug" :href="rutaGuia(guia)" class="boton-principal guia-descargar">
                Leer guía<IconoLinea nombre="flecha" />
              </a>
              <a
                v-if="guia.archivo"
                :href="guia.archivo"
                :download="nombreArchivo(guia.archivo)"
                class="guia-video guia-pdf"
              >
                <IconoLinea nombre="descargar" />PDF
              </a>
              <span v-if="!guia.slug" class="guia-proximamente">
                <span class="punto-vivo"></span>Próximamente
              </span>
              <a
                v-if="guia.video"
                :href="guia.video"
                target="_blank"
                rel="noopener noreferrer"
                class="guia-video"
              >
                <IconoLinea nombre="play" />Ver video
              </a>
            </div>
          </div>
        </article>
      </li>
    </TransitionGroup>
  </section>
</template>
