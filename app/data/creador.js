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
    usuario: "@automata.ofi",
    enlace: "https://www.instagram.com/automata.ofi",
    texto: "Automata, mi canal: trucos de IA y automatización explicados fácil, en carrusel.",
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

// ---------- Automata ----------
// Tu canal de Instagram y su mascota. El bloque "¿Quién está detrás?"
// (GuiaAutor.vue) lo presenta como tuyo en /guias y al final de cada guía.

export const automata = {
  usuario: "@automata.ofi",
  enlace: "https://www.instagram.com/automata.ofi",
  mascota: "/imagenes/automata/mascota-pulgar.webp",
  queHago:
    "En Automata comparto trucos de IA y automatización explicados fácil: herramientas como Claude Code, prompts que funcionan y guías gratis paso a paso para que los apliques en tu trabajo.",
};

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
    slug: "clipea-gta-vi",
    titulo: "Clipea GTA VI y cobra por vistas",
    descripcion: "Cómo funciona el clipping, OpenShorts gratis en tu ordenador, dónde te pagan y las reglas para no perder la cuenta.",
    categoria: "IA",
    nivel: "Básico",
    icono: "play",
    tono: "#f472b6",
    archivo: "/guias/clipea-gta-vi.pdf",
    video: "",
  },
  {
    slug: "claude-excel",
    titulo: "Claude maneja tu Excel",
    descripcion: "Sube tu hoja de cálculo y pídele a Claude que limpie datos, ponga fórmulas y cree gráficos, con los prompts exactos.",
    categoria: "IA",
    nivel: "Básico",
    icono: "grafica",
    tono: "#34d399",
    archivo: "/guias/claude-excel.pdf",
    video: "",
  },
  {
    slug: "10-codigos-chatgpt",
    titulo: "Los 10 códigos para ChatGPT",
    descripcion: "Diez órdenes cortas (truth, devil, odds, decode…) que cambian cómo te responde, con el prompt exacto de cada una.",
    categoria: "IA",
    nivel: "Básico",
    icono: "destello",
    tono: "#a78bfa",
    archivo: "/guias/10-codigos-chatgpt.pdf",
    video: "",
  },
  {
    slug: "dropshipping-ia",
    titulo: "Dropshipping con IA",
    descripcion: "De la ficha del proveedor a una página de venta y un vídeo de anuncio en minutos, con los prompts exactos.",
    categoria: "IA",
    nivel: "Básico",
    icono: "tienda",
    tono: "#fb923c",
    archivo: "/guias/dropshipping-ia.pdf",
    video: "",
  },
  {
    slug: "instala-5-skills-video",
    titulo: "5 skills para crear vídeos con Claude",
    descripcion: "HyperFrames, Remotion, onetake, Papercut Explainer y Embedded Captions: comando de instalación y frase de prueba de cada una.",
    categoria: "IA",
    nivel: "Básico",
    icono: "play",
    tono: "#fbbf24",
    archivo: "/guias/instala-5-skills-video.pdf",
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
