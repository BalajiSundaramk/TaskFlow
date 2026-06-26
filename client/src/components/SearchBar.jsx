import React from 'react'

export default function SearchBar({ onSearch }) {
  return (
    <div className="search-card">
      <input
        className="search-input"
        type="text"
        placeholder="Search tasks, notes, reminders..."
        onChange={(event) => onSearch(event.target.value)}
      />
    </div>
  )
}
