const STORAGE_KEY = 'todo-dark-mode-v1'

const isDark = ref(false)
let loaded = false

function apply() {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', isDark.value)
}

function load() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    isDark.value = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // ignore corrupted/blocked storage
  }
  apply()
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, isDark.value ? '1' : '0')
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function useTheme() {
  load()

  function setDark(value: boolean) {
    isDark.value = value
    apply()
    persist()
  }

  function toggleDark() {
    setDark(!isDark.value)
  }

  return { isDark, setDark, toggleDark }
}
