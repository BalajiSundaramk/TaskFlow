import React from 'react'
import ItemCard from './ItemCard'

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

export default function ItemList({ items = [], searchQuery = '', activeFilters = {}, onComplete, onDelete, onTagClick }) {
  const filteredItems = items.filter((item) => {
    const normalizedTags = normalizeTags(item.tags)
    const content = `${item.content || ''} ${normalizedTags.join(' ')}`.toLowerCase()
    const matchesSearch = !searchQuery || content.includes(searchQuery.toLowerCase())
    const matchesType = !activeFilters.type || item.type === activeFilters.type
    const matchesTag = !activeFilters.tag || normalizedTags.includes(activeFilters.tag)
    return matchesSearch && matchesType && matchesTag
  })

  const tasks = filteredItems.filter((item) => item.type === 'task')
  const notes = filteredItems.filter((item) => item.type === 'note')
  const reminders = filteredItems.filter((item) => item.type === 'reminder')

  const renderSection = (title, sectionItems, emptyMessage) => (
    <section className="section-card">
      <div className="section-header">
        <h3>{title}</h3>
        <span className="section-count">{sectionItems.length}</span>
      </div>
      {sectionItems.length === 0 ? (
        <div className="empty-state">{emptyMessage}</div>
      ) : (
        sectionItems.map((item) => (
          <ItemCard key={item.id} item={item} onComplete={onComplete} onDelete={onDelete} onTagClick={onTagClick} />
        ))
      )}
    </section>
  )

  return (
    <div className="item-list">
      {renderSection('Tasks', tasks, 'No tasks yet')}
      {renderSection('Notes', notes, 'No notes yet')}
      {renderSection('Reminders', reminders, 'No reminders yet')}
    </div>
  )
}
