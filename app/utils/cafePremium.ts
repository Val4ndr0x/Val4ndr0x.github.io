import type { CafeStyle } from '~/utils/cafeStyles'
import type { CoreSlot } from '~/utils/cafeDecor'

/**
 * Escenarios premium: el doble de caros que los normales y con piezas exclusivas
 * (no existen en la tienda de muebles). Cada pieza se dibuja con la paleta del escenario.
 */
type Pal = { a: string; b: string; dark: string; glyph: string }

const O = '#1a1530'
const S = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`
const JP = `font-family="'Noto Serif JP','Yu Mincho','Hiragino Mincho ProN',serif" font-weight="700" text-anchor="middle"`

const wall = (p: Pal) => `
  <rect x="10" y="8" width="80" height="84" rx="8" fill="${p.dark}" ${S}/>
  <rect x="16" y="14" width="68" height="72" rx="5" fill="none" stroke="${p.a}" stroke-width="2.5"/>
  <path d="M20 30H80M20 42H80M20 54H80M20 66H80M20 78H80" stroke="${p.a}" stroke-width="0.8" opacity="0.35"/>
  <circle cx="50" cy="46" r="24" fill="none" stroke="${p.b}" stroke-width="2" stroke-dasharray="5 4"/>
  <circle cx="50" cy="46" r="17" fill="${p.a}" opacity="0.22"/>
  <text x="50" y="57" font-size="30" fill="${p.a}" ${JP}>${p.glyph}</text>
  <circle cx="22" cy="20" r="2" fill="${p.b}"/><circle cx="78" cy="80" r="2" fill="${p.b}"/>`

const light = (p: Pal) => `
  <path d="M6 6H194" stroke="${O}" stroke-width="2"/>
  <rect x="24" y="6" width="152" height="9" rx="4.5" fill="${p.dark}" ${S}/>
  <rect x="30" y="8.5" width="140" height="4" rx="2" fill="${p.a}"/>
  <path d="M45 16V26M100 16V30M155 16V26" stroke="${O}" stroke-width="1.6"/>
  <circle cx="45" cy="38" r="13" fill="${p.b}" opacity="0.28"/><circle cx="45" cy="38" r="8" fill="${p.b}" ${S}/>
  <circle cx="100" cy="42" r="16" fill="${p.a}" opacity="0.28"/><circle cx="100" cy="42" r="10" fill="${p.a}" ${S}/>
  <circle cx="155" cy="38" r="13" fill="${p.b}" opacity="0.28"/><circle cx="155" cy="38" r="8" fill="${p.b}" ${S}/>
  <circle cx="42" cy="35" r="2.4" fill="#fff" opacity="0.8"/><circle cx="97" cy="38" r="3" fill="#fff" opacity="0.8"/><circle cx="152" cy="35" r="2.4" fill="#fff" opacity="0.8"/>`

const table = (p: Pal) => `
  <ellipse cx="50" cy="93" rx="24" ry="5" fill="${p.dark}" ${S}/>
  <path d="M42 90L46 62H54L58 90Z" fill="${p.dark}" ${S}/>
  <ellipse cx="50" cy="60" rx="40" ry="9" fill="${p.dark}" ${S}/>
  <ellipse cx="50" cy="59" rx="36" ry="7" fill="none" stroke="${p.a}" stroke-width="2"/>
  <ellipse cx="50" cy="48" rx="20" ry="5" fill="none" stroke="${p.b}" stroke-width="1.6" opacity="0.9"/>
  <ellipse cx="50" cy="36" rx="14" ry="3.5" fill="none" stroke="${p.b}" stroke-width="1.4" opacity="0.6"/>
  <path d="M30 59L50 12L70 59Z" fill="${p.a}" opacity="0.14"/>
  <text x="50" y="40" font-size="20" fill="${p.a}" ${JP}>${p.glyph}</text>`

const plant = (p: Pal) => `
  <path d="M18 96h44l-5-20H23z" fill="${p.dark}" ${S}/>
  <path d="M23 82H57" stroke="${p.a}" stroke-width="2"/>
  <path d="M40 76C38 58 26 50 22 34M40 76C42 56 54 46 60 30M40 76V24" stroke="${p.b}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g ${S}><circle cx="22" cy="30" r="8" fill="${p.a}"/><circle cx="60" cy="26" r="8" fill="${p.b}"/><circle cx="40" cy="18" r="10" fill="${p.a}"/></g>
  <circle cx="22" cy="30" r="14" fill="${p.a}" opacity="0.2"/><circle cx="40" cy="18" r="17" fill="${p.a}" opacity="0.2"/><circle cx="60" cy="26" r="14" fill="${p.b}" opacity="0.2"/>
  <circle cx="30" cy="56" r="2" fill="#fff"/><circle cx="52" cy="50" r="2" fill="#fff"/>`

const counter = (p: Pal) => `
  <rect x="8" y="80" width="84" height="12" rx="4" fill="${p.dark}" ${S}/>
  <rect x="16" y="30" width="68" height="50" rx="7" fill="${p.dark}" ${S}/>
  <rect x="22" y="36" width="56" height="30" rx="4" fill="${p.a}" opacity="0.2" stroke="${p.a}" stroke-width="2"/>
  <text x="50" y="60" font-size="22" fill="${p.a}" ${JP}>${p.glyph}</text>
  <circle cx="28" cy="73" r="3" fill="${p.b}"/><circle cx="40" cy="73" r="3" fill="${p.a}"/><circle cx="52" cy="73" r="3" fill="${p.b}"/>
  <path d="M62 73H76" stroke="${p.a}" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 30V14" stroke="${O}" stroke-width="2"/><circle cx="50" cy="12" r="4" fill="${p.b}" ${S}/>`

