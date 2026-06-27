import React from 'react'

export default function ActiveFilters({ filters = {}, onRemove }) {
  const chips = []
  if (filters.type) chips.push({ key: 'type', value: filters.type })
  if (filters.tag) chips.push({ key: 'tag', value: filters.tag })

  if (!chips.length) return null

  return (
    <div className="active-filters">
      {chips.map((chip) => (
        <span key={chip.key} className="filter-chip">
          <span>{chip.key === 'type' ? `Type: ${chip.value}` : `Tag: ${chip.value}`}</span>
          <button className="filter-chip-remove" type="button" onClick={() => onRemove(chip.key)}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
