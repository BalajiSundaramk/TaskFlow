import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Navigate, Routes, Route, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import detectIntent from './utils/detectIntent'
import extractTags from './utils/extractTags'
import Layout from './components/Layout'
import CaptureInput from './components/CaptureInput'
import ItemList from './components/ItemList'
import SearchBar from './components/SearchBar'
import ActiveFilters from './components/ActiveFilters'
import SummaryPage from './pages/SummaryPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import ReminderBanner from './components/ReminderBanner'
import TasksPage from './pages/TasksPage'
import NotesPage from './pages/NotesPage'
import RemindersPage from './pages/RemindersPage'
import ReminderPopup from './components/ReminderPopup'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import QuickAddModal from './components/QuickAddModal'

function ProtectedApp({ user, setUser, authToken, setAuthToken }) {
  const [items, setItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [dueReminder, setDueReminder] = useState(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const notifiedRef = useRef(new Set())
  const navigate = useNavigate()
  const location = useLocation()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/items')
      setItems(res.data)
    } catch (error) {
      console.error(error)
      showToast('Failed to load items', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return undefined
    }

    Notification.requestPermission().catch(() => {})

    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const dueItem = items.find((item) => {
        if (item.type !== 'reminder' || item.status === 'completed' || !item.remind_at || notifiedRef.current.has(item.id)) {
          return false
        }
        const remindAt = new Date(item.remind_at).getTime()
        return remindAt <= now && remindAt >= now - 120000
      })

      if (dueItem) {
        notifiedRef.current.add(dueItem.id)
        setDueReminder(dueItem)
        if (Notification.permission === 'granted') {
          const notification = new Notification('TaskFlow Reminder', {
            body: dueItem.content,
            icon: '/favicon.ico'
          })
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
      }
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [items])

  useEffect(() => {
    const handleQuickAddShortcut = (event) => {
      const blockedPaths = ['/login', '/register', '/admin', '/chat']
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (blockedPaths.includes(location.pathname)) return
        event.preventDefault()
        setShowQuickAdd(true)
      }
    }
    window.addEventListener('keydown', handleQuickAddShortcut)
    return () => window.removeEventListener('keydown', handleQuickAddShortcut)
  }, [location.pathname])

  const upcomingReminders = items.filter((item) => item.type === 'reminder' && item.status !== 'completed' && item.remind_at)

  const itemSearchTag = searchParams.get('tag')
  const typeParam = searchParams.get('type')
  const activeType = typeParam === 'task' || typeParam === 'note' || typeParam === 'reminder' ? typeParam : null
  const effectiveFilters = useMemo(() => ({ ...activeFilters, ...(activeType ? { type: activeType } : {}), ...(itemSearchTag ? { tag: itemSearchTag } : {}) }), [activeFilters, activeType, itemSearchTag])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (effectiveFilters.type && item.type !== effectiveFilters.type) return false
      if (effectiveFilters.tag) {
        const tags = JSON.parse(item.tags || '[]')
        if (!tags.includes(effectiveFilters.tag)) return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const tagText = JSON.parse(item.tags || '[]').join(' ')
        if (!item.content.toLowerCase().includes(query) && !item.type.toLowerCase().includes(query) && !tagText.includes(query)) return false
      }
      return true
    })
  }, [items, effectiveFilters, searchQuery])

  const handleCapture = async (text) => {
    if (!text || !text.trim()) return

    const type = detectIntent(text)
    const tags = extractTags(text)

    try {
      setIsLoading(true)
      await axios.post('/api/items', {
        content: text,
        type,
        tags,
        remind_at: null
      })
      await fetchItems()
      showToast(`Captured as ${type}!`, 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to capture item', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAdd = async ({ content, type, tags, remind_at }) => {
    if (!content || !content.trim()) return
    try {
      setIsLoading(true)
      const extractedTags = extractTags(content)
      const allTags = Array.from(new Set([...(tags || []), ...extractedTags]))
      await axios.post('/api/items', {
        content: content.trim(),
        type,
        tags: JSON.stringify(allTags),
        remind_at: remind_at || null
      })
      setShowQuickAdd(false)
      await fetchItems()
      showToast(`Added ${type}!`, 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to add item', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      setIsLoading(true)
      await axios.patch(`/api/items/${id}`, { status: 'completed' })
      if (dueReminder?.id === id) {
        setDueReminder(null)
      }
      await fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to update item', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setIsLoading(true)
      await axios.delete(`/api/items/${id}`)
      await fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to delete item', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagClick = (tag) => {
    setActiveFilters((prev) => ({ ...prev, tag }))
  }

  const handleRemoveFilter = (key) => {
    if (key === 'type') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('type')
      setSearchParams(nextParams, { replace: true })
    }

    if (key === 'tag') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('tag')
      setSearchParams(nextParams, { replace: true })
    }

    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSnooze = async (id, minutes) => {
    try {
      const nextTime = new Date(Date.now() + minutes * 60 * 1000).toISOString()
      await axios.patch(`/api/items/${id}`, { remind_at: nextTime })
      setDueReminder(null)
      await fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Unable to snooze reminder', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('taskflow_token')
    localStorage.removeItem('taskflow_user')
    setAuthToken('')
    setUser(null)
    navigate('/login')
  }

  const renderListView = () => (
    <>
      <CaptureInput onCapture={handleCapture} />
      <SearchBar value={searchQuery} onSearch={setSearchQuery} count={filteredItems.length} total={items.length} />
      <ActiveFilters filters={effectiveFilters} onRemove={handleRemoveFilter} />
      <ItemList
        items={items}
        searchQuery={searchQuery}
        activeFilters={effectiveFilters}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onTagClick={handleTagClick}
        isLoading={isLoading}
      />
    </>
  )

  const currentPath = location.pathname
  const showFab = !['/login', '/register', '/admin', '/chat'].includes(currentPath)

  return (
    <Layout user={user} onLogout={handleLogout} reminders={upcomingReminders} onReminderComplete={handleComplete}>
      <ReminderBanner reminders={upcomingReminders} onComplete={handleComplete} />
      <Routes>
        <Route path="/" element={renderListView()} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminRoute>{<AdminPage />}</AdminRoute>} />
      </Routes>
      <ReminderPopup reminder={dueReminder} onSnooze={handleSnooze} onComplete={handleComplete} onClose={() => setDueReminder(null)} />
      {toast && <Toast message={toast.message} type={toast.type} />}
      {showFab ? <button className="fab" type="button" onClick={() => setShowQuickAdd(true)}>+</button> : null}
      <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} onCreate={handleQuickAdd} />
    </Layout>
  )
}

function AdminRoute({ children }) {
  const stored = localStorage.getItem('taskflow_user')
  const user = stored ? JSON.parse(stored) : null
  if (!user || user.is_admin !== 1) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('taskflow_user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      return null
    }
  })
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('taskflow_token') || '')

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const token = localStorage.getItem('taskflow_token') || ''
      setAuthToken(token)
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        axios.defaults.headers.common['Authorization'] = ''
      }
      try {
        const storedUser = localStorage.getItem('taskflow_user')
        setUser(storedUser ? JSON.parse(storedUser) : null)
      } catch (error) {
        setUser(null)
      }
    }

    const handleAuthChange = () => syncAuthFromStorage()
    window.addEventListener('auth-changed', handleAuthChange)
    syncAuthFromStorage()

    return () => window.removeEventListener('auth-changed', handleAuthChange)
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <ProtectedApp user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