const pet = (p: Pal, kind: 0 | 1 | 2) => {
  const body = kind === 1
    ? `<path d="M20 84C20 58 34 44 50 44S80 58 80 84Z" fill="${p.dark}" ${S}/>
       <path d="M30 42L26 20L42 34ZM70 42L74 20L58 34Z" fill="${p.dark}" ${S}/>`
    : kind === 2
      ? `<ellipse cx="50" cy="52" rx="30" ry="26" fill="${p.dark}" ${S}/>
         <path d="M20 40Q6 44 8 62M80 40Q94 44 92 62" stroke="${p.a}" stroke-width="4" fill="none" stroke-linecap="round"/>
         <ellipse cx="50" cy="88" rx="16" ry="4" fill="${p.a}" opacity="0.3"/>`
      : `<path d="M22 88C18 62 30 48 50 48S82 62 78 88Z" fill="${p.dark}" ${S}/>
         <path d="M30 38L30 18L44 30ZM70 38L70 18L56 30Z" fill="${p.dark}" ${S}/>
         <path d="M80 80Q96 74 92 56" stroke="${p.a}" stroke-width="4" fill="none" stroke-linecap="round"/>`
  return `${body}
    <ellipse cx="50" cy="46" rx="24" ry="20" fill="${p.dark}" ${S}/>
    <rect x="30" y="38" width="40" height="14" rx="7" fill="${p.a}" opacity="0.25"/>
    <circle cx="40" cy="45" r="5" fill="${p.a}"/><circle cx="60" cy="45" r="5" fill="${p.a}"/>
    <circle cx="41.5" cy="43.5" r="1.6" fill="#fff"/><circle cx="61.5" cy="43.5" r="1.6" fill="#fff"/>
    <path d="M46 55Q50 58 54 55" stroke="${p.b}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="66" r="4" fill="${p.b}" ${S}/>`
}

const builders: Record<CoreSlot, (p: Pal, i: number) => string> = {
  wall, light, table, plant, counter,
  pet: (p, i) => pet(p, (i % 3) as 0 | 1 | 2),
}

type Def = {
  id: string; label: string; emoji: string; blurb: string; cost: number
  theme: { wall: string; wainscot: string; floor: string; bar: string }
  pal: Pal
}

