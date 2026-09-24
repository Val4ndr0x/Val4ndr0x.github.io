/** Exportaciones a PNG: stickers para WhatsApp/Instagram y fondos de pantalla. */

function download(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  return ctx ? { canvas, ctx } : null
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sticker'

/** Sticker de 512×512 con fondo transparente (formato de los stickers de WhatsApp). */
export function downloadEmojiSticker(emoji: string, label: string) {
  const c = makeCanvas(512, 512)
  if (!c) return
  const { canvas, ctx } = c
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '380px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  ctx.fillText(emoji, 256, 280)
  download(canvas, `sticker-${slug(label)}.png`)
}

export function downloadImageSticker(src: string, label: string) {
  const img = new Image()
  img.onload = () => {
    const c = makeCanvas(512, 512)
    if (!c) return
    const scale = Math.min(460 / img.width, 460 / img.height)
    const w = img.width * scale
    const h = img.height * scale
    c.ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h)
    download(c.canvas, `sticker-${slug(label)}.png`)
  }
  img.src = src
}

export type WallpaperOptions = {
  bg: string
  accent: string
  emoji: string
  name: string
  caption: string
  sprite?: { src: string; frameWidth: number; frameHeight: number }
}

/** Fondo de pantalla vertical (1080×1920) con la mascota y el tema de la temporada. */
export function downloadWallpaper(opts: WallpaperOptions) {
  const W = 1080
  const H = 1920
  const c = makeCanvas(W, H)
  if (!c) return
  const { canvas, ctx } = c

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, opts.bg)
  grad.addColorStop(1, opts.accent)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Confeti de emojis en cuadrícula desplazada.
  ctx.globalAlpha = 0.28
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '84px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 5; col++) {
      ctx.fillText(opts.emoji, col * 240 + (row % 2 ? 120 : 0) + 30, row * 190 + 120)
    }
  }
  ctx.globalAlpha = 1

  const finish = () => {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = 'bold 84px sans-serif'
    ctx.fillText(opts.name, W / 2, 1420)
    ctx.font = '44px sans-serif'
    ctx.fillText(opts.caption, W / 2, 1500)
    download(canvas, `fondo-${slug(opts.name)}.png`)
  }

  if (!opts.sprite) return finish()
  const img = new Image()
  img.onload = () => {
    const targetH = 620
    const targetW = (opts.sprite!.frameWidth / opts.sprite!.frameHeight) * targetH
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.ellipse(W / 2, 1250, 330, 330, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.drawImage(img, 0, 0, opts.sprite!.frameWidth, opts.sprite!.frameHeight, (W - targetW) / 2, 930, targetW, targetH)
    finish()
  }
  img.onerror = finish
  img.src = opts.sprite.src
}
