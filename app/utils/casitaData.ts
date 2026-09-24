// Datos estáticos de la casita: medallas, coleccionables, amigos, muebles, temporadas y cartitas.

/** Contadores de los que dependen medallas, amigos y muebles. */
export type CasitaStats = {
  tasks: number
  streak: number
  longest: number
  level: number
  chests: number
  focus: number
  gratitude: number
  capsules: number
  letters: number
  friends: number
  collection: number
  early: number
  night: number
  seasons: number
  achievements: number
}

export type StatKey = keyof CasitaStats

// ───────────────────────── Medallas ─────────────────────────

export type Achievement = { id: string; emoji: string; label: string; desc: string; stat: StatKey; goal: number }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-task', emoji: '🌱', label: 'Primer pasito', desc: 'Completa tu primera tarea', stat: 'tasks', goal: 1 },
  { id: 'tasks-10', emoji: '✅', label: 'Manos a la obra', desc: 'Completa 10 tareas', stat: 'tasks', goal: 10 },
  { id: 'tasks-50', emoji: '💪', label: 'Imparable', desc: 'Completa 50 tareas', stat: 'tasks', goal: 50 },
  { id: 'tasks-100', emoji: '👑', label: 'Reina de las listas', desc: 'Completa 100 tareas', stat: 'tasks', goal: 100 },
  { id: 'tasks-300', emoji: '🏆', label: 'Leyenda', desc: 'Completa 300 tareas', stat: 'tasks', goal: 300 },
  { id: 'streak-3', emoji: '✨', label: 'Chispita', desc: 'Racha de 3 días', stat: 'longest', goal: 3 },
  { id: 'streak-7', emoji: '🔥', label: 'Racha de 7 días', desc: 'Racha de 7 días seguidos', stat: 'longest', goal: 7 },
  { id: 'streak-30', emoji: '☄️', label: 'Fuego eterno', desc: 'Racha de 30 días', stat: 'longest', goal: 30 },
  { id: 'early', emoji: '🌅', label: 'Madrugadora', desc: 'Completa 5 tareas antes de las 8 am', stat: 'early', goal: 5 },
  { id: 'night', emoji: '🦉', label: 'Búho nocturno', desc: 'Completa 5 tareas después de las 10 pm', stat: 'night', goal: 5 },
  { id: 'level-5', emoji: '🌷', label: 'Floreciendo', desc: 'Llega al nivel 5', stat: 'level', goal: 5 },
  { id: 'level-10', emoji: '🌳', label: 'Raíces fuertes', desc: 'Llega al nivel 10', stat: 'level', goal: 10 },
  { id: 'level-20', emoji: '🐉', label: 'Compañero legendario', desc: 'Llega al nivel 20', stat: 'level', goal: 20 },
  { id: 'chest-1', emoji: '🎁', label: 'Primer cofre', desc: 'Abre tu primer cofrecito', stat: 'chests', goal: 1 },
  { id: 'chest-15', emoji: '💎', label: 'Cazatesoros', desc: 'Abre 15 cofrecitos', stat: 'chests', goal: 15 },
  { id: 'focus-1', emoji: '🍅', label: 'Enfoque total', desc: 'Completa una sesión de enfoque', stat: 'focus', goal: 1 },
  { id: 'focus-10', emoji: '🧘', label: 'Mente zen', desc: 'Completa 10 sesiones de enfoque', stat: 'focus', goal: 10 },
  { id: 'gratitude-7', emoji: '💗', label: 'Corazón agradecido', desc: 'Escribe 7 gratitudes', stat: 'gratitude', goal: 7 },
  { id: 'capsule-1', emoji: '⏳', label: 'Viaje en el tiempo', desc: 'Abre una cápsula del tiempo', stat: 'capsules', goal: 1 },
  { id: 'letters-7', emoji: '💌', label: 'Cartero de corazón', desc: 'Lee 7 cartitas', stat: 'letters', goal: 7 },
  { id: 'collect-10', emoji: '🧺', label: 'Coleccionista', desc: 'Reúne 10 stickers', stat: 'collection', goal: 10 },
  { id: 'collect-25', emoji: '📒', label: 'Álbum lleno', desc: 'Reúne 25 stickers', stat: 'collection', goal: 25 },
  { id: 'friends-3', emoji: '🐾', label: 'Casita llena', desc: 'Haz 3 amigos para tu mascota', stat: 'friends', goal: 3 },
  { id: 'season-1', emoji: '🎀', label: 'Fan de temporada', desc: 'Reclama un premio del pase mensual', stat: 'seasons', goal: 1 },
]

// ───────────────────────── Coleccionables ─────────────────────────

export type Rarity = 'comun' | 'raro' | 'epico'
export type Collectible = { id: string; emoji: string; label: string; rarity: Rarity; set: string }

