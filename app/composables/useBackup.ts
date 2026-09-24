const KEY_PREFIX = 'todo-'

function collectData(): Record<string, string> {
  const data: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      const value = localStorage.getItem(key)
      if (value !== null) data[key] = value
    }
  }
  return data
}

export function useBackup() {
  function exportData() {
    if (!import.meta.client) return
    const payload = {
      app: 'mis-tareas',
      exportedAt: new Date().toISOString(),
      data: collectData(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mis-tareas-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File): Promise<{ ok: boolean; error?: string }> {
    if (!import.meta.client) return { ok: false, error: 'No disponible' }
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const data = parsed?.data
      if (!data || typeof data !== 'object') {
        return { ok: false, error: 'El archivo no tiene el formato esperado.' }
      }
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith(KEY_PREFIX) && typeof value === 'string') {
          localStorage.setItem(key, value)
        }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'No se pudo leer el archivo. ¿Es un respaldo válido?' }
    }
  }

  return { exportData, importData }
}
