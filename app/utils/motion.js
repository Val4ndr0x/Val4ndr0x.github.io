// Motion: animaciones con resortes al estilo Apple.
// Reglas: responder al instante, partir siempre del valor que se ve en
// pantalla (para poder interrumpir cualquier animación) y usar resortes en
// vez de duraciones fijas.
// Todo lo que toca window/document se llama desde onMounted (solo navegador).

// Curvas de resorte precalculadas (amortiguación / respuesta en segundos).
// Las mismas curvas están en main.css como --resorte-*.
export const RESORTE = {
  // amortiguación 1.0, respuesta 0.45 s: sin rebote, para casi todo
  suave: {
    duration: 630,
    easing:
      "linear(0, 0.0254, 0.0868, 0.1674, 0.2559, 0.3452, 0.4308, 0.51, 0.5816, 0.6452, 0.7009, 0.7491, 0.7905, 0.8257, 0.8555, 0.8806, 0.9016, 0.9191, 0.9336, 0.9456, 0.9556, 0.9638, 0.9705, 0.976, 0.9805, 0.9842, 0.9872, 0.9896, 0.9916, 0.9932, 0.9945, 0.9956, 0.9965, 0.9971, 0.9977, 0.9982, 1)",
  },
  // amortiguación 0.72, respuesta 0.42 s: rebote leve, para elementos que se "lanzan"
  rebote: {
    duration: 520,
    easing:
      "linear(0, 0.021, 0.0756, 0.1525, 0.2427, 0.339, 0.4361, 0.5297, 0.617, 0.6964, 0.7666, 0.8274, 0.8788, 0.9214, 0.9557, 0.9826, 1.003, 1.0178, 1.0279, 1.0343, 1.0375, 1.0384, 1.0375, 1.0354, 1.0324, 1.0289, 1.0252, 1.0215, 1.0179, 1.0145, 1.0115, 1.0088, 1.0065, 1.0046, 1.0029, 1.0016, 1)",
  },
};

// Envuelve un manejador de scroll para que corra como mucho una vez por
// cuadro, justo antes de pintar: así las lecturas de medidas no obligan al
// navegador a recalcular la maquetación varias veces en el mismo cuadro.
export function unaVezPorCuadro(fn) {
  let pendiente = false;
  return () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      fn();
    });
  };
}

// Desenfoque para las escenas guiadas por el scroll, redondeado a pasos de
// 2px: cambiar el filtro obliga a repintar el elemento, así que con valores
// escalonados se repinta unas pocas veces por transición y no en cada cuadro.
export function desenfoque(px) {
  const escalon = Math.round(px / 2) * 2;
  return escalon > 0 ? `blur(${escalon}px)` : "none";
}

// Equipo modesto (lo detecta el script en línea de nuxt.config.ts): se
// mantienen las escenas, pero sin la decoración que más memoria gasta
export function equipoLigero() {
  return document.documentElement.classList.contains("ligero");
}

export function reducirMovimiento() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Zoom aplicado a la página (ver nuxt.config.ts). Las medidas de
// getBoundingClientRect vienen en píxeles de pantalla y hay que dividirlas
// para usarlas en estilos.
// Se guarda: leerla con getComputedStyle en cada cuadro obliga al navegador a
// tener los estilos al día justo en medio de las animaciones.
let escalaGuardada = null;
export function escalaPagina() {
  if (escalaGuardada === null) {
    escalaGuardada =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--escala")) || 1;
  }
  return escalaGuardada;
}

// ---------- Geometría guardada ----------

// Las escenas guiadas por el scroll medían su posición con
// getBoundingClientRect en cada cuadro, justo después de que otras escenas
// escribieran estilos: el navegador tenía que recalcular la maquetación
// entera varias veces por cuadro (por eso se trababa al entrar en ellas).
// Ahora cada una se mide una sola vez y su avance se calcula con scrollY, que
// no cuesta nada. Las medidas se tiran cuando algo cambia de tamaño.
let versionGeometria = 0;
let geometriaIniciada = false;
// Bucles que hay que despertar si la página cambia sin hacer scroll
const alCambiarGeometria = new Set();

