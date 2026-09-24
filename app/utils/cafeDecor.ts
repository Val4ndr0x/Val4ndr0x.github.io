import { ORIENTAL_ART } from '~/utils/cafeStyles'
import { PREMIUM_ART } from '~/utils/cafePremium'
import { CORNER_ART, CORNER_ITEMS, DINING_SETS, diningArt } from '~/utils/cafeDining'

/** Espacios que cubren los estilos completos. */
export type CoreSlot = 'wall' | 'light' | 'table' | 'plant' | 'counter' | 'pet'
/** Espacios extra: solo se llenan comprando piezas sueltas. */
export type DecorSlot = CoreSlot | 'sign' | 'sill' | 'rug' | 'dining' | 'cornerL' | 'cornerR'

export type DecorItem = { id: string; label: string; slot: DecorSlot; cost: number }

export const DECOR_SLOTS: { id: DecorSlot; label: string }[] = [
  { id: 'wall', label: 'Pared' },
  { id: 'light', label: 'Luces' },
  { id: 'table', label: 'Mesa' },
  { id: 'plant', label: 'Plantas' },
  { id: 'counter', label: 'Barra' },
  { id: 'pet', label: 'Mascota' },
  { id: 'sign', label: 'Letreros' },
  { id: 'sill', label: 'Ventana' },
  { id: 'rug', label: 'Alfombras' },
  { id: 'dining', label: 'Comedor (mesas y sillas)' },
  { id: 'cornerL', label: 'Rincón izquierdo' },
  { id: 'cornerR', label: 'Rincón derecho' },
]

export const DECOR: DecorItem[] = [
  { id: 'cuadro', label: 'Cuadro', slot: 'wall', cost: 40 },
  { id: 'reloj', label: 'Reloj', slot: 'wall', cost: 60 },
  { id: 'estante', label: 'Estante', slot: 'wall', cost: 90 },
  { id: 'lampara', label: 'Lámpara', slot: 'light', cost: 50 },
  { id: 'guirnalda', label: 'Guirnalda', slot: 'light', cost: 80 },
  { id: 'farolillos', label: 'Farolillos', slot: 'light', cost: 110 },
  { id: 'mesa-taza', label: 'Mesa con taza', slot: 'table', cost: 60 },
  { id: 'mesa-pastel', label: 'Mesa con pastel', slot: 'table', cost: 100 },
  { id: 'planta', label: 'Planta', slot: 'plant', cost: 35 },
  { id: 'cactus', label: 'Cactus', slot: 'plant', cost: 45 },
  { id: 'flores', label: 'Florero', slot: 'plant', cost: 70 },
  { id: 'tetera', label: 'Tetera', slot: 'counter', cost: 50 },
  { id: 'vitrina', label: 'Vitrina', slot: 'counter', cost: 120 },
  { id: 'cafetera', label: 'Cafetera', slot: 'counter', cost: 160 },
  { id: 'gato', label: 'Gato', slot: 'pet', cost: 150 },
  { id: 'gato-dormido', label: 'Gato dormido', slot: 'pet', cost: 170 },
  { id: 'buho', label: 'Búho', slot: 'pet', cost: 200 },
  { id: 'espejo', label: 'Espejo', slot: 'wall', cost: 75 },
  { id: 'poster', label: 'Póster de granos', slot: 'wall', cost: 55 },
  { id: 'guitarra', label: 'Guitarra', slot: 'wall', cost: 130 },
  { id: 'candelabro', label: 'Candelabro', slot: 'light', cost: 190 },
  { id: 'bombillas', label: 'Bombillas retro', slot: 'light', cost: 95 },
  { id: 'nubes', label: 'Nubes de papel', slot: 'light', cost: 120 },
  { id: 'mesa-libro', label: 'Mesa con libro', slot: 'table', cost: 70 },
  { id: 'mesa-ajedrez', label: 'Mesa de ajedrez', slot: 'table', cost: 110 },
  { id: 'mesa-flor', label: 'Mesa con flor', slot: 'table', cost: 85 },
  { id: 'monstera', label: 'Monstera', slot: 'plant', cost: 75 },
  { id: 'bonsai', label: 'Bonsái', slot: 'plant', cost: 90 },
  { id: 'girasoles', label: 'Girasoles', slot: 'plant', cost: 95 },
  { id: 'croissants', label: 'Croissants', slot: 'counter', cost: 85 },
  { id: 'molino', label: 'Molino de café', slot: 'counter', cost: 100 },
  { id: 'caja', label: 'Caja registradora', slot: 'counter', cost: 130 },
  { id: 'pastelera', label: 'Pastelera', slot: 'counter', cost: 140 },
  { id: 'pez', label: 'Pecera', slot: 'pet', cost: 120 },
  { id: 'conejo', label: 'Conejito', slot: 'pet', cost: 160 },
  { id: 'perro', label: 'Perrito', slot: 'pet', cost: 180 },
  { id: 'letrero-cafe', label: 'Neón CAFÉ', slot: 'sign', cost: 140 },
  { id: 'letrero-menu', label: 'Pizarra del menú', slot: 'sign', cost: 65 },
  { id: 'letrero-abierto', label: 'Letrero abierto', slot: 'sign', cost: 45 },
  { id: 'sill-vela', label: 'Vela', slot: 'sill', cost: 30 },
  { id: 'sill-maceta', label: 'Suculenta', slot: 'sill', cost: 40 },
  { id: 'sill-radio', label: 'Radio vieja', slot: 'sill', cost: 85 },
  { id: 'sill-luces', label: 'Luces de ventana', slot: 'sill', cost: 60 },
  { id: 'alfombra-rosa', label: 'Alfombra rosa', slot: 'rug', cost: 50 },
  { id: 'alfombra-persa', label: 'Alfombra persa', slot: 'rug', cost: 120 },
  { id: 'alfombra-pasto', label: 'Alfombra de pasto', slot: 'rug', cost: 80 },
  { id: 'alfombra-estrella', label: 'Alfombra estrella', slot: 'rug', cost: 150 },
  ...DINING_SETS.filter((d) => d.cost > 0).map((d) => ({ id: d.id, label: d.label, slot: 'dining' as const, cost: d.cost })),
  ...CORNER_ITEMS.map((d) => ({ id: d.id, label: d.label, slot: d.slot, cost: d.cost })),
]

