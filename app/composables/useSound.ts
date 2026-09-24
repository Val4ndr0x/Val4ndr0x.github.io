const STORAGE_KEY = 'todo-sound-v1'

const sfxOn = ref(true)
const musicOn = ref(false)
let loaded = false

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicGain: GainNode | null = null
let musicTimer: ReturnType<typeof setInterval> | null = null
let nextChordAt = 0
let chordIndex = 0

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) sfxOn.value = JSON.parse(raw).sfx !== false
  } catch {
    // ignore corrupted/blocked storage
  }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sfx: sfxOn.value }))
  } catch {
    // ignore write failures
  }
}

/** El AudioContext se crea de forma perezosa: los navegadores solo lo permiten tras un gesto del usuario. */
function getCtx() {
  if (!import.meta.client) return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

type NoteOpts = { type?: OscillatorType; gain?: number; dest?: AudioNode; attack?: number }

function note(freq: number, at: number, dur: number, opts: NoteOpts = {}) {
  if (!ctx || !master) return
  const { type = 'sine', gain = 0.2, dest = master, attack = 0.01 } = opts
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(gain, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(g).connect(dest)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

/** Ráfaga de ruido filtrado: el "chasquido" seco de un golpe. */
function noiseBurst(at: number, dur: number, freq: number, gain: number) {
  if (!ctx || !master) return
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, at)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(filter).connect(g).connect(master)
  src.start(at)
}

/** Bombo corto: seno que cae rápido de tono, el "thump" grave del impacto. */
function thump(at: number, gain = 0.5) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(190, at)
  osc.frequency.exponentialRampToValueAtTime(48, at + 0.14)
  g.gain.setValueAtTime(gain, at)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18)
  osc.connect(g).connect(master)
  osc.start(at)
  osc.stop(at + 0.22)
}

/** Lloriqueo suave de cachorrito: tono limpio que sube y cae con vibrato, sin timbres ásperos. */
function whimper(at: number, from: number, peak: number, to: number, dur: number, gain = 0.2) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(from, at)
  osc.frequency.exponentialRampToValueAtTime(peak, at + dur * 0.35)
  osc.frequency.exponentialRampToValueAtTime(to, at + dur)

  // Segundo armónico suave para darle cuerpo de voz.
  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(from * 2, at)
  osc2.frequency.exponentialRampToValueAtTime(peak * 2, at + dur * 0.35)
  osc2.frequency.exponentialRampToValueAtTime(to * 2, at + dur)
  const g2 = ctx.createGain()
  g2.gain.value = 0.25

  // Vibrato que se acentúa hacia el final, como la voz temblando.
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 8
  lfoGain.gain.setValueAtTime(peak * 0.005, at)
  lfoGain.gain.linearRampToValueAtTime(peak * 0.05, at + dur)
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  lfoGain.connect(osc2.frequency)

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2600

  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(gain, at + 0.09)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)

  osc.connect(lp)
  osc2.connect(g2).connect(lp)
  lp.connect(g).connect(master)
  for (const o of [osc, osc2, lfo]) {
    o.start(at)
    o.stop(at + dur + 0.05)
  }
}

/** Campanita: fundamental + un parcial agudo que se apaga más rápido. */
function bell(freq: number, at: number, gain = 0.18) {
  note(freq, at, 1.1, { gain })
  note(freq * 2.76, at, 0.35, { gain: gain * 0.35 })
}

export type SoundName = 'ding' | 'coin' | 'pop' | 'buy' | 'unlock' | 'levelup' | 'sparkle' | 'chime' | 'ouch' | 'cry' | 'land'

