<script setup>
import { redes, guias, categoriasGuias } from "~/data/creador";

// Guías y redes: tus canales arriba y, debajo, la biblioteca de guías en PDF
// con un control segmentado (como el de iOS) para filtrar por categoría.
// Las tarjetas siguen al puntero con un brillo suave y responden al
// presionarlas; al filtrar, las que quedan se reacomodan con un resorte.
defineProps({ numero: Number });

// ---------- Filtro ----------

const categoria = ref("Todas");
const visibles = computed(() =>
  categoria.value === "Todas" ? guias : guias.filter((g) => g.categoria === categoria.value)
);
const disponibles = guias.filter((g) => g.archivo).length;

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
  // En móvil el control se desplaza: el botón activo queda a la vista
  boton.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function elegir(c) {
  categoria.value = c;
  nextTick(moverPildora);
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
      etiqueta="Guías y redes"
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

    <!-- Biblioteca de guías -->
    <div class="guias-barra">
      <div>
        <h3 class="guias-titulo">Biblioteca de guías</h3>
        <p class="guias-conteo">
          {{ guias.length }} guías · {{ disponibles }} listas para descargar · PDF gratis
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
          :class="{ 'guia-pronto': !guia.archivo }"
          :style="{ '--tono': guia.tono }"
          @pointermove="alMoverPuntero"
        >
          <!-- Portada: un documento que flota sobre su color -->
          <div class="guia-portada" aria-hidden="true">
            <span class="guia-hoja guia-hoja--atras"></span>
            <span class="guia-hoja">
              <IconoLinea :nombre="guia.icono" />
              <span class="guia-lineas"><i></i><i></i><i></i></span>
            </span>
            <span class="guia-formato">PDF</span>
          </div>

          <div class="guia-cuerpo">
            <div class="guia-meta">
              <span class="chip"><span class="chip-punto"></span>{{ guia.categoria }}</span>
              <span class="guia-nivel">{{ guia.nivel }}</span>
            </div>
            <h3>{{ guia.titulo }}</h3>
            <p class="guia-descripcion">{{ guia.descripcion }}</p>

            <div class="guia-acciones">
              <a
                v-if="guia.archivo"
                :href="guia.archivo"
                :download="nombreArchivo(guia.archivo)"
                class="boton-principal guia-descargar"
              >
                <IconoLinea nombre="descargar" />Descargar
              </a>
              <span v-else class="guia-proximamente">
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