const DEFS: Def[] = [
  { id: 'neo-tokio', label: 'Neo Tokio 2099', emoji: '🏙️', blurb: 'Oriental futurista: hologramas, kanji de neón y gato robot', cost: 1800,
    theme: { wall: '#1b1440', wainscot: '#150f33', floor: '#0e0a26', bar: '#ff2e88' }, pal: { a: '#19e6ff', b: '#ff2e88', dark: '#241a52', glyph: '未' } },
  { id: 'sakura-holo', label: 'Sakura holográfica', emoji: '🪷', blurb: 'Cerezos de luz rosa y té en gravedad cero', cost: 1900,
    theme: { wall: '#3a1d4d', wainscot: '#2e1640', floor: '#22102f', bar: '#ff8fc7' }, pal: { a: '#ff9fd2', b: '#b48cff', dark: '#3b2150', glyph: '桜' } },
  { id: 'dragon-neon', label: 'Dragón de neón', emoji: '🐲', blurb: 'Rojo y oro eléctrico, calles chinas del futuro', cost: 2000,
    theme: { wall: '#3d0d14', wainscot: '#2f0a10', floor: '#1f070b', bar: '#ffb62e' }, pal: { a: '#ffb62e', b: '#ff3b3b', dark: '#4a141b', glyph: '龍' } },
  { id: 'orbita', label: 'Estación orbital', emoji: '🛰️', blurb: 'Café con vista a la Tierra y cero gravedad', cost: 2100,
    theme: { wall: '#0d1b3d', wainscot: '#0a1530', floor: '#070f22', bar: '#6ea8ff' }, pal: { a: '#6ea8ff', b: '#ffffff', dark: '#14284f', glyph: '∞' } },
  { id: 'aurora', label: 'Aurora cristalina', emoji: '🌠', blurb: 'Auroras verdes y violetas sobre hielo de cristal', cost: 2200,
    theme: { wall: '#0f2f3d', wainscot: '#0b2530', floor: '#081b24', bar: '#5cffb5' }, pal: { a: '#5cffb5', b: '#a77bff', dark: '#123847', glyph: '✦' } },
  { id: 'cristal', label: 'Palacio de cristal', emoji: '💎', blurb: 'Diamantes, espejos y luz blanca infinita', cost: 2400,
    theme: { wall: '#e8f6ff', wainscot: '#d2ebfa', floor: '#b8dbf0', bar: '#7ad7ff' }, pal: { a: '#3ab7f0', b: '#c08bff', dark: '#5a7fa0', glyph: '◆' } },
  { id: 'mecanico', label: 'Taller mecánico dorado', emoji: '⚙️', blurb: 'Engranes de oro, robots y vapor retrofuturista', cost: 2500,
    theme: { wall: '#3a2a16', wainscot: '#2f2211', floor: '#221809', bar: '#f0b429' }, pal: { a: '#f0b429', b: '#ff7a3d', dark: '#4a361c', glyph: '⚙' } },
  { id: 'galaxia', label: 'Galaxia líquida', emoji: '🪐', blurb: 'Nebulosas moradas y anillos de planeta', cost: 2700,
    theme: { wall: '#2a1252', wainscot: '#210e42', floor: '#170a30', bar: '#ff9a3d' }, pal: { a: '#ff9a3d', b: '#c56bff', dark: '#341a63', glyph: '☾' } },
  { id: 'abismo', label: 'Abismo luminoso', emoji: '🦑', blurb: 'Fondo del océano con criaturas bioluminiscentes', cost: 3000,
    theme: { wall: '#062a3a', wainscot: '#051f2d', floor: '#031521', bar: '#2effe0' }, pal: { a: '#2effe0', b: '#4d7cff', dark: '#0a3a4d', glyph: '海' } },
  { id: 'cuantico', label: 'Reloj cuántico', emoji: '⚛️', blurb: 'El tiempo detenido: plata, oro y portales', cost: 3500,
    theme: { wall: '#20242f', wainscot: '#181b24', floor: '#10121a', bar: '#e6c15c' }, pal: { a: '#e6c15c', b: '#8ff0ff', dark: '#2c3140', glyph: '時' } },
]

const SLOTS: CoreSlot[] = ['wall', 'light', 'table', 'plant', 'counter', 'pet']