/** Posición de cada espacio dentro de la escena (viewBox 400×240) y sistema de coordenadas de su dibujo. */
export const SLOT_BOX: Record<DecorSlot, { x: number; y: number; w: number; h: number; vb: string; par: string }> = {
  wall: { x: 36, y: 28, w: 84, h: 84, vb: '0 0 100 100', par: 'xMidYMid meet' },
  light: { x: 110, y: 0, w: 180, h: 54, vb: '0 0 200 60', par: 'xMidYMin meet' },
  table: { x: 8, y: 138, w: 96, h: 92, vb: '0 0 100 100', par: 'xMidYMax meet' },
  plant: { x: 316, y: 112, w: 72, h: 78, vb: '0 0 80 100', par: 'xMidYMax meet' },
  counter: { x: 112, y: 128, w: 58, h: 52, vb: '0 0 100 100', par: 'xMidYMax meet' },
  pet: { x: 240, y: 124, w: 58, h: 56, vb: '0 0 100 100', par: 'xMidYMax meet' },
  sign: { x: 124, y: 34, w: 60, h: 56, vb: '0 0 100 90', par: 'xMidYMid meet' },
  sill: { x: 270, y: 84, w: 84, h: 30, vb: '0 0 100 36', par: 'xMidYMax meet' },
  rug: { x: 308, y: 196, w: 88, h: 40, vb: '0 0 100 40', par: 'xMidYMid meet' },
  dining: { x: 48, y: 256, w: 90, h: 72, vb: '0 0 100 80', par: 'xMidYMax meet' },
  cornerL: { x: 0, y: 256, w: 46, h: 72, vb: '0 0 60 100', par: 'xMidYMax meet' },
  cornerR: { x: 354, y: 256, w: 46, h: 72, vb: '0 0 60 100', par: 'xMidYMax meet' },
}

