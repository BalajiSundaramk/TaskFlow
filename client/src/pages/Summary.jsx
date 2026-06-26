import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { formatRelativeTime } from '../utils/formatDate'

export default function Summary() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/items')
        setItems(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [])

  const tasks = items.filter((item) => item.type === 'task')
  const notes = items.filter((item) => item.type === 'note')
  const reminders = items.filter((item) => item.type === 'reminder')
  const completedTasks = tasks.filter((item) => item.status === 'completed').length
  const pendingTasks = tasks.length - completedTasks
  const now = new Date()
  const todaysItems = items.filter((item) => new Date(item.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000))
  const upcomingReminders = reminders.filter((item) => item.remind_at && new Date(item.remind_at) > now && item.status !== 'completed')
  const overdueReminders = reminders.filter((item) => item.remind_at && new Date(item.remind_at) < now && item.status !== 'completed')

  return (
    <div className="summary-page">
      <h2>Summary</h2>

      {isLoading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="summary-grid">
            <div className="metric-card">
              <div className="metric-label">Total Tasks</div>
              <div className="metric-value">{tasks.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Completed</div>
              <div className="metric-value">{completedTasks}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Pending</div>
              <div className="metric-value">{pendingTasks}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Notes</div>
              <div className="metric-value">{notes.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Reminders</div>
              <div className="metric-value">{reminders.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Upcoming Reminders</div>
              <div className="metric-value">{upcomingReminders.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Overdue Reminders</div>
              <div className="metric-value">{overdueReminders.length}</div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h3>Today's Captures</h3>
            </div>

            {todaysItems.length === 0 ? (
              <div className="empty-state">No captures today</div>
            ) : (
              <div className="summary-list">
                {todaysItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div>
                      <span className={`type-badge ${item.type}`}>{item.type}</span>{' '}
                      <span>{item.content}</span>
                    </div>
                    <span className="muted">{formatRelativeTime(item.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
