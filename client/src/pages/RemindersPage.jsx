import React, { useEffect, useState } from 'react';
import axios from 'axios';

function getUrgencyLabel(remindAt) {
  if (!remindAt) return 'No reminder';
  const diff = new Date(remindAt).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  if (diff < 24 * 60 * 60 * 1000) return 'Due soon';
  return 'Upcoming';
}

function getUrgencyStyle(remindAt) {
  if (!remindAt) return { dot: 'var(--border)', label: 'var(--text-secondary)' };
  const diff = new Date(remindAt).getTime() - Date.now();
  if (diff < 0) return { dot: 'var(--danger)', label: 'var(--danger)' };
  if (diff < 24 * 60 * 60 * 1000) return { dot: 'var(--warning)', label: 'var(--warning)' };
  return { dot: 'var(--success)', label: 'var(--success)' };
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);

  const fetchReminders = async () => {
    const response = await axios.get('/api/items?type=reminder');
    setReminders(response.data);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleComplete = async (id) => {
    await axios.patch(`/api/items/${id}`, { status: 'completed' });
    fetchReminders();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/items/${id}`);
    fetchReminders();
  };

  const groups = {
    overdue: reminders.filter((item) => item.status !== 'completed' && new Date(item.remind_at) < new Date()),
    today: reminders.filter((item) => item.status !== 'completed' && new Date(item.remind_at) >= new Date() && new Date(item.remind_at).toDateString() === new Date().toDateString()),
    upcoming: reminders.filter((item) => item.status !== 'completed' && new Date(item.remind_at) >= new Date() && new Date(item.remind_at).toDateString() !== new Date().toDateString()),
    completed: reminders.filter((item) => item.status === 'completed')
  };

  const renderSection = (key, title, color) => {
    const items = groups[key];
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ borderBottomColor: color }}>
          <span className="section-title" style={{ color }}>{title}</span>
          <span className="section-count">{items.length}</span>
        </div>
        <div className="timeline">
          {items.map((item) => {
            const style = getUrgencyStyle(item.remind_at);
            return (
              <div key={item.id} className="timeline-item">
                <span className="timeline-dot" style={{ background: style.dot }} />
                <div className="item-card" style={{ marginBottom: 0 }}>
                  <div className="item-header">
                    <div className="item-content">{item.content}</div>
                    <div className="item-actions">
                      <button className="action-btn complete" onClick={() => handleComplete(item.id)} title="Complete">✓</button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)} title="Delete">✕</button>
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className="item-time">{getUrgencyLabel(item.remind_at)}</span>
                    <span className="due-date" style={{ color: style.label }}>{new Date(item.remind_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="summary-page">
      {renderSection('overdue', 'Overdue', 'var(--danger)')}
      {renderSection('today', 'Today', 'var(--warning)')}
      {renderSection('upcoming', 'Upcoming', 'var(--success)')}
      {renderSection('completed', 'Completed', 'var(--text-muted)')}
      {!reminders.length ? <div className="empty-state">No reminders yet.</div> : null}
    </div>
  );
}
