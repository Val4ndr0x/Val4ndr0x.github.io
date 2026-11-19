// Sección "Guías y redes": tus canales y las guías descargables.
//
// ---------- Cómo subir una guía ----------
// 1. Copia el PDF a public/guias/  (ej. public/guias/ux-ui-desde-cero.pdf)
// 2. Agrega (o edita) su entrada abajo con  archivo: "/guias/ux-ui-desde-cero.pdf"
// 3. Sin "archivo", la tarjeta se muestra como "Próximamente".
//
// categoria: debe coincidir con una de `categoriasGuias`
// nivel: "Básico" | "Intermedio" | "Avanzado"
// video: enlace opcional al video de YouTube que acompaña la guía
// tono: color de la portada (uno por guía, como en los proyectos)

// ---------- Redes ----------
// TODO: cambia `usuario` y `enlace` por tus perfiles reales.

export const redes = [
  {
    red: "Instagram",
    icono: "instagram",
    usuario: "@val4ndr0x",
    enlace: "https://www.instagram.com/val4ndr0x",
    texto: "Procesos de diseño, antes y después, y tips rápidos en carrusel.",
    accion: "Seguir",
    tonos: ["#f58529", "#dd2a7b", "#8134af"],
  },
  {
    red: "TikTok",
    icono: "tiktok",
    usuario: "@val4ndr0x",
    enlace: "https://www.tiktok.com/@val4ndr0x",
    texto: "Trucos de código y diseño explicados en menos de un minuto.",
    accion: "Seguir",
    tonos: ["#25f4ee", "#fe2c55", "#25f4ee"],
  },
  {
    red: "YouTube",
    icono: "youtube",
    usuario: "@val4ndr0x",
    enlace: "https://www.youtube.com/@val4ndr0x",
    texto: "Tutoriales completos, paso a paso, que acompañan cada guía.",
    accion: "Suscribirme",
    tonos: ["#ff0033", "#ff4060", "#ff0033"],
  },
];

// ---------- Guías ----------

export const categoriasGuias = ["Todas", "Diseño", "Frontend", "Backend", "Herramientas"];

export const guias = [
  {
    titulo: "UX/UI desde cero",
    descripcion: "De la investigación al prototipo: el proceso que uso en cada proyecto.",
    categoria: "Diseño",
    nivel: "Básico",
    icono: "pincel",
    tono: "#ff4060",
    archivo: "",
    video: "",
  },
  {
    titulo: "Tu primera web con Vue y Nuxt",
    descripcion: "Componentes, páginas y publicación en GitHub Pages, sin rodeos.",
    categoria: "Frontend",
    nivel: "Intermedio",
    icono: "web",
    tono: "#42b883",
    archivo: "",
    video: "",
  },
  {
    titulo: "Tu primera API con Node.js y Express",
    descripcion: "Rutas, controladores y un CRUD completo conectado a una base de datos.",
    categoria: "Backend",
    nivel: "Intermedio",
    icono: "terminal",
    tono: "#5fa04e",
    archivo: "",
    video: "",
  },
  {
    titulo: "Git y GitHub sin miedo",
    descripcion: "Ramas, commits y pull requests con los comandos que de verdad usas.",
    categoria: "Herramientas",
    nivel: "Básico",
    icono: "carpeta",
    tono: "#f05032",
    archivo: "",
    video: "",
  },
];