export function invalidarGeometria() {
  versionGeometria++;
  escalaGuardada = null;
  alCambiarGeometria.forEach((fn) => fn());
}

function iniciarGeometria() {
  if (geometriaIniciada) return;
  geometriaIniciada = true;
  window.addEventListener("resize", invalidarGeometria);
  // El body cambia de alto cuando cambia cualquier cosa de la página
  // (pestañas, filtros, la pantalla de carga al terminar, imágenes…)
  new ResizeObserver(invalidarGeometria).observe(document.body);
}

// Avisa cuando las medidas guardadas dejan de valer; devuelve cómo dejar de escuchar
export function escucharGeometria(fn) {
  iniciarGeometria();
  alCambiarGeometria.add(fn);
  return () => alCambiarGeometria.delete(fn);
}

export function versionDeGeometria() {
  iniciarGeometria();
  return versionGeometria;
}

// Posición de un elemento respecto al documento, medida solo cuando hace falta
export function medidorPista(el) {
  iniciarGeometria();
  let version = -1;
  let arriba = 0;
  let alto = 0;
  let altoVentana = 0;
  function aldia() {
    if (version === versionGeometria) return;
    const r = el.getBoundingClientRect();
    arriba = r.top + window.scrollY;
    alto = r.height;
    altoVentana = window.innerHeight;
    version = versionGeometria;
  }
  return {
    // Lo mismo que getBoundingClientRect().top, sin medir
    top() {
      aldia();
      return arriba - window.scrollY;
    },
    alto() {
      aldia();
      return alto;
    },
    altoVentana() {
      aldia();
      return altoVentana;
    },
    // 0 cuando la pista llega arriba, 1 cuando termina (escena fija)
    avance() {
      aldia();
      const t = (window.scrollY - arriba) / (alto - altoVentana);
      return Math.min(1, Math.max(0, t || 0));
    },
    invalidar() {
      version = -1;
    },
  };
}

// Bucle de animación que se duerme cuando la escena ya llegó a su sitio y se
// despierta con el scroll o el puntero. Antes cada escena reescribía todos
// sus estilos 60–120 veces por segundo aunque nada se moviera.
// `paso(dt)` devuelve true mientras quede algo por animar.
export function crearBucle(paso) {
  let cuadro = null;
  let ultimo = 0;
  let activo = false;
  function cuadroDeAnimacion(ahora) {
    const dt = Math.min((ahora - (ultimo || ahora)) / 1000, 0.1);
    ultimo = ahora;
    const sigue = paso(dt);
    if (activo && sigue) {
      cuadro = requestAnimationFrame(cuadroDeAnimacion);
    } else {
      cuadro = null;
      ultimo = 0;
    }
  }
  const despertar = () => {
    if (activo && !cuadro) cuadro = requestAnimationFrame(cuadroDeAnimacion);
  };
  return {
    despertar,
    // true mientras la escena está cerca de la pantalla
    activar(valor) {
      activo = valor;
      if (activo) {
        window.addEventListener("scroll", despertar, { passive: true });
        alCambiarGeometria.add(despertar);
        despertar();
      } else {
        window.removeEventListener("scroll", despertar);
        alCambiarGeometria.delete(despertar);
        if (cuadro) cancelAnimationFrame(cuadro);
        cuadro = null;
        ultimo = 0;
      }
    },
    detener() {
      this.activar(false);
    },
  };
}

// Las imágenes van con loading="lazy", pero en las escenas fijas aparecen de
// golpe al llegar su turno: si se decodifican en ese momento el cuadro se
// traba. Esto las pide y decodifica un poco antes, cuando la escena se acerca.
export function predecodificar(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll("img").forEach((img) => {
    if (img._predecodificada) return;
    img._predecodificada = true;
    img.loading = "eager";
    img.decode?.().catch(() => {});
  });
}

