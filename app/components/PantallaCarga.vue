<script setup>
import { perfil } from "~/data/perfil";
import { reducirMovimiento } from "~/utils/motion";

// Pantalla de carga como secuencia de sincronización: una lluvia de
// caracteres roja (estilo Matrix) de la que emerge el porcentaje, formado por
// los mismos caracteres. Debajo, el registro muestra una línea a la vez.
// Al terminar avisa con `terminado` y app.vue muestra la página.
const emit = defineEmits(["terminado"]);

const DURACION = 3800; // de 0 a 100%
const FINAL = 1300; // al llegar a 100%: destello breve, y el número y los textos caen

const progreso = ref(0); // 0..1

// Se ve una sola línea a la vez: cada una aparece cuando el progreso llega a
// `aparece`, se marca en `en` y la siguiente la reemplaza en el mismo lugar
const registro = [
  { texto: "Cargando proyectos", aparece: 0.02, en: 0.18 },
  { texto: "Sincronizando escenas", aparece: 0.26, en: 0.42 },
  { texto: "Calibrando parallax", aparece: 0.5, en: 0.66 },
  { texto: "Todo listo", aparece: 0.76, en: 0.94 },
];

const porcentaje = computed(() => Math.round(progreso.value * 100));
const listo = computed(() => progreso.value >= 1);
const cayendo = ref(false); // al llegar a 100%: el número y los textos caen
const lineaActual = computed(() => registro.findLast((l) => progreso.value >= l.aparece));

// Los mismos caracteres para la lluvia y el número
const SIGNOS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFXZ<>#%&*+=";
const azar = () => SIGNOS[Math.floor(Math.random() * SIGNOS.length)];

// ---------- Lluvia y número ----------

const raiz = ref(null);
const lienzo = ref(null);
const ancla = ref(null); // marca dónde va centrado el número
const TAMANO = 16; // px por carácter (una celda)
let ctx = null;
let columnas = [];
let ancho = 0;
let alto = 0;
let filas = 0;
let ppp = 1;

// El número usa su propia cuadrícula, más fina que la lluvia, para que los
// dígitos se lean nítidos (como un panel de puntos)
const CELDA_NUMERO = 9;

// Celdas que forman el número: { col, fila, signo, calor }, y el ajuste en px
// que lo centra exactamente. `calor` (0..1) es cuánto brilla la celda:
// sube con los choques de la lluvia y se contagia a las vecinas
let celdasNumero = [];
let ajusteX = 0;
let ajusteY = 0;
let indiceNumero = new Map();
let chispas = []; // { x, y, vx, vy, vida }
let rayos = []; // { x, y, angulo, largo, vida, duracion, ramas }
let luz = 0; // cuánto ilumina el fondo la descarga actual (0..1)
let centroNumero = { x: 0, y: 0 };
let numeroDibujado = -1;
let molde = null;

function preparar() {
  const r = lienzo.value.getBoundingClientRect();
  ppp = Math.min(window.devicePixelRatio || 1, 2);
  ancho = r.width;
  alto = r.height;
  lienzo.value.width = Math.round(ancho * ppp);
  lienzo.value.height = Math.round(alto * ppp);
  ctx = lienzo.value.getContext("2d");
  ctx.setTransform(ppp, 0, 0, ppp, 0, 0);
  ctx.font = `600 ${TAMANO}px ui-monospace, "SF Mono", Menlo, monospace`;
  ctx.textBaseline = "top";
  filas = Math.ceil(alto / TAMANO);
  columnas = Array.from({ length: Math.ceil(ancho / TAMANO) }, () => ({
    y: -Math.random() * filas,
    velocidad: 8 + Math.random() * 18,
    cabeza: null,
  }));
  // Molde: un lienzo pequeño donde cada píxel es una celda del número
  molde = document.createElement("canvas");
  molde.width = Math.ceil(ancho / CELDA_NUMERO);
  molde.height = Math.ceil(alto / CELDA_NUMERO);
  numeroDibujado = -1;
}

