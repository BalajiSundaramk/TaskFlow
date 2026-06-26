import React from 'react'
import { formatRelativeTime, formatDueDate } from '../utils/formatDate'

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function ItemCard({ item, onComplete, onDelete, onTagClick }) {
  const tags = normalizeTags(item.tags)
  const isReminderOverdue = item.type === 'reminder' && item.remind_at && new Date(item.remind_at) < new Date() && item.status !== 'completed'
  const isCompleted = item.status === 'completed'

  return (
    <div className={`item-card ${isReminderOverdue ? 'reminder-overdue' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="item-main">
        <div className="item-meta">
          <span className={`type-badge ${item.type}`}>{item.type}</span>
          <span className="muted">{formatRelativeTime(item.created_at)}</span>
        </div>

        <p className="content-text">{item.content}</p>

        {item.type === 'reminder' && item.remind_at && (
          <div className="muted">Due {formatDueDate(item.remind_at)}</div>
        )}

        {tags.length > 0 && (
          <div className="tag-row">
            {tags.map((tag) => (
              <button key={tag} type="button" className="tag-pill" onClick={() => onTagClick(tag)}>
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card-actions">
        {item.type === 'task' && (
          <button
            type="button"
            className={`action-btn complete ${isCompleted ? 'active' : ''}`}
            onClick={() => onComplete(item.id)}
            disabled={isCompleted}
          >
            ✓
          </button>
        )}
        <button type="button" className="action-btn delete" onClick={() => onDelete(item.id)}>
          🗑
        </button>
      </div>
    </div>
  )
}
