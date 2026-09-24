import { addDays, toDateKey } from '~/utils/calendarDate'
import type { TodoList } from '~/composables/useLists'

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

/** Saca comillas sueltas al principio/final (ej. si la persona escribió que se llame "julio"). */
function stripQuotes(s: string): string {
  return s.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
}

/** Pone en mayúscula la primera letra (el resto tal cual), para prolijar lo que escribió la persona. */
function capitalizeFirst(s: string): string {
  const trimmed = stripQuotes(s)
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed
}

/** Prolija un nombre propio (ej. "maleja" -> "Maleja", "ana paz" -> "Ana Paz") por si la persona lo escribió en minúsculas. */
function prettifyName(s: string): string {
  return stripQuotes(s)
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ')
}

function findListByName(lists: TodoList[], name: string): TodoList | null {
  const n = normalize(name)
  if (!n) return null
  return (
    lists.find((l) => normalize(l.name) === n) ??
    lists.find((l) => normalize(l.name).includes(n) || n.includes(normalize(l.name))) ??
    null
  )
}

/** Separa "texto de la tarea" de un posible "en (la lista) X" al final, solo si X matchea una lista real. */
function splitListSuffix(raw: string, lists: TodoList[]): { text: string; list: TodoList | null } {
  const strict = raw.match(/^(.*?)\s+en\s+(?:la\s+)?lista\s+(.+)$/i)
  if (strict && strict[1]!.trim()) {
    const list = findListByName(lists, strict[2]!.trim())
    if (list) return { text: strict[1]!.trim(), list }
  }
  const loose = raw.match(/^(.*?)\s+en\s+(.+)$/i)
  if (loose && loose[1]!.trim()) {
    const list = findListByName(lists, loose[2]!.trim())
    if (list) return { text: loose[1]!.trim(), list }
  }
  return { text: raw.trim(), list: null }
}

/** Detecta si el usuario marcó la tarea como importante ("importante", "urgente", "prioritaria") y lo quita del texto. */
function extractImportant(raw: string): { text: string; important: boolean } {
  const re = /\b(?:muy\s+)?(?:importante|urgente|prioritari[oa])\b/i
  if (re.test(raw)) {
    return { text: raw.replace(re, '').replace(/\s+/g, ' ').trim(), important: true }
  }
  return { text: raw.trim(), important: false }
}

/** Frases temporales que no deben confundirse con un nombre de responsable tras "para"/"de". */
const TEMPORAL_TAIL =
  /^(?:hoy|mañana|manana|ma[nñ]ana|(?:el\s+)?(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)|la\s+(?:mañana|tarde|noche)|esta\s+(?:semana|noche)|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)$/i

/** Separa "texto de la tarea" de un posible responsable al final ("con responsable X", "para X", "de X"). */
function extractAssignee(raw: string): { text: string; assignee: string | null } {
  const patterns = [
    /^(.*?)\s+(?:con\s+)?responsable\s+(?:de\s+)?(.+)$/i,
    /^(.*?)\s+encargad[oa]\s+(?:de\s+)?(.+)$/i,
    /^(.*?)\s+a\s+cargo\s+de\s+(.+)$/i,
    /^(.*?)\s+para\s+(.+)$/i,
    /^(.*?)\s+de\s+(.+)$/i,
  ]
  for (const re of patterns) {
    const mm = raw.match(re)
    if (mm && mm[1]!.trim() && mm[2]!.trim() && mm[2]!.trim().split(/\s+/).length <= 3 && !TEMPORAL_TAIL.test(mm[2]!.trim())) {
      return { text: mm[1]!.trim(), assignee: mm[2]!.trim() }
    }
  }
  return { text: raw.trim(), assignee: null }
}

/** Separa "nombre" de una posible cláusula "en (una) categoría (de) X" al final. */
function extractCategory(raw: string): { text: string; category: string | null } {
  const m = raw.match(/^(.*?)\s+en\s+(?:una\s+)?categor[ií]a\s+(?:de\s+)?(.+)$/i)
  if (m && m[1]!.trim() && m[2]!.trim()) {
    return { text: m[1]!.trim(), category: m[2]!.trim() }
  }
  return { text: raw.trim(), category: null }
}

