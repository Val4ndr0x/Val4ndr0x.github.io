export type BoardItemType = 'sticker' | 'image' | 'title' | 'banner' | 'date' | 'mood' | 'todo' | 'checklist' | 'note' | 'sleep' | 'stars' | 'drawing' | 'panel' | 'calendar' | 'list' | 'book' | 'client'

export type BoardRefKind = 'list' | 'book' | 'client'

export type BoardItem = {
  id: string
  type: BoardItemType
  /** URL del sticker predefinido, o data URL de una imagen subida por el usuario (tipos 'sticker'/'image'). */
  src?: string
  label?: string
  /** Contenido del widget (título, nota, lista de tareas, etc.) para los demás tipos. */
  data?: Record<string, any>
  /** Id de la lista, libro o cliente al que apunta el elemento (tipos 'list'/'book'/'client'). */
  refId?: string
  /** Giro en grados (stickers e imágenes). */
  rotation?: number
  /** Escala del contenido de widgets y tarjetas (1 = tamaño natural); crece al agrandar un grupo. */
  scale?: number
  /** Grupo armado por el usuario (se guarda): al tocar uno se selecciona todo el grupo. */
  userGroup?: string
  /** Solo mientras se coloca una plantilla: todos sus elementos comparten grupo y se mueven juntos. No se guarda. */
  groupId?: string
  /** Posición en coordenadas del lienzo (px, sin escalar por el zoom). */
  x: number
  y: number
  /** Tamaño en coordenadas del lienzo. */
  width: number
  height: number
}

const STORAGE_KEY = 'todo-board-v1'
const LINKS_STORAGE_KEY = 'todo-board-links-v1'
const BG_STORAGE_KEY = 'todo-board-bg-v1'
const DEFAULT_BOARD_COLOR = '#131316'
const WIDGET_TYPES: BoardItemType[] = ['title', 'banner', 'date', 'mood', 'todo', 'checklist', 'note', 'sleep', 'stars', 'drawing', 'panel', 'calendar']

const REF_TYPES: BoardItemType[] = ['list', 'book', 'client']

export function isWidgetType(type: BoardItemType) {
  return WIDGET_TYPES.includes(type)
}

export function isRefType(type: BoardItemType) {
  return REF_TYPES.includes(type)
}

export type BoardLink = { id: string; from: string; to: string }

const items = ref<BoardItem[]>([])
const links = ref<BoardLink[]>([])
let linksLoaded = false
const boardColor = ref<string>(DEFAULT_BOARD_COLOR)
let loaded = false
let bgLoaded = false
/** Plantilla que se está acomodando (sus elementos se mueven en bloque hasta confirmarla). */
const editingGroup = ref<string | null>(null)

function sanitize(raw: unknown): BoardItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((i): i is Record<string, any> => !!i && typeof i === 'object' && typeof i.id === 'string')
    .map((i) => {
      const type: BoardItemType = ['sticker', 'image', ...WIDGET_TYPES, ...REF_TYPES].includes(i.type) ? i.type : 'image'
      // Los tableros guardados antes de tener ancho/alto independientes usaban un único "size" cuadrado.
      const legacySize = typeof i.size === 'number' && i.size > 0 ? i.size : undefined
      return {
        id: i.id,
        type,
        src: typeof i.src === 'string' ? i.src : undefined,
        label: typeof i.label === 'string' ? i.label : undefined,
        data: i.data && typeof i.data === 'object' ? i.data : undefined,
        refId: typeof i.refId === 'string' ? i.refId : undefined,
        scale: typeof i.scale === 'number' && i.scale > 0 ? i.scale : undefined,
        userGroup: typeof i.userGroup === 'string' ? i.userGroup : undefined,
        rotation: typeof i.rotation === 'number' && Number.isFinite(i.rotation) ? i.rotation : 0,
        x: typeof i.x === 'number' ? i.x : 0,
        y: typeof i.y === 'number' ? i.y : 0,
        width: typeof i.width === 'number' && i.width > 0 ? i.width : legacySize ?? 140,
        height: typeof i.height === 'number' && i.height > 0 ? i.height : legacySize ?? 140,
      }
    })
    .filter((i) => (isWidgetType(i.type) ? true : isRefType(i.type) ? !!i.refId : !!i.src)) as BoardItem[]
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    items.value = raw ? sanitize(JSON.parse(raw)) : []
  } catch {
    items.value = []
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value, (key, value) => (key === 'groupId' ? undefined : value)))
  } catch {
    // ignore write failures (e.g. private browsing, cupo lleno)
  }
}

function loadLinks() {
  if (linksLoaded || !import.meta.client) return
  linksLoaded = true
  try {
    const raw = JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY) ?? '[]')
    links.value = Array.isArray(raw)
      ? raw.filter(
          (l): l is BoardLink => !!l && typeof l.id === 'string' && typeof l.from === 'string' && typeof l.to === 'string',
        )
      : []
  } catch {
    links.value = []
  }
}

function persistLinks() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links.value))
  } catch {
    // ignore write failures (e.g. private browsing, cupo lleno)
  }
}

