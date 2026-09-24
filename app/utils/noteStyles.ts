export type NoteStyle = {
  id: string
  label: string
  /** Ilustración (en /public/notes) que se pega al pie de la nota. */
  image: string
  /** Color del washi que sujeta la nota. */
  tape: string
}

// Fondos ilustrados para las notas. Son transparentes por arriba, así que se ven sobre cualquier color de nota.
export const NOTE_STYLES: NoteStyle[] = [
  { id: 'tulipanes', label: 'Tulipanes', image: '/notes/tulipanes.svg', tape: '#e58fd8' },
  { id: 'margaritas', label: 'Margaritas', image: '/notes/margaritas.svg', tape: '#f4d35e' },
  { id: 'lavanda', label: 'Lavanda', image: '/notes/lavanda.svg', tape: '#b39ddb' },
  { id: 'nubes', label: 'Nubes', image: '/notes/nubes.svg', tape: '#8ec5e8' },
  { id: 'noche', label: 'Noche', image: '/notes/noche.svg', tape: '#8f7fd0' },
  { id: 'olas', label: 'Olas', image: '/notes/olas.svg', tape: '#6fb3e0' },
  { id: 'sakura', label: 'Sakura', image: '/notes/sakura.svg', tape: '#f4a9c2' },
  { id: 'bosque', label: 'Bosque', image: '/notes/bosque.svg', tape: '#7bb892' },
  { id: 'hongos', label: 'Hongos', image: '/notes/hongos.svg', tape: '#ee7f8e' },
  { id: 'colinas', label: 'Colinas', image: '/notes/colinas.svg', tape: '#f4b99a' },
]

export function getNoteStyle(id: string | null | undefined): NoteStyle | null {
  if (!id) return null
  return NOTE_STYLES.find((s) => s.id === id) ?? null
}

/** Estilo CSS de la ilustración de fondo; vacío si la nota no tiene estilo. */
export function noteStyleCss(style: NoteStyle | null): Record<string, string> {
  if (!style) return {}
  return {
    backgroundImage: `url(${style.image})`,
    backgroundSize: '100% auto',
    backgroundPosition: 'bottom',
    backgroundRepeat: 'no-repeat',
  }
}

/** Washi de cuadritos (como el de la nota de tulipanes) en el color dado. */
export function noteTapeCss(style: NoteStyle | null): Record<string, string> {
  if (!style) return {}
  return {
    backgroundColor: 'rgba(255,255,255,.55)',
    backgroundImage: `repeating-conic-gradient(${style.tape} 0 25%, transparent 0 50%)`,
    backgroundSize: '8px 8px',
    borderColor: 'transparent',
    opacity: '0.85',
  }
}
