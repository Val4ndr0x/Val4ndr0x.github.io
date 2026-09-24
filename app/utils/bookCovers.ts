export type BookCover = {
  id: string
  label: string
  image: string
  gradient: [string, string]
}

// Portadas ilustradas estilo kawaii, reutilizando los stickers ya disponibles en /public/stickers.
export const BOOK_COVERS: BookCover[] = [
  { id: 'kawaii', label: 'Kawaii', image: '/stickers/kawaii.png', gradient: ['#ffd9ec', '#ffe9d6'] },
  { id: 'gato', label: 'Gatito', image: '/stickers/gato.png', gradient: ['#e3d6f7', '#d6e8f7'] },
  { id: 'gato2', label: 'Gatito dormido', image: '/stickers/gato(1).png', gradient: ['#d3f2e6', '#eaf7d3'] },
  { id: 'conejo', label: 'Conejito', image: '/stickers/conejo.png', gradient: ['#ffe1ec', '#fff2d6'] },
  { id: 'planta', label: 'Plantita', image: '/stickers/planta.png', gradient: ['#d9f2df', '#eef7d3'] },
  { id: 'pina', label: 'Piña', image: '/stickers/pina.png', gradient: ['#fff3c4', '#ffe2b0'] },
  { id: 'torta', label: 'Pastelito', image: '/stickers/torta.png', gradient: ['#ffd9e6', '#ffecd0'] },
  { id: 'rubor', label: 'Sonrojo', image: '/stickers/rubor.png', gradient: ['#ffe1ea', '#ffd9d9'] },
  { id: 'mucho-calor', label: 'Soleado', image: '/stickers/mucho-calor.png', gradient: ['#ffe9c2', '#ffd6d6'] },
  { id: 'alejarse', label: 'Aventura', image: '/stickers/alejarse.png', gradient: ['#d6eaff', '#e3d6f7'] },
]

export function getBookCover(id: string | null | undefined): BookCover | null {
  if (!id) return null
  return BOOK_COVERS.find((c) => c.id === id) ?? null
}

export type BookTexture = { id: string; label: string; css: string; tint?: string }

// Texturas de tapa dibujadas solo con gradientes (sin imágenes): se superponen a la portada.
export const BOOK_TEXTURES: BookTexture[] = [
  { id: 'none', label: 'Lisa', css: 'none' },
  {
    id: 'tela',
    label: 'Tela',
    css: 'repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 1px, transparent 1px 3px)',
  },
  {
    id: 'lino',
    label: 'Lino',
    css: 'repeating-linear-gradient(45deg, rgba(255,255,255,.16) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,.06) 0 2px, transparent 2px 4px)',
  },
  {
    id: 'cuero',
    label: 'Cuero',
    css: 'radial-gradient(rgba(0,0,0,.16) 1px, transparent 1.5px) 0 0 / 5px 5px, radial-gradient(rgba(255,255,255,.12) 1px, transparent 1.5px) 2px 3px / 7px 7px',
    tint: 'rgba(110, 70, 36, 0.38)',
  },
  {
    id: 'terciopelo',
    label: 'Terciopelo',
    css: 'radial-gradient(circle at 28% 18%, rgba(255,255,255,.28), transparent 60%), radial-gradient(circle at 82% 92%, rgba(0,0,0,.3), transparent 60%)',
  },
]

export function getBookTexture(id: string | null | undefined): BookTexture | null {
  if (!id || id === 'none') return null
  return BOOK_TEXTURES.find((t) => t.id === id) ?? null
}
