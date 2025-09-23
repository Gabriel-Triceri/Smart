export function formatDateTime(dateTime?: string | null) {
  if (!dateTime) return "-"
  const d = new Date(dateTime)
  if (isNaN(d.getTime())) return String(dateTime)
  return d.toLocaleString("pt-BR")
}
