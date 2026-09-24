// Comedor del café: mesas con sillas (en varios estilos), clientes sentados y piezas de los rincones.
// Todo se dibuja en un viewBox de 100×80 por mesa (dos sillas laterales, una mesa redonda al centro).

const O = '#3b2a25'
const S = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`

type Pal = { top: string; side: string; leg: string; chair: string; seat: string; deco: string }

export const DEFAULT_DINING = 'comedor-madera'

export const DINING_SETS: { id: string; label: string; cost: number; pal: Pal }[] = [
  { id: DEFAULT_DINING, label: 'Madera clásica', cost: 0, pal: { top: '#c99b78', side: '#9a6f52', leg: '#6d4c3d', chair: '#b98b6a', seat: '#e8735a', deco: '#fff8f3' } },
  { id: 'comedor-rosa', label: 'Set rosita', cost: 90, pal: { top: '#fbdde9', side: '#ee8fb5', leg: '#c96a92', chair: '#f4a8c4', seat: '#fff8f3', deco: '#e0475b' } },
  { id: 'comedor-jardin', label: 'Set de jardín', cost: 110, pal: { top: '#e8f2dc', side: '#7fb08a', leg: '#4f8f5d', chair: '#6fb37d', seat: '#f7c948', deco: '#fff8f3' } },
  { id: 'comedor-marmol', label: 'Mármol y oro', cost: 200, pal: { top: '#f4f4f8', side: '#c9a24a', leg: '#9a7a2c', chair: '#3b4a6a', seat: '#e6c15c', deco: '#3b2a25' } },
  { id: 'comedor-neon', label: 'Set neón', cost: 260, pal: { top: '#241a52', side: '#19e6ff', leg: '#0e0a26', chair: '#ff2e88', seat: '#1b1440', deco: '#19e6ff' } },
]

const chairs = (p: Pal) => `
  <g ${S}>
    <path d="M9 60v14M25 60v14" fill="none"/>
    <rect x="2" y="14" width="13" height="38" rx="5" fill="${p.chair}"/>
    <ellipse cx="15" cy="55" rx="14" ry="5.5" fill="${p.seat}"/>
    <path d="M91 60v14M75 60v14" fill="none"/>
    <rect x="85" y="14" width="13" height="38" rx="5" fill="${p.chair}"/>
    <ellipse cx="85" cy="55" rx="14" ry="5.5" fill="${p.seat}"/>
  </g>`

const table = (p: Pal) => `
  <ellipse cx="50" cy="76" rx="18" ry="4.5" fill="${p.leg}" ${S}/>
  <rect x="45" y="58" width="10" height="18" fill="${p.leg}" ${S}/>
  <path d="M16 55v5a34 9 0 0 0 68 0v-5" fill="${p.side}" ${S}/>
  <ellipse cx="50" cy="55" rx="34" ry="9" fill="${p.top}" ${S}/>
  <path d="M30 52Q42 47 56 48" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>
  <rect x="47" y="45" width="7" height="8" rx="1.5" fill="${p.deco}" ${S} stroke-width="1.4"/>`

export function diningArt(id: string, customers: (number | null)[] = []): string {
  const p = (DINING_SETS.find((s) => s.id === id) ?? DINING_SETS[0]!).pal
  const seats = [32, 68]
  const people = customers.map((c, i) => (c === null ? '' : customer(c, seats[i]!, i === 1))).join('')
  const mugs = customers.map((c, i) => (c === null ? '' : mug(i === 0 ? 30 : 70))).join('')
  return `${chairs(p)}${people}${table(p)}${mugs}`
}

/** Clientes: los muñequitos (stickers de busto) de la app, sentados con medio cuerpo detrás de la mesa. */
export const CUSTOMER_STICKERS = ['ok(1).png', 'paz.png', 'ok.png', 'contento.png', 'timido.png', 'rubor.png']

function customer(kind: number, cx: number, flip: boolean): string {
  const file = CUSTOMER_STICKERS[kind % CUSTOMER_STICKERS.length]!
  return `
  <g class="cafe-bob" style="animation-delay:${(kind * 0.5).toFixed(1)}s">
    <image href="/stickers/${file}" x="${cx - 22}" y="6" width="44" height="48" ${flip ? `transform="translate(${cx * 2} 0) scale(-1 1)"` : ''}/>
  </g>`
}

const mug = (x: number) => `
  <g ${S} stroke-width="1.5"><rect x="${x - 4}" y="46" width="8" height="8" rx="1.5" fill="#fff8f3"/><path d="M${x + 4} 48q4 0 0 4" fill="none"/></g>
  <path class="cafe-steam" d="M${x - 1} 44q-2-3 0-6" stroke="#dcdce4" stroke-width="1.6" fill="none" stroke-linecap="round"/>`

/** Piezas de los rincones delanteros (viewBox 60×100). */
export const CORNER_ITEMS = [
  { id: 'ficus', label: 'Ficus grande', slot: 'cornerL', cost: 100 },
  { id: 'lampara-pie', label: 'Lámpara de pie', slot: 'cornerL', cost: 90 },
  { id: 'perchero', label: 'Perchero', slot: 'cornerL', cost: 70 },
  { id: 'jukebox', label: 'Rocola', slot: 'cornerR', cost: 220 },
  { id: 'chicles', label: 'Máquina de chicles', slot: 'cornerR', cost: 110 },
  { id: 'caballete', label: 'Caballete del día', slot: 'cornerR', cost: 60 },
] as const

export const CORNER_ART: Record<string, string> = {
  ficus: `
    <path d="M30 70V44" stroke="#6d4c3d" stroke-width="5" stroke-linecap="round"/>
    <g ${S}><ellipse cx="30" cy="22" rx="20" ry="18" fill="#5a9a6a"/><ellipse cx="16" cy="38" rx="12" ry="10" fill="#6fb37d"/><ellipse cx="44" cy="36" rx="13" ry="10" fill="#7fc38c"/></g>
    <path d="M12 68H48L44 96H16Z" fill="#e8735a" ${S}/><rect x="9" y="63" width="42" height="9" rx="3" fill="#d4634a" ${S}/>`,
  'lampara-pie': `
    <path d="M30 34V90" stroke="${O}" stroke-width="4" stroke-linecap="round"/><ellipse cx="30" cy="92" rx="14" ry="4.5" fill="#6d4c3d" ${S}/>
    <path d="M14 34L20 8H40L46 34Z" fill="#f7c948" ${S}/><ellipse cx="30" cy="35" rx="16" ry="4" fill="#fff3b0" ${S}/>`,
  perchero: `
    <path d="M30 14V90M16 92H44" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 20L14 14M30 20L46 14M30 32L16 30M30 32L44 30" stroke="#6d4c3d" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 32Q54 44 44 56L34 52Z" fill="#8ab4e8" ${S}/><circle cx="14" cy="14" r="5" fill="#ee8fb5" ${S}/>`,
  jukebox: `
    <path d="M8 96V34Q8 8 30 8Q52 8 52 34V96Z" fill="#c94a3a" ${S}/>
    <path d="M14 34Q14 14 30 14Q46 14 46 34Z" fill="#ffd166" ${S}/>
    <rect x="14" y="40" width="32" height="22" rx="3" fill="#3b2a25" ${S}/><circle cx="30" cy="51" r="7" fill="#19e6ff" opacity=".85"/>
    <path d="M14 70H46M14 78H46M14 86H46" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>`,
  chicles: `
    <path d="M18 96H42L44 60H16Z" fill="#8d7772" ${S}/>
    <circle cx="30" cy="34" r="22" fill="#dff1ff" fill-opacity=".55" ${S}/>
    <g ${S} stroke-width="1.3"><circle cx="22" cy="40" r="5" fill="#ee8fb5"/><circle cx="32" cy="42" r="5" fill="#f7c948"/><circle cx="38" cy="32" r="5" fill="#8ab4e8"/><circle cx="26" cy="30" r="5" fill="#7fb08a"/><circle cx="34" cy="22" r="5" fill="#e8735a"/></g>
    <rect x="14" y="54" width="32" height="10" rx="3" fill="#e0475b" ${S}/>`,
  caballete: `
    <path d="M14 96L30 10L46 96" fill="#c99b78" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M20 84L30 32L40 84Z" fill="#2f3b34" ${S}/>
    <path d="M25 66H35M26 58H34M27 50H33" stroke="#e6d9c0" stroke-width="2" stroke-linecap="round"/><path d="M30 44l-3-4a2.4 2.4 0 0 1 3-2a2.4 2.4 0 0 1 3 2Z" fill="#ee8fb5"/>`,
}
