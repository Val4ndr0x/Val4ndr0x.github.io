// Genera el CV en PDF a partir de los mismos datos del portafolio, así el
// documento descargado siempre coincide con lo que se ve en la página.
// Usa la estética del sitio: fondo oscuro, acento rosa con degradado a
// naranja, chips de colores y tarjetas. jsPDF se carga solo al pulsar el
// botón para no pesar en la carga inicial.
import { perfil, sobreMi, stack, trayectoria, idiomas, contacto } from "~/data/perfil";
import { proyectos } from "~/data/proyectos";
import { medallas, formatoFecha } from "~/data/insignias";
import fotoPerfil from "~/assets/andres1.jpg";

// Colores del sitio
const FONDO = "#0d1317";
const LATERAL = "#121a1f";
const BORDE = "#25313a";
const BLANCO = "#ffffff";
const GRIS = "#a1a1a6";
const GRIS_OSCURO = "#6e6e73";
const ACENTO = "#ff4060";
const NARANJA = "#ff9f0a";
const VERDE = "#30d158";

const nombreTipo = { experiencia: "Experiencia", educacion: "Educación", certificado: "Certificado" };

// Página A4 en mm: columna lateral a la izquierda y contenido a la derecha
const ANCHO = 210;
const ALTO = 297;
const LAT_ANCHO = 68;
const LAT_X = 10;
const LAT_UTIL = LAT_ANCHO - LAT_X * 2;
const X = LAT_ANCHO + 10;
const UTIL = ANCHO - X - 12;
const ARRIBA = 16;
const ABAJO = ALTO - 16;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Mezcla un color con el fondo, como un tono translúcido sobre negro
const tenue = (color, cuanto, base = FONDO) => {
  const [a, b] = [hex(color), hex(base)];
  return a.map((v, i) => Math.round(v * cuanto + b[i] * (1 - cuanto)));
};
const pt = (tam) => tam * 0.3528; // puntos a mm

async function cargarFoto(url) {
  try {
    const respuesta = await fetch(url);
    return new Uint8Array(await respuesta.arrayBuffer());
  } catch {
    return null; // sin foto el CV se genera igual
  }
}

// Encuadre de la foto en el círculo: centro de la cara y diámetro visible, en píxeles
const ENCUADRE = { cx: 640, cy: 720, diametro: 760 };

