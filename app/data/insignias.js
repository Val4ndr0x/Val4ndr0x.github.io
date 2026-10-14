// Insignias de Badgr y certificados. Los usan la sección "Credenciales" y la
// ventana "Certificados" del modo escritorio.
// Nombres, emisor y fechas tomados de las insignias públicas en Badgr.

const todosALaU = "Programa Todos a la U · Universidad Nacional de Colombia";

export const categoriasInsignias = ["UX/UI", "Transformación digital", "Socioemocional", "Reconocimiento"];

export const medallas = [
  {
    id: "T2DPeQAJRYKVJMUcm-xvBg",
    nombre: "Dinamizador de cambio para un mundo digital y sostenible",
    nivel: "Intermedio",
    categoria: "Transformación digital",
    fecha: "2024-01-30",
    emisor: todosALaU,
  },
  {
    id: "-mONaK1zRmab3j0CNhS2BA",
    nombre: "Participante destacado",
    nivel: "Intermedio · Cohorte 2",
    categoria: "Reconocimiento",
    fecha: "2024-01-11",
    emisor: todosALaU,
  },
  {
    id: "2yNb_5mfTAq0OzjA7Ysyng",
    nombre: "Agente de autoconciencia socioemocional",
    nivel: "Intermedio",
    categoria: "Socioemocional",
    fecha: "2023-12-18",
    emisor: todosALaU,
  },
  {
    id: "laVZt9NkTZecgOCyFvkIrw",
    nombre: "Innovador de experiencias tecnológicas",
    nivel: "Diseño UX/UI · Intermedio",
    categoria: "UX/UI",
    fecha: "2023-12-12",
    emisor: todosALaU,
  },
  {
    id: "7sPlzDwHQva25PqlHv_3-g",
    nombre: "Dinamizador del aprendizaje",
    nivel: "Diseño UX/UI · Intermedio",
    categoria: "UX/UI",
    fecha: "2023-11-28",
    emisor: todosALaU,
  },
  {
    id: "YT_bDK3lSBeUYvHb9VbvnA",
    nombre: "Participante destacado",
    nivel: "Básico",
    categoria: "Reconocimiento",
    fecha: "2023-10-06",
    emisor: todosALaU,
  },
  {
    id: "1MYQzR7wTLaR5kkupMDLkQ",
    nombre: "Agente de cambio para un mundo digital y sostenible",
    nivel: "Básico",
    categoria: "Transformación digital",
    fecha: "2023-10-06",
    emisor: todosALaU,
  },
  {
    id: "4ikpvqsDRbqkNhPqm3tfZw",
    nombre: "Agente de autoconciencia socioemocional",
    nivel: "Básico",
    categoria: "Socioemocional",
    fecha: "2023-09-09",
    emisor: todosALaU,
  },
];

export const imagenMedalla = (id) => `https://api.eu.badgr.io/public/assertions/${id}/image`;
export const verificarMedalla = (id) => `https://eu.badgr.com/public/assertions/${id}`;

export const certificados = [
  {
    src: "/imagenes/certificados/certificado-1.jpg",
    titulo: "Diplomado en Diseño UX/UI · Nivel Básico",
    emisor: "Universidad Nacional de Colombia",
    anio: "2023",
  },
  {
    src: "/imagenes/certificados/certificado-2.jpg",
    titulo: "Diplomado en Diseño UX/UI · Nivel Intermedio",
    emisor: "Universidad Nacional de Colombia",
    anio: "2023",
  },
  {
    src: "/imagenes/certificados/certificado-3.png",
    titulo: "Inglés CEFR A2 · EnglishScore",
    emisor: "British Council",
    anio: "2023",
  },
];

export const formatoFecha = (fecha) =>
  new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", { month: "short", year: "numeric" });
