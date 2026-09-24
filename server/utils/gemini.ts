// Utilidades compartidas por las rutas /api/companion* para hablar con Gemini.
// Orden de preferencia: modelos lite (más cupo gratuito) primero, con un modelo
// de respaldo por si los lite están saturados (Gemini responde 503 en picos de demanda).
export const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview']

// Límite simple por IP (en memoria, compartido entre endpoints) para no agotar el cupo gratuito.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 15
const hits = new Map<string, number[]>()

export function checkGeminiRateLimit(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return false
  hits.set(ip, [...recent, now])
  return true
}

/**
 * Llama a generateContent probando los modelos en orden; devuelve la primera respuesta que no sea un
 * 503 de saturación. Cada intento tiene un timeout propio: sin esto, un modelo que se cuelga (no 503,
 * simplemente no responde) bloquea toda la cadena de respaldo durante minutos en vez de pasar al siguiente.
 */
export async function callGemini(key: string, body: Record<string, unknown>, timeoutMs = 12_000): Promise<Response | undefined> {
  let res: Response | undefined
  for (const model of GEMINI_MODELS) {
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch {
      // timeout o error de red con este modelo: probamos el siguiente
      res = undefined
      continue
    }
    if (res.status !== 503) break
  }
  return res
}