/** Separa "nombre" de una posible cláusula "con/y añade una [corta/breve] descripción de que ..." al final. */
function extractDescription(raw: string): { text: string; description: string | null } {
  const m = raw.match(
    /^(.*?)(?:\s*(?:y\s+)?(?:añad\w*|agreg\w*|pon\w*|con)\s+(?:una\s+)?(?:[a-záéíóúñ]+\s+){0,2}descripci[oó]n\s*(?:que diga|de que|que es|:)?\s*(.+))$/i
  )
  if (m && m[2]!.trim()) {
    return { text: m[1]!.trim(), description: m[2]!.trim() }
  }
  return { text: raw.trim(), description: null }
}

function findTask(lists: TodoList[], phrase: string) {
  const n = normalize(phrase)
  if (!n) return null
  for (const l of lists) {
    const t = l.tasks.find((t) => !t.completed && normalize(t.text).includes(n))
    if (t) return { list: l, task: t }
  }
  for (const l of lists) {
    const t = l.tasks.find((t) => normalize(t.text).includes(n))
    if (t) return { list: l, task: t }
  }
  return null
}

function extractEventDate(raw: string): { title: string; date: string } {
  const today = new Date()
  let date = toDateKey(today)
  let title = raw

  const dmy = raw.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/)
  if (dmy) {
    const day = parseInt(dmy[1]!, 10)
    const month = parseInt(dmy[2]!, 10)
    const yearRaw = dmy[3]
    const year = yearRaw ? (yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10)) : today.getFullYear()
    const d = new Date(year, month - 1, day)
    if (!Number.isNaN(d.getTime())) {
      date = toDateKey(d)
      title = raw.replace(dmy[0], '').trim()
    }
  } else if (/\bma[nñ]ana\b/i.test(raw)) {
    date = toDateKey(addDays(today, 1))
    title = raw.replace(/\bma[nñ]ana\b/i, '').trim()
  } else if (/\bhoy\b/i.test(raw)) {
    date = toDateKey(today)
    title = raw.replace(/\bhoy\b/i, '').trim()
  }

  title = title.replace(/^(el\s+d[ií]a|el|para el|para|de)\s+/i, '').trim()
  title = title.replace(/\s+/g, ' ').trim()
  return { title: title || 'Evento', date }
}

const GREETINGS = ['¡Hola', '¡Ey', '¡Buenas', '¡Qué tal'] as const
const OK_INTERJECTIONS = ['¡Listo!', '¡Dale!', '¡Hecho!', '¡A la orden!', '¡Ahí va!'] as const

export type BrainChatMessage = { role: 'user' | 'assistant'; content: string }

