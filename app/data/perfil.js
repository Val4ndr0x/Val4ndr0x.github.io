// Datos de las secciones del portafolio (Sobre mí, Stack, Servicios,
// Proceso, Trayectoria, Testimonios, Blog, FAQ y Contacto).
// Los proyectos están en proyectos.js y los textos de la consola en consola.js.
// Las listas vacías (testimonios, posts) ocultan su sección hasta que tengan datos.

export const perfil = {
  nombre: "Andrés Valencia",
  nombreCompleto: "Andrés Felipe Valencia", // el del CV en PDF, igual que en LinkedIn
  alias: "Val4ndr0x",
  cargo: "Diseñador UX/UI y desarrollador web",
  ciudad: "Bogotá, Colombia",
  zonaHoraria: "America/Bogota",
  disponible: true,
  disponibilidad: "Disponible para proyectos",
};

// ---------- (01) Sobre mí ----------

export const sobreMi = {
  titulo: "Diseño y código,",
  tituloDestacado: "en un solo lugar.",
  resumen:
    "Soy desarrollador y diseñador UX/UI. Creo experiencias web completas: desde sitios para marcas hasta aplicaciones y realidad virtual, cuidando tanto cómo se ven como cómo funcionan.",
  cifras: [
    // "proyectos" se cuenta solo a partir de proyectos.js
    { valor: "proyectos", sufijo: "", texto: "Proyectos construidos" },
    { valor: 4, sufijo: "", texto: "Diplomados y certificados" },
    { valor: 8, sufijo: "", texto: "Insignias digitales" },
  ],
  // Se ilumina palabra por palabra al hacer scroll
  manifiesto:
    "Diseño la experiencia y después la construyo yo mismo. Sin traducciones entre equipos: quien dibuja cada píxel es quien escribe el código que lo hace funcionar.",
  // Las tres fases que recorre el lienzo de la sección
  fases: [
    { fase: "Diseño", valor: "Detalle", texto: "Cada interacción se dibuja y se mide antes de programarse." },
    { fase: "Interfaz", valor: "Accesibilidad", texto: "Contraste, jerarquía y tamaños pensados para que cualquiera pueda usarla." },
    { fase: "Código", valor: "Rendimiento", texto: "Componentes limpios que responden al instante." },
  ],
  ahoraMismo: [
    { etiqueta: "Estudiando", texto: "Tecnología en Desarrollo de Software (SENA)" },
    { etiqueta: "Construyendo", texto: "Este portafolio en Nuxt 4" },
    { etiqueta: "Explorando", texto: "Animaciones con resortes y realidad virtual" },
  ],
};

// ---------- (02) Stack ----------
// nivel: "experto" | "avanzado" | "aprendiendo" (define el anillo de la órbita)
// sigla y color: cómo se ve cada tecnología en la órbita

export const niveles = {
  experto: { texto: "Experto", color: "#30d158", valor: 3 },
  avanzado: { texto: "Avanzado", color: "#64d2ff", valor: 2 },
  aprendiendo: { texto: "Aprendiendo", color: "#ff9f0a", valor: 1 },
};

export const stack = [
  {
    categoria: "Diseño",
    items: [
      { nombre: "UX/UI", sigla: "UX", color: "#ff4060", nivel: "avanzado", detalle: "Diplomados de la Universidad Nacional" },
      { nombre: "Prototipado", sigla: "Pr", color: "#a259ff", nivel: "avanzado", detalle: "Kit UX/UI de DMK Sport" },
      { nombre: "Realidad virtual", sigla: "VR", color: "#64d2ff", nivel: "aprendiendo", detalle: "Experiencia inmersiva con gafas VR" },
    ],
  },
  {
    categoria: "Frontend",
    items: [
      { nombre: "JavaScript", sigla: "JS", color: "#f7df1e", nivel: "avanzado", detalle: "Base de todos mis proyectos web" },
      { nombre: "Vue", sigla: "Vue", color: "#42b883", nivel: "avanzado", detalle: "DMK Sport, Toodo" },
      { nombre: "Nuxt", sigla: "Nx", color: "#00dc82", nivel: "avanzado", detalle: "Este portafolio" },
      { nombre: "HTML y CSS", sigla: "</>", color: "#e34f26", nivel: "experto", detalle: "Animaciones, layouts y efectos" },
      { nombre: "Tailwind CSS", sigla: "Tw", color: "#38bdf8", nivel: "avanzado", detalle: "Estilos rápidos con clases utilitarias" },
    ],
  },
  {
    categoria: "Backend y datos",
    items: [
      { nombre: "SQL", sigla: "SQL", color: "#5b9bd5", nivel: "aprendiendo", detalle: "CRUD de DMK Sport" },
    ],
  },
  {
    categoria: "Herramientas",
    items: [
      { nombre: "Git y GitHub", sigla: "Git", color: "#f05032", nivel: "avanzado", detalle: "Publicación en GitHub Pages" },
      { nombre: "Metodologías ágiles", sigla: "Ag", color: "#ff9f0a", nivel: "avanzado", detalle: "Trabajo por iteraciones" },
    ],
  },
];

// ---------- Servicios ----------