export const PREMIUM_ART: Record<string, string> = {}
export const PREMIUM_STYLES: CafeStyle[] = DEFS.map((d, i) => {
  const items = {} as Record<CoreSlot, string>
  for (const slot of SLOTS) {
    const id = `${d.id}-${slot}`
    PREMIUM_ART[id] = builders[slot](d.pal, i)
    items[slot] = id
  }
  return { id: d.id, label: d.label, emoji: d.emoji, blurb: d.blurb, cost: d.cost, theme: d.theme, items, premium: true }
})

// ---------------------------------------------------------------------------
// Fondos: líneas, figuras y graffitis pintados en pared y piso para que
// los escenarios premium no se vean planos. Lienzo 400×240, `h` = horizonte.
// ---------------------------------------------------------------------------
const TAG = `font-family="'Permanent Marker','Brush Script MT','Comic Sans MS',cursive" font-weight="700"`
const rand = (i: number) => ((i * 9301 + 49297) % 233280) / 233280

const drip = (x: number, y: number, len: number, c: string) =>
  `<path d="M${x} ${y}V${y + len}" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x}" cy="${y + len + 1.5}" r="2" fill="${c}"/>`

const stars = (n: number, c: string, h: number, seed = 1) =>
  Array.from({ length: n }, (_, i) => `<circle cx="${(rand(i + seed) * 400).toFixed(0)}" cy="${(rand(i * 3 + seed + 7) * (h - 10)).toFixed(0)}" r="${(0.6 + rand(i + 5) * 1.1).toFixed(1)}" fill="${c}" opacity="0.7"/>`).join('')

const hex = (cx: number, cy: number, r: number) =>
  `M${cx + r} ${cy}L${cx + r / 2} ${cy + r * 0.87}L${cx - r / 2} ${cy + r * 0.87}L${cx - r} ${cy}L${cx - r / 2} ${cy - r * 0.87}L${cx + r / 2} ${cy - r * 0.87}Z`

/** Piso en perspectiva + zócalo luminoso, común a todos. */
const floorLines = (p: Pal, h: number) => {
  const fan = Array.from({ length: 13 }, (_, i) => `M200 ${h}L${-400 + i * 100} 340`).join('')
  return `
    <path d="${fan}" stroke="${p.a}" stroke-width="1" opacity="0.28"/>
    <path d="M0 ${h + 16}H400M0 ${h + 38}H400M0 ${h + 62}H400M0 ${h + 90}H400M0 ${h + 122}H400M0 ${h + 150}H400M0 ${h + 168}H400" stroke="${p.b}" stroke-width="1" opacity="0.22"/>
    <rect y="${h - 3}" width="400" height="4" fill="${p.a}" opacity="0.75"/>
    <rect y="${h - 6}" width="400" height="10" fill="${p.a}" opacity="0.14"/>`
}

/** Paneles verticales con juntas y tiras de luz en la pared. */
const wallPanels = (p: Pal, h: number) => `
  <path d="M100 0V${h}M200 0V${h}M300 0V${h}" stroke="${p.a}" stroke-width="1" opacity="0.22"/>
  <path d="M0 ${h * 0.42}H400" stroke="${p.b}" stroke-width="1" opacity="0.2"/>
  <rect x="0" y="${h * 0.58}" width="400" height="2" fill="${p.b}" opacity="0.45"/>`

