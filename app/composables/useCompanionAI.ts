/**
 * IA del compañero: pregunta a Gemini a través de la ruta /api/companion del servidor de Nuxt.
 * No descarga ningún modelo; la clave (gratuita, de Google AI Studio) vive solo en el servidor.
 */
export type AIStatus = 'idle' | 'loading' | 'ready' | 'error'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

// Siempre "lista": no hay nada que cargar. Si el servidor no tiene clave o falla, `errorMessage` lo explica.
const status = ref<AIStatus>('ready')
const errorMessage = ref('')

export function useCompanionAI() {
  /** Responde una pregunta libre con Gemini. */
  async function ask(
    question: string,
    persona: { companionName: string; userName: string },
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<string> {
    const systemPrompt = `Sos ${persona.companionName}, un mapachito compañero amigable dentro de una app de organización de tareas (listas, tablero, calendario, clientes, libros). Hablás en español rioplatense, cálido y breve (máximo 4-5 líneas). Podés responder cualquier pregunta general. Si te preguntan algo que requiere abrir o modificar algo dentro de la app, recordá que eso ya lo manejás con comandos como "crea una tarea..." y no hace falta repetirlo salvo que te lo pidan. Le hablás a ${persona.userName}.`

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.role, content: h.content }) as ChatMessage),
      { role: 'user', content: question },
    ]

    try {
      const { text } = await $fetch<{ text: string }>('/api/companion', { method: 'POST', body: { messages } })
      errorMessage.value = ''
      return text || 'Mmm, no se me ocurrió nada para eso 😅'
    } catch (err: any) {
      errorMessage.value = err?.statusMessage || err?.data?.statusMessage || err?.message || 'error desconocido'
      throw err
    }
  }

  /**
   * Le pide a la IA que redacte un texto puntual (parafrasear un título, escribir una descripción)
   * siguiendo una instrucción corta. No decide acciones ni tiene persona/historial: es redacción pura,
   * para usar sobre un texto que el motor de comandos ya extrajo (título de tarea/lista/libro/cliente, etc).
   */
  async function rewrite(instruction: string, input: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: instruction },
      { role: 'user', content: input },
    ]
    // timeout acotado: si el servidor tarda de más (modelos saturados), mejor que quien llamó
    // caiga a su respaldo local ya, en vez de dejar la respuesta del compañero colgada.
    const { text } = await $fetch<{ text: string }>('/api/companion', {
      method: 'POST',
      body: { messages, fast: true },
      timeout: 10_000,
    })
    return (text || '').trim().replace(/^["“”']+|["“”']+$/g, '').trim()
  }

  return { status, errorMessage, ask, rewrite }
}
