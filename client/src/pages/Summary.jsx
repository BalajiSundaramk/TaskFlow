import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { formatRelativeTime } from '../utils/formatDate'
import Spinner from '../components/Spinner'

export default function Summary() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true)
      try {
        const res = await axios.get('/api/items')
        setItems(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  const totalTasks = items.filter((item) => item.type === 'task')
  const completedTasks = totalTasks.filter((item) => item.status === 'completed')
  const pendingTasks = totalTasks.length - completedTasks.length
  const totalNotes = items.filter((item) => item.type === 'note')
  const totalReminders = items.filter((item) => item.type === 'reminder')
  const now = new Date()
  const upcomingReminders = totalReminders.filter((item) => item.status !== 'completed' && item.remind_at && new Date(item.remind_at) > now)
  const overdueReminders = totalReminders.filter((item) => item.status !== 'completed' && item.remind_at && new Date(item.remind_at) < now)
  const todaysItems = items.filter((item) => new Date(item.created_at) > new Date(Date.now() - 86400000))

  const metricCards = [
    { value: totalTasks.length, label: 'Total Tasks', className: '' },
    { value: completedTasks.length, label: 'Completed', className: 'success' },
    { value: pendingTasks, label: 'Pending Tasks', className: pendingTasks > 0 ? 'warning' : '' },
    { value: totalNotes.length, label: 'Notes', className: '' },
    { value: totalReminders.length, label: 'Reminders', className: '' },
    { value: upcomingReminders.length, label: 'Upcoming', className: 'success' },
    { value: overdueReminders.length, label: 'Overdue', className: overdueReminders.length > 0 ? 'danger' : '' },
    { value: todaysItems.length, label: "Today's Captures", className: '' }
  ]

  return (
    <div className="summary-page">
      <h1 className="summary-heading">Summary</h1>
      <p className="summary-sub">Your productivity at a glance</p>

      {isLoading ? (
        <div className="loading-state">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            {metricCards.map((card) => (
              <div key={card.label} className={`metric-card${card.className ? ` ${card.className}` : ''}`}>
                <div className="metric-value">{card.value}</div>
                <div className="metric-label">{card.label}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="todays-title">Today's Captures</h3>
            {todaysItems.length === 0 ? (
              <div className="empty-state">No captures today yet.</div>
            ) : (
              todaysItems.map((item) => (
                <div key={item.id} className="today-item">
                  <span className={`type-badge ${item.type}`}>{item.type}</span>
                  <span>{item.content}</span>
                  <span className="item-time">{formatRelativeTime(item.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
