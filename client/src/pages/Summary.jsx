import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { formatRelativeTime } from '../utils/formatDate'

export default function Summary(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ load() }, [])
  const load = async ()=>{
    setLoading(true)
    try { const res = await axios.get('/api/items'); setItems(res.data) }
    catch (e){ console.error(e) }
    finally { setLoading(false) }
  }

  const totalTasks = items.filter(i=>i.type==='task').length
  const completedTasks = items.filter(i=>i.type==='task' && i.status==='completed').length
  const pendingTasks = totalTasks - completedTasks
  const totalNotes = items.filter(i=>i.type==='note').length
  const totalReminders = items.filter(i=>i.type==='reminder').length
  const upcomingReminders = items.filter(i=>i.type==='reminder' && i.remind_at && new Date(i.remind_at) > new Date()).length
  const overdueReminders = items.filter(i=>i.type==='reminder' && i.remind_at && new Date(i.remind_at) < new Date() && i.status !== 'completed').length

  const today = new Date();
  const since = new Date(today.getTime() - 24*60*60*1000);
  const todays = items.filter(i=> new Date(i.created_at) >= since )

  return (
    <div>
      <h2>Summary</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
          <div className="item-card"><strong>Total Tasks</strong><div className="muted">{totalTasks}</div></div>
          <div className="item-card"><strong>Completed Tasks</strong><div className="muted">{completedTasks}</div></div>
          <div className="item-card"><strong>Pending Tasks</strong><div className="muted">{pendingTasks}</div></div>
          <div className="item-card"><strong>Total Notes</strong><div className="muted">{totalNotes}</div></div>
          <div className="item-card"><strong>Total Reminders</strong><div className="muted">{totalReminders}</div></div>
          <div className="item-card"><strong>Upcoming Reminders</strong><div className="muted">{upcomingReminders}</div></div>
          <div className="item-card"><strong>Overdue Reminders</strong><div className="muted">{overdueReminders}</div></div>
        </div>
      )}

      <h3 style={{marginTop:18}}>Today's captures</h3>
      <div style={{display:'grid',gap:8}}>
        {todays.map(i=> <div key={i.id} className="item-card"><div>{i.content}</div><div className="muted">{formatRelativeTime(i.created_at)}</div></div>)}
        {todays.length===0 && <div className="muted">No captures in the last 24 hours</div>}
      </div>
    </div>
  )
}