export const RARITY_LABEL: Record<Rarity, string> = { comun: 'Común', raro: 'Raro', epico: 'Épico' }
export const RARITY_COLOR: Record<Rarity, string> = { comun: '#b9c2d0', raro: '#7fb3f0', epico: '#c58af0' }

const c = (set: string, rarity: Rarity, emoji: string, label: string): Collectible => ({
  id: `${set}-${label.toLowerCase().replace(/\s+/g, '-')}`,
  emoji,
  label,
  rarity,
  set,
})

export const COLLECTIBLES: Collectible[] = [
  c('Postres', 'comun', '🍰', 'Pastelito'),
  c('Postres', 'comun', '🧁', 'Cupcake'),
  c('Postres', 'comun', '🍩', 'Dona'),
  c('Postres', 'comun', '🍓', 'Fresita'),
  c('Postres', 'raro', '🍦', 'Helado'),
  c('Postres', 'epico', '🍡', 'Dango'),
  c('Cielo', 'comun', '☁️', 'Nubecita'),
  c('Cielo', 'comun', '🌙', 'Lunita'),
  c('Cielo', 'comun', '⭐', 'Estrellita'),
  c('Cielo', 'raro', '🌈', 'Arcoíris'),
  c('Cielo', 'epico', '☄️', 'Cometa'),
  c('Cielo', 'epico', '🪐', 'Planeta'),
  c('Flores', 'comun', '🌸', 'Sakura'),
  c('Flores', 'comun', '🌷', 'Tulipán'),
  c('Flores', 'comun', '🌻', 'Girasol'),
  c('Flores', 'comun', '🌼', 'Margarita'),
  c('Flores', 'raro', '🪷', 'Loto'),
  c('Flores', 'raro', '💐', 'Ramo'),
  c('Bosque', 'comun', '🍄', 'Hongo'),
  c('Bosque', 'comun', '🌿', 'Hojita'),
  c('Bosque', 'comun', '🐞', 'Mariquita'),
  c('Bosque', 'raro', '🦋', 'Mariposa'),
  c('Bosque', 'raro', '🦉', 'Búho'),
  c('Bosque', 'epico', '🦔', 'Erizo'),
  c('Mar', 'comun', '🐚', 'Concha'),
  c('Mar', 'comun', '🐠', 'Pececito'),
  c('Mar', 'raro', '🐙', 'Pulpo'),
  c('Mar', 'raro', '🐳', 'Ballena'),
  c('Mar', 'epico', '🦦', 'Nutria'),
]

// ───────────────────────── Temporadas (pase mensual) ─────────────────────────

export type SeasonDef = {
  month: number
  name: string
  emoji: string
  theme: { label: string; bg: string; accent: string }
  stickers: { emoji: string; label: string }[]
  friend: { emoji: string; label: string }
  insignia: { emoji: string; label: string }
  /** Adorno flotante de la casita durante el mes. */
  decor: string[]
}

