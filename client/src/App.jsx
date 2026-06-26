import React, { useEffect, useState } from 'react'
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

export default function App() {
  const [items, setItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({ type: null, tag: null })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

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
      showToast('Item captured successfully', 'success')
      fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to capture item', 'error')
    }
  }

  const handleComplete = async (id) => {
    try {
      await axios.patch(`/api/items/${id}`, { status: 'completed' })
      showToast('Item marked complete', 'success')
      fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to update item', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`)
      showToast('Item deleted', 'success')
      fetchItems()
    } catch (error) {
      console.error(error)
      showToast('Failed to delete item', 'error')
    }
  }

  const handleTagClick = (tag) => {
    setActiveFilters((prev) => ({ ...prev, tag }))
  }

  const handleRemoveFilter = (filterKey) => {
    if (filterKey === 'type') {
      setActiveFilters((prev) => ({ ...prev, type: null }))
    }
    if (filterKey === 'tag') {
      setActiveFilters((prev) => ({ ...prev, tag: null }))
    }
  }

  return (
    <Layout>
      <div className="topbar">
        <div>
          <h1>TaskFlow</h1>
          <p className="muted">Capture ideas, tasks, and reminders in one calm workspace.</p>
        </div>
      </div>

      <div className="capture-area">
        <CaptureInput onCapture={handleCapture} />
        <SearchBar onSearch={setSearchQuery} />
        <ActiveFilters filters={activeFilters} onRemove={handleRemoveFilter} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <ItemList
                items={items}
                searchQuery={searchQuery}
                activeFilters={activeFilters}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onTagClick={handleTagClick}
              />
            }
          />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </Layout>
  )
}
