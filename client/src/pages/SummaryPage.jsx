import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function getGreeting(userName = 'there') {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${userName}!`;
  if (hour < 18) return `Good afternoon, ${userName}!`;
  return `Good evening, ${userName}!`;
}

function RingChart({ value, total, color, label, size = 160 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (value / total) * circumference : 0;

  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="var(--border)" strokeWidth="16" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="donut-label">{label}</div>
    </div>
  );
}

export default function SummaryPage() {
  const [items, setItems] = useState([]);
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    const storedUser = localStorage.getItem('taskflow_user');
    if (storedUser) {
      setUserName(JSON.parse(storedUser).name || 'there');
    }

    const fetchItems = async () => {
      const response = await axios.get('/api/items');
      setItems(response.data);
    };

    fetchItems();
  }, []);

  const metrics = useMemo(() => {
    const tasks = items.filter((item) => item.type === 'task');
    const reminders = items.filter((item) => item.type === 'reminder');
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const overdueReminders = reminders.filter((item) => item.status !== 'completed' && new Date(item.remind_at) < new Date()).length;
    const upcomingReminders = reminders.filter((item) => item.status !== 'completed' && new Date(item.remind_at) >= new Date()).length;

    return {
      totalItems: items.length,
      tasksDone: completedTasks,
      notes: items.filter((item) => item.type === 'note').length,
      reminders: reminders.length,
      completedTasks,
      totalTasks: tasks.length,
      overdueReminders,
      upcomingReminders,
      productivityScore: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
    };
  }, [items]);

  const activityBars = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = Array(7).fill(0);
    items.forEach((item) => {
      const dayIndex = new Date(item.created_at).getDay();
      const normalized = dayIndex === 0 ? 6 : dayIndex - 1;
      counts[normalized] += 1;
    });
    return days.map((day, index) => ({ day, count: counts[index] }));
  }, [items]);

  const todayItems = useMemo(() => items.filter((item) => new Date(item.created_at).toDateString() === new Date().toDateString()), [items]);

  return (
    <div className="summary-page">
      <h2 className="summary-heading">{getGreeting(userName)}</h2>
      <p className="summary-sub">Here is a focused view of your productivity.</p>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalItems}</div>
          <div className="metric-label">Total items</div>
        </div>
        <div className="metric-card success">
          <div className="metric-value">{metrics.tasksDone}</div>
          <div className="metric-label">Tasks done</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.notes}</div>
          <div className="metric-label">Notes</div>
        </div>
        <div className="metric-card warning">
          <div className="metric-value">{metrics.reminders}</div>
          <div className="metric-label">Reminders</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="activity-chart">
          <RingChart value={metrics.completedTasks} total={metrics.totalTasks} color="var(--success)" label="Task progress" />
        </div>
        <div className="activity-chart">
          <RingChart value={metrics.upcomingReminders} total={Math.max(metrics.overdueReminders + metrics.upcomingReminders, 1)} color="var(--warning)" label="Reminder status" />
        </div>
      </div>

      <div className="activity-chart" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Activity</div>
        <svg viewBox="0 0 500 200" width="100%" height="200">
          {activityBars.map((bar, index) => (
            <g key={bar.day}>
              <rect x={40 + index * 60} y={160 - bar.count * 20} width="32" height={bar.count * 20} rx="4" fill="var(--accent)" />
              <text x={56 + index * 60} y="180" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">{bar.day}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="activity-chart" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Today&apos;s timeline</div>
        {todayItems.length ? todayItems.map((item) => (
          <div key={item.id} className="today-item">
            <span className={`type-badge ${item.type}`}>{item.type}</span>
            <span>{item.content}</span>
          </div>
        )) : <div className="empty-state">Nothing captured today yet.</div>}
      </div>

      <div className="activity-chart">
        <div className="section-title" style={{ marginBottom: 12 }}>Productivity score</div>
        <div className="donut-chart">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="60" stroke="var(--border)" strokeWidth="16" fill="none" />
            <circle cx="80" cy="80" r="60" stroke="var(--accent)" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray={`${(metrics.productivityScore / 100) * 376} 376`} transform="rotate(-90 80 80)" />
          </svg>
          <div className="donut-label" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{metrics.productivityScore}%</div>
        </div>
      </div>
    </div>
  );
}