export function useCompanionBrain() {
  const { companionName, userName, streak, level } = useCompanion()
  const { lists, addList, renameList, addTask, editTask, toggleTask, updateTaskMeta } = useLists()
  const { addEvent, updateEvent } = useCalendar()
  const { addClient, renameClient } = useClients()
  const { books, addBook, renameBook, addSticker, updateSticker } = useBooks()
  const router = useRouter()
  const ai = useCompanionAI()

  function nameOf() {
    return userName.value.trim() || 'amigo'
  }

  function targetList(explicit: TodoList | null): TodoList {
    if (explicit) return explicit
    if (lists.value.length) return lists.value[0]!
    const id = addList('Mis tareas')
    return lists.value.find((l) => l.id === id)!
  }

  /**
   * Le pide a la IA que parafrasee/prolije un título ya extraído por el motor de comandos (tarea, lista,
   * evento, cliente, libro...). La IA solo redacta; qué acción tomar y qué texto extraer lo decide el
   * motor por regex de más abajo. Si la IA falla, se usa el prolijado local (capitalizar) como respaldo.
   */
  async function polishTitle(raw: string): Promise<string> {
    try {
      const out = await ai.rewrite(
        'Reformulá el siguiente texto como un título breve y prolijo en español: corregí mayúsculas y errores de tipeo evidentes, sin agregar información nueva ni cambiar el sentido, sin comillas ni punto final. Respondé solo con el texto reformulado, nada más.',
        raw,
      )
      return out || capitalizeFirst(raw)
    } catch {
      return capitalizeFirst(raw)
    }
  }

  /** Le pide a la IA que redacte una descripción corta a partir de lo que dijo el usuario, sin inventar datos nuevos. */
  async function writeDescription(name: string, raw: string): Promise<string> {
    try {
      const out = await ai.rewrite(
        `Escribí en español una descripción corta (una sola frase) para "${name}", redactando mejor esta idea del usuario, sin inventar datos que no dijo: "${raw}". Respondé solo con la frase, sin comillas.`,
        raw,
      )
      return out || capitalizeFirst(raw)
    } catch {
      return capitalizeFirst(raw)
    }
  }

  /** Interpreta un mensaje libre, ejecuta la acción correspondiente sobre la app y devuelve la respuesta del compañero. */
  async function respond(raw: string, history: BrainChatMessage[] = []): Promise<string> {
    const text = raw.trim()
    if (!text) return '¿Me decís algo? Estoy acá 👀'
    const n = normalize(text)

    // Saludo / charla pequeña
    if (/^(hola|hey|holi|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(n)) {
      return `${pick([...GREETINGS])} ${nameOf()}! ¿Creamos una tarea, revisamos el calendario, o qué se te ocurre? 🦝`
    }

    if (/\bque (podes|puedes|sabes) hacer\b|\bayuda\b|\bcomo funciona\b/.test(n)) {
      return [
        'Puedo ayudarte con esta app 🦝 Por ejemplo:',
        '• "crea una tarea comprar pan en la lista compras"',
        '• "marca comprar pan como hecha"',
        '• "crea una lista viaje"',
        '• "agenda un evento cita con el dentista mañana"',
        '• "abrí el calendario / el tablero / clientes / libros"',
        'Para charlar de otras cosas o apoyo emocional, mejor hablá con ChatGPT 💬. Yo me encargo de organizarte acá adentro.',
      ].join('\n')
    }

    // Estado de ánimo / apoyo emocional -> redirigir con calidez
    // Solo si el usuario habla de sí mismo (antes "mal" atrapaba "malos hábitos") y la IA no puede responder.
    if (ai.status.value !== 'ready' && /\b(estoy|me siento|ando|toy)\s+(muy\s+|re\s+|bastante\s+)?(triste|mal|cansad|estresad|agotad|ansios|agobiad)\w*/.test(n)) {
      return `Uy, lamento que andes así 💛 Yo puedo ayudarte a aliviar la carga organizando tus tareas, pero para hablar más a fondo ChatGPT te va a acompañar mejor. ¿Querés que veamos qué tenés pendiente hoy?`
    }

    // Completar tarea
    let m = n.match(/^(?:marca|marcar|completa|completar|termina|terminar|finaliza|finalizar)\s+(?:la tarea\s+)?(.+?)(?:\s+como\s+(?:hecha|completada|lista|terminada))?$/)
    if (m && m[1]) {
      const found = findTask(lists.value, m[1])
      if (!found) return `No encontré ninguna tarea que se parezca a "${m[1]}" 🤔`
      if (found.task.completed) return `"${found.task.text}" ya estaba completada ✅`
      toggleTask(found.list.id, found.task.id)
      return `${pick([...OK_INTERJECTIONS])} Marqué "${found.task.text}" como completada ✅`
    }

    // Crear lista (admite "...que se llame X en una categoría de Y")
    m = text.match(/(?:crea|crear|agrega|agregar|añade|añadir|nueva)\s+(?:una\s+)?lista\s*(?:que se llame|llamada|:)?\s*(.+)/i)
    if (m && m[1]) {
      const { text: rawName, category: rawCategory } = extractCategory(m[1].trim())
      const name = capitalizeFirst(rawName)
      const category = rawCategory ? capitalizeFirst(rawCategory) : null
      const id = addList(name, category)
      if (id) polishTitle(rawName).then((polished) => { if (polished && polished !== name) renameList(id, polished) })
      return `${pick([...OK_INTERJECTIONS])} Creé la lista "${name}"${category ? ` en la categoría "${category}"` : ''} 📋`
    }

    // Crear evento / recordatorio con fecha
    m = text.match(/(?:agenda|agendar|crea|crear)\s+(?:un\s+)?(?:evento|recordatorio)\s*(?:que se llame|llamado|:)?\s*(.+)/i)
    if (m && m[1]) {
      const { title: rawTitle, date } = extractEventDate(m[1])
      const title = capitalizeFirst(rawTitle)
      const id = addEvent({ date, time: null, title })
      if (id) polishTitle(rawTitle).then((polished) => { if (polished && polished !== title) updateEvent(id, { title: polished }) })
      return `${pick([...OK_INTERJECTIONS])} Agendé "${title}" para el ${date} 📅`
    }

    // Crear cliente (admite "...que se llame X en una categoría de Y")
    m = text.match(/(?:crea|crear|agrega|agregar|añade|añadir|nuevo)\s+(?:un\s+)?cliente\s*(?:que se llame|llamado|:)?\s*(.+)/i)
    if (m && m[1]) {
      const { text: rawName, category: rawCategory } = extractCategory(m[1].trim())
      const name = capitalizeFirst(rawName)
      const category = rawCategory ? capitalizeFirst(rawCategory) : null
      const id = addClient({ name, category, order: '', deliveryDate: '', price: 0, paymentStatus: 'no_pagado', deposit: 0, sticker: null })
      if (id) polishTitle(rawName).then((polished) => { if (polished && polished !== name) renameClient(id, polished) })
      return `${pick([...OK_INTERJECTIONS])} Agregué el cliente "${name}"${category ? ` en la categoría "${category}"` : ''} 🧾`
    }

    // Crear libro (admite "quiero que me crees un libro y añadas una descripción de que es...")
    m = text.match(/(?:crea\w*|crees|agreg\w*|añad\w*|nuevo|hazme|haz)\s+(?:un\s+)?libro\s*(?:que se llame|llamado|:)?\s*(.+)?/i)
    if (m) {
      const { text: namePart, description: rawDescription } = extractDescription((m[1] ?? '').trim())
      const name = namePart ? capitalizeFirst(namePart) : 'Mi libro'
      const bookId = addBook(name)
      if (namePart && bookId) {
        polishTitle(namePart).then((polished) => { if (polished && polished !== name) renameBook(bookId, polished) })
      }
      if (rawDescription && bookId) {
        const book = books.value.find((b) => b.id === bookId)
        const pageId = book?.pages[0]?.id
        if (pageId) {
          const localDescription = capitalizeFirst(rawDescription)
          const stickerId = addSticker(bookId, pageId, 'note', { title: 'Descripción', value: localDescription })
          if (stickerId) {
            writeDescription(name, rawDescription).then((polished) => {
              if (polished && polished !== localDescription) updateSticker(bookId, pageId, stickerId, { value: polished })
            })
          }
        }
      }
      return `${pick([...OK_INTERJECTIONS])} Creé el libro "${name}"${rawDescription ? ' con su descripción' : ''} 📖`
    }

    // Crear tarea / recordatorio simple (admite "pon una nota de una tarea importante X de Persona")
    m = text.match(
      /(?:crea|crear|agrega|agregar|anota|anotar|apunta|apuntar|añade|añadir|pon|poner)\s+(?:una\s+nota\s+(?:de|sobre)\s+)?(?:un\s+recordatorio\s+(?:de|sobre)\s+)?(?:una\s+)?tarea\s*(?:que diga|de que|:)?\s*(.+)/i
    )
    const reminderMatch = text.match(/recu[eé]rdame(?:\s+que)?\s+(.+)/i)
    const taskBody = m?.[1] ?? reminderMatch?.[1]
    if (taskBody) {
      const { text: withoutList, list } = splitListSuffix(taskBody.trim(), lists.value)
      const { text: withoutImportant, important } = extractImportant(withoutList)
      const { text: rawTaskText, assignee: rawAssignee } = extractAssignee(withoutImportant)
      if (!rawTaskText) return '¿Qué tarea querés que anote? 📝'
      const taskText = capitalizeFirst(rawTaskText)
      const assignee = rawAssignee ? prettifyName(rawAssignee) : null
      const dest = targetList(list)
      const taskId = addTask(dest.id, taskText, assignee)
      if (important && taskId) updateTaskMeta(dest.id, taskId, { priority: 'high' })
      if (taskId) polishTitle(rawTaskText).then((polished) => { if (polished && polished !== taskText) editTask(dest.id, taskId, polished) })
      const extras = [important ? 'como importante ⭐' : null, assignee ? `con responsable ${assignee}` : null]
        .filter(Boolean)
        .join(' y ')
      return `${pick([...OK_INTERJECTIONS])} Anoté "${taskText}" en "${dest.name}"${extras ? `, ${extras}` : ''} 📝`
    }

    // Navegación
    const navTargets: { keys: RegExp; path: string; label: string }[] = [
      { keys: /calendario/, path: '/calendario', label: 'el calendario' },
      { keys: /tablero/, path: '/tablero', label: 'el tablero' },
      { keys: /client/, path: '/clientes', label: 'clientes' },
      { keys: /libro/, path: '/books', label: 'los libros' },
      { keys: /\b(inicio|tareas|home)\b/, path: '/', label: 'el inicio' },
    ]
    if (/\babr\w*\b|\bllev\w*\b|\bve a\b|\bvamos a\b|\bir a\b|\bmuestr\w*\b/.test(n)) {
      const dest = navTargets.find((t) => t.keys.test(n))
      if (dest) {
        router.push(dest.path)
        return `${pick([...OK_INTERJECTIONS])} Te llevo a ${dest.label} 🧭`
      }
    }

    // Nada de lo anterior matcheó: que responda la IA (preguntas libres).
    try {
      return await ai.ask(text, { companionName: companionName.value, userName: nameOf() }, history)
    } catch {
      return [
        'No pude conectar mi cerebro IA 😵‍💫 (revisá tu conexión o la clave de Gemini del servidor).',
        'Mientras tanto puedo crear tareas y listas, marcar tareas como hechas, agendar eventos, o abrir el calendario/tablero/clientes/libros 🦝',
      ].join('\n')
    }
  }

  /** Frase espontánea según el estado real de la app, para que el compañero "viva" sin que le escribas. */
  function idleLine(): string {
    const todayKey = toDateKey(new Date())
    const pendingToday = lists.value
      .flatMap((l) => l.tasks)
      .filter((t) => !t.completed && t.dueDate === todayKey).length
    const pendingTotal = lists.value.flatMap((l) => l.tasks).filter((t) => !t.completed).length

    const contextual: string[] = []
    if (pendingToday > 0) {
      contextual.push(`¡Che ${nameOf()}! Todavía te quedan ${pendingToday} ${pendingToday === 1 ? 'tarea' : 'tareas'} para hoy 👀`)
    }
    if (pendingToday === 0 && pendingTotal === 0 && lists.value.length > 0) {
      contextual.push('¡Todo listo por acá! Sos un crack ✨')
    }
    if (streak.value >= 2) {
      contextual.push(`Llevamos ${streak.value} días de racha 🔥 ¡no la cortes!`)
    }
    if (level.value >= 3) {
      contextual.push(`Nivel ${level.value} ya... ¡vamos creciendo juntos! 🌱`)
    }

    const generic = [
      `Estoy acá si necesitás organizar algo, ${nameOf()} 🐾`,
      'Escribime "ayuda" si querés ver qué puedo hacer.',
      '¿Creamos una tarea nueva?',
      `Soy ${companionName.value.trim() || 'tu compañero'}, tu ayudante de esta app 🦝`,
      '¿Revisamos el calendario de hoy?',
    ]

    const pool = contextual.length ? contextual : generic
    return pick(pool)
  }

  return { respond, idleLine }
}
