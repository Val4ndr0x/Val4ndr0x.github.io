import type { StickerType } from '~/composables/useBooks'

/** Sticker ya posicionado, listo para agregarse a una página. */
export type TemplateSticker = {
  type: StickerType
  data: Record<string, any>
  x: number
  y: number
  free?: boolean
  rot?: number
  scale?: number
  z?: number
}

export type TemplatePage = {
  color: string
  /** Id de papel (ver app/utils/pagePapers.ts). */
  paper?: string
  stickers: TemplateSticker[]
}

export type BookTemplate = {
  id: string
  label: string
  blurb: string
  /** Se arma en cada uso para que los ids internos (tareas, hábitos, etc.) sean nuevos. */
  build: () => TemplatePage[]
}

// ---------------------------------------------------------------------------
// Constructores. Las plantillas se escriben como una lista de "filas" (un sticker a todo el ancho
// o dos en columnas) más decoraciones libres (stickers de imagen, washi). page() calcula la posición
// vertical de cada fila con un alto estimado por tipo, con holgura para que filas distintas nunca
// se superpongan (BookPage agrupa en columnas los stickers que se tocan). Sleep y water se dibujan
// más altos cuando quedan angostos y, antes de medirse, BookPage supone 150px de alto: por eso
// esas filas ocupan al menos 150px, o quedarían enganchadas en columna con la fila siguiente.
// ---------------------------------------------------------------------------

type Flow = { type: StickerType; data: Record<string, any>; h: number }
type Decor = { type: StickerType; data: Record<string, any>; x: number; y: number; rot: number; scale: number; z: number }
type Entry = Flow | [Flow, Flow] | Decor

const GAP = 20
const isPair = (e: Entry): e is [Flow, Flow] => Array.isArray(e)
const isDecor = (e: Entry): e is Decor => !Array.isArray(e) && 'x' in e

const P = {
  rosa: '#fde6ee',
  lila: '#e9e1f5',
  menta: '#dff1e6',
  azul: '#dfeaf7',
  durazno: '#fbe8d9',
  crema: '#f7f3d2',
  papel: '#fbfaf7',
  vintage: '#f1e4c8',
  noche: '#1b1740',
  bosque: '#e3efd9',
}

const N = {
  amarillo: '#fdeec9',
  verde: '#eef0d9',
  azul: '#dbe7f5',
  lila: '#e6dbf0',
  rosa: '#fbe3ea',
  durazno: '#fde2c8',
  menta: '#d9f0ea',
  papel: '#f3e3d3',
  blanco: '#ffffff',
}

const stickerFile = (file: string) => `/stickers/${file}.png`

const title = (text: string, color = 'transparent'): Flow => ({ type: 'title', data: { text, color }, h: 68 })
const banner = (text: string, color: string, variant = 'brush', decor = ''): Flow => ({ type: 'banner', data: { text, variant, color, decor }, h: 64 })
const date = (color = N.blanco): Flow => ({ type: 'date', data: { value: '', color }, h: 54 })
const note = (heading: string, color: string): Flow => ({ type: 'note', data: { title: heading, color, value: '' }, h: 132 })
const todo = (heading: string, color: string, count = 4): Flow => ({
  type: 'todo',
  data: { title: heading, color, items: Array.from({ length: count }, () => ({ id: uuid(), text: '', checked: false })) },
  h: 40 + count * 42,
})
const checklist = (heading: string, color: string, labels: string[]): Flow => ({
  type: 'checklist',
  data: { title: heading, color, items: labels.map((label) => ({ id: uuid(), label, checked: false })) },
  h: 40 + labels.length * 40,
})
const mood = (color = N.lila): Flow => ({ type: 'mood', data: { color, value: null }, h: 100 })
const sleep = (color = N.azul): Flow => ({ type: 'sleep', data: { color, value: null }, h: 150 })
const stars = (heading: string, color = N.blanco): Flow => ({ type: 'stars', data: { title: heading, color, value: 0 }, h: 84 })
const weather = (color = N.azul): Flow => ({ type: 'weather', data: { color, value: null }, h: 100 })
const water = (color = N.menta): Flow => ({ type: 'water', data: { color, value: 0 }, h: 150 })
const gratitude = (color = N.rosa): Flow => ({ type: 'gratitude', data: { color, lines: ['', '', ''] }, h: 147 })
const habits = (names: string[], color = N.blanco): Flow => ({
  type: 'habits',
  data: { color, habits: names.map((name) => ({ id: uuid(), name, days: [false, false, false, false, false, false, false] })) },
  h: 65 + names.length * 42,
})
const polaroid = (caption: string): Flow => ({ type: 'polaroid', data: { src: '', caption }, h: 306 })