export async function descargarCvPdf() {
  const [{ jsPDF }, foto] = await Promise.all([import("jspdf"), cargarFoto(fotoPerfil)]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const relleno = (c) => doc.setFillColor(...(Array.isArray(c) ? c : hex(c)));
  const trazo = (c) => doc.setDrawColor(...(Array.isArray(c) ? c : hex(c)));
  const tinta = (c) => doc.setTextColor(...(Array.isArray(c) ? c : hex(c)));
  const fuente = (tam, estilo = "normal", familia = "helvetica") => {
    doc.setFont(familia, estilo);
    doc.setFontSize(tam);
  };

  function fondoPagina() {
    relleno(FONDO);
    doc.rect(0, 0, ANCHO, ALTO, "F");
    relleno(LATERAL);
    doc.rect(0, 0, LAT_ANCHO, ALTO, "F");
    // Brillo del acento en la esquina, como la luz del sitio
    for (let i = 0; i < 40; i++) {
      relleno(tenue(ACENTO, 0.0022 * i, LATERAL));
      doc.circle(0, 0, 60 - i * 1.5, "F");
    }
  }

  // Barra con degradado rosa → naranja
  function degradado(x, y, ancho, alto) {
    const pasos = 40;
    const [a, b] = [hex(ACENTO), hex(NARANJA)];
    for (let i = 0; i < pasos; i++) {
      const t = i / (pasos - 1);
      relleno(a.map((v, k) => Math.round(v + (b[k] - v) * t)));
      doc.rect(x + (ancho / pasos) * i, y, ancho / pasos + 0.1, alto, "F");
    }
  }

  // Texto con saltos de línea; devuelve la nueva y
  function parrafo(contenido, x, y, ancho, { tam = 9.5, color = GRIS, estilo = "normal", interlineado = 1.45 } = {}) {
    fuente(tam, estilo);
    tinta(color);
    const lineas = doc.splitTextToSize(String(contenido), ancho);
    lineas.forEach((linea, i) => doc.text(linea, x, y + pt(tam) + i * pt(tam) * interlineado));
    return y + lineas.length * pt(tam) * interlineado;
  }

  const altoParrafo = (contenido, ancho, tam = 9.5, interlineado = 1.45, estilo = "normal") => {
    fuente(tam, estilo);
    return doc.splitTextToSize(String(contenido), ancho).length * pt(tam) * interlineado;
  };

  // Chips en filas que se ajustan al ancho; devuelve la nueva y
  function chips(lista, x, y, ancho, { tam = 7.5 } = {}) {
    const alto = 5.4;
    let cx = x;
    lista.forEach(({ texto, color = ACENTO }) => {
      fuente(tam, "bold");
      const w = doc.getTextWidth(texto) + 5;
      if (cx + w > x + ancho) {
        cx = x;
        y += alto + 1.8;
      }
      relleno(tenue(color, 0.18, LATERAL));
      trazo(tenue(color, 0.55, LATERAL));
      doc.setLineWidth(0.25);
      doc.roundedRect(cx, y, w, alto, alto / 2, alto / 2, "FD");
      tinta(BLANCO);
      doc.text(texto, cx + w / 2, y + alto / 2 + pt(tam) * 0.35, { align: "center" });
      cx += w + 1.8;
    });
    return y + alto;
  }

  // Título de sección al estilo "(01) Sobre mí"
  let numero = 0;
  function seccion(titulo, x, y, ancho) {
    numero++;
    fuente(8, "normal", "courier");
    tinta(ACENTO);
    const etiqueta = `(${String(numero).padStart(2, "0")})`;
    doc.text(etiqueta, x, y + 3);
    const ew = doc.getTextWidth(etiqueta) + 2;
    fuente(12, "bold");
    tinta(BLANCO);
    doc.text(titulo, x + ew, y + 3.2);
    trazo(BORDE);
    doc.setLineWidth(0.3);
    doc.line(x, y + 6, x + ancho, y + 6);
    return y + 10;
  }

  // ---------- Página 1 ----------
  fondoPagina();

  // ----- Columna lateral -----
  let ly = ARRIBA + 2;
  const fotoR = 21;
  const fotoCx = LAT_ANCHO / 2;
  const fotoCy = ly + fotoR;
  // Aro con el degradado del acento
  relleno(ACENTO);
  doc.circle(fotoCx, fotoCy, fotoR + 1.6, "F");
  relleno(NARANJA);
  doc.circle(fotoCx + 0.6, fotoCy + 0.6, fotoR + 0.9, "F");
  relleno(LATERAL);
  doc.circle(fotoCx, fotoCy, fotoR + 0.6, "F");
  if (foto) {
    // La foto se recorta en círculo, centrada en la cara
    const { width, height } = doc.getImageProperties(foto);
    const { cx, cy, diametro } = ENCUADRE;
    const escala = (fotoR * 2) / diametro;
    doc.saveGraphicsState();
    doc.circle(fotoCx, fotoCy, fotoR, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(foto, "JPEG", fotoCx - cx * escala, fotoCy - cy * escala, width * escala, height * escala);
    doc.restoreGraphicsState();
  }
  ly = fotoCy + fotoR + 7;

  // Estado de disponibilidad, como la insignia verde de la portada
  if (perfil.disponible) {
    fuente(7.5, "bold");
    const w = doc.getTextWidth(perfil.disponibilidad) + 10;
    const px = (LAT_ANCHO - w) / 2;
    relleno(tenue(VERDE, 0.14, LATERAL));
    trazo(tenue(VERDE, 0.5, LATERAL));
    doc.setLineWidth(0.25);
    doc.roundedRect(px, ly, w, 6, 3, 3, "FD");
    relleno(VERDE);
    doc.circle(px + 4, ly + 3, 0.9, "F");
    tinta("#d1f7dc");
    doc.text(perfil.disponibilidad, px + 6.5, ly + 3 + pt(7.5) * 0.35);
    ly += 13;
  }

  function tituloLateral(texto) {
    fuente(7.5, "bold", "courier");
    tinta(ACENTO);
    doc.text(texto.toUpperCase(), LAT_X, ly);
    trazo(BORDE);
    doc.setLineWidth(0.3);
    doc.line(LAT_X, ly + 2, LAT_X + LAT_UTIL, ly + 2);
    ly += 6.5;
  }

  tituloLateral("Contacto");
  const datosContacto = [
    { etiqueta: "Correo", valor: contacto.correo, url: `mailto:${contacto.correo}` },
    { etiqueta: "Teléfono", valor: contacto.telefono, url: contacto.whatsapp },
    { etiqueta: "LinkedIn", valor: decodeURIComponent(contacto.linkedin.replace(/^.*\/in\//, "").replace(/\/$/, "")), url: contacto.linkedin },
    { etiqueta: "Ciudad", valor: perfil.ciudad },
  ];
  datosContacto.forEach(({ etiqueta, valor, url }) => {
    fuente(6.5, "normal", "courier");
    tinta(GRIS_OSCURO);
    doc.text(etiqueta.toUpperCase(), LAT_X, ly);
    const inicio = ly + 1;
    ly = parrafo(valor, LAT_X, inicio, LAT_UTIL, { tam: 8, color: BLANCO, interlineado: 1.3 });
    if (url) doc.link(LAT_X, inicio, LAT_UTIL, ly - inicio, { url });
    ly += 3.2;
  });
  ly += 3;

  tituloLateral("Stack");
  stack.forEach((grupo) => {
    fuente(7.5, "bold");
    tinta(GRIS);
    doc.text(grupo.categoria, LAT_X, ly);
    ly = chips(
      grupo.items.map((i) => ({ texto: i.nombre, color: i.color })),
      LAT_X,
      ly + 2,
      LAT_UTIL,
      { tam: 6.8 }
    );
    ly += 4.5;
  });
  ly += 2;

  tituloLateral("Idiomas");
  idiomas.forEach((i) => {
    fuente(8.5, "bold");
    tinta(BLANCO);
    doc.text(i.idioma, LAT_X, ly);
    ly = parrafo(i.nivel, LAT_X, ly + 0.8, LAT_UTIL, { tam: 7.5, interlineado: 1.3 }) + 3;
  });
  ly += 2;

  tituloLateral("Ahora mismo");
  sobreMi.ahoraMismo.filter((a) => a.etiqueta === "Estudiando").forEach((a) => {
    fuente(6.5, "normal", "courier");
    tinta(NARANJA);
    doc.text(a.etiqueta.toUpperCase(), LAT_X, ly);
    ly = parrafo(a.texto, LAT_X, ly + 1, LAT_UTIL, { tam: 7.5, interlineado: 1.3 }) + 3;
  });

  // ----- Columna principal -----
  let y = ARRIBA;

  const nuevaPagina = () => {
    doc.addPage();
    fondoPagina();
    y = ARRIBA;
  };
  const espacio = (necesario) => {
    if (y + necesario > ABAJO) nuevaPagina();
  };

  fuente(7.5, "normal", "courier");
  tinta(GRIS_OSCURO);
  doc.text(`CURRÍCULUM · ${perfil.alias.toUpperCase()}`, X, y + 2);
  y += 6;

  // Nombre: el apellido va en el color del acento, como en la portada
  const [nombre, ...resto] = perfil.nombreCompleto.split(" ");
  const apellido = resto.pop();
  fuente(32, "bold");
  tinta(BLANCO);
  doc.text([nombre, ...resto].join(" "), X, y + pt(32) * 0.8);
  y += pt(32) * 1.02;
  tinta(ACENTO);
  doc.text(apellido, X, y + pt(32) * 0.8);
  y += pt(32) * 0.95;
  degradado(X, y + 1, 34, 1.2);
  y += 5;
  y = parrafo(perfil.cargo, X, y, UTIL, { tam: 12, color: BLANCO });
  y += 6;

  y = seccion("Sobre mí", X, y, UTIL);
  y = parrafo(sobreMi.resumen, X, y, UTIL, { tam: 9.5, color: GRIS });
  y += 8;

  // ----- Trayectoria: línea de tiempo -----
  y = seccion("Trayectoria", X, y, UTIL);
  const lineaX = X + 1.5;
  const textoX = X + 7;
  const textoAncho = UTIL - 7 - 18;
  // En "Proyectos independientes" van los proyectos de proyectos.js, con su
  // tipo y color; así no hace falta una sección aparte de proyectos
  const puntosDe = (h) =>
    h.tipo === "experiencia"
      ? proyectos.map((p) => ({ nombre: p.nombre, texto: p.tipo, color: p.tono, enlace: p.enlace }))
      : (h.puntos ?? []).map((p) => ({ texto: p, color: ACENTO }));
  const altoPunto = pt(8.5) * 1.45;
  trayectoria.forEach((h, i) => {
    const puntos = puntosDe(h);
    const alto = altoParrafo(h.titulo, textoAncho, 10, 1.3, "bold") + 5 + puntos.length * altoPunto;
    espacio(alto + 4);
    const inicio = y;
    const colorPunto = h.actual ? VERDE : ACENTO;

    y = parrafo(h.titulo, textoX, y, textoAncho, { tam: 10, color: BLANCO, estilo: "bold", interlineado: 1.3 });
    fuente(7.5, "normal", "courier");
    tinta(h.actual ? VERDE : GRIS);
    doc.text(h.periodo.toUpperCase(), X + UTIL, inicio + pt(10), { align: "right" });
    fuente(8, "normal");
    tinta(GRIS_OSCURO);
    doc.text(`${nombreTipo[h.tipo] ?? ""}  ·  ${h.lugar}`, textoX, y + 3.2);
    y += 5;
    puntos.forEach((p) => {
      relleno(p.color);
      doc.circle(textoX + 0.8, y + 2.2, p.nombre ? 0.8 : 0.5, "F");
      if (!p.nombre) {
        y = parrafo(p.texto, textoX + 3, y, textoAncho - 3, { tam: 8.5 });
        return;
      }
      fuente(8.5, "bold");
      tinta(BLANCO);
      doc.text(p.nombre, textoX + 3, y + pt(8.5));
      const w = doc.getTextWidth(p.nombre);
      fuente(8.5, "normal");
      tinta(GRIS);
      doc.text(`  ·  ${p.texto}`, textoX + 3 + w, y + pt(8.5));
      if (p.enlace) doc.link(textoX + 3, y, textoAncho - 3, altoPunto, { url: p.enlace });
      y += altoPunto;
    });

    // Línea que une los puntos (no en el último)
    if (i < trayectoria.length - 1) {
      trazo(BORDE);
      doc.setLineWidth(0.4);
      doc.line(lineaX, inicio + 4.5, lineaX, y + 3.3);
    }
    relleno(tenue(colorPunto, 0.25));
    doc.circle(lineaX, inicio + 2.3, 2, "F");
    relleno(colorPunto);
    doc.circle(lineaX, inicio + 2.3, 1, "F");
    y += 2.8;
  });
  y += 4;

  // ----- Insignias: dos columnas compactas -----
  if (medallas.length) {
    const columnas = 2;
    const separacion = 5;
    const colAncho = (UTIL - separacion) / columnas;
    const altoFila = (fila) => Math.max(...fila.map((m) => altoParrafo(m.nombre, colAncho - 5, 8, 1.25, "bold"))) + 5.5;
    espacio(10 + altoFila(medallas.slice(0, columnas)));
    y = seccion("Insignias digitales", X, y, UTIL);
    for (let i = 0; i < medallas.length; i += columnas) {
      const fila = medallas.slice(i, i + columnas);
      const filaAlto = altoFila(fila);
      espacio(filaAlto);
      fila.forEach((m, k) => {
        const mx = X + k * (colAncho + separacion);
        relleno(tenue(NARANJA, 0.25));
        doc.circle(mx + 1.6, y + 1.9, 1.6, "F");
        relleno(NARANJA);
        doc.circle(mx + 1.6, y + 1.9, 0.7, "F");
        fuente(8, "bold");
        tinta(BLANCO);
        const fin = parrafo(m.nombre, mx + 5, y, colAncho - 5, { tam: 8, color: BLANCO, estilo: "bold", interlineado: 1.25 });
        fuente(6.5, "normal", "courier");
        tinta(GRIS_OSCURO);
        doc.text(`${m.nivel.toUpperCase()} · ${formatoFecha(m.fecha).toUpperCase()}`, mx + 5, fin + 2.6);
      });
      y += filaAlto;
    }
  }

  // Pie con número de página
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    fuente(7, "normal", "courier");
    tinta(GRIS_OSCURO);
    doc.text(`${perfil.nombreCompleto.toUpperCase()} · CV`, X, ALTO - 8);
    doc.text(`${i} / ${paginas}`, X + UTIL, ALTO - 8, { align: "right" });
  }

  doc.save(`CV-${perfil.nombreCompleto.replace(/\s+/g, "-")}.pdf`);
}
