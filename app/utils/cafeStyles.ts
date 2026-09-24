import type { CoreSlot } from '~/utils/cafeDecor'
import { PREMIUM_STYLES } from '~/utils/cafePremium'

export type CafeTheme = { wall: string; wainscot: string; floor: string; bar: string }

export type CafeStyle = {
  id: string
  label: string
  emoji: string
  blurb: string
  cost: number
  /** Escenario de lujo: el doble de caro y con piezas exclusivas. */
  premium?: boolean
  theme: CafeTheme
  /** Una pieza por espacio; las de "ori-*" solo existen dentro del estilo oriental. */
  items: Record<CoreSlot, string>
}

export const CAFE_STYLES: CafeStyle[] = [
  {
    id: 'kawaii', label: 'Kawaii rosa', emoji: '🎀', blurb: 'Todo dulce y rosita', cost: 400,
    theme: { wall: '#fbdde9', wainscot: '#f8c9dc', floor: '#f0b7cd', bar: '#ee8fb5' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'bosque', label: 'Bosque', emoji: '🌲', blurb: 'Verde, calmado y con búho', cost: 450,
    theme: { wall: '#dcebd3', wainscot: '#c5dcb8', floor: '#9fbf8f', bar: '#6f9e7a' },
    items: { wall: 'estante', light: 'farolillos', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'oriental', label: 'Oriental', emoji: '⛩️', blurb: 'Faroles rojos, bonsái, maneki-neko y letras japonesas', cost: 900,
    theme: { wall: '#f1e2c8', wainscot: '#d9c19a', floor: '#8a5a3c', bar: '#c0392b' },
    items: { wall: 'ori-pared', light: 'ori-faroles', table: 'ori-mesa', plant: 'ori-bonsai', counter: 'ori-tetsubin', pet: 'ori-neko' },
  },
  {
    id: 'noche', label: 'Noche estrellada', emoji: '🌌', blurb: 'Azul profundo y gatito dormido', cost: 600,
    theme: { wall: '#2f3763', wainscot: '#262d54', floor: '#1e2445', bar: '#6a5acd' },
    items: { wall: 'reloj', light: 'lampara', table: 'mesa-taza', plant: 'cactus', counter: 'cafetera', pet: 'gato-dormido' },
  },
  {
    id: 'desierto', label: 'Desierto', emoji: '🌵', blurb: 'Tonos arena y terracota', cost: 500,
    theme: { wall: '#f4dcb6', wainscot: '#ebc790', floor: '#d3a267', bar: '#e8735a' },
    items: { wall: 'cuadro', light: 'lampara', table: 'mesa-taza', plant: 'cactus', counter: 'tetera', pet: 'gato' },
  },
  {
    id: 'diner', label: 'Diner retro', emoji: '🍒', blurb: 'Menta y rojo cereza', cost: 550,
    theme: { wall: '#cfe9e6', wainscot: '#b7dcd8', floor: '#f2ece2', bar: '#d9432f' },
    items: { wall: 'reloj', light: 'lampara', table: 'mesa-pastel', plant: 'planta', counter: 'cafetera', pet: 'gato' },
  },
  {
    id: 'nordico', label: 'Nórdico', emoji: '🪵', blurb: 'Claro, limpio y minimalista', cost: 500,
    theme: { wall: '#eef1f4', wainscot: '#dde3ea', floor: '#d2c0a6', bar: '#9fb4c7' },
    items: { wall: 'estante', light: 'lampara', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'gato-dormido' },
  },
  {
    id: 'campestre', label: 'Campestre', emoji: '🧺', blurb: 'Casita de campo con flores', cost: 550,
    theme: { wall: '#f6edd0', wainscot: '#ecdcaa', floor: '#b98b6a', bar: '#c99b78' },
    items: { wall: 'estante', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'otono', label: 'Otoño', emoji: '🍂', blurb: 'Naranjas y madera cálida', cost: 600,
    theme: { wall: '#f4d3b3', wainscot: '#e8b98f', floor: '#a0603a', bar: '#c8622a' },
    items: { wall: 'cuadro', light: 'farolillos', table: 'mesa-taza', plant: 'flores', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'lavanda', label: 'Lavanda soñada', emoji: '💜', blurb: 'Morados suaves de ensueño', cost: 700,
    theme: { wall: '#e8def6', wainscot: '#d6c8ee', floor: '#c4b1e6', bar: '#a58ad6' },
    items: { wall: 'reloj', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato-dormido' },
  },
  {
    id: 'sakura', label: 'Sakura', emoji: '🌸', blurb: 'Cerezos en flor y té rosado', cost: 800,
    theme: { wall: '#fde4ec', wainscot: '#f9cfdd', floor: '#d99aa8', bar: '#e88fac' },
    items: { wall: 'ori-pared', light: 'farolillos', table: 'mesa-pastel', plant: 'flores', counter: 'ori-tetsubin', pet: 'gato' },
  },
  {
    id: 'calles-chinas', label: 'Calles chinas', emoji: '🏮', blurb: 'Faroles rojos y callejón de noche', cost: 850,
    theme: { wall: '#8c2f2f', wainscot: '#6f2323', floor: '#3d2a2a', bar: '#e0a72e' },
    items: { wall: 'ori-pared', light: 'ori-faroles', table: 'ori-mesa', plant: 'ori-bonsai', counter: 'ori-tetsubin', pet: 'ori-neko' },
  },
  {
    id: 'anime-tokyo', label: 'Anime Tokyo', emoji: '🗼', blurb: 'Ciudad anime con neón suave', cost: 800,
    theme: { wall: '#dfe4fb', wainscot: '#c6cdf3', floor: '#8f9ad6', bar: '#ff6fa8' },
    items: { wall: 'cuadro', light: 'lampara', table: 'mesa-taza', plant: 'planta', counter: 'cafetera', pet: 'gato' },
  },
  {
    id: 'ramen', label: 'Ramen-ya', emoji: '🍜', blurb: 'Barra de ramen con cortina noren', cost: 750,
    theme: { wall: '#f3e3c3', wainscot: '#e2c795', floor: '#7a4b32', bar: '#d9432f' },
    items: { wall: 'ori-pared', light: 'ori-faroles', table: 'ori-mesa', plant: 'planta', counter: 'ori-tetsubin', pet: 'ori-neko' },
  },
  {
    id: 'izakaya', label: 'Izakaya', emoji: '🍶', blurb: 'Taberna japonesa de madera', cost: 750,
    theme: { wall: '#d9b98d', wainscot: '#c29a68', floor: '#6b4429', bar: '#b5533c' },
    items: { wall: 'reloj', light: 'farolillos', table: 'ori-mesa', plant: 'ori-bonsai', counter: 'tetera', pet: 'gato-dormido' },
  },
  {
    id: 'templo', label: 'Templo zen', emoji: '🏯', blurb: 'Piedra, bambú y calma', cost: 700,
    theme: { wall: '#e7e3d3', wainscot: '#d3ceb8', floor: '#a7a38c', bar: '#7d9a7a' },
    items: { wall: 'ori-pared', light: 'farolillos', table: 'ori-mesa', plant: 'ori-bonsai', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'neon', label: 'Neón nocturno', emoji: '🌃', blurb: 'Ciudad cyberpunk violeta', cost: 850,
    theme: { wall: '#231b3f', wainscot: '#1a1330', floor: '#141024', bar: '#00e0d0' },
    items: { wall: 'reloj', light: 'lampara', table: 'mesa-taza', plant: 'cactus', counter: 'cafetera', pet: 'gato-dormido' },
  },
  {
    id: 'tropical', label: 'Tropical', emoji: '🏝️', blurb: 'Palmeras y colores vivos', cost: 600,
    theme: { wall: '#d6f2e2', wainscot: '#bfe8d0', floor: '#e8d3a2', bar: '#ff8a5c' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'planta', counter: 'vitrina', pet: 'buho' },
  },
  {
    id: 'playa', label: 'Playa', emoji: '🏖️', blurb: 'Arena, sol y brisa', cost: 550,
    theme: { wall: '#cdeaf7', wainscot: '#b5dff0', floor: '#f0dfb4', bar: '#f2a65a' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'gato' },
  },
  {
    id: 'espacio', label: 'Espacial', emoji: '🚀', blurb: 'Cafetería en órbita', cost: 850,
    theme: { wall: '#1c2350', wainscot: '#151b3f', floor: '#10143a', bar: '#7cf0ff' },
    items: { wall: 'reloj', light: 'lampara', table: 'mesa-taza', plant: 'cactus', counter: 'cafetera', pet: 'gato-dormido' },
  },
  {
    id: 'invierno', label: 'Invierno', emoji: '⛄', blurb: 'Nieve afuera, chocolate adentro', cost: 600,
    theme: { wall: '#e6f0fa', wainscot: '#d3e3f2', floor: '#b9c9d9', bar: '#7fa6d0' },
    items: { wall: 'estante', light: 'lampara', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'gato-dormido' },
  },
  {
    id: 'navidad', label: 'Navidad', emoji: '🎄', blurb: 'Luces, pino y regalos', cost: 700,
    theme: { wall: '#f5e1dd', wainscot: '#e8c4be', floor: '#8a3b3b', bar: '#2f7d4f' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'planta', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'halloween', label: 'Halloween', emoji: '🎃', blurb: 'Calabazas y telarañas', cost: 700,
    theme: { wall: '#3a2a4d', wainscot: '#2f2140', floor: '#241a33', bar: '#ff8a1f' },
    items: { wall: 'reloj', light: 'farolillos', table: 'mesa-taza', plant: 'cactus', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'pirata', label: 'Pirata', emoji: '🏴‍☠️', blurb: 'Madera de barco y tesoros', cost: 650,
    theme: { wall: '#c9a978', wainscot: '#b08c5d', floor: '#6e4a2c', bar: '#b8863b' },
    items: { wall: 'cuadro', light: 'farolillos', table: 'mesa-taza', plant: 'planta', counter: 'cafetera', pet: 'buho' },
  },
  {
    id: 'medieval', label: 'Medieval', emoji: '🏰', blurb: 'Castillo de piedra y antorchas', cost: 700,
    theme: { wall: '#b9b3a8', wainscot: '#a29c90', floor: '#6f6a60', bar: '#9a3b3b' },
    items: { wall: 'estante', light: 'farolillos', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'hadas', label: 'Hadas', emoji: '🧚', blurb: 'Bosque brillante de cuento', cost: 700,
    theme: { wall: '#e3f3dc', wainscot: '#cde8c4', floor: '#a7cf9e', bar: '#c48ee6' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'sirena', label: 'Sirena', emoji: '🧜‍♀️', blurb: 'Fondo del mar y perlas', cost: 700,
    theme: { wall: '#c9ecf0', wainscot: '#aedfe6', floor: '#8ccbd6', bar: '#f28fb8' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'planta', counter: 'vitrina', pet: 'gato-dormido' },
  },
  {
    id: 'selva', label: 'Selva', emoji: '🦜', blurb: 'Hojas enormes y loros', cost: 600,
    theme: { wall: '#c5e2b0', wainscot: '#a9d18f', floor: '#7a9f5f', bar: '#e3a634' },
    items: { wall: 'estante', light: 'farolillos', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'granja', label: 'Granja', emoji: '🐄', blurb: 'Establo y heno', cost: 550,
    theme: { wall: '#f3e0c0', wainscot: '#e6c99a', floor: '#b9895a', bar: '#c0562f' },
    items: { wall: 'reloj', light: 'lampara', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'circo', label: 'Circo', emoji: '🎪', blurb: 'Rayas rojas y carpa', cost: 650,
    theme: { wall: '#fbe3d9', wainscot: '#f6c7b6', floor: '#e2a06f', bar: '#e0413b' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'biblioteca', label: 'Biblioteca', emoji: '📖', blurb: 'Libros, madera y silencio', cost: 600,
    theme: { wall: '#d8bf9a', wainscot: '#c2a375', floor: '#6b4a30', bar: '#7a4f2f' },
    items: { wall: 'estante', light: 'lampara', table: 'mesa-taza', plant: 'planta', counter: 'tetera', pet: 'buho' },
  },
  {
    id: 'paris', label: 'París', emoji: '🥐', blurb: 'Boulangerie y croissants', cost: 650,
    theme: { wall: '#f3ead9', wainscot: '#e6d9bf', floor: '#c6b18d', bar: '#5b7fb3' },
    items: { wall: 'cuadro', light: 'lampara', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'mexicano', label: 'Mexicano', emoji: '🪅', blurb: 'Papel picado y colores de fiesta', cost: 650,
    theme: { wall: '#fbe0a8', wainscot: '#f4c96f', floor: '#c9743f', bar: '#e0457b' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'cactus', counter: 'tetera', pet: 'gato' },
  },
  {
    id: 'arcoiris', label: 'Arcoíris', emoji: '🌈', blurb: 'Todos los colores felices', cost: 700,
    theme: { wall: '#fff3d6', wainscot: '#ffe0e0', floor: '#d9ecff', bar: '#a17ce6' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'dulces', label: 'Dulcería', emoji: '🍭', blurb: 'Caramelo y algodón de azúcar', cost: 700,
    theme: { wall: '#ffe0f0', wainscot: '#ffc9e3', floor: '#c9f0f0', bar: '#ff7ab8' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  {
    id: 'dia-muertos', label: 'Día de Muertos', emoji: '💀', blurb: 'Cempasúchil, catrinas, papel picado y ofrenda', cost: 750,
    theme: { wall: '#4a2a5e', wainscot: '#3a1f4c', floor: '#2b1638', bar: '#ff8a1f' },
    items: { wall: 'cuadro', light: 'guirnalda', table: 'mesa-pastel', plant: 'flores', counter: 'vitrina', pet: 'gato' },
  },
  ...PREMIUM_STYLES,]

const O = '#3b2a25'
const S = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`
const JP = `font-family="'Noto Serif JP','Yu Mincho','Hiragino Mincho ProN',serif" font-weight="700" text-anchor="middle"`

const lantern = (cx: number, glyph: string) => `
  <path d="M${cx} 4V12" stroke="${O}" stroke-width="1.6"/>
  <rect x="${cx - 6}" y="12" width="12" height="4" rx="1" fill="${O}"/>
  <ellipse cx="${cx}" cy="32" rx="15" ry="17" fill="#d9432f" ${S}/>
  <path d="M${cx - 14} 25 Q${cx} 29 ${cx + 14} 25M${cx - 14} 39 Q${cx} 43 ${cx + 14} 39" stroke="${O}" stroke-width="1.2" fill="none"/>
  <text x="${cx}" y="37" font-size="14" fill="#fff3b0" ${JP}>${glyph}</text>
  <rect x="${cx - 6}" y="48" width="12" height="4" rx="1" fill="${O}"/>
  <path d="M${cx} 52V58" stroke="#f7c948" stroke-width="2" stroke-linecap="round"/>`

/** Dibujos del estilo oriental (no se venden por separado). */
export const ORIENTAL_ART: Record<string, string> = {
  'ori-pared': `
    <rect x="28" y="6" width="44" height="5" rx="2.5" fill="#6d4c3d" ${S}/>
    <rect x="33" y="11" width="34" height="72" fill="#f7efd9" ${S}/>
    <rect x="28" y="83" width="44" height="5" rx="2.5" fill="#6d4c3d" ${S}/>
    <text x="50" y="40" font-size="24" fill="#c0392b" ${JP}>和</text>
    <text x="50" y="62" font-size="15" fill="${O}" ${JP}>福</text>
    <circle cx="50" cy="74" r="4.5" fill="#c0392b" ${S}/>`,
  'ori-faroles': `
    <path d="M4 4H196" stroke="${O}" stroke-width="1.6"/>
    ${lantern(40, '福')}${lantern(100, '祭')}${lantern(160, '福')}`,
  'ori-mesa': `
    <rect x="0" y="84" width="24" height="9" rx="4.5" fill="#c0392b" ${S}/>
    <rect x="76" y="84" width="24" height="9" rx="4.5" fill="#c0392b" ${S}/>
    <rect x="22" y="76" width="9" height="16" fill="#6d4c3d" ${S}/>
    <rect x="69" y="76" width="9" height="16" fill="#6d4c3d" ${S}/>
    <ellipse cx="50" cy="74" rx="38" ry="10" fill="#a8583c" ${S}/>
    <path d="M28 64h13l-2 9H30z" fill="#f4e8cf" ${S}/>
    <ellipse cx="65" cy="63" rx="10" ry="8" fill="#3f6b5a" ${S}/>
    <path d="M55 62q-7-1-7-7" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M58 55q7-6 14 0" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  'ori-bonsai': `
    <path d="M20 96h40l-4-15H24z" fill="#b5533c" ${S}/>
    <path d="M40 82C38 64 46 58 34 46M40 68C48 62 54 56 58 48" stroke="#6d4c3d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <g fill="#7fb08a" ${S}><circle cx="30" cy="40" r="11"/><circle cx="48" cy="32" r="12"/><circle cx="63" cy="46" r="10"/></g>
    <g fill="#f4b6cf"><circle cx="26" cy="36" r="2.4"/><circle cx="50" cy="28" r="2.4"/><circle cx="62" cy="42" r="2.4"/><circle cx="40" cy="42" r="2"/></g>`,
  'ori-tetsubin': `
    <rect x="10" y="84" width="80" height="8" rx="3" fill="#6d4c3d" ${S}/>
    <path d="M28 84C22 60 34 48 50 48S78 60 72 84Z" fill="#3b3f4a" ${S}/>
    <path d="M40 48C40 36 60 36 60 48" stroke="${O}" stroke-width="3" fill="none"/>
    <rect x="46" y="42" width="8" height="6" fill="#3b3f4a" ${S}/>
    <path d="M72 68L90 58L92 63L74 77Z" fill="#3b3f4a" ${S}/>
    <text x="50" y="74" font-size="17" fill="#f7c948" ${JP}>茶</text>`,
  'ori-neko': `
    <path d="M28 92C24 66 34 52 50 52S76 66 72 92Z" fill="#fff" ${S}/>
    <path d="M30 28L32 10L45 22ZM70 28L68 10L55 22Z" fill="#fff" ${S}/>
    <path d="M34 24L35 16L40 21ZM66 24L65 16L60 21Z" fill="#f4b6cf"/>
    <ellipse cx="50" cy="40" rx="24" ry="20" fill="#fff" ${S}/>
    <ellipse cx="75" cy="34" rx="7" ry="12" fill="#fff" ${S}/>
    <path d="M38 40q4-4 8 0M54 40q4-4 8 0" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M47 46h6l-3 3z" fill="#ee8fb5"/>
    <path d="M32 55Q50 66 68 55" stroke="#c0392b" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="64" r="4" fill="#f7c948" ${S}/>
    <ellipse cx="50" cy="79" rx="10" ry="12" fill="#f7c948" ${S}/>
    <text x="50" y="84" font-size="11" fill="#c0392b" ${JP}>福</text>`,
}
