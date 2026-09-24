import { isHex } from '~/utils/color'
import { getBookTemplate, type TemplatePage } from '~/utils/bookTemplates'

export type StickerType =
  | 'title'
  | 'banner'
  | 'date'
  | 'mood'
  | 'todo'
  | 'checklist'
  | 'note'
  | 'sleep'
  | 'stars'
  | 'image'
  | 'washi'
  | 'polaroid'
  | 'clip'
  | 'pin'
  | 'stamp'
  | 'emoji'
  | 'weather'
  | 'water'
  | 'gratitude'
  | 'habits'
  | 'drawing'
  | 'language'
  | 'vocab'

export type Sticker = {
  id: string
  type: StickerType
  data: Record<string, any>
  /** Posición horizontal (0-100, % del ancho de la página) del punto de anclaje del sticker. */
  x: number
  /** Posición vertical en píxeles desde arriba de la página. */
  y: number
  /** Modo scrapbook: flota libre sobre la página (sin imán ni columnas). */
  free?: boolean
  /** Rotación en grados (solo modo scrapbook). */
  rot?: number
  /** Escala 0.5–2.5 (solo modo scrapbook). */
  scale?: number
  /** Orden de apilado en modo scrapbook: mayor = más arriba. */
  z?: number
}

export type StickerLayout = Pick<Sticker, 'free' | 'rot' | 'scale' | 'z'>

// Puntos de imán horizontales: bordes (0/100) y los tres puntos intermedios de las 2 "columnas".
export const STICKER_SNAP_X = [0, 25, 50, 75, 100]
// Alto de fila base usado para el imán vertical (mitad = "el medio del cuadro").
export const STICKER_ROW_UNIT = 45

// Por defecto cada sticker nuevo cae en su propia fila (vacía), así que ocupa todo el ancho.
// Si el usuario lo arrastra sobre otro, BookPage los reacomoda en columnas.
function defaultStickerPosition(index: number) {
  return { x: 50, y: 16 + index * (STICKER_ROW_UNIT * 4) }
}

// Posición para un sticker nuevo agregado al final de la página: se calcula contando
// filas (valores de "y" distintos), no stickers. Varios stickers pueden compartir una
// misma fila (columnas), así que contarlos uno por uno haría caer el nuevo mucho más
// abajo de lo necesario.
function nextStickerPosition(page: BookPage) {
  const rows = new Set(page.stickers.filter((s) => !s.free).map((s) => s.y)).size
  return defaultStickerPosition(rows)
}

export type BookPage = {
  id: string
  stickers: Sticker[]
  /** Color de fondo de la hoja (hex). */
  color: string
  /** Id de papel decorativo (ver app/utils/pagePapers.ts). */
  paper?: string
}

export const PAGE_DEFAULT_COLOR = '#fbfaf7'
export const PAGE_COLORS = [
  '#fbfaf7', '#fde6ee', '#e9e1f5', '#dff1e6', '#dfeaf7', '#fbe8d9',
  '#f7f3d2', '#2a2438', '#1d2a26', '#1b2536', '#33262b', '#1e1e24',
]

export type Book = {
  id: string
  name: string
  color: string
  /** Id de una portada ilustrada (ver app/utils/bookCovers.ts), o null para el lomo de color plano. */
  cover: string | null
  /** Imagen propia subida por el usuario (data URL). Tiene prioridad sobre `cover`. */
  coverImage: string | null
  /** Clave de fuente (ver app/utils/fonts.ts) para el nombre del libro. */
  font?: string
  /** Textura de la tapa (ver app/utils/bookCovers.ts). */
  texture?: string
  /** Muestra un broche dorado en el borde de la tapa. */
  clasp?: boolean
  createdAt: number
  pages: BookPage[]
}

export const BOOK_COLORS = ['#e8dbf2', '#dbe9dd', '#f3d9df', '#dbe3f2', '#f4e8cf', '#f2dbe8']

const STORAGE_KEY = 'todo-books-v1'

const books = ref<Book[]>([])
let loaded = false

function emptyPage(): BookPage {
  return { id: uuid(), stickers: [], color: PAGE_DEFAULT_COLOR }
}

function pageFromTemplate(tpl: TemplatePage): BookPage {
  return {
    id: uuid(),
    color: tpl.color,
    paper: tpl.paper,
    stickers: tpl.stickers.map((s) => ({
      id: uuid(),
      type: s.type,
      data: structuredClone(s.data),
      x: s.x,
      y: s.y,
      ...(s.free ? { free: true } : {}),
      ...(s.rot !== undefined ? { rot: s.rot } : {}),
      ...(s.scale !== undefined ? { scale: s.scale } : {}),
      ...(s.z !== undefined ? { z: s.z } : {}),
    })),
  }
}

