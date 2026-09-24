/** Path SVG (viewBox 0 0 100 100) de un rectángulo redondeado con borde ondulado tipo nube; `seed` varía la forma por mes. */
export function blobPath(seed: number): string {
  const steps = 160
  const p1 = seed * 1.7
  const p2 = seed * 2.9
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    // Superelipse (exponente 5): casi rectangular con esquinas redondeadas.
    const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / 5)
    const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / 5)
    const wave = 1 + 0.022 * Math.sin(t * 10 + p1) + 0.018 * Math.sin(t * 3 + p2)
    const px = 50 + 46 * x * wave
    const py = 50 + 46 * y * wave
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`)
  }
  return `${pts.join(' ')} Z`
}