// Calcula qué celdas caen dentro del número, centrado en el núcleo
function moldearNumero(valor) {
  const m = molde.getContext("2d", { willReadFrequently: true });
  m.clearRect(0, 0, molde.width, molde.height);
  const n = ancla.value.getBoundingClientRect();
  const l = lienzo.value.getBoundingClientRect();
  const cx = ((n.left + n.width / 2 - l.left) / l.width) * molde.width;
  const cy = ((n.top + n.height / 2 - l.top) / l.height) * molde.height;
  // Alto del número: un 85% del espacio reservado (en celdas del molde)
  const altoNumero = Math.max(14, Math.round(((n.height / l.height) * alto * 0.85) / CELDA_NUMERO));
  const texto = `${valor}`;
  m.fillStyle = "#fff";
  m.textBaseline = "middle";
  m.font = `900 ${altoNumero}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  const anchoNumero = m.measureText(texto).width;
  const tamanoSigno = Math.round(altoNumero * 0.45);
  m.font = `900 ${tamanoSigno}px "Arial Black", Arial, sans-serif`;
  const anchoSigno = m.measureText("%").width;
  // Número y "%" centrados juntos en el núcleo
  const x0 = cx - (anchoNumero + anchoSigno + 1) / 2;
  m.font = `900 ${altoNumero}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  m.fillText(texto, x0, cy);
  m.font = `900 ${tamanoSigno}px "Arial Black", Arial, sans-serif`;
  m.fillText("%", x0 + anchoNumero + 1, cy + altoNumero * 0.22);

  const datos = m.getImageData(0, 0, molde.width, molde.height).data;
  const anteriores = new Map(celdasNumero.map((c) => [c.col + "," + c.fila, c]));
  celdasNumero = [];
  for (let fila = 0; fila < molde.height; fila++) {
    for (let col = 0; col < molde.width; col++) {
      if (datos[(fila * molde.width + col) * 4 + 3] > 110) {
        const previa = anteriores.get(col + "," + fila);
        celdasNumero.push({ col, fila, signo: previa?.signo || azar(), calor: previa?.calor || 0 });
      }
    }
  }
  // Centra el contorno real del número en el centro del núcleo (en px),
  // sin depender de la cuadrícula ni de la línea base de la fuente
  if (celdasNumero.length) {
    let minCol = Infinity, maxCol = -Infinity, minFila = Infinity, maxFila = -Infinity;
    for (const c of celdasNumero) {
      minCol = Math.min(minCol, c.col);
      maxCol = Math.max(maxCol, c.col);
      minFila = Math.min(minFila, c.fila);
      maxFila = Math.max(maxFila, c.fila);
    }
    const centroX = ((n.left + n.width / 2 - l.left) / l.width) * ancho;
    const centroY = ((n.top + n.height / 2 - l.top) / l.height) * alto;
    ajusteX = centroX - ((minCol + maxCol + 1) / 2) * CELDA_NUMERO;
    ajusteY = centroY - ((minFila + maxFila + 1) / 2) * CELDA_NUMERO;
    centroNumero = { x: centroX, y: centroY };
  }
  indiceNumero = new Map(celdasNumero.map((c) => [c.col + "," + c.fila, c]));
  numeroDibujado = valor;
}

