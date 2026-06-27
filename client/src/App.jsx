import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Routes, Route } from 'react-router-dom'
import detectIntent from './utils/detectIntent'
import extractTags from './utils/extractTags'
import Layout from './components/Layout'
import CaptureInput from './components/CaptureInput'
import ItemList from './components/ItemList'
import SearchBar from './components/SearchBar'
import ActiveFilters from './components/ActiveFilters'
import Summary from './pages/Summary'
import Spinner from './components/Spinner'
import Toast from './components/Toast'
import ReminderBanner from './components/ReminderBanner'

export default function App() {
  const [items, setItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const notifiedRef = useRef(new Set())

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
      items.forEach((item) => {
        if (item.type !== 'reminder' || item.status === 'completed' || !item.remind_at) {
          return
        }
        const remindAt = new Date(item.remind_at).getTime()
        const diff = remindAt - now
        if (diff < 0 || diff > 24 * 60 * 60 * 1000) {
          return
        }
        const hourKey = Math.floor(now / (60 * 60 * 1000))
        const notificationKey = `${item.id}:${hourKey}`
        if (notifiedRef.current.has(notificationKey)) {
          return
        }
        notifiedRef.current.add(notificationKey)
        if (Notification.permission === 'granted') {
          const notification = new Notification('TaskFlow Reminder', {
            body: diff < 0 ? `🚨 OVERDUE — ${item.content}` : `⏰ ${item.content}`,
            icon: '/favicon.ico'
          })
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
      })
    }, 300000)

    return () => window.clearInterval(intervalId)
  }, [items])

  const upcomingReminders = items.filter((item) => item.type === 'reminder' && item.status !== 'completed' && item.remind_at)

  const handleCapture = async (text) => {
    if (!text || !text.trim()) return
    const type = detectIntent(text)
    const tags = extractTags(text)
    try {
      await axios.post('/api/items', {
        content: text,
        type,
        tags: JSON.stringify(tags),
        remind_at: null
      })
      await fetchItems()
      showToast(`Captured as ${type}!`, 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to capture item', 'error')
    }
  }

  const handleComplete = async (id) => {
    try {
      await axios.patch(`/api/items/${id}`, { status: 'completed' })
      await fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to update item', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`)
      await fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to delete item', 'error')
    }
  }

  const handleTagClick = (tag) => {
    setActiveFilters((prev) => ({ ...prev, tag }))
  }

  const handleRemoveFilter = (key) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const routeType = window.location.pathname === '/tasks'
    ? 'task'
    : window.location.pathname === '/notes'
      ? 'note'
      : window.location.pathname === '/reminders'
        ? 'reminder'
        : null

  const effectiveFilters = { ...activeFilters, ...(routeType ? { type: routeType } : {}) }

  return (
    <Layout>
      <ReminderBanner reminders={upcomingReminders} onComplete={handleComplete} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <CaptureInput onCapture={handleCapture} />
              <SearchBar value={searchQuery} onSearch={setSearchQuery} />
              <ActiveFilters filters={effectiveFilters} onRemove={handleRemoveFilter} />
              <ItemList items={items} searchQuery={searchQuery} activeFilters={effectiveFilters} onComplete={handleComplete} onDelete={handleDelete} onTagClick={handleTagClick} />
            </>
          }
        />
        <Route
          path="/tasks"
          element={
            <>
              <CaptureInput onCapture={handleCapture} />
              <SearchBar value={searchQuery} onSearch={setSearchQuery} />
              <ActiveFilters filters={effectiveFilters} onRemove={handleRemoveFilter} />
              <ItemList items={items} searchQuery={searchQuery} activeFilters={effectiveFilters} onComplete={handleComplete} onDelete={handleDelete} onTagClick={handleTagClick} />
            </>
          }
        />
        <Route
          path="/notes"
          element={
            <>
              <CaptureInput onCapture={handleCapture} />
              <SearchBar value={searchQuery} onSearch={setSearchQuery} />
              <ActiveFilters filters={effectiveFilters} onRemove={handleRemoveFilter} />
              <ItemList items={items} searchQuery={searchQuery} activeFilters={effectiveFilters} onComplete={handleComplete} onDelete={handleDelete} onTagClick={handleTagClick} />
            </>
          }
        />
        <Route
          path="/reminders"
          element={
            <>
              <CaptureInput onCapture={handleCapture} />
              <SearchBar value={searchQuery} onSearch={setSearchQuery} />
              <ActiveFilters filters={effectiveFilters} onRemove={handleRemoveFilter} />
              <ItemList items={items} searchQuery={searchQuery} activeFilters={effectiveFilters} onComplete={handleComplete} onDelete={handleDelete} onTagClick={handleTagClick} />
            </>
          }
        />
        <Route path="/summary" element={<Summary />} />
      </Routes>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </Layout>
  )
}
