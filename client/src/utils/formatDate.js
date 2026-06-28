export function formatRelativeTime(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'just now'

  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 48) return `${days} day${days === 1 ? '' : 's'} ago`

  return date.toDateString()
}

export function formatDueDate(isoString) {
  if (!isoString) return ''

  const date = new Date(isoString)
  const datePart = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${datePart} at ${timePart}`
}

export default {
  formatRelativeTime,
  formatDueDate
}
