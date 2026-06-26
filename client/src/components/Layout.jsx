import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflow-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('taskflow-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="app-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <h2>TaskFlow</h2>
          <p>Stay focused and clear.</p>
        </div>

        <nav className="nav-links">
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
            All Items
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/?type=task">
            Tasks
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/?type=note">
            Notes
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/?type=reminder">
            Reminders
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/summary">
            Summary
          </NavLink>
        </nav>

        <button className="theme-toggle" onClick={() => setIsDark((value) => !value)}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </aside>

      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main-content">
        <div className="topbar">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen((value) => !value)}>
            ☰
          </button>
          <button className="theme-toggle" onClick={() => setIsDark((value) => !value)}>
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}