/** Sticker de imagen suelto, sin tarjeta. y negativo = distancia por debajo del final del contenido. */
const img = (file: string, x: number, y: number, rot = 0, scale = 1): Decor => ({
  type: 'image',
  data: { src: stickerFile(file), label: file, color: 'transparent' },
  x,
  y,
  rot,
  scale,
  z: 20,
})
const washi = (color: string, pattern: string, x: number, y: number, rot = 0): Decor => ({
  type: 'washi',
  data: { color, pattern },
  x,
  y,
  rot,
  scale: 1,
  z: 15,
})

function page(color: string, paper: string | undefined, entries: Entry[]): TemplatePage {
  const stickers: TemplateSticker[] = []
  const decors: Decor[] = []
  let y = 16
  for (const e of entries) {
    if (isDecor(e)) {
      decors.push(e)
    } else if (isPair(e)) {
      const [a, b] = e
      // El alto de los stickers casi no depende del ancho, así que la fila mide lo que el más alto.
      const h = Math.max(a.h, b.h)
      stickers.push({ type: a.type, data: a.data, x: 25, y }, { type: b.type, data: b.data, x: 75, y })
      y += h + GAP
    } else {
      stickers.push({ type: e.type, data: e.data, x: 50, y })
      y += e.h + GAP
    }
  }
  for (const d of decors) {
    stickers.push({
      type: d.type,
      data: d.data,
      x: d.x,
      y: d.y < 0 ? y - GAP - d.y : d.y,
      free: true,
      rot: d.rot,
      scale: d.scale,
      z: d.z,
    })
  }
  return { color, ...(paper ? { paper } : {}), stickers }
}