// Acerca `actual` a `objetivo`; si ya casi llegó, lo deja exacto
export function acercar(actual, objetivo, factor, umbral = 0.0005) {
  const siguiente = actual + (objetivo - actual) * factor;
  return Math.abs(objetivo - siguiente) < umbral ? objetivo : siguiente;
}

function rectEnCss(el) {
  const r = el.getBoundingClientRect();
  const e = escalaPagina();
  return { left: r.left / e, top: r.top / e, width: r.width / e, height: r.height / e };
}

// Anima desde el valor actual en pantalla hasta `hasta`. Si el elemento ya
// se estaba animando, la nueva animación arranca justo donde iba la otra.
export function animar(el, hasta, resorte = RESORTE.suave, alTerminar) {
  const estilo = getComputedStyle(el);
  const desde = {};
  for (const prop in hasta) desde[prop] = estilo[prop];
  if (el._animacion) el._animacion.cancel();

  const animacion = el.animate([desde, hasta], {
    duration: reducirMovimiento() ? 1 : resorte.duration,
    easing: resorte.easing,
    fill: "forwards",
  });
  el._animacion = animacion;
  animacion.onfinish = () => {
    if (el._animacion === animacion && alTerminar) alTerminar();
  };
  return animacion;
}

// ---------- Aparición al hacer scroll ----------

let observadorRevelado = null;

function obtenerObservadorRevelado() {
  if (!observadorRevelado) {
    observadorRevelado = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const anim = entrada.target._revelado;
          if (anim) anim.play();
          observadorRevelado.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
  }
  return observadorRevelado;
}

// El elemento "se materializa": sube, pierde el desenfoque y llega a su
// opacidad normal. Al terminar se cancela la animación para que el CSS
// original vuelva a mandar.
export function revelar(el, orden = 0) {
  // Si dos selectores coinciden, solo cuenta la primera animación.
  // En modo inmersivo la aparición la maneja el scroll (utils/inmersivo.js).
  if (reducirMovimiento() || el._revelado || document.documentElement.classList.contains("inmersivo")) return;
  const estilo = getComputedStyle(el);
  const filtro = estilo.filter === "none" ? "" : estilo.filter + " ";

  const anim = el.animate(
    [
      {
        opacity: 0,
        translate: "0 32px",
        scale: "0.96",
        filter: `${filtro}blur(12px)`,
      },
      {
        opacity: estilo.opacity,
        translate: "0 0",
        scale: "1",
        filter: `${filtro}blur(0px)`,
      },
    ],
    {
      duration: RESORTE.suave.duration * 1.5,
      easing: RESORTE.suave.easing,
      delay: orden * 80,
      fill: "both",
    }
  );
  anim.pause();
  anim.onfinish = () => anim.cancel();
  el._revelado = anim;
  obtenerObservadorRevelado().observe(el);
}

export function revelarGrupo(selector) {
  document.querySelectorAll(selector).forEach((el, i) => revelar(el, i));
}

// Orden en que aparece cada parte de la página al terminar la carga
export function revelarSecciones() {
  revelarGrupo("#imagennav, nav ul li");
  revelarGrupo(
    ".about-section .profile-image, .about-section .about-text > h2, .about-section .about-text > p"
  );
  revelarGrupo(".insignia-estado, .hero-acciones");
  // Cada sección revela su cabecera y sus tarjetas en cascada
  document.querySelectorAll(".seccion, .proyectos").forEach((seccion) => {
    seccion
      .querySelectorAll(
        ".seccion-cabecera > *, .sobre-cifra, .tarjeta-vidrio:not(.hito-tarjeta), .proyecto-tarjeta, .pestanas, .filtros, .proceso-paso"
      )
      .forEach((el, i) => revelar(el, i % 6));
  });
  revelarGrupo(".imagerr");
  revelarGrupo(".invitacion-escritorio");
  revelarGrupo(".console");
  revelarGrupo(".footer .content > div");
}