function dibujar(dt, acelerar, destello, caida) {
  const p = progreso.value;

  // Velo oscuro: lo dibujado antes se desvanece y deja la estela
  ctx.fillStyle = `rgba(11, 11, 14, ${Math.min(0.9, dt * 6)})`;
  ctx.fillRect(0, 0, ancho, alto);

  // Lluvia atenuada: el fondo queda opaco para que el número sea protagonista
  ctx.globalAlpha = 0.45;
  columnas.forEach((c, i) => {
    const x = i * TAMANO;
    const fila = Math.floor(c.y);
    // Al bajar una fila, el carácter de la cabeza queda en rojo como estela
    if (fila >= 0 && (!c.cabeza || fila !== c.cabeza.y)) {
      if (c.cabeza) {
        ctx.fillStyle = "#ff2d55";
        ctx.fillText(c.cabeza.signo, x, c.cabeza.y * TAMANO);
      }
      c.cabeza = { signo: azar(), y: fila };
      chocar(x + TAMANO / 2, fila * TAMANO + TAMANO / 2);
    }
    if (c.cabeza) {
      ctx.fillStyle = "#ffe3e8";
      ctx.fillText(c.cabeza.signo, x, c.cabeza.y * TAMANO);
    }
    c.y += c.velocidad * acelerar * dt;
    // Al salir por abajo vuelve a caer desde arriba (a veces con una pausa)
    if (c.y * TAMANO > alto && Math.random() > 0.96) {
      c.y = -Math.random() * 10;
      c.velocidad = 8 + Math.random() * 18;
      c.cabeza = null;
    }
  });
  ctx.globalAlpha = 1;

  // Infección: cuanto mayor es el número, más celdas se encienden solas y más
  // rápido se contagia el brillo a las vecinas. El calor se va apagando.
  const encendidas = celdasNumero.length * p * p * dt * 0.6;
  for (let k = 0; k < encendidas; k++) {
    const celda = celdasNumero[Math.floor(Math.random() * celdasNumero.length)];
    if (celda) celda.calor = 1;
  }
  const contagio = (0.6 + p * 5) * dt;
  for (const celda of celdasNumero) {
    if (celda.calor > 0.55 && Math.random() < contagio) {
      const vecina = indiceNumero.get(
        celda.col + Math.round(Math.random() * 2 - 1) + "," + (celda.fila + Math.round(Math.random() * 2 - 1))
      );
      if (vecina && vecina.calor < celda.calor * 0.9) vecina.calor = celda.calor * 0.9;
    }
    celda.calor = Math.max(0, celda.calor - dt * (1.4 - p * 0.7));
  }

  // Descargas eléctricas: salen de las celdas encendidas, más frecuentes y
  // largas cuanto mayor es el número
  const ritmo = (0.3 + p * p * 3) * dt;
  if (celdasNumero.length && Math.random() < ritmo) disparar(p);
  // La descarga ilumina el fondo desde el número hacia afuera
  if (luz > 0.01) {
    const r = Math.max(ancho, alto) * (0.35 + luz * 0.3);
    const g = ctx.createRadialGradient(centroNumero.x, centroNumero.y, 0, centroNumero.x, centroNumero.y, r);
    g.addColorStop(0, `rgba(255, 90, 120, ${(luz * 0.26).toFixed(3)})`);
    g.addColorStop(0.4, `rgba(255, 45, 85, ${(luz * 0.09).toFixed(3)})`);
    g.addColorStop(1, "rgba(255, 45, 85, 0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = "source-over";
  }
  // Se apaga rápido: son destellos, no una luz fija
  luz = Math.max(0, luz - dt * 7);

  // Al llegar a 100% el número se desmorona: cada celda se suelta con un
  // pequeño desfase y cae con gravedad mientras se desvanece
  if (caida > 0) {
    for (const celda of celdasNumero) {
      if (celda.retraso === undefined) {
        celda.retraso = Math.random() * 0.35;
        celda.dy = 0;
        celda.vy = -40 - Math.random() * 60; // un pequeño salto antes de caer
        celda.dx = (Math.random() - 0.5) * 30;
      }
      if (caida > celda.retraso) {
        celda.vy += 1400 * dt;
        celda.dy += celda.vy * dt;
      }
    }
  }
  const desplazar = (celda) => (caida > 0 ? celda.dy || 0 : 0);
  const visible = (celda) => (caida > 0 ? Math.max(0, 1 - (celda.dy || 0) / 380) : 1);

  // El número: un punto por celda (panel LED) que brilla más con el progreso
  // y con el calor de cada celda; encima, caracteres que parpadean
  const base = 0.18 + p * 0.3;
  for (const celda of celdasNumero) {
    const v = visible(celda);
    if (v <= 0) continue;
    const a = (destello > 0 ? 0.25 + destello * 0.5 : base + celda.calor * 0.55) * v;
    ctx.fillStyle = celda.calor > 0.7 || destello > 0 ? `rgba(255, 220, 228, ${a.toFixed(2)})` : `rgba(255, 45, 85, ${a.toFixed(2)})`;
    ctx.fillRect(
      celda.col * CELDA_NUMERO + ajusteX + 1 + (caida > 0 ? celda.dx * Math.min(1, (celda.dy || 0) / 200) : 0),
      celda.fila * CELDA_NUMERO + ajusteY + 1 + desplazar(celda),
      CELDA_NUMERO - 2,
      CELDA_NUMERO - 2
    );
  }
  ctx.font = `700 ${CELDA_NUMERO + 1}px ui-monospace, "SF Mono", Menlo, monospace`;
  for (const celda of celdasNumero) {
    if (Math.random() < 0.08 + celda.calor * 0.3) celda.signo = azar();
    const v = visible(celda);
    if (v <= 0) continue;
    const calor = destello > 0 ? 1 : celda.calor;
    ctx.globalAlpha = v;
    ctx.fillStyle = calor > 0.75 ? "#ffffff" : calor > 0.35 ? "#ff8fa3" : `rgba(255, 45, 85, ${(0.5 + p * 0.5).toFixed(2)})`;
    if (calor > 0.5) {
      ctx.shadowColor = "#ff4060";
      ctx.shadowBlur = 6 + calor * 8;
    }
    ctx.fillText(
      celda.signo,
      celda.col * CELDA_NUMERO + ajusteX + (caida > 0 ? celda.dx * Math.min(1, (celda.dy || 0) / 200) : 0),
      celda.fila * CELDA_NUMERO + ajusteY + desplazar(celda)
    );
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  dibujarRayos(dt);

  // Chispas de los choques
  for (const ch of chispas) {
    ch.x += ch.vx * dt;
    ch.y += ch.vy * dt;
    ch.vy += 260 * dt;
    ch.vida -= dt * 2.4;
    if (ch.vida <= 0) continue;
    ctx.globalAlpha = ch.vida;
    ctx.fillStyle = ch.vida > 0.6 ? "#ffffff" : "#ff6b81";
    ctx.fillRect(ch.x, ch.y, 2, 2);
  }
  ctx.globalAlpha = 1;
  chispas = chispas.filter((ch) => ch.vida > 0);

  ctx.font = `600 ${TAMANO}px ui-monospace, "SF Mono", Menlo, monospace`;
}

// ---------- Electricidad ----------

// Lanza un rayo desde una celda encendida del número, hacia afuera
function disparar(p) {
  const encendidas = celdasNumero.filter((c) => c.calor > 0.5);
  const lista = encendidas.length ? encendidas : celdasNumero;
  const celda = lista[Math.floor(Math.random() * lista.length)];
  celda.calor = 1;
  const x = celda.col * CELDA_NUMERO + ajusteX + CELDA_NUMERO / 2;
  const y = celda.fila * CELDA_NUMERO + ajusteY + CELDA_NUMERO / 2;
  const angulo = Math.atan2(y - centroNumero.y, x - centroNumero.x) + (Math.random() - 0.5) * 1.2;
  const duracion = 0.12 + Math.random() * 0.16;
  rayos.push({
    x,
    y,
    angulo,
    largo: (50 + Math.random() * 80) * (0.6 + p * 1),
    vida: duracion,
    duracion,
    ramas: Math.random() < 0.15 + p * 0.25,
  });
  luz = Math.min(1, luz + 0.12 + p * 0.15);
  // El impacto también enciende las celdas de alrededor
  for (let k = 0; k < 6; k++) {
    const vecina = indiceNumero.get(celda.col + Math.round(Math.random() * 4 - 2) + "," + (celda.fila + Math.round(Math.random() * 4 - 2)));
    if (vecina) vecina.calor = 1;
  }
}

// Un trazo en zigzag desde (x, y) en una dirección; se rehace en cada cuadro
// para que crepite
function trazoRayo(x, y, angulo, largo) {
  const tramos = 7 + Math.floor(Math.random() * 6);
  const puntos = [[x, y]];
  for (let i = 1; i <= tramos; i++) {
    const t = i / tramos;
    const desvio = (Math.random() - 0.5) * largo * 0.28 * (1 - t * 0.4);
    puntos.push([
      x + Math.cos(angulo) * largo * t - Math.sin(angulo) * desvio,
      y + Math.sin(angulo) * largo * t + Math.cos(angulo) * desvio,
    ]);
  }
  return puntos;
}

function pintarTrazo(puntos, grosor, alfa) {
  ctx.beginPath();
  ctx.moveTo(puntos[0][0], puntos[0][1]);
  for (let i = 1; i < puntos.length; i++) ctx.lineTo(puntos[i][0], puntos[i][1]);
  // Resplandor ancho y rojo, y encima un núcleo blanco fino
  ctx.globalAlpha = alfa * 0.25;
  ctx.strokeStyle = "#ff4060";
  ctx.lineWidth = grosor * 3;
  ctx.shadowColor = "#ff2d55";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.globalAlpha = alfa * 0.55;
  ctx.strokeStyle = "#ffd6dd";
  ctx.lineWidth = grosor;
  ctx.shadowBlur = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function dibujarRayos(dt) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const rayo of rayos) {
    rayo.vida -= dt;
    if (rayo.vida <= 0) continue;
    // Parpadea mientras vive, como una descarga real
    const alfa = (rayo.vida / rayo.duracion) * (0.6 + Math.random() * 0.4);
    const puntos = trazoRayo(rayo.x, rayo.y, rayo.angulo, rayo.largo);
    pintarTrazo(puntos, 1.1, alfa);
    // Ramas que salen de la mitad del rayo
    if (rayo.ramas) {
      const [bx, by] = puntos[Math.floor(puntos.length / 2)];
      pintarTrazo(trazoRayo(bx, by, rayo.angulo + (Math.random() < 0.5 ? -0.8 : 0.8), rayo.largo * 0.45), 1, alfa * 0.8);
    }
    // Chispas en la punta
    if (Math.random() < 0.2) {
      const [px, py] = puntos[puntos.length - 1];
      chispas.push({ x: px, y: py, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, vida: 0.7 });
    }
  }
  rayos = rayos.filter((r) => r.vida > 0);
}

// Una gota de lluvia que cae sobre el número lo enciende y suelta chispas
function chocar(x, y) {
  const celda = indiceNumero.get(
    Math.floor((x - ajusteX) / CELDA_NUMERO) + "," + Math.floor((y - ajusteY) / CELDA_NUMERO)
  );
  if (!celda) return;
  celda.calor = 1;
  const cuantas = 3 + Math.floor(progreso.value * 5);
  for (let k = 0; k < cuantas && chispas.length < 220; k++) {
    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
    const fuerza = 60 + Math.random() * 140;
    chispas.push({ x, y, vx: Math.cos(angulo) * fuerza, vy: Math.sin(angulo) * fuerza, vida: 1 });
  }
}

let cuadro;
let avisado = false;
function avisar() {
  if (avisado) return;
  avisado = true;
  emit("terminado");
}

onMounted(() => {
  if (reducirMovimiento()) {
    progreso.value = 1;
    setTimeout(avisar, 900);
    return;
  }

  preparar();
  const inicio = performance.now();
  let ultimo = inicio;
  let terminoEn = 0;

  function paso(ahora) {
    // Se detiene sola cuando app.vue oculta la pantalla de carga
    if (!raiz.value || raiz.value.style.display === "none") return;
    const dt = Math.min((ahora - ultimo) / 1000, 0.1);
    ultimo = ahora;

    const t = Math.min(1, (ahora - inicio) / DURACION);
    // Avanza a buen ritmo y se asienta al final, como una carga real
    progreso.value = 1 - Math.pow(1 - t, 2.2);
    if (porcentaje.value !== numeroDibujado) moldearNumero(porcentaje.value);

    let destello = 0;
    let caida = 0;
    if (t >= 1) {
      if (!terminoEn) terminoEn = ahora;
      const f = (ahora - terminoEn) / FINAL;
      // Destello breve al llegar a 100%; luego el número y los textos caen
      destello = Math.max(0, 1 - f * 5);
      caida = Math.max(0, (ahora - terminoEn) / 1000 - 0.18);
      if (caida > 0 && !cayendo.value) cayendo.value = true;
      if (f >= 1) avisar();
    }
    // Al llegar a 100% la lluvia se acelera de golpe
    dibujar(dt, t >= 1 ? 4 : 1, destello, caida);
    cuadro = requestAnimationFrame(paso);
  }
  cuadro = requestAnimationFrame(paso);
});

onBeforeUnmount(() => cancelAnimationFrame(cuadro));
</script>

<template>
  <div id="loader" ref="raiz" class="carga" :class="{ listo }" role="status" :aria-label="`Cargando ${porcentaje}%`">
    <canvas ref="lienzo" class="carga-lluvia" aria-hidden="true"></canvas>
    <div class="carga-halo" aria-hidden="true"></div>
    <div class="carga-esquinas" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="carga-lineas" aria-hidden="true"></div>

    <div class="carga-centro">
      <!-- Espacio del número: lo dibuja la lluvia, centrado aquí -->
      <div ref="ancla" class="carga-ancla" aria-hidden="true"></div>

      <div class="carga-texto" :class="{ cayendo }">
        <p class="carga-etiqueta">Secuencia de sincronización</p>
        <p class="carga-cargo">{{ perfil.cargo }}</p>

        <!-- Registro de arranque: una línea a la vez -->
        <div class="carga-registro" aria-hidden="true">
          <Transition name="carga-linea" mode="out-in">
            <p v-if="lineaActual" :key="lineaActual.texto" :class="{ hecho: progreso >= lineaActual.en }">
              <span class="carga-check"></span>{{ lineaActual.texto }}
            </p>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