const SOUNDS: Record<SoundName, (t: number) => void> = {
  ding: (t) => {
    bell(1046.5, t)
    bell(1568, t + 0.09, 0.14)
  },
  coin: (t) => {
    note(987.8, t, 0.09, { type: 'square', gain: 0.06 })
    note(1318.5, t + 0.08, 0.3, { type: 'square', gain: 0.06 })
  },
  pop: (t) => {
    note(520, t, 0.1, { gain: 0.22 })
    note(780, t + 0.06, 0.16, { gain: 0.2 })
  },
  buy: (t) => {
    ;[784, 988, 1319].forEach((f, i) => note(f, t + i * 0.07, 0.25, { type: 'triangle', gain: 0.16 }))
  },
  unlock: (t) => {
    ;[523.25, 659.25, 784, 1046.5].forEach((f, i) => bell(f, t + i * 0.11, 0.15))
  },
  levelup: (t) => {
    ;[392, 523.25, 659.25, 784, 1046.5].forEach((f, i) => bell(f, t + i * 0.1, 0.15))
  },
  // Destellito ascendente: cofre, medallas y stickers nuevos.
  sparkle: (t) => {
    ;[1318.5, 1568, 1975.5, 2637].forEach((f, i) => bell(f, t + i * 0.06, 0.09))
  },
  // Golpe: chasquido + thump grave, y un quejidito agudo justo después.
  ouch: (t) => {
    noiseBurst(t, 0.07, 1800, 0.55)
    thump(t)
    note(760, t + 0.1, 0.09, { type: 'square', gain: 0.05 })
    note(430, t + 0.17, 0.2, { type: 'square', gain: 0.05 })
  },
  // Aterrizaje blando: un plop grave sin chasquido.
  land: (t) => thump(t, 0.32),
  // Llanto: tres lloriqueos seguidos, cada uno más corto y más bajito.
  cry: (t) => {
    whimper(t, 520, 900, 560, 0.5)
    whimper(t + 0.6, 540, 880, 520, 0.45, 0.17)
    whimper(t + 1.15, 500, 780, 470, 0.4, 0.13)
  },
  // Campanita doble y larga: fin de una sesión de enfoque.
  chime: (t) => {
    bell(659.25, t, 0.16)
    bell(987.8, t + 0.35, 0.16)
    bell(1318.5, t + 0.7, 0.14)
  },
}

// Música ambiente tipo lo-fi: acordes suaves lentos + alguna nota de pentatónica.
const CHORDS = [
  [130.81, 164.81, 196, 246.94], // Cmaj7
  [110, 130.81, 164.81, 196], // Am7
  [87.31, 110, 130.81, 164.81], // Fmaj7
  [98, 123.47, 146.83, 174.61], // G7
]
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880]
const CHORD_SECONDS = 4.5

function scheduleChord(at: number) {
  if (!ctx || !musicGain) return
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  filter.connect(musicGain)
  for (const f of CHORDS[chordIndex % CHORDS.length]) {
    note(f * 2, at, CHORD_SECONDS + 0.8, { gain: 0.05, attack: 0.9, dest: filter })
    note(f * 2.003, at, CHORD_SECONDS + 0.8, { type: 'triangle', gain: 0.025, attack: 0.9, dest: filter })
  }
  for (let i = 0; i < 2; i++) {
    const f = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
    note(f, at + 0.8 + i * 1.9 + Math.random() * 0.4, 1.6, { type: 'triangle', gain: 0.03, attack: 0.05, dest: filter })
  }
  chordIndex++
}

function startMusic() {
  const c = getCtx()
  if (!c || !master) return
  if (!musicGain) {
    musicGain = c.createGain()
    musicGain.connect(master)
  }
  musicGain.gain.cancelScheduledValues(c.currentTime)
  musicGain.gain.setValueAtTime(musicGain.gain.value, c.currentTime)
  musicGain.gain.linearRampToValueAtTime(1, c.currentTime + 1.5)
  nextChordAt = c.currentTime + 0.1
  if (musicTimer) clearInterval(musicTimer)
  musicTimer = setInterval(() => {
    if (!ctx) return
    while (nextChordAt < ctx.currentTime + 2) {
      scheduleChord(nextChordAt)
      nextChordAt += CHORD_SECONDS
    }
  }, 500)
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer)
  musicTimer = null
  if (ctx && musicGain) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime)
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime)
    musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
  }
}

export function useSound() {
  load()

  function play(name: SoundName, delay = 0) {
    if (!sfxOn.value) return
    const c = getCtx()
    if (!c) return
    SOUNDS[name](c.currentTime + 0.02 + delay)
  }

  function toggleSfx() {
    sfxOn.value = !sfxOn.value
    persist()
    if (sfxOn.value) play('pop')
  }

  function toggleMusic() {
    musicOn.value = !musicOn.value
    if (musicOn.value) startMusic()
    else stopMusic()
  }

  return { sfxOn, musicOn, play, toggleSfx, toggleMusic }
}
