import React from 'react'

function formatLabel(key, value) {
  if (key === 'type') return `Type: ${value}`
  if (key === 'tag') return `Tag: ${value}`
  return value
}

export default function ActiveFilters({ filters = {}, onRemove }) {
  const chips = []
  if (filters.type) chips.push({ key: 'type', value: filters.type })
  if (filters.tag) chips.push({ key: 'tag', value: filters.tag })

  if (!chips.length) return null

  return (
    <div className="filters-card">
      <div className="active-filters">
        {chips.map((chip) => (
          <span key={chip.key} className="filter-chip">
            {formatLabel(chip.key, chip.value)}
            <button type="button" onClick={() => onRemove(chip.key)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