export const SEASONS: SeasonDef[] = [
  { month: 0, name: 'Nieve suave', emoji: '⛄', theme: { label: 'Nieve suave', bg: '#dfeaf5', accent: '#6fa8dc' }, stickers: [{ emoji: '❄️', label: 'Copo' }, { emoji: '⛄', label: 'Muñequito' }, { emoji: '🧤', label: 'Guantes' }], friend: { emoji: '🐻‍❄️', label: 'Osito polar' }, insignia: { emoji: '❄️', label: 'Corazón de nieve' }, decor: ['❄️', '⛄'] },
  { month: 1, name: 'Mes del amor', emoji: '💝', theme: { label: 'Corazoncitos', bg: '#fde2ea', accent: '#ec6f95' }, stickers: [{ emoji: '💌', label: 'Carta' }, { emoji: '🍫', label: 'Chocolate' }, { emoji: '💘', label: 'Flechazo' }], friend: { emoji: '🕊️', label: 'Palomita' }, insignia: { emoji: '💝', label: 'Corazón dulce' }, decor: ['💗', '💌'] },
  { month: 2, name: 'Brotes de primavera', emoji: '🌱', theme: { label: 'Brote verde', bg: '#e8f3d9', accent: '#8ec26a' }, stickers: [{ emoji: '🌱', label: 'Brote' }, { emoji: '🌧️', label: 'Lluvia suave' }, { emoji: '🪴', label: 'Macetita' }], friend: { emoji: '🐛', label: 'Orugui' }, insignia: { emoji: '🌱', label: 'Mano verde' }, decor: ['🌱', '🌸'] },
  { month: 3, name: 'Pascua tierna', emoji: '🥚', theme: { label: 'Huevito lila', bg: '#f5e6f5', accent: '#c68ad6' }, stickers: [{ emoji: '🥚', label: 'Huevito' }, { emoji: '🐰', label: 'Conejito' }, { emoji: '☔', label: 'Paraguas' }], friend: { emoji: '🐣', label: 'Pollito pascual' }, insignia: { emoji: '🥚', label: 'Cazahuevos' }, decor: ['🥚', '🐰'] },
  { month: 4, name: 'Jardín de mayo', emoji: '🌻', theme: { label: 'Girasol', bg: '#fdf1c9', accent: '#eeb432' }, stickers: [{ emoji: '🌼', label: 'Florecita' }, { emoji: '🍯', label: 'Miel' }, { emoji: '🧺', label: 'Canastita' }], friend: { emoji: '🐝', label: 'Abejita' }, insignia: { emoji: '🌻', label: 'Manos de jardín' }, decor: ['🌻', '🐝'] },
  { month: 5, name: 'Verano fresquito', emoji: '☀️', theme: { label: 'Brisa marina', bg: '#dff3f5', accent: '#3fb8c4' }, stickers: [{ emoji: '🏖️', label: 'Playa' }, { emoji: '🍉', label: 'Sandía' }, { emoji: '🕶️', label: 'Gafitas' }], friend: { emoji: '🦀', label: 'Cangrejito' }, insignia: { emoji: '☀️', label: 'Solecito' }, decor: ['☀️', '🍉'] },
  { month: 6, name: 'Helados de julio', emoji: '🍧', theme: { label: 'Raspadito', bg: '#fde7d3', accent: '#f28e57' }, stickers: [{ emoji: '🍧', label: 'Raspado' }, { emoji: '🧊', label: 'Hielito' }, { emoji: '🍹', label: 'Tropical' }], friend: { emoji: '🦩', label: 'Flamenco' }, insignia: { emoji: '🍧', label: 'Amante del helado' }, decor: ['🍧', '🌴'] },
  { month: 7, name: 'Mar de agosto', emoji: '🌊', theme: { label: 'Ola azul', bg: '#d9ecf7', accent: '#3d8fd1' }, stickers: [{ emoji: '🌊', label: 'Ola' }, { emoji: '⛵', label: 'Velero' }, { emoji: '🐬', label: 'Delfín' }], friend: { emoji: '🐬', label: 'Delfincito' }, insignia: { emoji: '🌊', label: 'Surfista' }, decor: ['🌊', '⛵'] },
  { month: 8, name: 'Otoño acogedor', emoji: '🍂', theme: { label: 'Hojas secas', bg: '#f6e3cc', accent: '#d98a3d' }, stickers: [{ emoji: '🍂', label: 'Hojas' }, { emoji: '🍁', label: 'Maple' }, { emoji: '🌰', label: 'Castaña' }], friend: { emoji: '🐿️', label: 'Ardillita' }, insignia: { emoji: '🍂', label: 'Hoja dorada' }, decor: ['🍂', '🍁'] },
  { month: 9, name: 'Noche de brujitas', emoji: '🎃', theme: { label: 'Calabaza', bg: '#2b2238', accent: '#f28c28' }, stickers: [{ emoji: '🎃', label: 'Calabaza' }, { emoji: '👻', label: 'Fantasmita' }, { emoji: '🦇', label: 'Murciélago' }], friend: { emoji: '👻', label: 'Fantasmita' }, insignia: { emoji: '🎃', label: 'Dulce o truco' }, decor: ['🎃', '🦇'] },
  { month: 10, name: 'Cabaña de noviembre', emoji: '🧣', theme: { label: 'Chocolate caliente', bg: '#e9ddd0', accent: '#a9745a' }, stickers: [{ emoji: '🧣', label: 'Bufanda' }, { emoji: '☕', label: 'Chocolate caliente' }, { emoji: '🕯️', label: 'Velita' }], friend: { emoji: '🐻', label: 'Osito abrigado' }, insignia: { emoji: '🧣', label: 'Abrigo listo' }, decor: ['🕯️', '🍂'] },
  { month: 11, name: 'Navidad brillante', emoji: '🎄', theme: { label: 'Bosque navideño', bg: '#1f2e27', accent: '#e0525a' }, stickers: [{ emoji: '🎄', label: 'Arbolito' }, { emoji: '🎁', label: 'Regalo' }, { emoji: '🔔', label: 'Campana' }], friend: { emoji: '🦌', label: 'Reno' }, insignia: { emoji: '🎄', label: 'Espíritu navideño' }, decor: ['🎄', '✨'] },
]

export type PassTier = { tasks: number; kind: 'theme' | 'stickers' | 'friend' | 'insignia'; label: string }

export const PASS_TIERS: PassTier[] = [
  { tasks: 5, kind: 'theme', label: 'Tema del mes' },
  { tasks: 15, kind: 'stickers', label: 'Pack de 3 stickers' },
  { tasks: 30, kind: 'friend', label: 'Visitante de temporada' },
  { tasks: 50, kind: 'insignia', label: 'Insignia + 100 monedas' },
]

export function seasonKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function seasonFor(date = new Date()): SeasonDef {
  return SEASONS[date.getMonth()]!
}

