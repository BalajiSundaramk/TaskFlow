import React from 'react'
import ItemCard from './ItemCard'

function applyFilters(items, searchQuery, activeFilters){
  return items.filter(it=>{
    if (activeFilters.type && it.type !== activeFilters.type) return false
    if (activeFilters.tags && activeFilters.tags.length){
      const tags = JSON.parse(it.tags || '[]')
      for (const t of activeFilters.tags) if (!tags.includes(t)) return false
    }
    if (searchQuery){
      const q = searchQuery.toLowerCase()
      if (!it.content.toLowerCase().includes(q)) return false
    }
    return true
  })
}

export default function ItemList({ items=[], searchQuery='', activeFilters, onToggleComplete, onDelete, onTagClick }){
  const filtered = applyFilters(items, searchQuery, activeFilters)
  const groups = { tasks:[], notes:[], reminders:[] }
  for (const it of filtered){
    if (it.type === 'task') groups.tasks.push(it)
    else if (it.type === 'note') groups.notes.push(it)
    else if (it.type === 'reminder') groups.reminders.push(it)
  }

  return (
    <div className="content-grid">
      <section>
        <h3>Tasks</h3>
        {groups.tasks.map(i=> <ItemCard key={i.id} item={i} onToggleComplete={onToggleComplete} onDelete={onDelete} onTagClick={onTagClick} />)}
      </section>
      <section>
        <h3>Notes</h3>
        {groups.notes.map(i=> <ItemCard key={i.id} item={i} onToggleComplete={onToggleComplete} onDelete={onDelete} onTagClick={onTagClick} />)}
      </section>
      <section>
        <h3>Reminders</h3>
        {groups.reminders.map(i=> <ItemCard key={i.id} item={i} onToggleComplete={onToggleComplete} onDelete={onDelete} onTagClick={onTagClick} />)}
      </section>
    </div>
  )
}
