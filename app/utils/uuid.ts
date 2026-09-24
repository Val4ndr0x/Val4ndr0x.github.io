// crypto.randomUUID solo existe en contextos seguros (HTTPS/localhost); en móvil vía http://IP-local no está.
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
    const n = Number(c)
    return (n ^ (Math.floor(Math.random() * 256) & (15 >> (n / 4)))).toString(16)
  })
}
