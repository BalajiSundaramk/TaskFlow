import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'

const navItems = [
  { path: '/', icon: '◈', label: 'All Items' },
  { path: '/tasks', icon: '✦', label: 'Tasks' },
  { path: '/notes', icon: '◆', label: 'Notes' },
  { path: '/reminders', icon: '◎', label: 'Reminders' },
  { path: '/summary', icon: '▦', label: 'Summary' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/admin', icon: '⚙', label: 'Admin Panel', adminOnly: true }
]

export default function Layout({ children, user, onLogout, reminders = [], onReminderComplete }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isServerOnline, setIsServerOnline] = useState(false)
  const [recentTags, setRecentTags] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

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

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get('/api/health')
        setIsServerOnline(true)
      } catch (error) {
        setIsServerOnline(false)
      }
    }

    const loadTags = async () => {
      try {
        const result = await axios.get('/api/items')
        const counts = result.data.reduce((acc, item) => {
          const tags = Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]')
          tags.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1
          })
          return acc
        }, {})
        const sorted = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([tag]) => tag)
        setRecentTags(sorted)
      } catch (error) {
        setRecentTags([])
      }
    }

    checkHealth()
    loadTags()
  }, [])

  const pageTitle = (() => {
    if (location.pathname === '/summary') return 'Summary'
    if (location.pathname === '/tasks') return 'Tasks'
    if (location.pathname === '/notes') return 'Notes'
    if (location.pathname === '/reminders') return 'Reminders'
    if (location.pathname === '/chat') return 'Chat'
    if (location.pathname === '/admin') return 'Admin'
    const typeParam = new URLSearchParams(location.search).get('type')
    if (typeParam === 'task') return 'Tasks'
    if (typeParam === 'note') return 'Notes'
    if (typeParam === 'reminder') return 'Reminders'
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
          {navItems.map((item) => {
            if (item.adminOnly && user?.is_admin !== 1) return null
            const currentType = new URLSearchParams(location.search).get('type')
            const isFilterLink = item.type && item.type === currentType
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${item.adminOnly ? 'admin-link' : ''} ${isActive || isFilterLink ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {recentTags.length > 0 ? (
          <div className="sidebar-tags-section">
            <div className="sidebar-section-label">Recent Tags</div>
            <div className="sidebar-tags">
              {recentTags.map((tag) => (
                <button key={tag} type="button" className="sidebar-tag-pill" onClick={() => navigate(`/?tag=${encodeURIComponent(tag)}`)}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sidebar-footer">
          {user ? (
            <div>
              <div className="user-info">
                <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              {user.is_admin === 1 ? <div className="admin-badge">Admin</div> : null}
              <button className="logout-btn" type="button" onClick={onLogout}>↪ Logout</button>
            </div>
          ) : null}
          <button className="dark-toggle" type="button" onClick={() => setIsDark((value) => !value)} style={{ marginTop: 10 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationCenter reminders={reminders} onComplete={onReminderComplete} />
            <div className={`server-status${isServerOnline ? '' : ' offline'}`}>
              <span className={`status-dot${isServerOnline ? '' : ' offline'}`} />
              <span>{isServerOnline ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="content-area">{children}</div>
      </main>
    </div>
  )
}