const MOTIFS: Record<string, (p: Pal, h: number) => string> = {
  'neo-tokio': (p, h) => {
    const bld = Array.from({ length: 16 }, (_, i) => {
      const w = 22 + rand(i) * 18, x = i * 26 - 6, bh = 34 + rand(i + 3) * 58
      const win = Array.from({ length: 6 }, (_, j) => rand(i * 7 + j) > 0.45 ? `<rect x="${x + 4 + (j % 2) * 9}" y="${h - bh + 6 + Math.floor(j / 2) * 12}" width="4" height="6" fill="${j % 3 ? p.a : p.b}" opacity="0.85"/>` : '').join('')
      return `<rect x="${x}" y="${h - bh}" width="${w}" height="${bh}" fill="#0c0722" stroke="${p.a}" stroke-width="0.8" opacity="0.9"/>${win}`
    }).join('')
    return `${bld}
      <g ${TAG} font-size="15" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <text x="170" y="88" stroke="${p.b}" transform="rotate(-6 170 88)">TOKYO</text>
        <text x="172" y="90" fill="${p.a}" opacity="0.85" transform="rotate(-6 170 88)">TOKYO</text>
      </g>
      ${drip(150, 90, 12, p.b)}${drip(196, 84, 8, p.b)}
      <g font-family="'Noto Serif JP',serif" font-weight="700" font-size="13" fill="${p.a}" opacity="0.9"><text x="132" y="20" writing-mode="tb">ラーメン</text><text x="246" y="18" writing-mode="tb" fill="${p.b}">酒場</text></g>
      <path d="M150 104l14-8 14 8M196 100l10 6-10 6" stroke="${p.a}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="212" y="120" font-size="16" fill="${p.b}" ${TAG} transform="rotate(4 212 120)">♥ 2099</text>`
  },
  'sakura-holo': (p, h) => `
    <path d="M-4 40C60 46 90 16 150 30S250 14 300 34S380 26 404 44" stroke="#5a3a6a" stroke-width="5" fill="none" opacity="0.8"/>
    <path d="M60 40C70 60 60 74 76 88M150 30C140 56 152 68 144 90M300 34C310 56 300 70 314 86" stroke="#5a3a6a" stroke-width="3" fill="none" opacity="0.7"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(rand(i + 2) * 400).toFixed(0)}" cy="${(14 + rand(i * 2 + 9) * (h - 30)).toFixed(0)}" r="${(2 + rand(i) * 2.6).toFixed(1)}" fill="${i % 2 ? p.a : p.b}" opacity="0.8"/>`).join('')}
    <circle cx="200" cy="${h * 0.55}" r="46" fill="none" stroke="${p.b}" stroke-width="1" stroke-dasharray="3 5" opacity="0.5"/>
    <circle cx="200" cy="${h * 0.55}" r="30" fill="none" stroke="${p.a}" stroke-width="1" opacity="0.4"/>
    <text x="200" y="${h * 0.55 + 12}" font-size="34" fill="${p.a}" opacity="0.28" ${JP}>桜</text>
    <text x="150" y="120" font-size="17" fill="${p.a}" ${TAG} transform="rotate(-5 150 120)">sakura ✿</text>${drip(158, 122, 10, p.a)}`,
  'dragon-neon': (p, h) => `
    <path d="M-6 ${h * 0.7}C50 ${h * 0.2} 90 ${h * 0.9} 140 ${h * 0.5}S220 ${h * 0.15} 270 ${h * 0.55}S350 ${h * 0.9} 406 ${h * 0.3}" stroke="${p.a}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M-6 ${h * 0.7}C50 ${h * 0.2} 90 ${h * 0.9} 140 ${h * 0.5}S220 ${h * 0.15} 270 ${h * 0.55}S350 ${h * 0.9} 406 ${h * 0.3}" stroke="${p.b}" stroke-width="1.6" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/>
    <path d="M382 ${h * 0.24}l16-10 4 12-14 6zM392 ${h * 0.34}l10 8" stroke="${p.a}" stroke-width="2.4" fill="${p.b}" stroke-linejoin="round"/>
    <g fill="none" stroke="${p.a}" stroke-width="1" opacity="0.28">${Array.from({ length: 5 }, (_, r) => Array.from({ length: 10 }, (_, c) => `<path d="M${c * 42 + (r % 2) * 21} ${h - r * 14}a18 18 0 0 1 36 0"/>`).join('')).join('')}</g>
    <text x="196" y="${h * 0.62}" font-size="40" fill="${p.b}" opacity="0.35" ${JP}>龍</text>
    <text x="150" y="118" font-size="16" fill="${p.a}" ${TAG} transform="rotate(-4 150 118)">DRAGON KING</text>${drip(170, 120, 12, p.a)}${drip(214, 118, 8, p.a)}`,
  orbita: (p, h) => `
    ${stars(40, '#fff', h)}
    <circle cx="70" cy="${h * 0.5}" r="34" fill="#1d3f7a" stroke="${p.a}" stroke-width="1.6"/><path d="M40 ${h * 0.42}q30 -10 60 4M38 ${h * 0.56}q32 8 64 -2" stroke="#4fb56a" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M100 ${h * 0.75}L400 ${h * 0.75}M40 ${h * 0.9}H400" stroke="${p.a}" stroke-width="1" opacity="0.3"/>
    <g fill="${p.a}" opacity="0.5">${Array.from({ length: 18 }, (_, i) => `<circle cx="${8 + i * 22}" cy="${h - 8}" r="1.6"/>`).join('')}</g>
    <path d="M150 14l8 6-8 6M154 20h52" stroke="${p.a}" stroke-width="1.6" fill="none"/>
    <text x="150" y="112" font-size="14" fill="${p.b}" ${TAG} transform="rotate(-3 150 112)">ORBIT · 408 km</text>
    <text x="222" y="126" font-size="13" fill="${p.a}" ${TAG}>↑ ☆</text>`,
  aurora: (p, h) => `
    ${stars(30, '#fff', h * 0.6)}
    <path d="M0 40C60 8 110 70 170 34S290 4 400 40V70C300 46 230 90 160 60S60 30 0 74Z" fill="${p.a}" opacity="0.25"/>
    <path d="M0 62C70 30 120 90 190 56S300 26 400 64V84C310 62 240 108 170 80S60 56 0 92Z" fill="${p.b}" opacity="0.22"/>
    ${[30, 90, 160, 250, 320, 370].map((x, i) => `<path d="M${x} ${h}l${8 + i * 2} -${28 + (i % 3) * 14}l${10} ${28 + (i % 3) * 14}z" fill="${p.a}" opacity="0.3" stroke="${p.a}" stroke-width="1"/>`).join('')}
    <text x="146" y="118" font-size="16" fill="${p.a}" ${TAG} transform="rotate(-5 146 118)">aurora ✦</text>${drip(154, 120, 9, p.a)}`,
  cristal: (p, h) => `
    <g fill="none" stroke="${p.a}" stroke-width="1" opacity="0.4">${Array.from({ length: 5 }, (_, r) => Array.from({ length: 9 }, (_, c) => `<path d="${hex(c * 52 + (r % 2) * 26, r * 30 + 8, 28)}"/>`).join('')).join('')}</g>
    <path d="M0 0L120 ${h}M400 0L280 ${h}M200 0L160 ${h}L240 ${h}Z" stroke="${p.b}" stroke-width="1" fill="${p.a}" opacity="0.12"/>
    <path d="M60 30l16 -16l16 16l-16 26z M320 40l12 -14l12 14l-12 22z" fill="#fff" stroke="${p.a}" stroke-width="1.4" opacity="0.7"/>
    <text x="152" y="116" font-size="16" fill="${p.b}" ${TAG} transform="rotate(-4 152 116)">✧ shine ✧</text>`,
  mecanico: (p, h) => {
    const gear = (cx: number, cy: number, r: number, c: string) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="none" stroke="${c}" stroke-width="2"/>${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return `<path d="M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}L${cx + Math.cos(a) * (r + 6)} ${cy + Math.sin(a) * (r + 6)}" stroke="${c}" stroke-width="5"/>` }).join('')}</g>`
    return `${gear(46, 50, 22, p.a)}${gear(96, 76, 14, p.b)}${gear(356, 46, 26, p.a)}${gear(316, 96, 12, p.b)}
      <path d="M0 22H120V60M400 20H300M130 ${h}V110H210M262 ${h}V126H340" stroke="${p.b}" stroke-width="5" fill="none" opacity="0.5" stroke-linejoin="round"/>
      <g fill="${p.a}" opacity="0.6">${Array.from({ length: 16 }, (_, i) => `<circle cx="${10 + i * 26}" cy="8" r="2"/>`).join('')}</g>
      <text x="150" y="98" font-size="17" fill="${p.a}" ${TAG} transform="rotate(-4 150 98)">STEAM &amp; GOLD</text>${drip(170, 100, 10, p.a)}`
  },
  galaxia: (p, h) => `
    ${stars(50, '#fff', h)}
    <path d="M200 ${h * 0.5}m0 0c30 -6 60 20 40 50s-70 34 -100 -2s-14 -78 30 -92s110 10 116 70" stroke="${p.b}" stroke-width="2" fill="none" opacity="0.55"/>
    <path d="M200 ${h * 0.5}c-24 6 -44 -10 -34 -28s44 -22 66 -4" stroke="${p.a}" stroke-width="2" fill="none" opacity="0.5"/>
    <circle cx="336" cy="60" r="18" fill="${p.a}" opacity="0.85"/><ellipse cx="336" cy="60" rx="34" ry="8" fill="none" stroke="${p.b}" stroke-width="3" transform="rotate(-18 336 60)"/>
    <text x="150" y="118" font-size="16" fill="${p.a}" ${TAG} transform="rotate(-4 150 118)">✦ cosmic ✦</text>${drip(160, 120, 8, p.b)}`,
  abismo: (p, h) => {
    const jelly = (x: number, y: number, s: number, c: string) => `<g opacity="0.75"><path d="M${x - 14 * s} ${y}a${14 * s} ${14 * s} 0 0 1 ${28 * s} 0z" fill="${c}" opacity="0.5" stroke="${c}" stroke-width="1.4"/><path d="M${x - 8 * s} ${y}q-4 14 0 26M${x} ${y}q4 16 0 30M${x + 8 * s} ${y}q-4 14 0 22" stroke="${c}" stroke-width="1.4" fill="none"/></g>`
    return `${Array.from({ length: 22 }, (_, i) => `<circle cx="${(rand(i + 4) * 400).toFixed(0)}" cy="${(rand(i * 5 + 1) * h).toFixed(0)}" r="${(1.5 + rand(i) * 3).toFixed(1)}" fill="none" stroke="${p.a}" stroke-width="1" opacity="0.5"/>`).join('')}
      ${jelly(60, 30, 1.3, p.a)}${jelly(330, 24, 1.6, p.b)}${jelly(360, 92, 1, p.a)}
      <path d="M0 ${h - 22}q30 -14 60 0t60 0t60 0t60 0t60 0t60 0t60 0" stroke="${p.a}" stroke-width="2" fill="none" opacity="0.5"/>
      <text x="150" y="112" font-size="16" fill="${p.a}" ${TAG} transform="rotate(-4 150 112)">~ deep blue ~</text>${drip(158, 114, 9, p.b)}`
  },
  cuantico: (p, h) => `
    <g fill="none" stroke="${p.a}" opacity="0.45">${[26, 46, 66, 86].map((r, i) => `<circle cx="200" cy="${h * 0.5}" r="${r}" stroke-width="${i % 2 ? 1 : 2}" ${i % 2 ? 'stroke-dasharray="4 5"' : ''}/>`).join('')}</g>
    ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M${200 + Math.cos(a) * 86} ${h * 0.5 + Math.sin(a) * 86}L${200 + Math.cos(a) * 94} ${h * 0.5 + Math.sin(a) * 94}" stroke="${p.b}" stroke-width="2"/>` }).join('')}
    <path d="M200 ${h * 0.5}V${h * 0.5 - 60}M200 ${h * 0.5}l34 20" stroke="${p.a}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M0 40H70V80H120M400 40H330V80H280M0 ${h - 30}H60L84 ${h - 50}" stroke="${p.b}" stroke-width="1.4" fill="none" opacity="0.5"/>
    <g fill="${p.b}" opacity="0.7"><circle cx="70" cy="40" r="3"/><circle cx="330" cy="40" r="3"/><circle cx="120" cy="80" r="3"/></g>
    <text x="200" y="${h * 0.5 + 8}" font-size="22" fill="${p.a}" opacity="0.4" ${JP}>時</text>
    <text x="146" y="116" font-size="15" fill="${p.a}" ${TAG} transform="rotate(-4 146 116)">t = ∞</text>`,
}

/** Fondo de un escenario premium ('' si no es premium). `h` = altura del horizonte en un lienzo de 400×240. */
export function premiumBackdrop(id: string, h: number): string {
  const d = DEFS.find((x) => x.id === id)
  const motif = MOTIFS[id]
  if (!d || !motif) return ''
  return `${wallPanels(d.pal, h)}${motif(d.pal, h)}${floorLines(d.pal, h)}`
}
