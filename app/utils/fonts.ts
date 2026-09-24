export type FontOption = { key: string; label: string; family: string }

/** Fuentes disponibles para los textos que escribe el usuario (no afectan a los textos de la app). */
export const FONT_OPTIONS: FontOption[] = [
  { key: 'default', label: 'Predeterminada', family: '' },
  { key: 'caveat', label: 'Caveat', family: '"Caveat", cursive' },
  { key: 'patrick', label: 'Patrick Hand', family: '"Patrick Hand", cursive' },
  { key: 'indie', label: 'Indie Flower', family: '"Indie Flower", cursive' },
  { key: 'dancing', label: 'Dancing Script', family: '"Dancing Script", cursive' },
  { key: 'pacifico', label: 'Pacifico', family: '"Pacifico", cursive' },
  { key: 'lobster', label: 'Lobster', family: '"Lobster", cursive' },
  { key: 'fredoka', label: 'Fredoka', family: '"Fredoka", sans-serif' },
  { key: 'merriweather', label: 'Merriweather', family: '"Merriweather", serif' },
  { key: 'special', label: 'Special Elite', family: '"Special Elite", monospace' },
]

export function fontFamilyFor(key: string | undefined) {
  return FONT_OPTIONS.find((f) => f.key === key)?.family || undefined
}
