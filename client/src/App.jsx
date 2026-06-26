import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Routes, Route, Link } from 'react-router-dom'
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
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({ type: null, tags: [] })
  const [toast, setToast] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/items')
      setItems(res.data)
    } catch (err) {
      console.error(err)
      showToast('Failed to load items', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const showToast = (message, type='success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCapture = async (text) => {
    const type = detectIntent(text)
    const tags = extractTags(text)
    try {
      const res = await axios.post('/api/items', { content: text, type, tags })
      showToast('Captured', 'success')
      fetchItems()
      return res.data
    } catch (err) {
      showToast('Failed to capture', 'error')
      throw err
    }
  }

  const handleToggleComplete = async (item) => {
    try {
      await axios.patch(`/api/items/${item.id}`, { status: item.status === 'completed' ? 'pending' : 'completed' })
      fetchItems()
    } catch (err) { showToast('Failed to update', 'error') }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`)
      fetchItems()
    } catch (err) { showToast('Failed to delete', 'error') }
  }

  const handleTagClick = (tag) => {
    setActiveFilters(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag] }))
  }

  const handleRemoveFilter = (filterType, value) => {
    if (filterType === 'type') setActiveFilters(prev => ({ ...prev, type: null }))
    if (filterType === 'tag') setActiveFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== value) }))
  }

  return (
    <Layout>
      <div className="topbar">
        <h1>TaskFlow</h1>
      </div>
      <div className="capture-area">
        <CaptureInput onSubmit={handleCapture} />
        <SearchBar onSearch={setSearchQuery} />
        <ActiveFilters filters={activeFilters} onRemove={handleRemoveFilter} />
      </div>

      {loading ? <Spinner /> : (
        <Routes>
          <Route path="/" element={<ItemList items={items} searchQuery={searchQuery} activeFilters={activeFilters} onToggleComplete={handleToggleComplete} onDelete={handleDelete} onTagClick={handleTagClick} />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </Layout>
  )
}
