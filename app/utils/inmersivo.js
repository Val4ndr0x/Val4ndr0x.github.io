// Modo inmersivo: el scroll dirige la página. Cada elemento se acerca y se
// agranda al entrar en pantalla, queda nítido en el centro y se aleja al
// salir. Los valores se pasan como variables CSS (--i-*) y el CSS de
// `html.inmersivo` los aplica (ver main.css).
import { escalaPagina, reducirMovimiento } from "./motion";

const SELECTOR = [
  "#about",
  ".seccion-cabecera",
  ".proyecto-tarjeta",
  ".tarjeta-vidrio",
  ".proceso-paso",
  ".orbita-escena",
  ".invitacion-escritorio",
].join(", ");

// Las escenas de "Sobre mí", "Servicios", "Proyectos", "Proceso", "Trayectoria" e "Insignias" ya tienen su propio recorrido fijo
const EXCLUIR = ".sobre-inmersiva, .proceso-pista.en-espacio, .trayectoria-pista.en-escena, .insignias-pista.en-escena, .proyectos-pista.en-escena, .servicios-pista.en-escena, .ventana, #desktop";

const VARIABLES = ["--i-y", "--i-s", "--i-rx", "--i-o", "--i-b"];

const limitar = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const suave = (t) => t * t * (3 - 2 * t);

// Último valor aplicado a cada elemento, para descontar su propio
// desplazamiento y escala al medirlo
const aplicado = new WeakMap();
let activo = false;
let pendiente = false;

// d: posición del centro del elemento respecto al de la pantalla.
// 1 = acaba de asomar por abajo, 0 = centrado, -1 = se fue por arriba.
function valores(tipo, d) {
  const entrando = limitar(d);
  const saliendo = limitar(-d);

  if (tipo === "portada") {
    // La portada se agranda y se desvanece al hacer scroll, como un telón
    const t = limitar((saliendo - 0.05) / 0.6);
    return { y: -40 * t, s: 1 + 0.18 * t, rx: 0, o: 1 - t, b: 10 * t };
  }

  if (tipo === "titulo") {
    // Los títulos llegan desde lejos (grandes y desenfocados) y se asientan
    const t = suave(limitar((entrando - 0.1) / 0.8));
    const f = limitar((saliendo - 0.5) / 0.5);
    return { y: 60 * t - 30 * f, s: 1 + 0.22 * t - 0.04 * f, rx: 0, o: 1 - t * 0.9 - f, b: 12 * t * t };
  }

  // Tarjetas y bloques: suben inclinados hacia atrás y crecen hasta su tamaño
  const t = suave(limitar((entrando - 0.05) / 0.9));
  const f = limitar((saliendo - 0.55) / 0.45);
  return {
    y: 90 * t - 24 * saliendo,
    s: 1 - 0.14 * t - 0.05 * saliendo,
    rx: 16 * t - 4 * saliendo,
    o: 1 - limitar((t - 0.3) / 0.7) - f,
    b: 0,
  };
}

function tipoDe(el) {
  if (el.id === "about") return "portada";
  if (el.classList.contains("seccion-cabecera")) return "titulo";
  return "item";
}

function actualizar() {
  pendiente = false;
  if (!activo) return;

  const alto = window.innerHeight;
  const e = escalaPagina();
  const elementos = [...document.querySelectorAll(SELECTOR)].filter((el) => !el.closest(EXCLUIR));

  // Primero se mide todo y después se escribe, para no forzar el layout en cada elemento
  const medidas = elementos.map((el) => {
    const r = el.getBoundingClientRect();
    const previo = aplicado.get(el) || { y: 0, s: 1 };
    const altoReal = r.height / previo.s;
    const centro = r.top + r.height / 2 - previo.y * e;
    return limitar((centro - alto / 2) / (alto / 2 + altoReal / 2), -1.2, 1.2);
  });


  elementos.forEach((el, i) => {
    const tipo = tipoDe(el);
    const v = valores(tipo, medidas[i]);
    aplicado.set(el, v);
    el.style.setProperty("--i-y", v.y.toFixed(1) + "px");
    el.style.setProperty("--i-s", v.s.toFixed(4));
    el.style.setProperty("--i-rx", v.rx.toFixed(2) + "deg");
    el.style.setProperty("--i-o", limitar(v.o).toFixed(3));
    el.style.setProperty("--i-b", v.b.toFixed(1) + "px");

    // Los títulos se "sincronizan" (glitch del Animus) la primera vez que llegan
    if (tipo === "titulo" && medidas[i] < 0.55 && !el.dataset.sincronizado) {
      el.dataset.sincronizado = "1";
    }
  });
}

function programar() {
  if (!pendiente) {
    pendiente = true;
    requestAnimationFrame(actualizar);
  }
}

// Mientras cambia el contenido (filtros, pestañas) se sigue midiendo un momento
let rafaga;
function medirDuranteUnMomento() {
  clearInterval(rafaga);
  let veces = 0;
  rafaga = setInterval(() => {
    programar();
    if (++veces > 40) clearInterval(rafaga);
  }, 30);
}

export function activarInmersivo() {
  document.documentElement.classList.add("inmersivo");
  if (activo || reducirMovimiento()) return;
  activo = true;
  window.addEventListener("scroll", programar, { passive: true });
  window.addEventListener("resize", programar);
  document.addEventListener("click", medirDuranteUnMomento);
  medirDuranteUnMomento();
}

export function desactivarInmersivo() {
  document.documentElement.classList.remove("inmersivo");
  activo = false;
  window.removeEventListener("scroll", programar);
  window.removeEventListener("resize", programar);
  document.removeEventListener("click", medirDuranteUnMomento);
  clearInterval(rafaga);
  document.querySelectorAll(SELECTOR).forEach((el) => {
    VARIABLES.forEach((v) => el.style.removeProperty(v));
    aplicado.delete(el);
  });
}

// Para volver a medir cuando aparece contenido nuevo (p. ej. tras la carga)
export function refrescarInmersivo() {
  if (activo) medirDuranteUnMomento();
}

export function inmersivoActivo() {
  return document.documentElement.classList.contains("inmersivo");
}
