// Página /guias: tus canales y las guías.
//
// ---------- Cómo publicar una guía ----------
// 1. Elige un slug corto y legible (ej. "ux-ui-desde-cero"): será su URL,
//    /guias/ux-ui-desde-cero.
// 2. Crea su página en app/pages/guias/<slug>.vue (copia la de
//    claude-aprende-de-youtube.vue y usa los bloques Guia*.vue).
// 3. Copia el PDF a public/guias/<slug>.pdf y ponlo en `archivo`.
// 4. Sin `slug`, la tarjeta se muestra como "Próximamente".
//
// categoria: debe coincidir con una de `categoriasGuias`
// nivel: "Básico" | "Intermedio" | "Avanzado"
// video: enlace opcional al video de YouTube que acompaña la guía
// tono: color de la portada y del acento de su página (uno por guía)

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

export const categoriasGuias = ["Todas", "IA", "Diseño", "Frontend", "Backend", "Herramientas"];

export const guias = [
  {
    slug: "claude-aprende-de-youtube",
    titulo: "Claude aprende de YouTube",
    descripcion: "La skill Watch y el prompt exacto para convertir cualquier video en una skill de Claude Code.",
    categoria: "IA",
    nivel: "Básico",
    icono: "youtube",
    tono: "#38bdf8",
    archivo: "/guias/claude-aprende-de-youtube.pdf",
    video: "",
  },
  {
    titulo: "UX/UI desde cero",
    descripcion: "De la investigación al prototipo: el proceso que uso en cada proyecto.",
    categoria: "Diseño",
    nivel: "Básico",
    icono: "pincel",
    tono: "#ff4060",
    slug: "",
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
    slug: "",
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
    slug: "",
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
    slug: "",
    archivo: "",
    video: "",
  },
];

// Busca una guía por su slug (lo usan las páginas de cada guía)
export const guiaPorSlug = (slug) => guias.find((g) => g.slug === slug);