export const servicios = [
  {
    titulo: "Diseño UX/UI",
    descripcion: "Interfaces claras y atractivas, del boceto al prototipo.",
    incluye: ["Investigación y flujos", "Wireframes", "Prototipo interactivo"],
    icono: "pincel",
    tono: "#ff9f0a",
  },
  {
    titulo: "Sitios web",
    descripcion: "Páginas para marcas y negocios, rápidas y adaptables.",
    incluye: ["Diseño a medida", "Adaptable a móvil", "Publicación"],
    icono: "web",
    tono: "#ff375f",
  },
  {
    titulo: "Aplicaciones web",
    descripcion: "Herramientas con datos, usuarios y gestión de contenido.",
    incluye: ["Vue / Nuxt", "Gestión CRUD", "Base de datos"],
    icono: "app",
    tono: "#64d2ff",
  },
];

// ---------- Proceso ----------

// entregables: lo que queda al terminar cada paso; tono: color del paso en la escena
export const proceso = [
  {
    titulo: "Descubrir",
    texto: "Entiendo tu idea, tu público y lo que necesitas lograr.",
    entregables: ["Objetivos", "Público", "Alcance"],
    tono: "#ff4060",
  },
  {
    titulo: "Diseñar",
    texto: "Propongo flujos y prototipos que puedes probar antes de programar.",
    entregables: ["Flujos", "Prototipo", "Sistema visual"],
    tono: "#bf5af2",
  },
  {
    titulo: "Desarrollar",
    texto: "Construyo con revisiones frecuentes para ajustar a tiempo.",
    entregables: ["Componentes", "Revisiones", "Rendimiento"],
    tono: "#64d2ff",
  },
  {
    titulo: "Entregar",
    texto: "Publico el proyecto y te acompaño en los primeros ajustes.",
    entregables: ["Publicación", "Ajustes", "Acompañamiento"],
    tono: "#30d158",
  },
];

// ---------- (04) Trayectoria ----------
// tipo: "educacion" | "certificado" | "experiencia"

export const trayectoria = [
  {
    tipo: "educacion",
    titulo: "Tecnología en Desarrollo de Software",
    lugar: "SENA · Bogotá",
    periodo: "En curso",
    actual: true,
    chips: ["JavaScript", "SQL"],
  },
  {
    tipo: "experiencia",
    titulo: "Proyectos independientes",
    lugar: "Diseño y desarrollo web",
    periodo: "En curso",
    actual: true,
    puntos: [
      "Sitio web para La Oveja Negra Creativa.",
      "DMK Sport: aplicación web con gestión CRUD (proyecto final).",
      "Experiencia de realidad virtual para gafas VR.",
    ],
    chips: ["Vue", "Nuxt", "UX/UI"],
  },
  {
    tipo: "certificado",
    titulo: "Certificado de Inglés",
    lugar: "British Council · Bogotá",
    periodo: "2024",
  },
  {
    tipo: "certificado",
    titulo: "Inteligencia Socioemocional",
    lugar: "Universidad Nacional de Colombia",
    periodo: "2024",
  },
  {
    tipo: "educacion",
    titulo: "Diplomado en Diseño UX/UI (Nivel Intermedio)",
    lugar: "Universidad Nacional de Colombia",
    periodo: "2023",
    chips: ["UX/UI"],
  },
  {
    tipo: "educacion",
    titulo: "Diplomado en Diseño UX/UI (Nivel Básico)",
    lugar: "Universidad Nacional de Colombia",
    periodo: "2023",
    chips: ["UX/UI"],
  },
];

export const idiomas = [
  { idioma: "Español", nivel: "Nativo" },
  { idioma: "Inglés", nivel: "Certificado British Council" },
];

// ---------- (05) Testimonios ----------
// Agrega aquí testimonios reales para que aparezca la sección:
// { texto, nombre, cargo, proyecto, enlace }

export const testimonios = [];

// ---------- (06) Blog ----------
// { titulo, fecha: "2026-09-12", lectura: "5 min", categoria, enlace, destacado }

export const posts = [];

// ---------- Preguntas frecuentes ----------

export const preguntas = [
  {
    pregunta: "¿Qué tipo de proyectos haces?",
    respuesta: "Sitios web para marcas, aplicaciones web con Vue y Nuxt, diseño UX/UI y experiencias de realidad virtual.",
  },
  {
    pregunta: "¿Puedo pedir solo el diseño?",
    respuesta: "Sí. Puedo entregarte el prototipo listo para que otro equipo lo programe, o encargarme de todo.",
  },
  {
    pregunta: "¿Trabajas de forma remota?",
    respuesta: "Sí, trabajo desde Bogotá con clientes en cualquier lugar, por videollamada y mensajes.",
  },
  {
    pregunta: "¿Qué necesito para empezar?",
    respuesta: "Una idea de lo que quieres lograr. Con eso agendamos una charla y te propongo los siguientes pasos.",
  },
];

// ---------- (07) Contacto ----------

export const contacto = {
  correo: "valenciagaandriux@gmail.com",
  telefono: "+57 320 353 1129",
  whatsapp: "https://wa.me/573203531129",
  linkedin: "https://co.linkedin.com/in/andr%C3%A9s-felipe-valencia-121a3a3b7",
  respuesta: "Respondo en menos de 24 horas",
  tiposProyecto: ["Sitio web", "Aplicación web", "Diseño UX/UI", "Realidad virtual", "Otro"],
  presupuestos: ["Por definir", "Pequeño", "Mediano", "Grande"],
};
