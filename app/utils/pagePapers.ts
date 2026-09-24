export type PagePaper = {
  id: string
  label: string
  /** Color de hoja que se aplica junto con el papel (si no hay, se conserva el actual). */
  color?: string
  css: string
  size?: string
}

// Papeles decorativos: capas de gradientes sobre el color de la hoja.
export const PAGE_PAPERS: PagePaper[] = [
  { id: 'liso', label: 'Liso', css: 'none' },
  { id: 'renglones', label: 'Renglones', css: 'repeating-linear-gradient(to bottom, transparent 0 27px, rgba(110,140,200,.32) 27px 28px)' },
  {
    id: 'cuadricula',
    label: 'Cuadrícula',
    css: 'linear-gradient(rgba(110,140,200,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(110,140,200,.25) 1px, transparent 1px)',
    size: '24px 24px',
  },
  { id: 'puntos', label: 'Puntos', css: 'radial-gradient(rgba(0,0,0,.2) 1.3px, transparent 1.6px)', size: '22px 22px' },
  {
    id: 'kawaii',
    label: 'Kawaii',
    color: '#fff0f6',
    css: 'radial-gradient(#ffb7d1 2.2px, transparent 2.8px), radial-gradient(#ffd9a8 2.2px, transparent 2.8px)',
    size: '30px 30px, 30px 30px',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    color: '#fdf1f6',
    css: 'linear-gradient(160deg, rgba(255,203,224,.7), rgba(203,225,255,.6) 55%, rgba(214,255,224,.6))',
  },
  {
    id: 'galaxia',
    label: 'Galaxia',
    color: '#1b1740',
    css: 'radial-gradient(circle at 20% 15%, rgba(190,120,255,.38), transparent 45%), radial-gradient(circle at 80% 85%, rgba(90,140,255,.32), transparent 50%), radial-gradient(#fff 0.9px, transparent 1.3px), radial-gradient(#ffe9a8 0.9px, transparent 1.3px)',
    size: '100% 100%, 100% 100%, 46px 46px, 61px 61px',
  },
  {
    id: 'bosque',
    label: 'Bosque',
    color: '#e3efd9',
    css: 'repeating-linear-gradient(135deg, rgba(80,140,90,.12) 0 12px, transparent 12px 24px), linear-gradient(to bottom, rgba(60,120,70,.16), transparent 35%)',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    color: '#f1e4c8',
    css: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,80,30,.26)), repeating-linear-gradient(0deg, rgba(120,90,40,.06) 0 2px, transparent 2px 5px)',
  },
]

export function getPagePaper(id: string | null | undefined): PagePaper | null {
  if (!id || id === 'liso') return null
  return PAGE_PAPERS.find((p) => p.id === id) ?? null
}