// ---------------------------------------------------------------------------
// Plantillas
// ---------------------------------------------------------------------------

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: 'vintage',
    label: 'Diario vintage',
    blurb: 'Papel envejecido con renglones y detalles antiguos.',
    build: () => [
      page(P.vintage, 'vintage', [
        title('Querido diario'),
        date(N.papel),
        note('Hoy pasó...', N.papel),
        img('cafe', 88, 6, 8, 0.9),
        img('planta', 10, -8, -8, 1),
        washi('#c9a97a', 'stripes', 50, 0, -2),
      ]),
      page(P.vintage, 'vintage', [
        banner('Recuerdos', '#d8bf94', 'brush'),
        [note('Lo mejor', N.papel), note('Lo que aprendí', N.papel)],
        gratitude(N.papel),
        img('leer', 12, 4, -6, 0.9),
      ]),
      page(P.vintage, 'vintage', [
        title('Cartas y pensamientos'),
        note('Una carta para mí', N.papel),
        stars('Cómo me sentí', N.papel),
        img('gato', 86, -8, 6, 1),
      ]),
      page(P.vintage, 'vintage', [
        banner('Pendientes', '#d8bf94', 'brush'),
        todo('Por hacer', N.papel, 5),
        note('Notas sueltas', N.papel),
        washi('#c9a97a', 'plaid', 80, 0, 3),
      ]),
    ],
  },
  {
    id: 'kawaii',
    label: 'Diario kawaii',
    blurb: 'Colores pastel, puntitos y muchos stickers tiernos.',
    build: () => [
      page(P.rosa, 'kawaii', [
        title('Mi día kawaii'),
        [date('#ffffff'), mood('#ffffff')],
        banner('Hoy quiero', '#f7b8cf', 'hearts'),
        todo('Mis pendientes', N.rosa, 4),
        img('conejo', 90, 4, 8, 1.1),
        img('kawaii', 8, -8, -8, 0.9),
        washi('#f7b8cf', 'dots', 50, 0, -3),
      ]),
      page(P.rosa, 'kawaii', [
        banner('Cosas lindas', '#f4a3c4', 'confetti'),
        gratitude(N.blanco),
        [note('Me dio risa', N.durazno), note('Me dio ternura', N.lila)],
        img('amor', 88, -8, 8, 1),
      ]),
      page(P.rosa, 'kawaii', [
        title('Mis metas'),
        checklist('Rutina', N.blanco, ['Tomar agua', 'Hacer ejercicio', 'Leer un rato', 'Dormir temprano']),
        stars('Qué tan bien me fue', N.blanco),
        img('gato(1)', 12, -8, -6, 1),
      ]),
    ],
  },
  {
    id: 'semanal',
    label: 'Planificador semanal',
    blurb: 'Tareas, hábitos y metas para organizar la semana.',
    build: () => [
      page(P.papel, 'cuadricula', [
        title('Mi semana'),
        [date(N.verde), weather(N.azul)],
        habits(['Ejercicio', 'Leer', 'Meditar'], N.blanco),
        todo('Prioridades', N.amarillo, 5),
        img('ser-creativo', 90, 6, 6, 0.8),
      ]),
      page(P.papel, 'cuadricula', [
        banner('Lunes a viernes', '#cdb8ec', 'brush'),
        checklist('Rutina diaria', N.blanco, ['Despertar temprano', 'Desayunar bien', 'Revisar pendientes', 'Ordenar mi espacio']),
        [note('Reuniones', N.azul), note('Recordatorios', N.durazno)],
      ]),
      page(P.papel, 'cuadricula', [
        banner('Balance de la semana', '#a9dcc3', 'brush'),
        stars('Productividad', N.blanco),
        [note('Lo que logré', N.verde), note('Para mejorar', N.rosa)],
        img('ok', 88, -8, 8, 1),
      ]),
    ],
  },
  {
    id: 'bienestar',
    label: 'Bienestar',
    blurb: 'Ánimo, sueño, agua y gratitud para cuidarte cada día.',
    build: () => [
      page(P.lila, 'pastel', [
        title('Mi autocuidado'),
        [mood(N.blanco), water(N.blanco)],
        sleep(N.blanco),
        weather(N.blanco),
        checklist('Hoy me cuido', N.blanco, ['Tomar agua', 'Estirarme', 'Salir a caminar', 'Desconectarme un rato']),
        img('paz', 90, 4, 8, 1),
      ]),
      page(P.lila, 'pastel', [
        banner('Gratitud', '#cdb8ec', 'hearts'),
        gratitude(N.blanco),
        note('Afirmaciones', N.lila),
        img('adorable', 10, -8, -6, 1),
      ]),
      page(P.lila, 'pastel', [
        title('Cómo me siento'),
        mood(N.blanco),
        note('Lo que necesito hoy', N.blanco),
        stars('Energía', N.blanco),
        img('contento', 88, -8, 6, 1),
      ]),
    ],
  },
  {
    id: 'lectura',
    label: 'Bitácora de lectura',
    blurb: 'Registra libros, frases favoritas y tu calificación.',
    build: () => [
      page(P.crema, 'renglones', [
        title('Mi libro'),
        [note('Título', N.blanco), note('Autor/a', N.blanco)],
        [date(N.verde), stars('Mi calificación', N.blanco)],
        note('De qué trata', N.amarillo),
        img('leer', 90, 6, 6, 1),
      ]),
      page(P.crema, 'renglones', [
        banner('Frases y citas', '#f3e3ae', 'brush', stickerFile('planta')),
        note('Frase favorita', N.amarillo),
        note('Por qué me gustó', N.blanco),
      ]),
      page(P.crema, 'renglones', [
        title('Mis lecturas'),
        checklist('Quiero leer', N.blanco, ['Libro 1', 'Libro 2', 'Libro 3', 'Libro 4']),
        habits(['Leer 20 minutos'], N.blanco),
        img('cafe(1)', 12, -8, -8, 1),
      ]),
    ],
  },
  {
    id: 'nocturno',
    label: 'Diario nocturno',
    blurb: 'Fondo de galaxia para reflexionar antes de dormir.',
    build: () => [
      page(P.noche, 'galaxia', [
        title('Buenas noches', '#2a2438'),
        date('#2a2438'),
        sleep('#2a2438'),
        note('Lo que pasó hoy', '#2a2438'),
        img('hola', 90, 6, 8, 0.9),
      ]),
      page(P.noche, 'galaxia', [
        banner('Antes de dormir', '#cdb8ec', 'brush'),
        gratitude('#2a2438'),
        [note('Sueños', '#1b2536'), note('Para mañana', '#33262b')],
      ]),
    ],
  },
  {
    id: 'naturaleza',
    label: 'Cuaderno de naturaleza',
    blurb: 'Tonos verdes para plantas, paseos y hábitos sanos.',
    build: () => [
      page(P.bosque, 'bosque', [
        title('Mi rincón verde'),
        [weather('#ffffff'), date('#ffffff')],
        habits(['Regar las plantas', 'Caminar', 'Tomar agua'], N.blanco),
        note('Lo que observé hoy', N.verde),
        img('planta', 90, 4, 6, 1.2),
        img('rana', 10, -8, -8, 1),
      ]),
      page(P.bosque, 'bosque', [
        banner('Mis plantas', '#a9dcc3', 'brush', stickerFile('planta')),
        checklist('Cuidados', N.blanco, ['Regar', 'Podar', 'Abonar', 'Cambiar de maceta']),
        [note('Nuevas hojas', N.verde), note('Por comprar', N.amarillo)],
      ]),
    ],
  },
  {
    id: 'scrapbook',
    label: 'Scrapbook',
    blurb: 'Polaroids, washi y stickers para un álbum de recuerdos.',
    build: () => [
      page(P.durazno, undefined, [
        title('Recuerdos'),
        [polaroid('Un momento'), polaroid('Otro momento')],
        note('Qué recuerdo de este día', N.papel),
        washi('#f7b8cf', 'dots', 25, 6, -6),
        washi('#a9dcc3', 'stripes', 78, 260, 5),
        img('kawaii', 92, 20, 8, 1),
        img('torta', 8, -8, -8, 1),
      ]),
      page(P.durazno, undefined, [
        banner('Aventuras', '#f4b99a', 'confetti'),
        [polaroid('Nuestro viaje'), polaroid('Otro lugar')],
        [note('Dónde fuimos', N.amarillo), note('Con quién', N.rosa)],
        washi('#cdb8ec', 'hearts', 50, 60, 3),
        img('cafe(2)', 88, -8, 6, 1),
      ]),
    ],
  },
  {
    id: 'minimalista',
    label: 'Minimalista',
    blurb: 'Hoja punteada, limpia, con lo esencial.',
    build: () => [
      page(P.papel, 'puntos', [
        title('Hoy'),
        date(N.blanco),
        todo('Lo importante', N.blanco, 5),
        note('Notas', N.blanco),
      ]),
      page(P.papel, 'puntos', [
        title('Ideas'),
        [note('Idea', N.blanco), note('Idea', N.blanco)],
        note('Apuntes', N.blanco),
      ]),
    ],
  },
]

export function getBookTemplate(id: string | null | undefined): BookTemplate | null {
  if (!id) return null
  return BOOK_TEMPLATES.find((t) => t.id === id) ?? null
}