export function seasonCollectibleId(monthKey: string, index: number) {
  return `pase-${monthKey}-${index}`
}

/** Emoji/etiqueta de un coleccionable del pase a partir de su id ("pase-2026-09-1"). */
export function passCollectible(id: string): Collectible | null {
  const m = /^pase-(\d{4})-(\d{2})-(\d)$/.exec(id)
  if (!m) return null
  const season = SEASONS[Number(m[2]) - 1]
  const st = season?.stickers[Number(m[3])]
  if (!season || !st) return null
  return { id, emoji: st.emoji, label: st.label, rarity: 'raro', set: season.name }
}

export function findCollectible(id: string): Collectible | null {
  return COLLECTIBLES.find((x) => x.id === id) ?? passCollectible(id)
}

// ───────────────────────── Amigos de la mascota ─────────────────────────

export type Friend = {
  id: string
  label: string
  emoji?: string
  image?: string
  stat: StatKey
  goal: number
  blurb: string
}

export const FRIENDS: Friend[] = [
  { id: 'conejo', label: 'Conejito', image: '/stickers/conejo.png', stat: 'level', goal: 2, blurb: 'Llegó saltando cuando tu mascota eclosionó.' },
  { id: 'gato', label: 'Michi', image: '/stickers/gato.png', stat: 'tasks', goal: 10, blurb: 'Vino a ver qué tanto hacías.' },
  { id: 'rana', label: 'Ranita', image: '/stickers/rana.png', stat: 'longest', goal: 3, blurb: 'Le encantan las rachas.' },
  { id: 'pollito', label: 'Pollito', emoji: '🐥', stat: 'level', goal: 5, blurb: 'Pía cada vez que completas algo.' },
  { id: 'gato-dormido', label: 'Michi dormilón', image: '/stickers/gato(1).png', stat: 'tasks', goal: 40, blurb: 'Duerme en la alfombra todo el día.' },
  { id: 'zorrito', label: 'Zorrito', emoji: '🦊', stat: 'tasks', goal: 75, blurb: 'Astuto y siempre curioso.' },
  { id: 'pingui', label: 'Pingüi', emoji: '🐧', stat: 'longest', goal: 7, blurb: 'Se desliza feliz por tu racha.' },
  { id: 'panda', label: 'Pandita', emoji: '🐼', stat: 'tasks', goal: 150, blurb: 'Come bambú y te anima.' },
  { id: 'unicornio', label: 'Unicornio', emoji: '🦄', stat: 'level', goal: 15, blurb: 'Solo visita a quienes brillan.' },
  { id: 'dragon', label: 'Dragoncito', emoji: '🐉', stat: 'level', goal: 20, blurb: 'Protege la casita con su fuego tierno.' },
]

export const STAT_LABEL: Record<StatKey, string> = {
  tasks: 'tareas',
  streak: 'de racha',
  longest: 'días de racha',
  level: 'de nivel',
  chests: 'cofres',
  focus: 'sesiones',
  gratitude: 'gratitudes',
  capsules: 'cápsulas',
  letters: 'cartitas',
  friends: 'amigos',
  collection: 'stickers',
  early: 'madrugadas',
  night: 'noches',
  seasons: 'premios',
  achievements: 'medallas',
}

export function requirementText(stat: StatKey, goal: number) {
  if (stat === 'level') return `Nivel ${goal}`
  return `${goal} ${STAT_LABEL[stat]}`
}

// ───────────────────────── Muebles ─────────────────────────

export type FurnitureSlot = 'wall' | 'floor' | 'left' | 'right' | 'shelf'

export const FURNITURE_SLOTS: { id: FurnitureSlot; label: string }[] = [
  { id: 'wall', label: 'Pared' },
  { id: 'shelf', label: 'Repisa' },
  { id: 'left', label: 'Izquierda' },
  { id: 'right', label: 'Derecha' },
  { id: 'floor', label: 'Alfombra' },
]

export type Furniture = {
  id: string
  label: string
  slot: FurnitureSlot
  emoji?: string
  /** Las alfombras se dibujan como una elipse de color. */
  rug?: string
  stat: StatKey
  goal: number
}

