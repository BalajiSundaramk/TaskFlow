import React from 'react'
import { formatRelativeTime, formatDueDate } from '../utils/formatDate'

export default function ItemCard({ item, onComplete, onDelete, onTagClick }) {
  const parsedTags = (() => {
    try {
      return JSON.parse(item.tags)
    } catch (e) {
      return []
    }
  })()
  const isOverdue = item.type === 'reminder' && item.remind_at && new Date(item.remind_at) < new Date() && item.status !== 'completed'
  const isCompleted = item.status === 'completed'

  return (
    <div className={`item-card${isOverdue ? ' overdue' : ''}${isCompleted ? ' completed' : ''}`}>
      <div className="item-header">
        <p className="item-content">{item.content}</p>
        <div className="item-actions">
          {item.type === 'task' && (
            <button type="button" className="action-btn complete" onClick={() => onComplete(item.id)}>
              ✓
            </button>
          )}
          <button type="button" className="action-btn delete" onClick={() => onDelete(item.id)}>
            ✕
          </button>
        </div>
      </div>

      <div className="item-meta">
        <span className={`type-badge ${item.type}`}>{item.type}</span>
        <span className="item-time">{formatRelativeTime(item.created_at)}</span>
        {item.remind_at && <span className="due-date">⏰ {formatDueDate(item.remind_at)}</span>}
        {parsedTags.length > 0 && (
          <div className="tags">
            {parsedTags.map((tag) => (
              <button key={tag} type="button" className="tag-pill" onClick={() => onTagClick(tag)}>
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
