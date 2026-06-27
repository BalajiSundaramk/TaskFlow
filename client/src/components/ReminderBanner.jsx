import React, { useState } from 'react'

function getUrgencyLabel(remindAt, content) {
  const diff = new Date(remindAt).getTime() - new Date().getTime()
  if (diff < 0) return `🚨 OVERDUE — ${content}`
  if (diff < 60 * 60 * 1000) return `⏰ ${Math.ceil(diff / 60000)} minutes to go — ${content}`
  if (diff < 2 * 60 * 60 * 1000) return `🔔 1 hour to go — ${content}`
  if (diff < 24 * 60 * 60 * 1000) return `📅 Today — ${content}`
  return `🗓 ${new Date(remindAt).toLocaleDateString()} — ${content}`
}

function getUrgencyColor(remindAt) {
  const diff = new Date(remindAt).getTime() - new Date().getTime()
  if (diff < 0 || diff < 60 * 60 * 1000) return '#dc2626'
  if (diff < 24 * 60 * 60 * 1000) return '#d97706'
  return '#16a34a'
}

export default function ReminderBanner({ reminders = [], onComplete }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || reminders.length === 0) return null

  return (
    <div className="reminder-banner">
      <div className="reminder-banner-header">
        <div className="reminder-banner-title">Upcoming reminders</div>
        <button className="reminder-dismiss" type="button" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
      {reminders.map((item) => (
        <div className="reminder-row" key={item.id}>
          <span className="urgency-dot" style={{ background: getUrgencyColor(item.remind_at) }} />
          <span className="reminder-label">{getUrgencyLabel(item.remind_at, item.content)}</span>
          <button className="mark-done-btn" type="button" onClick={() => onComplete(item.id)}>
            Mark done
          </button>
        </div>
      ))}
    </div>
  )
}
