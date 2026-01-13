export function formatTime(dateTimeString?: string): string {
  if (!dateTimeString) return 'N/A'
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateTimeString
  }
}

export function calculateDuration(start?: string, end?: string): string {
  if (!start || !end) return 'N/A'
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    return `${minutes} min`
  } catch {
    return 'N/A'
  }
}
