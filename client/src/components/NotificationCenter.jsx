import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function NotificationCenter({ reminders = [], onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pendingReminders = reminders.filter((item) => item.status !== 'completed');

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button className="notification-bell" type="button" onClick={() => setIsOpen((value) => !value)}>
        🔔
        {pendingReminders.length ? <span className="notif-badge">{pendingReminders.length}</span> : null}
      </button>

      {isOpen ? (
        <div className="notif-panel">
          <div className="notif-header">Upcoming reminders</div>
          {pendingReminders.length ? (
            pendingReminders.map((item) => (
              <div key={item.id} className="notif-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.content}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {new Date(item.remind_at).toLocaleString()}
                  </div>
                </div>
                <button className="mark-done-btn" onClick={() => onComplete(item.id)}>Done</button>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ margin: 12, border: 'none' }}>No pending reminders 🎉</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