export const FURNITURE: Furniture[] = [
  { id: 'cuadrito', label: 'Cuadrito', slot: 'wall', emoji: '🖼️', stat: 'level', goal: 1 },
  { id: 'ventana', label: 'Ventana', slot: 'wall', emoji: '🪟', stat: 'level', goal: 1 },
  { id: 'reloj', label: 'Reloj', slot: 'wall', emoji: '🕰️', stat: 'tasks', goal: 10 },
  { id: 'farolito', label: 'Farolito', slot: 'wall', emoji: '🏮', stat: 'level', goal: 5 },
  { id: 'estrellas', label: 'Estrellas', slot: 'wall', emoji: '🌟', stat: 'longest', goal: 7 },
  { id: 'arcoiris', label: 'Arcoíris', slot: 'wall', emoji: '🌈', stat: 'collection', goal: 10 },
  { id: 'osito', label: 'Osito', slot: 'shelf', emoji: '🧸', stat: 'level', goal: 1 },
  { id: 'te', label: 'Tacita de té', slot: 'shelf', emoji: '🍵', stat: 'tasks', goal: 12 },
  { id: 'velita', label: 'Velita', slot: 'shelf', emoji: '🕯️', stat: 'longest', goal: 3 },
  { id: 'bola', label: 'Bola disco', slot: 'shelf', emoji: '🪩', stat: 'level', goal: 8 },
  { id: 'telescopio', label: 'Telescopio', slot: 'shelf', emoji: '🔭', stat: 'level', goal: 14 },
  { id: 'trofeo', label: 'Trofeo', slot: 'shelf', emoji: '🏆', stat: 'achievements', goal: 5 },
  { id: 'planta', label: 'Plantita', slot: 'left', emoji: '🪴', stat: 'level', goal: 1 },
  { id: 'cactus', label: 'Cactus', slot: 'left', emoji: '🌵', stat: 'tasks', goal: 5 },
  { id: 'arbolito', label: 'Arbolito', slot: 'left', emoji: '🎄', stat: 'level', goal: 6 },
  { id: 'lampara', label: 'Lámpara', slot: 'left', emoji: '💡', stat: 'tasks', goal: 15 },
  { id: 'arbol', label: 'Árbol grande', slot: 'left', emoji: '🌳', stat: 'level', goal: 12 },
  { id: 'sillon', label: 'Sillón', slot: 'right', emoji: '🛋️', stat: 'level', goal: 1 },
  { id: 'cama', label: 'Camita', slot: 'right', emoji: '🛏️', stat: 'tasks', goal: 8 },
  { id: 'librero', label: 'Librero', slot: 'right', emoji: '📚', stat: 'focus', goal: 3 },
  { id: 'piano', label: 'Piano', slot: 'right', emoji: '🎹', stat: 'level', goal: 10 },
  { id: 'alfombra-rosa', label: 'Alfombra rosa', slot: 'floor', rug: '#f4b6cd', stat: 'level', goal: 1 },
  { id: 'alfombra-menta', label: 'Alfombra menta', slot: 'floor', rug: '#a9dcc3', stat: 'tasks', goal: 5 },
  { id: 'alfombra-nube', label: 'Alfombra nube', slot: 'floor', rug: '#dfe9f7', stat: 'level', goal: 4 },
  { id: 'alfombra-lila', label: 'Alfombra lila', slot: 'floor', rug: '#cdb8ec', stat: 'longest', goal: 7 },
]

// Más muebles: cada ranura llega a 30+ objetos.
const fe = (slot: FurnitureSlot, id: string, label: string, emoji: string, stat: StatKey, goal: number): Furniture => ({ id, label, slot, emoji, stat, goal })
const rg = (id: string, label: string, rug: string, stat: StatKey, goal: number): Furniture => ({ id, label, slot: 'floor', rug, stat, goal })

