import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }){
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(()=>{
    const stored = localStorage.getItem('taskflow-theme')
    if (stored === 'dark') document.documentElement.classList.add('dark')
  },[])

  const toggleTheme = ()=>{
    const el = document.documentElement
    if (el.classList.contains('dark')){ el.classList.remove('dark'); localStorage.setItem('taskflow-theme','light') }
    else { el.classList.add('dark'); localStorage.setItem('taskflow-theme','dark') }
  }

  return (
    <div className="app-wrapper">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <h2>TaskFlow</h2>
        <nav>
          <Link className="nav-link" to="/">All</Link>
          <Link className="nav-link" to="/?type=task">Tasks</Link>
          <Link className="nav-link" to="/?type=note">Notes</Link>
          <Link className="nav-link" to="/?type=reminder">Reminders</Link>
          <Link className="nav-link" to="/summary">Summary</Link>
        </nav>
      </aside>

      <main className="main">
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
          <button className="sidebar-toggle btn" onClick={()=>setOpen(o=>!o)}>☰</button>
          <div style={{flex:1}}>{location.pathname}</div>
          <button className="btn" onClick={toggleTheme}>Toggle Theme</button>
        </div>
        {children}
      </main>
    </div>
  )
}