// ---------- Visor de imágenes (medallas y certificados) ----------

let visorAbierto = null;

// Transformación que lleva la imagen grande a la posición de la miniatura
function transformHacia(origen, destino) {
  const sx = origen.width / destino.width;
  const sy = origen.height / destino.height;
  const dx = origen.left - destino.left;
  const dy = origen.top - destino.top;
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
}

export function abrirVisor(imgOrigen) {
  if (visorAbierto) return;
  const e = escalaPagina();
  const anchoVentana = window.innerWidth / e;
  const altoVentana = window.innerHeight / e;
  const origen = rectEnCss(imgOrigen);
  if (!origen.width || !origen.height) return;

  // Tamaño final: lo más grande posible dentro del 80% de la ventana
  const proporcion = origen.width / origen.height;
  let ancho = Math.min(anchoVentana * 0.8, 900);
  let alto = ancho / proporcion;
  if (alto > altoVentana * 0.8) {
    alto = altoVentana * 0.8;
    ancho = alto * proporcion;
  }
  const destino = {
    left: (anchoVentana - ancho) / 2,
    top: (altoVentana - alto) / 2,
    width: ancho,
    height: alto,
  };

  const visor = document.createElement("div");
  visor.className = "visor";
  visor.innerHTML = '<div class="visor-fondo"></div>';
  const img = document.createElement("img");
  img.className = "visor-img";
  img.src = imgOrigen.currentSrc || imgOrigen.src;
  img.alt = imgOrigen.alt;
  Object.assign(img.style, {
    left: destino.left + "px",
    top: destino.top + "px",
    width: destino.width + "px",
    height: destino.height + "px",
    transform: transformHacia(origen, destino),
  });
  visor.appendChild(img);
  document.body.appendChild(visor);

  const fondo = visor.querySelector(".visor-fondo");
  imgOrigen.style.visibility = "hidden";
  visorAbierto = { visor, img, fondo, imgOrigen, destino };

  animar(img, { transform: "none" });
  animar(fondo, { opacity: "1" });

  visor.addEventListener("click", cerrarVisor);
}

// Vuelve a la miniatura por el mismo camino. Si la imagen aún estaba
// abriéndose, el regreso parte de donde iba.
export function cerrarVisor() {
  if (!visorAbierto) return;
  const { visor, img, fondo, imgOrigen, destino } = visorAbierto;
  visorAbierto = null;
  const origen = rectEnCss(imgOrigen);

  animar(fondo, { opacity: "0" });
  animar(img, { transform: transformHacia(origen, destino) }, RESORTE.suave, () => {
    imgOrigen.style.visibility = "";
    visor.remove();
  });
}

// ---------- Ventanas (navegador del escritorio) ----------

// La ventana crece desde el icono que la abrió y vuelve a él al cerrarse
export function abrirVentana(ventana, iconoOrigen) {
  // Si se estaba cerrando, se reabre desde donde iba, con el mismo origen
  if (!ventana._animacion) {
    ventana.style.display = "flex";
    ventana.style.scale = "1";
    if (iconoOrigen) {
      const v = rectEnCss(ventana);
      const i = rectEnCss(iconoOrigen);
      ventana.style.transformOrigin = `${i.left + i.width / 2 - v.left}px ${
        i.top + i.height / 2 - v.top
      }px`;
    }
    ventana.style.opacity = "0";
    ventana.style.scale = "0.2";
    ventana.style.filter = "blur(10px)";
  }
  animar(ventana, { opacity: "1", scale: "1", filter: "blur(0px)" });
}

export function cerrarVentana(ventana, alTerminar) {
  animar(
    ventana,
    { opacity: "0", scale: "0.2", filter: "blur(10px)" },
    RESORTE.suave,
    () => {
      ventana.style.display = "none";
      ventana._animacion.cancel();
      ventana._animacion = null;
      if (alTerminar) alTerminar();
    }
  );
}

// ---------- Parallax con inercia ----------