const O = '#3b2a25' // contorno, igual al del sprite
const S = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`

const TABLE_BASE = `
  <ellipse cx="50" cy="92" rx="22" ry="5" fill="#6d4c3d" ${S}/>
  <rect x="45" y="60" width="10" height="32" fill="#9a6f52" ${S}/>
  <path d="M10 56 v5 a40 10 0 0 0 80 0 v-5" fill="#9a6f52" ${S}/>
  <ellipse cx="50" cy="56" rx="40" ry="10" fill="#c99b78" ${S}/>`

export const DECOR_ART: Record<string, string> = {
  // --- Pared
  cuadro: `
    <rect x="12" y="14" width="76" height="62" rx="4" fill="#b98b6a" ${S}/>
    <rect x="21" y="23" width="58" height="44" rx="2" fill="#cfe6f2" ${S}/>
    <path d="M21 67 L40 42 L54 58 L64 48 L79 67 Z" fill="#7fb08a" ${S}/>
    <circle cx="66" cy="34" r="6" fill="#f7c948" ${S}/>`,
  reloj: `
    <circle cx="50" cy="46" r="34" fill="#f4e8cf" stroke="${O}" stroke-width="3"/>
    <path d="M50 22v6M50 64v6M26 46h6M68 46h6" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 46V32M50 46l10 6" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="46" r="3" fill="#ee8fb5" ${S}/>`,
  estante: `
    <rect x="14" y="36" width="10" height="28" fill="#ee8fb5" ${S}/>
    <rect x="25" y="42" width="9" height="22" fill="#7fb08a" ${S}/>
    <rect x="35" y="32" width="10" height="32" fill="#f7c948" ${S}/>
    <rect x="46" y="44" width="9" height="20" fill="#8ab4e8" ${S}/>
    <path d="M67 64 L71 50 H85 L89 64Z" fill="#e8735a" ${S}/>
    <path d="M78 50 C69 42 71 34 78 30 C85 34 87 42 78 50Z" fill="#7fb08a" ${S}/>
    <rect x="6" y="64" width="88" height="9" rx="2" fill="#b98b6a" ${S}/>`,
  // --- Luces
  lampara: `
    <path d="M100 0V22" stroke="${O}" stroke-width="2"/>
    <path d="M76 46 L88 22 H112 L124 46 Z" fill="#f7c948" ${S}/>
    <ellipse cx="100" cy="47" rx="11" ry="4" fill="#fff3b0" ${S}/>`,
  guirnalda: `
    <path d="M4 6 Q52 40 100 14 Q148 40 196 6" stroke="${O}" stroke-width="1.6" fill="none"/>
    <g ${S} stroke-width="1.5">
      <circle cx="28" cy="23" r="4.5" fill="#ffd166"/><circle cx="52" cy="29" r="4.5" fill="#ee8fb5"/>
      <circle cx="76" cy="27" r="4.5" fill="#ffd166"/><circle cx="100" cy="19" r="4.5" fill="#8ab4e8"/>
      <circle cx="124" cy="27" r="4.5" fill="#ffd166"/><circle cx="148" cy="29" r="4.5" fill="#ee8fb5"/>
      <circle cx="172" cy="23" r="4.5" fill="#ffd166"/>
    </g>`,
  farolillos: `
    <g ${S} stroke-width="1.6">
      <path d="M50 0V14M100 0V6M150 0V16" fill="none"/>
      <ellipse cx="50" cy="28" rx="12" ry="14" fill="#f4a8b8"/><path d="M50 14V42" fill="none"/>
      <ellipse cx="100" cy="22" rx="13" ry="15" fill="#ffd166"/><path d="M100 7V37" fill="none"/>
      <ellipse cx="150" cy="30" rx="12" ry="14" fill="#f4a8b8"/><path d="M150 16V44" fill="none"/>
    </g>`,
  // --- Mesa
  'mesa-taza': `${TABLE_BASE}
    <path d="M56 38q8 2 4 10q-2 2-5 2" fill="none" ${S}/>
    <path d="M38 34h18l-2 18H40z" fill="#fff8f3" ${S}/>
    <path d="M42 28q-3-5 0-9M50 28q-3-5 0-9" stroke="#b9b9c4" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'mesa-pastel': `${TABLE_BASE}
    <ellipse cx="38" cy="52" rx="16" ry="4" fill="#fff8f3" ${S}/>
    <path d="M28 50L50 42V51H28Z" fill="#f4c3d8" ${S}/>
    <path d="M28 47L50 39" stroke="#fff8f3" stroke-width="3" stroke-linecap="round"/>
    <circle cx="33" cy="43" r="3.5" fill="#e0475b" ${S}/>
    <rect x="68" y="40" width="9" height="14" rx="2" fill="#8ab4e8" ${S}/>
    <path d="M72 40V30" stroke="#5a9a6a" stroke-width="2.4"/>
    <circle cx="72" cy="27" r="5" fill="#ee8fb5" ${S}/>`,
  // --- Plantas
  planta: `
    <path d="M40 60C22 50 18 30 30 14C40 26 42 44 40 60Z" fill="#7fb08a" ${S}/>
    <path d="M40 60C58 50 62 30 50 14C40 26 38 44 40 60Z" fill="#8fc79a" ${S}/>
    <path d="M40 60C34 44 36 24 40 8C46 24 46 44 40 60Z" fill="#6ba277" ${S}/>
    <path d="M18 62H62L56 96H24Z" fill="#e8735a" ${S}/>
    <rect x="15" y="57" width="50" height="9" rx="3" fill="#d4634a" ${S}/>`,
  cactus: `
    <path d="M28 52H20a4 4 0 0 1-4-4V38" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M28 52H20a4 4 0 0 1-4-4V38" fill="none" stroke="#7fb08a" stroke-width="5" stroke-linecap="round"/>
    <path d="M52 44H60a4 4 0 0 0 4-4V32" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M52 44H60a4 4 0 0 0 4-4V32" fill="none" stroke="#7fb08a" stroke-width="5" stroke-linecap="round"/>
    <rect x="28" y="20" width="24" height="52" rx="12" fill="#7fb08a" ${S}/>
    <path d="M36 32v30M44 32v30" stroke="#5a9a6a" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M18 66H62L56 96H24Z" fill="#f4c3d8" ${S}/>
    <rect x="15" y="61" width="50" height="9" rx="3" fill="#ee8fb5" ${S}/>`,
  flores: `
    <path d="M34 64L28 32M40 64V24M46 64L54 34" stroke="#5a9a6a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g ${S}>
      <circle cx="28" cy="28" r="7" fill="#ee8fb5"/><circle cx="40" cy="20" r="7" fill="#f7c948"/><circle cx="54" cy="30" r="7" fill="#fff8f3"/>
    </g>
    <g fill="#e8735a"><circle cx="28" cy="28" r="2"/><circle cx="40" cy="20" r="2"/><circle cx="54" cy="30" r="2"/></g>
    <path d="M26 62H54L50 96H30Z" fill="#8ab4e8" ${S}/>`,
  // --- Barra
  tetera: `
    <path d="M74 60Q92 52 90 38Q82 44 72 50" fill="#f4c3d8" ${S}/>
    <path d="M22 58Q4 60 8 76Q14 84 24 80" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="48" cy="68" rx="28" ry="24" fill="#f4c3d8" ${S}/>
    <path d="M32 48Q48 32 64 48Z" fill="#ee8fb5" ${S}/>
    <circle cx="48" cy="34" r="4" fill="#ee8fb5" ${S}/>`,
  vitrina: `
    <ellipse cx="50" cy="90" rx="40" ry="7" fill="#b98b6a" ${S}/>
    <rect x="30" y="62" width="40" height="26" rx="4" fill="#f4c3d8" ${S}/>
    <path d="M30 70Q40 78 50 70Q60 78 70 70" fill="none" stroke="#fff8f3" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="58" r="5" fill="#e0475b" ${S}/>
    <path d="M16 88C16 30 84 30 84 88Z" fill="#dff1ff" fill-opacity=".35" ${S}/>
    <circle cx="50" cy="40" r="4" fill="#b98b6a" ${S}/>`,
  cafetera: `
    <rect x="18" y="22" width="64" height="64" rx="8" fill="#8d7772" ${S}/>
    <rect x="14" y="14" width="72" height="14" rx="5" fill="#6d4c3d" ${S}/>
    <rect x="44" y="40" width="12" height="10" fill="${O}"/>
    <circle cx="30" cy="36" r="3.5" fill="#ee8fb5" ${S}/><circle cx="70" cy="36" r="3.5" fill="#f7c948" ${S}/>
    <path d="M39 64H61L58 82H42Z" fill="#f4e8cf" ${S}/>
    <rect x="16" y="86" width="68" height="8" rx="3" fill="#6d4c3d" ${S}/>`,
  // --- Mascotas
  gato: `
    <path d="M72 92C92 92 96 66 84 60" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M72 92C92 92 96 66 84 60" fill="none" stroke="#e8a35a" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 98C18 72 30 50 50 50C70 50 82 72 72 98Z" fill="#e8a35a" ${S}/>
    <path d="M35 27L34 8L46 20ZM65 27L66 8L54 20Z" fill="#e8a35a" ${S}/>
    <circle cx="50" cy="38" r="18" fill="#e8a35a" ${S}/>
    <circle cx="43" cy="38" r="2.4" fill="${O}"/><circle cx="57" cy="38" r="2.4" fill="${O}"/>
    <path d="M47 44l3 3 3-3z" fill="#ee8fb5" ${S}/>
    <path d="M40 86h8M52 86h8" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`,
  'gato-dormido': `
    <ellipse cx="54" cy="80" rx="38" ry="18" fill="#b8b8c8" ${S}/>
    <path d="M14 66L12 50L24 58ZM38 60L42 46L46 62Z" fill="#b8b8c8" ${S}/>
    <circle cx="28" cy="72" r="15" fill="#b8b8c8" ${S}/>
    <path d="M21 72q3 3 6 0M31 72q3 3 6 0" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
    <path d="M78 86q14-2 12-14" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
    <path d="M78 86q14-2 12-14" fill="none" stroke="#b8b8c8" stroke-width="3" stroke-linecap="round"/>
    <text x="70" y="34" font-size="14" fill="#8a8aa0" font-family="sans-serif" font-weight="700">z</text>
    <text x="82" y="22" font-size="10" fill="#8a8aa0" font-family="sans-serif" font-weight="700">z</text>`,
  buho: `
    <ellipse cx="50" cy="60" rx="28" ry="34" fill="#a07855" ${S}/>
    <path d="M30 32L28 14L42 26ZM70 32L72 14L58 26Z" fill="#a07855" ${S}/>
    <ellipse cx="50" cy="70" rx="18" ry="22" fill="#e6cfa8" ${S}/>
    <circle cx="39" cy="46" r="10" fill="#fff8f3" ${S}/><circle cx="61" cy="46" r="10" fill="#fff8f3" ${S}/>
    <circle cx="40" cy="47" r="4" fill="${O}"/><circle cx="60" cy="47" r="4" fill="${O}"/>
    <path d="M46 54L50 61L54 54Z" fill="#f7c948" ${S}/>
    <path d="M40 94l-2 4M46 94l-1 4M54 94l1 4M60 94l2 4" stroke="#f7c948" stroke-width="2.4" stroke-linecap="round"/>`,
  // --- Nuevas piezas
  espejo: `
    <ellipse cx="50" cy="46" rx="30" ry="38" fill="#c99b78" ${S}/>
    <ellipse cx="50" cy="46" rx="24" ry="32" fill="#dff1ff" ${S}/>
    <path d="M36 30Q44 24 52 26M34 42Q36 36 40 34" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
  poster: `
    <rect x="22" y="10" width="56" height="74" rx="3" fill="#f4e8cf" ${S}/>
    <ellipse cx="50" cy="40" rx="11" ry="15" fill="#8a5a44" ${S}/><path d="M50 27Q46 40 50 53" stroke="#3b2a25" stroke-width="2" fill="none"/>
    <path d="M32 66H68M36 74H64" stroke="#b98b6a" stroke-width="3" stroke-linecap="round"/>`,
  guitarra: `
    <g transform="rotate(20 50 50)">
      <rect x="46" y="4" width="8" height="40" rx="2" fill="#6d4c3d" ${S}/><rect x="43" y="0" width="14" height="10" rx="3" fill="#3b2a25"/>
      <circle cx="50" cy="66" r="16" fill="#e0a05a" ${S}/><circle cx="50" cy="52" r="11" fill="#e0a05a" ${S}/>
      <circle cx="50" cy="62" r="5" fill="#3b2a25"/>
    </g>`,
  candelabro: `
    <path d="M100 0V14" stroke="${O}" stroke-width="2"/>
    <path d="M60 40Q100 62 140 40" fill="none" stroke="#c9a24a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="24" r="7" fill="#f7c948" ${S}/>
    <g ${S}><rect x="54" y="26" width="8" height="14" fill="#fff8f3"/><rect x="96" y="30" width="8" height="14" fill="#fff8f3"/><rect x="138" y="26" width="8" height="14" fill="#fff8f3"/></g>
    <g fill="#ffb300"><path d="M58 18q-4 6 0 8q4-2 0-8zM100 22q-4 6 0 8q4-2 0-8zM142 18q-4 6 0 8q4-2 0-8z"/></g>`,
  bombillas: `
    <path d="M6 8Q100 30 194 8" stroke="${O}" stroke-width="1.6" fill="none"/>
    <g ${S} stroke-width="1.4">
      <path d="M30 17V26"/><circle cx="30" cy="32" r="6" fill="#ffe08a"/>
      <path d="M70 24V33"/><circle cx="70" cy="39" r="6" fill="#ffe08a"/>
      <path d="M110 25V34"/><circle cx="110" cy="40" r="6" fill="#ffe08a"/>
      <path d="M150 21V30"/><circle cx="150" cy="36" r="6" fill="#ffe08a"/>
    </g>`,
  nubes: `
    <g ${S} stroke-width="1.6">
      <path d="M50 0V16M100 0V26M150 0V12" fill="none"/>
      <path d="M32 34a10 10 0 0 1 8-14a12 12 0 0 1 22 2a8 8 0 0 1 2 12z" fill="#fff8f3"/>
      <path d="M82 46a10 10 0 0 1 8-14a12 12 0 0 1 22 2a8 8 0 0 1 2 12z" fill="#dff1ff"/>
      <path d="M132 30a10 10 0 0 1 8-14a12 12 0 0 1 22 2a8 8 0 0 1 2 12z" fill="#fff8f3"/>
    </g>`,
  'mesa-libro': `${TABLE_BASE}
    <path d="M28 52L50 46L72 52L50 58Z" fill="#8ab4e8" ${S}/><path d="M28 48L50 42L72 48L50 54Z" fill="#fff8f3" ${S}/>
    <path d="M50 42V54" stroke="${O}" stroke-width="1.6"/><rect x="66" y="36" width="10" height="14" rx="2" fill="#ee8fb5" ${S}/>`,
  'mesa-ajedrez': `${TABLE_BASE}
    <path d="M26 50L50 40L74 50L50 60Z" fill="#fff8f3" ${S}/>
    <g fill="#3b2a25"><path d="M38 50L44 47.5L50 50L44 52.5ZM50 45L56 42.5L62 45L56 47.5ZM50 55L56 52.5L62 55L56 57.5ZM38 45L44 42.5L50 45L44 47.5Z"/></g>
    <circle cx="44" cy="40" r="4" fill="#fff8f3" ${S}/><path d="M56 34h6v10h-6z" fill="#3b2a25" ${S}/>`,
  'mesa-flor': `${TABLE_BASE}
    <path d="M42 36h16l-2 18H44z" fill="#8ab4e8" ${S}/><path d="M50 36V22" stroke="#5a9a6a" stroke-width="3"/>
    <circle cx="50" cy="18" r="8" fill="#ee8fb5" ${S}/><circle cx="50" cy="18" r="3" fill="#f7c948"/>`,
  monstera: `
    <path d="M40 64C14 58 8 30 24 12C36 22 42 42 40 64Z" fill="#5a9a6a" ${S}/><path d="M40 64C66 58 72 30 56 12C44 22 38 42 40 64Z" fill="#6fb37d" ${S}/>
    <path d="M40 64C30 46 32 24 40 6C48 24 50 46 40 64Z" fill="#7fc38c" ${S}/>
    <path d="M16 24l8 4M14 38l10 2M64 24l-8 4M66 38l-10 2" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 62H62L56 96H24Z" fill="#8ab4e8" ${S}/><rect x="15" y="57" width="50" height="9" rx="3" fill="#6d9bd6" ${S}/>`,
  bonsai: `
    <path d="M40 66Q34 52 42 44Q50 38 44 30" stroke="#6d4c3d" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g ${S}><ellipse cx="28" cy="34" rx="14" ry="10" fill="#6fb37d"/><ellipse cx="54" cy="26" rx="16" ry="11" fill="#7fc38c"/><ellipse cx="40" cy="16" rx="12" ry="9" fill="#5a9a6a"/></g>
    <path d="M14 70H66L62 92H18Z" fill="#8d7772" ${S}/><rect x="10" y="64" width="60" height="9" rx="3" fill="#6d5a55" ${S}/>`,
  girasoles: `
    <path d="M30 64V36M42 64V22M54 64V38" stroke="#5a9a6a" stroke-width="3.4" stroke-linecap="round"/>
    <g ${S}><circle cx="30" cy="32" r="9" fill="#f7c948"/><circle cx="42" cy="18" r="10" fill="#f7c948"/><circle cx="54" cy="34" r="9" fill="#f7c948"/></g>
    <g fill="#6d4c3d"><circle cx="30" cy="32" r="4"/><circle cx="42" cy="18" r="4.5"/><circle cx="54" cy="34" r="4"/></g>
    <path d="M22 62H58L54 96H26Z" fill="#e8735a" ${S}/>`,
  croissants: `
    <ellipse cx="50" cy="88" rx="38" ry="7" fill="#c99b78" ${S}/>
    <path d="M14 82Q20 52 50 50Q80 52 86 82Q50 70 14 82Z" fill="#e8b25a" ${S}/>
    <path d="M30 76L36 58M44 72L46 54M58 72L56 54M70 76L64 58" stroke="#b9803a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 50Q40 30 60 36Q72 40 70 52Q52 44 30 50Z" fill="#f0c274" ${S}/>`,
  molino: `
    <rect x="24" y="60" width="52" height="30" rx="4" fill="#8d5f44" ${S}/>
    <path d="M28 60L34 32H66L72 60Z" fill="#dff1ff" fill-opacity=".55" ${S}/>
    <g fill="#6d4c3d"><circle cx="44" cy="52" r="3"/><circle cx="54" cy="46" r="3"/><circle cx="58" cy="54" r="3"/></g>
    <rect x="42" y="16" width="16" height="16" rx="3" fill="#c9a24a" ${S}/><path d="M50 16V6H68" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="68" cy="6" r="4" fill="#ee8fb5" ${S}/>`,
  caja: `
    <path d="M14 90V58L30 44H86V90Z" fill="#b98b6a" ${S}/>
    <rect x="26" y="20" width="48" height="26" rx="4" fill="#3b2a25" ${S}/><rect x="31" y="25" width="38" height="14" rx="2" fill="#9be8b0"/>
    <text x="50" y="36" font-size="11" text-anchor="middle" font-family="monospace" font-weight="700" fill="#2c5a3c">$ 5.0</text>
    <g fill="#fff8f3" ${S} stroke-width="1.4"><rect x="24" y="52" width="10" height="8" rx="2"/><rect x="38" y="52" width="10" height="8" rx="2"/><rect x="52" y="52" width="10" height="8" rx="2"/><rect x="66" y="52" width="10" height="8" rx="2"/></g>
    <rect x="22" y="70" width="60" height="14" rx="3" fill="#8d5f44" ${S}/>`,
  pastelera: `
    <ellipse cx="50" cy="88" rx="26" ry="6" fill="#f4c3d8" ${S}/><path d="M46 88V74M54 88V74" stroke="${O}" stroke-width="2"/>
    <ellipse cx="50" cy="72" rx="40" ry="8" fill="#fff8f3" ${S}/>
    <path d="M22 68V46a28 8 0 0 1 56 0V68a28 8 0 0 1-56 0Z" fill="#f4c3d8" ${S}/>
    <ellipse cx="50" cy="46" rx="28" ry="8" fill="#fff8f3" ${S}/>
    <circle cx="36" cy="42" r="4" fill="#e0475b" ${S}/><circle cx="50" cy="40" r="4" fill="#e0475b" ${S}/><circle cx="64" cy="42" r="4" fill="#e0475b" ${S}/>
    <path d="M14 30Q50 6 86 30" fill="none" stroke="#dff1ff" stroke-width="3" opacity=".7"/>`,
  pez: `
    <path d="M18 94H82V44Q82 30 50 30Q18 30 18 44Z" fill="#8ab4e8" fill-opacity=".5" ${S}/>
    <path d="M20 66H80V92H20Z" fill="#6ea8ff" fill-opacity=".55"/>
    <g class="fish"><path d="M34 62Q46 50 58 62Q46 74 34 62Z" fill="#ff9a3d" ${S}/><path d="M58 62L68 54V70Z" fill="#ff9a3d" ${S}/><circle cx="41" cy="60" r="1.8" fill="${O}"/></g>
    <path d="M30 92Q28 78 34 72M70 92Q72 80 66 74" stroke="#5a9a6a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="46" r="2.4" fill="#fff" opacity=".8"/><circle cx="72" cy="38" r="1.6" fill="#fff" opacity=".8"/>`,
  conejo: `
    <path d="M62 92C86 92 90 76 82 72" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/><circle cx="82" cy="74" r="7" fill="#fff8f3" ${S}/>
    <path d="M26 98C16 74 28 54 50 54C72 54 84 74 74 98Z" fill="#f2e6dc" ${S}/>
    <ellipse cx="40" cy="20" rx="6" ry="20" fill="#f2e6dc" ${S}/><ellipse cx="60" cy="20" rx="6" ry="20" fill="#f2e6dc" ${S}/>
    <ellipse cx="40" cy="22" rx="2.6" ry="12" fill="#f4a8b8"/><ellipse cx="60" cy="22" rx="2.6" ry="12" fill="#f4a8b8"/>
    <circle cx="50" cy="44" r="16" fill="#f2e6dc" ${S}/>
    <circle cx="44" cy="43" r="2.4" fill="${O}"/><circle cx="56" cy="43" r="2.4" fill="${O}"/><path d="M47 49l3 3 3-3z" fill="#ee8fb5" ${S}/>`,
  perro: `
    <path d="M74 88C92 88 94 68 88 60" fill="none" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
    <path d="M74 88C92 88 94 68 88 60" fill="none" stroke="#c99b78" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 98C16 72 30 54 50 54C72 54 84 72 76 98Z" fill="#c99b78" ${S}/>
    <path d="M28 30L18 50L32 52ZM72 30L82 50L68 52Z" fill="#8a5a44" ${S}/>
    <circle cx="50" cy="40" r="18" fill="#c99b78" ${S}/><ellipse cx="50" cy="48" rx="9" ry="7" fill="#f4e8cf" ${S}/>
    <circle cx="43" cy="37" r="2.4" fill="${O}"/><circle cx="57" cy="37" r="2.4" fill="${O}"/><ellipse cx="50" cy="45" rx="3" ry="2" fill="${O}"/>
    <path d="M50 52v5q-4 4-8 0" fill="#ee8fb5" ${S} stroke-width="1.4"/>`,
  'letrero-cafe': `
    <rect x="6" y="14" width="88" height="52" rx="10" fill="#1b1440" ${S}/>
    <rect x="12" y="20" width="76" height="40" rx="7" fill="none" stroke="#ff2e88" stroke-width="3" style="filter:drop-shadow(0 0 4px #ff2e88)"/>
    <text x="50" y="47" font-size="20" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#19e6ff" style="filter:drop-shadow(0 0 4px #19e6ff)">CAFÉ</text>
    <path d="M40 66V80M60 66V80" stroke="${O}" stroke-width="1.6"/>`,
  'letrero-menu': `
    <rect x="16" y="6" width="68" height="76" rx="4" fill="#6d4c3d" ${S}/><rect x="22" y="12" width="56" height="64" rx="2" fill="#2f3b34" ${S}/>
    <text x="50" y="27" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#fff8f3">MENÚ</text>
    <path d="M28 36H72M28 46H64M28 56H70M28 66H58" stroke="#e6d9c0" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="8 3"/>`,
  'letrero-abierto': `
    <path d="M40 4V22M60 4V22" stroke="${O}" stroke-width="1.8"/>
    <rect x="12" y="20" width="76" height="34" rx="6" fill="#f4c3d8" ${S}/>
    <text x="50" y="43" font-size="15" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#e0475b">ABIERTO</text>`,
  'sill-vela': `
    <rect x="40" y="10" width="20" height="24" rx="3" fill="#fff8f3" ${S}/>
    <path d="M50 10V6" stroke="${O}" stroke-width="2"/><path d="M50 -2q-5 5 0 8q5-3 0-8z" fill="#ffb300"/>
    <rect x="10" y="30" width="80" height="5" rx="2" fill="#b98b6a"/>`,
  'sill-maceta': `
    <path d="M40 22C30 14 32 6 38 2C44 8 46 16 40 22Z" fill="#7fb08a" ${S}/><path d="M50 22C50 12 54 6 60 4C62 12 58 20 50 22Z" fill="#8fc79a" ${S}/>
    <path d="M34 22H66L62 34H38Z" fill="#e8735a" ${S}/>`,
  'sill-radio': `
    <rect x="26" y="8" width="48" height="26" rx="4" fill="#c99b78" ${S}/><circle cx="40" cy="21" r="8" fill="#3b2a25" ${S}/>
    <circle cx="40" cy="21" r="4" fill="#8d7772"/><path d="M56 14h12M56 21h12M56 28h8" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
    <path d="M62 8L76 -2" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`,
  'sill-luces': `
    <path d="M6 12Q28 26 50 12Q72 26 94 12" stroke="${O}" stroke-width="1.6" fill="none"/>
    <g ${S} stroke-width="1.2"><circle cx="16" cy="19" r="3.4" fill="#ffd166"/><circle cx="30" cy="22" r="3.4" fill="#ee8fb5"/><circle cx="40" cy="19" r="3.4" fill="#8ab4e8"/><circle cx="60" cy="19" r="3.4" fill="#ffd166"/><circle cx="70" cy="22" r="3.4" fill="#ee8fb5"/><circle cx="84" cy="19" r="3.4" fill="#8ab4e8"/></g>`,
  'alfombra-rosa': `
    <ellipse cx="50" cy="20" rx="46" ry="15" fill="#ee8fb5" ${S}/><ellipse cx="50" cy="20" rx="34" ry="10" fill="#f8c9dc" stroke="#fff8f3" stroke-width="1.6" stroke-dasharray="3 3"/>
    <ellipse cx="50" cy="20" rx="14" ry="4.5" fill="#ee8fb5"/>`,
  'alfombra-persa': `
    <path d="M6 8H94L98 32H2Z" fill="#a8324a" ${S}/><path d="M14 12H86L90 28H10Z" fill="#e6c15c" stroke="${O}" stroke-width="1.4"/>
    <path d="M22 15H78L82 25H18Z" fill="#7a2036"/><path d="M50 15L66 20L50 25L34 20Z" fill="#e6c15c" stroke="${O}" stroke-width="1.2"/>
    <path d="M6 32v4M20 32v4M34 32v4M48 32v4M62 32v4M76 32v4M90 32v4" stroke="#e6c15c" stroke-width="2"/>`,
  'alfombra-pasto': `
    <ellipse cx="50" cy="20" rx="46" ry="15" fill="#6fb37d" ${S}/>
    <g stroke="#4f8f5d" stroke-width="1.6" stroke-linecap="round"><path d="M22 20l-2-5M32 24l-1-5M44 14l-1-5M56 24l1-5M68 16l1-5M78 22l2-5M50 20l-1-5"/></g>
    <circle cx="36" cy="16" r="2.4" fill="#fff8f3"/><circle cx="64" cy="22" r="2.4" fill="#f7c948"/>`,
  'alfombra-estrella': `
    <ellipse cx="50" cy="20" rx="46" ry="15" fill="#3b4a8a" ${S}/>
    <path d="M50 8L54 17L64 18L57 24L59 33L50 28L41 33L43 24L36 18L46 17Z" fill="#f7c948" stroke="${O}" stroke-width="1.2" transform="translate(0 -1) scale(1 .8) translate(0 5)"/>
    <circle cx="20" cy="18" r="1.6" fill="#fff8f3"/><circle cx="82" cy="22" r="1.6" fill="#fff8f3"/><circle cx="72" cy="12" r="1.4" fill="#fff8f3"/>`,
}

Object.assign(DECOR_ART, ORIENTAL_ART, PREMIUM_ART, CORNER_ART)
for (const d of DINING_SETS) DECOR_ART[d.id] = diningArt(d.id)
