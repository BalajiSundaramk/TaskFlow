import React from 'react'
import ItemCard from './ItemCard'
import Spinner from './Spinner'

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

export default function ItemList({ items = [], searchQuery = '', activeFilters = {}, onComplete, onDelete, onTagClick, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="loading-state">
        <Spinner />
      </div>
    )
  }

  const filteredItems = items.filter((item) => {
    const normalizedTags = normalizeTags(item.tags)
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const content = `${item.content || ''} ${normalizedTags.join(' ')}`.toLowerCase()
    const matchesSearch = !normalizedQuery || content.includes(normalizedQuery)
    const matchesType = !activeFilters.type || item.type === activeFilters.type
    const matchesTag = !activeFilters.tag || normalizedTags.some((tag) => tag.toLowerCase() === activeFilters.tag.toLowerCase())

    return matchesSearch && matchesType && matchesTag
  })

  const tasks = filteredItems.filter((item) => item.type === 'task')
  const notes = filteredItems.filter((item) => item.type === 'note')
  const reminders = filteredItems.filter((item) => item.type === 'reminder')

  const renderSection = (title, sectionItems, emptyMessage) => (
    <section className="section">
      <div className="section-header">
        <div className="section-title-row">
          <h3 className="section-title">{title}</h3>
          <span className="section-count">{sectionItems.length}</span>
        </div>
      </div>
      {sectionItems.length === 0 ? (
        <div className="empty-state">{emptyMessage}</div>
      ) : (
        sectionItems.map((item) => (
          <ItemCard key={item.id} item={item} searchQuery={searchQuery} onComplete={onComplete} onDelete={onDelete} onTagClick={onTagClick} />
        ))
      )}
    </section>
  )

  return (
    <div>
      {renderSection('Tasks', tasks, 'No tasks yet. Start with a quick capture and keep momentum going.')}
      {renderSection('Notes', notes, 'No notes yet. Capture reflections and references in one place.')}
      {renderSection('Reminders', reminders, 'No reminders yet. Schedule the next thing that matters.')}
    </div>
  )
}