// Los fondos (ángel, letras) siguen el scroll con un pequeño
// retraso amortiguado, como si tuvieran masa. Se usa `translate` en vez de
// márgenes para no recalcular el layout en cada frame.
export function iniciarParallax() {
  if (reducirMovimiento() || equipoLigero()) return;
  const capas = [
    ["credencialesAngel", 0, 0.12],
    ["letras3", 0.3, 0],
    ["img-cl", 0, -0.5],
  ]
    .map(([id, x, y]) => ({ el: document.getElementById(id), x, y }))
    .filter((capa) => capa.el);

  let actual = window.scrollY;
  let corriendo = false;

  function cuadro() {
    const objetivo = window.scrollY;
    actual += (objetivo - actual) * 0.14;
    if (Math.abs(objetivo - actual) < 0.1) actual = objetivo;
    capas.forEach(({ el, x, y }) => {
      el.style.translate = `${actual * x}px ${actual * y}px`;
    });
    corriendo = actual !== objetivo;
    if (corriendo) requestAnimationFrame(cuadro);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!corriendo) {
        corriendo = true;
        requestAnimationFrame(cuadro);
      }
    },
    { passive: true }
  );
  cuadro();
}

// ---------- Barra de navegación ----------

export function iniciarNavegacion(header) {
  const lista = header.querySelector("nav ul");
  const enlaces = [...header.querySelectorAll("nav ul li a")];

  // Material translúcido solo cuando hay contenido pasando por debajo
  const actualizarBarra = () =>
    header.classList.toggle("header-flotante", window.scrollY > 24);
  window.addEventListener("scroll", actualizarBarra, { passive: true });
  actualizarBarra();

  // Píldora que se desliza (con resorte, vía CSS) hacia el enlace señalado
  const pildora = document.createElement("span");
  pildora.className = "nav-pildora";
  lista.prepend(pildora);

  let activo = null;
  function moverPildora(enlace) {
    if (!enlace) {
      pildora.style.opacity = "0";
      return;
    }
    const base = lista.getBoundingClientRect();
    const r = enlace.getBoundingClientRect();
    const e = escalaPagina();
    // Si estaba oculta aparece directamente en su sitio; si no, se desliza
    const oculta = pildora.style.opacity !== "1";
    if (oculta) pildora.style.transition = "opacity 200ms ease";
    pildora.style.width = r.width / e + "px";
    pildora.style.height = r.height / e + "px";
    pildora.style.translate = `${(r.left - base.left) / e}px ${(r.top - base.top) / e}px`;
    if (oculta) {
      void pildora.offsetWidth;
      pildora.style.transition = "";
    }
    pildora.style.opacity = "1";
  }

  enlaces.forEach((enlace) => {
    enlace.addEventListener("pointerenter", () => moverPildora(enlace));
  });
  lista.addEventListener("pointerleave", () => moverPildora(activo));
  window.addEventListener("resize", () => moverPildora(activo));

  // Marca la sección que se está viendo (para saber dónde estás)
  // Solo los enlaces a secciones de esta misma página ("#..."); en otras
  // páginas (ej. /guias) queda marcado el enlace de la página actual
  const porSeccion = new Map();
  enlaces.forEach((enlace) => {
    const href = enlace.getAttribute("href");
    if (!href.startsWith("#") || href.length < 2) return;
    const destino = document.querySelector(href);
    if (destino) porSeccion.set(destino, enlace);
  });
  const actual = enlaces.find((a) => a.getAttribute("aria-current") === "page");
  if (actual) {
    activo = actual;
    actual.classList.add("activo");
    requestAnimationFrame(() => moverPildora(activo));
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        const enlace = porSeccion.get(entrada.target);
        if (entrada.isIntersecting) activo = enlace;
        else if (activo === enlace) activo = null;
      });
      enlaces.forEach((a) => a.classList.toggle("activo", a === activo));
      if (!lista.matches(":hover")) moverPildora(activo);
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  porSeccion.forEach((_, seccion) => observador.observe(seccion));
}