FURNITURE.push(
  // Pared
  fe('wall', 'espejo', 'Espejo', '🪞', 'level', 2),
  fe('wall', 'luna-pared', 'Lunita', '🌙', 'tasks', 3),
  fe('wall', 'sol', 'Solecito', '☀️', 'tasks', 6),
  fe('wall', 'nube-pared', 'Nubecita', '☁️', 'level', 3),
  fe('wall', 'corazon', 'Corazón', '💗', 'gratitude', 3),
  fe('wall', 'mapa', 'Mapamundi', '🗺️', 'tasks', 20),
  fe('wall', 'guirnalda', 'Guirnalda', '🎏', 'level', 4),
  fe('wall', 'banderin', 'Banderines', '🎌', 'tasks', 25),
  fe('wall', 'mariposas', 'Mariposas', '🦋', 'collection', 4),
  fe('wall', 'flor-pared', 'Flores secas', '💐', 'collection', 6),
  fe('wall', 'polaroid', 'Polaroids', '📸', 'tasks', 30),
  fe('wall', 'dardos', 'Diana', '🎯', 'focus', 2),
  fe('wall', 'paleta', 'Paleta de pintura', '🎨', 'level', 7),
  fe('wall', 'guitarra', 'Guitarra', '🎸', 'level', 9),
  fe('wall', 'atrapasuenos', 'Atrapasueños', '🪶', 'longest', 5),
  fe('wall', 'cometa', 'Cometa', '☄️', 'longest', 10),
  fe('wall', 'copo', 'Copo de nieve', '❄️', 'tasks', 45),
  fe('wall', 'pez-pared', 'Pecera de pared', '🐠', 'collection', 12),
  fe('wall', 'medalla', 'Medalla', '🏅', 'achievements', 3),
  fe('wall', 'cinta', 'Listón', '🎀', 'letters', 3),
  fe('wall', 'calendario', 'Calendario', '📅', 'longest', 14),
  fe('wall', 'pizarra', 'Pizarrón', '📝', 'tasks', 60),
  fe('wall', 'galaxia', 'Galaxia', '🌌', 'level', 16),
  fe('wall', 'aurora', 'Aurora', '🎆', 'level', 18),
  fe('wall', 'corona-pared', 'Corona', '👑', 'tasks', 250),
  fe('wall', 'dragon-pared', 'Dragón de papel', '🐲', 'level', 22),
  // Repisa
  fe('shelf', 'libro', 'Libro', '📖', 'tasks', 2),
  fe('shelf', 'florero', 'Florerito', '🌷', 'level', 2),
  fe('shelf', 'reloj-arena', 'Reloj de arena', '⏳', 'focus', 1),
  fe('shelf', 'globo', 'Globo terráqueo', '🌍', 'level', 4),
  fe('shelf', 'cafe', 'Cafecito', '☕', 'tasks', 18),
  fe('shelf', 'pastel', 'Pastelito', '🍰', 'chests', 2),
  fe('shelf', 'conejito-peluche', 'Conejito de peluche', '🐰', 'friends', 1),
  fe('shelf', 'gatito-figura', 'Gatito figura', '🐱', 'friends', 2),
  fe('shelf', 'rana-figura', 'Ranita figura', '🐸', 'tasks', 35),
  fe('shelf', 'cofre-mini', 'Cofrecito', '🧰', 'chests', 5),
  fe('shelf', 'cristal', 'Cristal', '🔮', 'level', 11),
  fe('shelf', 'diamante', 'Diamante', '💎', 'chests', 10),
  fe('shelf', 'caracola', 'Caracola', '🐚', 'collection', 8),
  fe('shelf', 'cactus-mini', 'Cactus mini', '🌵', 'tasks', 22),
  fe('shelf', 'hongo-mini', 'Hongo', '🍄', 'collection', 5),
  fe('shelf', 'pinceles', 'Pinceles', '🖌️', 'tasks', 55),
  fe('shelf', 'camara', 'Cámara', '📷', 'tasks', 70),
  fe('shelf', 'radio', 'Radio', '📻', 'level', 6),
  fe('shelf', 'audifonos', 'Audífonos', '🎧', 'focus', 5),
  fe('shelf', 'gramofono', 'Tocadiscos', '📀', 'level', 13),
  fe('shelf', 'nave', 'Cohete', '🚀', 'level', 17),
  fe('shelf', 'pulpo-peluche', 'Pulpo de peluche', '🐙', 'collection', 15),
  fe('shelf', 'lampara-lava', 'Lámpara de lava', '🫧', 'focus', 8),
  fe('shelf', 'estrella-cristal', 'Estrella de cristal', '⭐', 'achievements', 8),
  fe('shelf', 'pergamino', 'Pergamino', '📜', 'letters', 5),
  fe('shelf', 'copa-oro', 'Copa dorada', '🥇', 'achievements', 12),
  fe('shelf', 'unicornio-fig', 'Unicornio figura', '🦄', 'level', 20),
  // Izquierda
  fe('left', 'flor-maceta', 'Girasol en maceta', '🌻', 'level', 2),
  fe('left', 'helecho', 'Helecho', '🌿', 'tasks', 4),
  fe('left', 'bambu', 'Bambú', '🎋', 'tasks', 9),
  fe('left', 'palmera', 'Palmerita', '🌴', 'level', 3),
  fe('left', 'rosal', 'Rosal', '🌹', 'tasks', 14),
  fe('left', 'sakura-arbol', 'Cerezo', '🌸', 'level', 9),
  fe('left', 'maple', 'Maple', '🍁', 'tasks', 28),
  fe('left', 'pino', 'Pino', '🌲', 'level', 7),
  fe('left', 'espantapajaros', 'Espantapájaros', '🎃', 'tasks', 40),
  fe('left', 'farol', 'Farol de pie', '🏮', 'longest', 4),
  fe('left', 'perchero', 'Perchero', '🧥', 'tasks', 24),
  fe('left', 'paraguero', 'Paragüero', '☂️', 'tasks', 16),
  fe('left', 'regadera', 'Regadera', '🚿', 'tasks', 32),
  fe('left', 'cesto', 'Cesto', '🧺', 'collection', 3),
  fe('left', 'globo-helio', 'Globos', '🎈', 'level', 5),
  fe('left', 'osito-gigante', 'Osito gigante', '🧸', 'level', 10),
  fe('left', 'pinguino-fig', 'Pingüino', '🐧', 'friends', 3),
  fe('left', 'zorro-fig', 'Zorrito', '🦊', 'friends', 4),
  fe('left', 'panda-fig', 'Pandita', '🐼', 'tasks', 90),
  fe('left', 'hada', 'Hada', '🧚', 'level', 13),
  fe('left', 'estatua', 'Estatua', '🗿', 'tasks', 120),
  fe('left', 'fuente', 'Fuentecita', '⛲', 'level', 15),
  fe('left', 'molino', 'Molino', '🌀', 'focus', 6),
  fe('left', 'castillo', 'Castillito', '🏰', 'level', 19),
  fe('left', 'telescopio-grande', 'Telescopio grande', '🔭', 'level', 21),
  fe('left', 'arbol-luces', 'Árbol de luces', '✨', 'longest', 21),
  fe('left', 'muneco-nieve', 'Muñeco de nieve', '⛄', 'tasks', 160),
  fe('left', 'estufa', 'Estufita', '🔥', 'longest', 30),
  fe('left', 'reno-fig', 'Reno', '🦌', 'level', 24),
  // Derecha
  fe('right', 'mesita', 'Mesita', '🪑', 'level', 2),
  fe('right', 'silla', 'Silla', '💺', 'tasks', 3),
  fe('right', 'escritorio', 'Escritorio', '🖥️', 'tasks', 11),
  fe('right', 'cuna', 'Cunita de peluches', '🧺', 'collection', 2),
  fe('right', 'cofre-grande', 'Baúl', '📦', 'chests', 3),
  fe('right', 'closet', 'Armario', '🚪', 'level', 5),
  fe('right', 'tocador', 'Tocador', '💄', 'level', 8),
  fe('right', 'cocina', 'Cocinita', '🍳', 'tasks', 26),
  fe('right', 'nevera', 'Refri', '🧊', 'tasks', 38),
  fe('right', 'lavadora', 'Lavadora', '🫧', 'tasks', 48),
  fe('right', 'tele', 'Tele', '📺', 'level', 11),
  fe('right', 'consola', 'Consola', '🎮', 'focus', 4),
  fe('right', 'bici', 'Bici', '🚲', 'tasks', 65),
  fe('right', 'patineta', 'Patineta', '🛹', 'longest', 6),
  fe('right', 'guitarra-pie', 'Guitarra', '🎸', 'level', 12),
  fe('right', 'bateria', 'Batería', '🥁', 'level', 14),
  fe('right', 'arpa', 'Arpa', '🪕', 'level', 16),
  fe('right', 'caballete', 'Caballete', '🖼️', 'tasks', 80),
  fe('right', 'acuario', 'Acuario', '🐟', 'collection', 18),
  fe('right', 'terrario', 'Terrario', '🦎', 'collection', 20),
  fe('right', 'pecera-gato', 'Cama de michi', '🐈', 'friends', 2),
  fe('right', 'casa-perro', 'Casita de perrito', '🐕', 'tasks', 100),
  fe('right', 'hamaca', 'Hamaca', '🏝️', 'longest', 12),
  fe('right', 'tienda', 'Casa de campaña', '⛺', 'tasks', 130),
  fe('right', 'columpio', 'Columpio', '🎠', 'level', 18),
  fe('right', 'bola-cristal', 'Mesa de cristal', '🔮', 'level', 20),
  fe('right', 'trono', 'Trono', '👑', 'level', 23),
  fe('right', 'carruaje', 'Carruaje', '🎡', 'level', 25),
  fe('right', 'nave-grande', 'Nave espacial', '🛸', 'tasks', 400),
  // Alfombras
  rg('alfombra-amarilla', 'Alfombra limón', '#f6e08a', 'tasks', 3),
  rg('alfombra-durazno', 'Alfombra durazno', '#f8c9a8', 'level', 2),
  rg('alfombra-cielo', 'Alfombra cielo', '#aed6f1', 'tasks', 7),
  rg('alfombra-coral', 'Alfombra coral', '#f2a3a0', 'tasks', 9),
  rg('alfombra-lavanda', 'Alfombra lavanda', '#d7c6f0', 'level', 3),
  rg('alfombra-pistacho', 'Alfombra pistacho', '#c9e4a5', 'tasks', 13),
  rg('alfombra-crema', 'Alfombra crema', '#f7ecd6', 'tasks', 17),
  rg('alfombra-chicle', 'Alfombra chicle', '#f9a8d4', 'level', 5),
  rg('alfombra-turquesa', 'Alfombra turquesa', '#8fd8d2', 'tasks', 21),
  rg('alfombra-mostaza', 'Alfombra mostaza', '#e6b94f', 'tasks', 27),
  rg('alfombra-vino', 'Alfombra vino', '#b5546c', 'longest', 4),
  rg('alfombra-cafe', 'Alfombra café', '#a67c5b', 'tasks', 33),
  rg('alfombra-gris', 'Alfombra gris', '#c3c7cf', 'tasks', 37),
  rg('alfombra-noche', 'Alfombra noche', '#3b3a5c', 'level', 6),
  rg('alfombra-oceano', 'Alfombra océano', '#4a90c2', 'collection', 5),
  rg('alfombra-bosque', 'Alfombra bosque', '#5f9b6e', 'tasks', 42),
  rg('alfombra-sandia', 'Alfombra sandía', '#f07a86', 'collection', 7),
  rg('alfombra-arena', 'Alfombra arena', '#e9d3ab', 'longest', 5),
  rg('alfombra-fresa', 'Alfombra fresa', '#ee8fab', 'tasks', 50),
  rg('alfombra-uva', 'Alfombra uva', '#9a7bc9', 'level', 9),
  rg('alfombra-naranja', 'Alfombra naranja', '#f5a25d', 'tasks', 58),
  rg('alfombra-jade', 'Alfombra jade', '#6fc3a1', 'focus', 3),
  rg('alfombra-atardecer', 'Alfombra atardecer', '#f28e6f', 'longest', 10),
  rg('alfombra-algodon', 'Alfombra algodón', '#fbd5e8', 'gratitude', 5),
  rg('alfombra-hielo', 'Alfombra hielo', '#cfe9f7', 'tasks', 85),
  rg('alfombra-carbon', 'Alfombra carbón', '#5b5f6b', 'tasks', 110),
  rg('alfombra-dorada', 'Alfombra dorada', '#e8c766', 'achievements', 10),
  rg('alfombra-galaxia', 'Alfombra galaxia', '#6a4fa3', 'level', 15),
  rg('alfombra-arcoiris', 'Alfombra arcoíris', '#f7a8c8', 'collection', 20),
)

