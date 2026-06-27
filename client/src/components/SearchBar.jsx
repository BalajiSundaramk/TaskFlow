import React from 'react'

export default function SearchBar({ value, onSearch }) {
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
    </div>
  )
}