function sanitize(raw: unknown): Book[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((b): b is Record<string, any> => !!b && typeof b === 'object' && typeof b.id === 'string')
    .map((b) => {
      const pages = Array.isArray(b.pages)
        ? b.pages
            .filter((p: any) => !!p && typeof p === 'object' && typeof p.id === 'string')
            .map((p: any) => ({
              id: p.id,
              color: isHex(p.color) ? p.color : PAGE_DEFAULT_COLOR,
              paper: typeof p.paper === 'string' ? p.paper : undefined,
              stickers: Array.isArray(p.stickers)
                ? p.stickers
                    .filter((s: any) => !!s && typeof s === 'object' && typeof s.id === 'string' && typeof s.type === 'string')
                    .map((s: any, i: number) => {
                      const fallback = defaultStickerPosition(i)
                      return {
                        id: s.id,
                        type: s.type,
                        data: s.data && typeof s.data === 'object' ? s.data : {},
                        x: typeof s.x === 'number' ? s.x : fallback.x,
                        y: typeof s.y === 'number' ? s.y : fallback.y,
                        ...(s.free ? { free: true } : {}),
                        ...(typeof s.rot === 'number' ? { rot: s.rot } : {}),
                        ...(typeof s.scale === 'number' ? { scale: Math.min(2.5, Math.max(0.5, s.scale)) } : {}),
                        ...(typeof s.z === 'number' ? { z: s.z } : {}),
                      }
                    })
                : [],
            }))
        : []
      return {
        id: b.id,
        name: typeof b.name === 'string' ? b.name : 'Sin título',
        color: typeof b.color === 'string' ? b.color : BOOK_COLORS[0],
        cover: typeof b.cover === 'string' ? b.cover : null,
        coverImage: typeof b.coverImage === 'string' ? b.coverImage : null,
        font: typeof b.font === 'string' ? b.font : undefined,
        texture: typeof b.texture === 'string' ? b.texture : undefined,
        clasp: !!b.clasp,
        createdAt: typeof b.createdAt === 'number' ? b.createdAt : Date.now(),
        pages: pages.length ? pages : [emptyPage()],
      }
    })
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    books.value = raw ? sanitize(JSON.parse(raw)) : []
  } catch {
    books.value = []
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books.value))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useBooks() {
  load()

  function nextColor() {
    return BOOK_COLORS[books.value.length % BOOK_COLORS.length]
  }

  function addBook(name: string, cover: string | null = null, coverImage: string | null = null, templateId: string | null = null) {
    const trimmed = name.trim()
    if (!trimmed) return
    const templatePages = getBookTemplate(templateId)?.build().map(pageFromTemplate)
    const book: Book = {
      id: uuid(),
      name: trimmed,
      color: nextColor(),
      cover: coverImage ? null : cover,
      coverImage,
      createdAt: Date.now(),
      pages: templatePages?.length ? templatePages : [emptyPage()],
    }
    books.value.unshift(book)
    persist()
    return book.id
  }

  function setCover(bookId: string, cover: string | null) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    book.cover = cover
    book.coverImage = null
    persist()
  }

  function setBookFont(bookId: string, font: string) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    book.font = font
    persist()
  }

  function setCoverImage(bookId: string, image: string | null) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    book.coverImage = image
    if (image) book.cover = null
    persist()
  }

  function setPageColor(bookId: string, pageId: string, color: string) {
    const book = books.value.find((b) => b.id === bookId)
    const page = book?.pages.find((p) => p.id === pageId)
    if (!page) return
    page.color = color
    persist()
  }

  function deleteBook(id: string) {
    books.value = books.value.filter((b) => b.id !== id)
    persist()
  }

  function getBook(id: string) {
    return computed(() => books.value.find((b) => b.id === id) ?? null)
  }

  function addPage(bookId: string) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    book.pages.push(emptyPage())
    persist()
    return book.pages.length - 1
  }

  /**
   * Agrega páginas de una plantilla al libro. `pageIndexes` elige cuáles (por defecto, todas).
   * Si la página `replacePageId` está en blanco, la primera página de la plantilla la reemplaza
   * en vez de agregarse al final. Devuelve el índice de la primera página aplicada.
   */
  function applyTemplate(bookId: string, templateId: string, pageIndexes?: number[], replacePageId?: string) {
    const book = books.value.find((b) => b.id === bookId)
    const template = getBookTemplate(templateId)
    if (!book || !template) return
    const built = template.build()
    const chosen = (pageIndexes ?? built.map((_, i) => i)).map((i) => built[i]).filter((p): p is TemplatePage => !!p)
    if (!chosen.length) return
    const pages = chosen.map(pageFromTemplate)

    const blankIndex = replacePageId ? book.pages.findIndex((p) => p.id === replacePageId && !p.stickers.length) : -1
    let firstIndex: number
    if (blankIndex >= 0) {
      const [first, ...rest] = pages
      // Se conserva el id de la hoja en blanco para no perder la referencia de la página actual.
      book.pages[blankIndex] = { ...first!, id: book.pages[blankIndex]!.id }
      book.pages.splice(blankIndex + 1, 0, ...rest)
      firstIndex = blankIndex
    } else {
      firstIndex = book.pages.length
      book.pages.push(...pages)
    }
    persist()
    return firstIndex
  }

  function deletePage(bookId: string, pageId: string) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    if (book.pages.length <= 1) return
    book.pages = book.pages.filter((p) => p.id !== pageId)
    persist()
  }

  function addSticker(
    bookId: string,
    pageId: string,
    type: StickerType,
    data: Record<string, any>,
    position?: { x: number; y: number },
    layout?: StickerLayout,
  ) {
    const book = books.value.find((b) => b.id === bookId)
    const page = book?.pages.find((p) => p.id === pageId)
    if (!page) return
    const { x, y } = position ?? nextStickerPosition(page)
    const id = uuid()
    page.stickers.push({ id, type, data: structuredClone(data), x, y, ...(layout ?? {}) })
    persist()
    return id
  }

  function moveSticker(bookId: string, pageId: string, stickerId: string, x: number, y: number) {
    const book = books.value.find((b) => b.id === bookId)
    const page = book?.pages.find((p) => p.id === pageId)
    const sticker = page?.stickers.find((s) => s.id === stickerId)
    if (!sticker) return
    sticker.x = x
    sticker.y = y
    persist()
  }

  /** Cambia el layout scrapbook (libre / rotación / escala / apilado) de un sticker. */
  function setStickerLayout(bookId: string, pageId: string, stickerId: string, patch: Partial<StickerLayout> & { x?: number; y?: number }) {
    const page = books.value.find((b) => b.id === bookId)?.pages.find((p) => p.id === pageId)
    const sticker = page?.stickers.find((s) => s.id === stickerId)
    if (!page || !sticker) return
    Object.assign(sticker, patch)
    if (patch.scale !== undefined) sticker.scale = Math.min(2.5, Math.max(0.5, patch.scale))
    persist()
  }

  function bringToFront(bookId: string, pageId: string, stickerId: string) {
    const page = books.value.find((b) => b.id === bookId)?.pages.find((p) => p.id === pageId)
    const sticker = page?.stickers.find((s) => s.id === stickerId)
    if (!page || !sticker) return
    sticker.z = Math.max(10, ...page.stickers.map((s) => s.z ?? 10)) + 1
    persist()
  }

  function setPagePaper(bookId: string, pageId: string, paperId: string, color?: string) {
    const page = books.value.find((b) => b.id === bookId)?.pages.find((p) => p.id === pageId)
    if (!page) return
    page.paper = paperId === 'liso' ? undefined : paperId
    if (color && isHex(color)) page.color = color
    persist()
  }

  function setBookTexture(bookId: string, texture: string | undefined, clasp: boolean) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    book.texture = texture && texture !== 'none' ? texture : undefined
    book.clasp = clasp
    persist()
  }

  function updateSticker(bookId: string, pageId: string, stickerId: string, data: Record<string, any>) {
    const book = books.value.find((b) => b.id === bookId)
    const page = book?.pages.find((p) => p.id === pageId)
    const sticker = page?.stickers.find((s) => s.id === stickerId)
    if (!sticker) return
    sticker.data = { ...sticker.data, ...data }
    persist()
  }

  function removeSticker(bookId: string, pageId: string, stickerId: string) {
    const book = books.value.find((b) => b.id === bookId)
    const page = book?.pages.find((p) => p.id === pageId)
    if (!page) return
    page.stickers = page.stickers.filter((s) => s.id !== stickerId)
    persist()
  }

  function renameBook(bookId: string, name: string) {
    const book = books.value.find((b) => b.id === bookId)
    if (!book) return
    const trimmed = name.trim()
    if (!trimmed) return
    book.name = trimmed
    persist()
  }

  return {
    books,
    addBook,
    deleteBook,
    getBook,
    setBookFont,
    addPage,
    applyTemplate,
    deletePage,
    addSticker,
    updateSticker,
    setStickerLayout,
    bringToFront,
    setPagePaper,
    setBookTexture,
    moveSticker,
    removeSticker,
    renameBook,
    setCover,
    setCoverImage,
    setPageColor,
  }
}
