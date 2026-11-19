<script setup>
import { perfil } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// Pantalla de carga al estilo del arranque de un Mac: el nombre y una barra
// fina que avanza con lo que de verdad falta por cargar (las fuentes y las
// imágenes de la primera pantalla), no con un tiempo fijo. Si todo ya está
// en caché, se va casi de inmediato. Solo usa CSS (transform y opacity),
// nada de canvas, para no gastar batería mientras carga lo importante.
// Al terminar avisa con `terminado` y app.vue muestra la página.
const emit = defineEmits(["terminado"]);

const MINIMO = 600; // ms: lo justo para que el nombre se alcance a ver
const TOPE = 4000; // ms: con una conexión lenta, la página entra igual
const LLENADO = 320; // ms: lo que tarda la barra en completarse al final

// Lo que se espera: imágenes visibles al abrir la página
const PRIMERA_PANTALLA = "header img, #about img, .bg-1 img, .bg-2 img";

const progreso = ref(0); // 0..1
const porcentaje = computed(() => Math.round(progreso.value * 100));

let avisado = false;
function terminar() {
  if (avisado) return;
  avisado = true;
  progreso.value = 1;
  setTimeout(() => emit("terminado"), reducirMovimiento() ? 0 : LLENADO);
}

// Una promesa por imagen que se resuelve al cargar o al fallar (una imagen
// rota no debe bloquear la entrada)
function imagenLista(img) {
  if (img.complete) return Promise.resolve();
  return new Promise((listo) => {
    img.addEventListener("load", listo, { once: true });
    img.addEventListener("error", listo, { once: true });
  });
}

onMounted(() => {
  const inicio = performance.now();
  const tareas = [
    document.fonts?.ready ?? Promise.resolve(),
    ...[...document.querySelectorAll(PRIMERA_PANTALLA)].map(imagenLista),
  ];

  // La barra arranca con un poco de avance para que se note que está viva
  let hechas = 0;
  progreso.value = 0.08;
  for (const tarea of tareas) {
    tarea.then(() => {
      hechas++;
      // Nunca llega a 100% sola: el final lo marca terminar()
      progreso.value = Math.max(progreso.value, 0.08 + (hechas / tareas.length) * 0.82);
    });
  }

  Promise.all(tareas).then(() => {
    const falta = MINIMO - (performance.now() - inicio);
    setTimeout(terminar, Math.max(0, falta));
  });
  setTimeout(terminar, TOPE);
});
</script>

<template>
  <div
    id="loader"
    class="carga"
    role="progressbar"
    aria-label="Cargando el portafolio"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="porcentaje"
  >
    <div class="carga-aura" aria-hidden="true"></div>

    <div class="carga-centro">
      <p class="carga-alias">{{ perfil.alias }}</p>
      <p class="carga-nombre">{{ perfil.nombre }}</p>
      <p class="carga-cargo">{{ perfil.cargo }}</p>

      <div class="carga-barra" aria-hidden="true">
        <span :style="{ transform: `scaleX(${progreso})` }"></span>
      </div>
    </div>
  </div>
</template>
