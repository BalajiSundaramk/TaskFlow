import React from 'react'

export default function SearchBar({ value, onSearch, count = 0, total = 0 }) {
  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        className="search-input"
        type="text"
        placeholder="Search tasks, notes, reminders..."
        value={value}
        onChange={(event) => onSearch(event.target.value)}
      />
      {value ? (
        <button className="search-clear" type="button" onClick={() => onSearch('')}>
          ×
        </button>
      ) : null}
      <div className="search-meta">
        Showing {count} of {total} items
      </div>
    </div>
  )
}
