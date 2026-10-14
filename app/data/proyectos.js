// Proyectos del portafolio. Los usan la sección "Proyectos" y el comando
// `proyectos` de la consola.
// - enlace: opcional
// - destacado: en la grilla (pantallas angostas) la tarjeta ocupa dos columnas
// - icono: nombre del icono en IconoLinea.vue
// - tono: color de acento de la tarjeta
// - imagen: captura que se ve en la sección (en app/assets/proyectos). Se ve
//   encuadrada desde arriba y al centro; lo ideal es una proporción cercana a 2:1.
import imgRegalando from "~/assets/proyectos/RegalandoMomentos.png";
import imgOveja from "~/assets/proyectos/LaOvejaNegraCreativa.png";
import imgPhotobooth from "~/assets/proyectos/photoboot.png";
import imgTour from "~/assets/proyectos/360tour.png";
import imgLoganiq from "~/assets/proyectos/loganIQ.png";
import imgToodo from "~/assets/proyectos/TooDo.png";
import imgMilion from "~/assets/proyectos/OneMillon.png";
import imgBlackHouse from "~/assets/proyectos/BlackHouse.png";

export const proyectos = [
  {
    nombre: "Regalando Momentos",
    tipo: "Tienda en línea",
    descripcion: "Página web y e-shop de detalles sorpresa: catálogo, pedidos y una experiencia pensada para regalar.",
    destacado: true,
    icono: "tienda",
    tono: "#ff375f",
    imagen: imgRegalando,
  },
  {
    nombre: "La Oveja Negra Creativa",
    tipo: "Sitio web",
    descripcion: "Sitio web para La Oveja Negra Creativa, productora audiovisual.",
    icono: "web",
    tono: "#ff9f0a",
    imagen: imgOveja,
  },
  {
    nombre: "Photobooth LONC",
    tipo: "Experiencia interactiva",
    descripcion: "Un photobooth para La Oveja Negra Creativa: los asistentes se toman la foto y la reciben al instante.",
    icono: "destello",
    tono: "#bf5af2",
    imagen: imgPhotobooth,
  },
  {
    nombre: "Tour 360° Coopidrogas",
    tipo: "Recorrido virtual",
    descripcion: "Tour 360° para Coopidrogas: un recorrido virtual por sus espacios desde cualquier dispositivo.",
    icono: "vr",
    tono: "#64d2ff",
    imagen: imgTour,
  },
  {
    nombre: "LoganIQ",
    tipo: "Aplicación web",
    descripcion: "Aplicación de inventario para controlar productos, existencias y movimientos.",
    icono: "app",
    tono: "#0a84ff",
    imagen: imgLoganiq,
  },
  {
    nombre: "Toodo",
    tipo: "Aplicación",
    descripcion: "Aplicación de tareas para crear, organizar y completar pendientes.",
    icono: "tareas",
    tono: "#5e5ce6",
    imagen: imgToodo,
  },
  {
    nombre: "Milion",
    tipo: "Aplicación",
    descripcion: "Simulador de inversión por porcentajes: muestra cómo crece tu dinero según el rendimiento.",
    destacado: true,
    icono: "grafica",
    tono: "#ffd60a",
    imagen: imgMilion,
  },
  {
    nombre: "Black House Studio",
    tipo: "Sitio web",
    descripcion: "Página para Black House Studio, fundación de bailarines sin ánimo de lucro.",
    icono: "persona",
    tono: "#ff453a",
    imagen: imgBlackHouse,
  },
];