function loadBoardColor() {
  if (bgLoaded || !import.meta.client) return
  bgLoaded = true
  try {
    const raw = localStorage.getItem(BG_STORAGE_KEY)
    boardColor.value = typeof raw === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : DEFAULT_BOARD_COLOR
  } catch {
    boardColor.value = DEFAULT_BOARD_COLOR
  }
}

function persistBoardColor() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(BG_STORAGE_KEY, boardColor.value)
  } catch {
    // ignore write failures (e.g. private browsing, cupo lleno)
  }
}

export function useBoard() {
  load()
  loadLinks()
  loadBoardColor()

  function setBoardColor(color: string) {
    boardColor.value = color
    persistBoardColor()
  }

  function addItem(input: Omit<BoardItem, 'id'>) {
    const item: BoardItem = { id: uuid(), ...input }
    items.value.push(item)
    persist()
    return item.id
  }

  /** Agrega varios elementos de golpe (una plantilla) como un solo grupo y lo deja en modo de edición en bloque. */
  function addGroup(inputs: Omit<BoardItem, 'id' | 'groupId'>[]) {
    const groupId = uuid()
    for (const input of inputs) items.value.push({ id: uuid(), ...input, groupId })
    editingGroup.value = groupId
    persist()
    return groupId
  }

  function moveGroup(groupId: string, dx: number, dy: number) {
    for (const item of items.value) {
      if (item.groupId !== groupId) continue
      item.x += dx
      item.y += dy
    }
    persist()
  }

  function moveItems(ids: string[], dx: number, dy: number) {
    const set = new Set(ids)
    for (const item of items.value) {
      if (!set.has(item.id)) continue
      item.x += dx
      item.y += dy
    }
    persist()
  }

  /** Escala posiciones y tamaños respecto al punto (ox, oy); el contenido de widgets y tarjetas crece con ellos. */
  function scaleItems(ids: string[], factor: number, ox: number, oy: number) {
    const set = new Set(ids)
    for (const item of items.value) {
      if (!set.has(item.id)) continue
      item.x = ox + (item.x - ox) * factor
      item.y = oy + (item.y - oy) * factor
      item.width *= factor
      item.height *= factor
      if (isWidgetType(item.type) || isRefType(item.type)) item.scale = Math.min(8, Math.max(0.1, (item.scale ?? 1) * factor))
    }
    persist()
  }

  function groupItems(ids: string[]) {
    const userGroup = uuid()
    const set = new Set(ids)
    for (const item of items.value) if (set.has(item.id)) item.userGroup = userGroup
    persist()
  }

  function ungroupItems(ids: string[]) {
    const set = new Set(ids)
    for (const item of items.value) if (set.has(item.id)) delete item.userGroup
    persist()
  }

  /** Sale del modo de edición en bloque: la plantilla queda como grupo guardado (se mueve y escala junta hasta desagrupar). */
  function ungroup(groupId: string) {
    const members = items.value.filter((i) => i.groupId === groupId)
    for (const item of members) {
      if (members.length > 1) item.userGroup = groupId
      delete item.groupId
    }
    if (editingGroup.value === groupId) editingGroup.value = null
    persist()
  }

  function removeGroup(groupId: string) {
    const ids = new Set(items.value.filter((i) => i.groupId === groupId).map((i) => i.id))
    items.value = items.value.filter((i) => !ids.has(i.id))
    if (editingGroup.value === groupId) editingGroup.value = null
    persist()
    if (links.value.some((l) => ids.has(l.from) || ids.has(l.to))) {
      links.value = links.value.filter((l) => !ids.has(l.from) && !ids.has(l.to))
      persistLinks()
    }
  }

  function moveItem(id: string, x: number, y: number) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    item.x = x
    item.y = y
    persist()
  }

  function resizeItem(id: string, width: number, height: number) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    item.width = Math.max(60, width)
    item.height = Math.max(48, height)
    persist()
  }

  function updateItemData(id: string, data: Record<string, any>) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    item.data = { ...item.data, ...data }
    persist()
  }

  function rotateItem(id: string, rotation: number) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    item.rotation = ((Math.round(rotation) % 360) + 360) % 360
    persist()
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    persist()
    if (links.value.some((l) => l.from === id || l.to === id)) {
      links.value = links.value.filter((l) => l.from !== id && l.to !== id)
      persistLinks()
    }
  }

  /** Une dos elementos; si ya estaban unidos, quita la unión. */
  function toggleLink(a: string, b: string) {
    if (a === b) return
    const existing = links.value.find((l) => (l.from === a && l.to === b) || (l.from === b && l.to === a))
    links.value = existing ? links.value.filter((l) => l.id !== existing.id) : [...links.value, { id: uuid(), from: a, to: b }]
    persistLinks()
  }

  function removeLink(id: string) {
    links.value = links.value.filter((l) => l.id !== id)
    persistLinks()
  }

  return {
    items,
    links,
    addItem,
    addGroup,
    moveGroup,
    moveItems,
    scaleItems,
    groupItems,
    ungroupItems,
    ungroup,
    removeGroup,
    editingGroup,
    moveItem,
    resizeItem,
    rotateItem,
    updateItemData,
    removeItem,
    toggleLink,
    removeLink,
    boardColor,
    setBoardColor,
  }
}
