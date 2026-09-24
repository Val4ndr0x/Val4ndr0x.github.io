import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let pluginsRegistered = false

/**
 * Scoped smooth-scroll (Lenis) driven by the GSAP ticker, wired to
 * ScrollTrigger. Instantiated per-page (onMounted/onBeforeUnmount) so it
 * never leaks into routes that need native scroll/drag behaviour (e.g. the
 * board's drag & drop).
 */
export function useLenis() {
  if (import.meta.client && !pluginsRegistered) {
    gsap.registerPlugin(ScrollTrigger)
    pluginsRegistered = true
  }

  let lenis: Lenis | null = null

  function onTick(time: number) {
    lenis?.raf(time * 1000)
  }

  function start() {
    if (!import.meta.client || lenis) return
    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)
  }

  function stop() {
    gsap.ticker.remove(onTick)
    lenis?.destroy()
    lenis = null
  }

  onMounted(start)
  onBeforeUnmount(stop)

  return { gsap, ScrollTrigger }
}