export const WALL_COLORS = ['#fde2ea', '#e6def5', '#dcebd2', '#dfeaf7', '#fdf1c9', '#fbe8d9', '#2a2438', '#1b2536']
export const FLOOR_COLORS = ['#e8c9a6', '#d9b48a', '#f1dfc9', '#c9d8c0', '#cfc3e0', '#8a7a6b']

// ───────────────────────── Cartitas diarias ─────────────────────────

export const LETTERS: string[] = [
  'Hoy no tienes que hacerlo todo. Con una cosita pequeña ya cuenta. 🌷',
  'Respira hondo. Lo estás haciendo mejor de lo que crees. 💗',
  'Tu ritmo es el correcto, aunque hoy sea lento. 🐢',
  'Cada tarea que tachas es una promesa que te cumples. ✨',
  'Descansar también es productivo. Anótalo en tu lista. 🌙',
  'Eres más fuerte que tu lista de pendientes. 💪',
  'Un pasito hoy, un montón de pasitos mañana. 👣',
  'Me alegra mucho verte por aquí. ¡Vamos con calma! 🍵',
  'No compares tu capítulo 3 con el capítulo 20 de nadie. 📖',
  'Toma agüita, estira los hombros y sonríe un poquito. 💧',
  'Las cosas buenas llevan tiempo, y tú estás en camino. 🌱',
  'Hoy puedes empezar de nuevo, las veces que haga falta. 🌅',
  'Tu esfuerzo se nota, aunque nadie lo aplauda. 👏',
  'Está bien pedir ayuda. Nadie florece solo. 🌼',
  'Celebra lo pequeño: también es un logro. 🎉',
  'Hoy mereces algo rico, aunque sea un tecito. ☕',
  'No hace falta ser perfecta para ser increíble. 🦋',
  'Confío en ti, incluso en los días nublados. ☁️',
  'Haz lo que puedas con cariño, lo demás puede esperar. 💌',
  'Eres mi plan favorito para hoy. 🐾',
  'Tus sueños caben en una lista, empecemos por la primera línea. 🌟',
  'Si hoy pesa, hazlo en pedacitos. 🧩',
  'Ya has superado el 100% de tus días difíciles. 🌈',
  'Dormir bien es magia. No la subestimes. 😴',
  'Gracias por cuidar de mí y de ti. 🧸',
  'Lo importante no es cuánto haces, sino cómo te sientes. 🌸',
  'Hoy brillas, aunque no te des cuenta. ✨',
  'Un descanso corto y volvemos con todo. 🍓',
  'Puedes hacer cosas difíciles. Ya lo has hecho antes. 🏔️',
  'Que tu día sea suave como un peluche. 🐻',
  'Sigue, aunque sea despacito. Yo te acompaño. 🐌',
  'Tu constancia es mi cosa favorita. 🔥',
  'Ponle música a tu lista y hazla bailar. 🎶',
  'Recuerda: tú escribes tu propia historia. 📚',
  'Ordena una cosa hoy y verás cómo se siente. 🧺',
  'Una tarea hecha vale más que diez pendientes. ✅',
  'Hoy el universo te guiña un ojo. 🌌',
  'Te veo esforzarte y me da mucho orgullo. 🥹',
  'Mereces la misma paciencia que le das a los demás. 🫶',
  'Cuando dudes, vuelve a lo más pequeño. 🌰',
]
