import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { formatRelativeTime } from '../utils/formatDate'
import Spinner from '../components/Spinner'

export default function Summary() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
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

  const tasks = items.filter((item) => item.type === 'task')
  const notes = items.filter((item) => item.type === 'note')
  const reminders = items.filter((item) => item.type === 'reminder')
  const completedTasks = tasks.filter((item) => item.status === 'completed').length
  const pendingTasks = tasks.length - completedTasks
  const now = new Date()
  const upcomingReminders = reminders.filter((item) => item.remind_at && new Date(item.remind_at) > now && item.status !== 'completed')
  const overdueReminders = reminders.filter((item) => item.remind_at && new Date(item.remind_at) < now && item.status !== 'completed')
  const todaysItems = items.filter((item) => new Date(item.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000))

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
            <div className="metric-card">
              <div className="metric-value">{tasks.length}</div>
              <div className="metric-label">Tasks</div>
            </div>
            <div className="metric-card success">
              <div className="metric-value">{completedTasks}</div>
              <div className="metric-label">Completed</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-value">{pendingTasks}</div>
              <div className="metric-label">Pending</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{notes.length}</div>
              <div className="metric-label">Notes</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{reminders.length}</div>
              <div className="metric-label">Reminders</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-value">{upcomingReminders.length}</div>
              <div className="metric-label">Upcoming</div>
            </div>
            <div className="metric-card danger">
              <div className="metric-value">{overdueReminders.length}</div>
              <div className="metric-label">Overdue</div>
            </div>
          </div>

          <div>
            <h3 className="todays-title">Today's captures</h3>
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
