import React from 'react'
import { formatRelativeTime, formatDueDate } from '../utils/formatDate'
import axios from 'axios'

export default function ItemCard({ item, onToggleComplete, onDelete, onTagClick }){
  const tags = JSON.parse(item.tags || '[]')
  const overdue = item.type === 'reminder' && item.remind_at && new Date(item.remind_at) < new Date() && item.status !== 'completed'

  const toggle = ()=> onToggleComplete && onToggleComplete(item)
  const del = ()=> onDelete && onDelete(item.id)

  return (
    <div className={`item-card ${overdue ? 'overdue' : ''}`}>
      <div className="item-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <span className={`badge ${item.type}`}>{item.type}</span>
            <p className={item.status === 'completed' ? 'strike' : ''}>{item.content}</p>
          </div>
          <div className="controls">
            {item.type === 'task' && <button className="btn" onClick={toggle}>{item.status === 'completed' ? '↺' : '✓'}</button>}
            <button className="btn" onClick={del}>🗑</button>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8,alignItems:'center'}}>
          <div className="tags">
            {tags.map(t=> <div key={t} className="tag" onClick={()=>onTagClick && onTagClick(t)}>{t}</div>)}
          </div>
          <div className="muted">
            <small>{formatRelativeTime(item.created_at)}{item.type === 'reminder' && item.remind_at ? ` • ${formatDueDate(item.remind_at)}` : ''}</small>
          </div>
        </div>
      </div>
    </div>
  )
}
