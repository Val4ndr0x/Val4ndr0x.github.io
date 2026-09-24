// Proxy de la IA del compañero hacia Gemini: la clave vive solo en el servidor (NUXT_GEMINI_API_KEY).
// Usa el modelo Flash-Lite, que tiene cupo gratuito en Google AI Studio.
type Msg = { role: 'system' | 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 12
const MAX_CHARS = 2000

export default defineEventHandler(async (event) => {
  const key = useRuntimeConfig(event).geminiApiKey
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Falta NUXT_GEMINI_API_KEY en el servidor' })

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'local'
  if (!checkGeminiRateLimit(ip)) throw createError({ statusCode: 429, statusMessage: 'Muchas preguntas seguidas, espera un momento' })

  const body = await readBody<{ messages?: Msg[]; fast?: boolean }>(event)
  const messages = (body?.messages ?? [])
    .filter((m) => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role))
    .slice(-MAX_MESSAGES)
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_CHARS) }))
  if (!messages.some((m) => m.role === 'user')) throw createError({ statusCode: 400, statusMessage: 'Mensaje vacío' })

  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))

  // Nota: "thinkingConfig" (para apagar el razonamiento interno del modelo) NO lo aceptan estos modelos
  // (Gemini responde 400 Invalid argument), así que no hay forma de evitar esa demora desde acá.
  // maxOutputTokens alto: los modelos Gemini 3.x gastan tokens en "pensamiento" interno (invisible)
  // antes de responder; con un límite bajo cortaban la respuesta a la mitad (finishReason MAX_TOKENS),
  // dando contestaciones incoherentes o incompletas.
  const generationConfig = { temperature: body?.fast ? 0.4 : 0.7, maxOutputTokens: 1024 }

  // "fast": para redacciones puntuales (pulir un título, escribir una descripción corta), donde preferimos
  // que un modelo lento/saturado se descarte pronto y se pruebe el siguiente, en vez de esperarlo de más.
  const res = await callGemini(
    key,
    {
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig,
    },
    body?.fast ? 6_000 : 12_000,
  )
  if (!res || !res.ok) throw createError({ statusCode: 502, statusMessage: `Gemini respondió ${res?.status}` })

  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  return { text: text || '' }
})
