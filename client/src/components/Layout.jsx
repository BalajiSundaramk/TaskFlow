import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '◈', label: 'All Items' },
  { path: '/tasks', icon: '✦', label: 'Tasks' },
  { path: '/notes', icon: '◆', label: 'Notes' },
  { path: '/reminders', icon: '◎', label: 'Reminders' },
  { path: '/summary', icon: '▦', label: 'Summary' }
]

export default function Layout({ children, serverConnected = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  const pageTitle = (() => {
    if (location.pathname === '/summary') return 'Summary'
    if (location.pathname === '/tasks') return 'Tasks'
    if (location.pathname === '/notes') return 'Notes'
    if (location.pathname === '/reminders') return 'Reminders'
    return 'All Items'
  })()

  return (
    <div className="app-layout">
      <div className={`overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span>⚡</span>
            <span>TaskFlow</span>
          </div>
          <div className="sidebar-tagline">Capture ideas, tasks, and reminders.</div>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="dark-toggle" type="button" onClick={() => setIsDark((value) => !value)}>
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <button className="hamburger" type="button" onClick={() => setIsSidebarOpen((value) => !value)} aria-label="Toggle sidebar">
            ☰
          </button>
          <div className="top-bar-title">{pageTitle}</div>
          <div className="server-status">
            <span className="status-dot" />
            <span>{serverConnected ? 'Server connected' : 'Connecting...'}</span>
          </div>
        </div>
        <div className="content-area">{children}</div>
      </main>
    </div>
  )
}
