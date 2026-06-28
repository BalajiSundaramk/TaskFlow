import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function getStatusBadge(status) {
  return status === 'suspended' ? 'status-badge suspended' : 'status-badge active';
}

export default function AdminPage() {
  const token = localStorage.getItem('taskflow_token');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copiedUser, setCopiedUser] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const authHeaders = { headers: { Authorization: 'Bearer ' + token } };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const formatCreated = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelative = (iso) => {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' hour' + (hrs > 1 ? 's' : '') + ' ago';
    const days = Math.floor(hrs / 24);
    return days + ' day' + (days > 1 ? 's' : '') + ' ago';
  };

  const fetchData = async () => {
    try {
      setError('');
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users', authHeaders),
        axios.get('/api/admin/stats', authHeaders)
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuspend = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      setError('');
      await axios.patch(`/api/admin/users/${userId}/status`, { status: nextStatus }, authHeaders);
      await fetchData();
      showToast(nextStatus === 'suspended' ? 'User suspended' : 'User activated');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update user status');
    }
  };

  const handleDelete = (userId) => {
    setConfirmDelete(userId);
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      setError('');
      await axios.delete(`/api/admin/users/${confirmDelete}`, authHeaders);
      setConfirmDelete(null);
      await fetchData();
      showToast('User deleted');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete user');
      setConfirmDelete(null);
    }
  };

  const registrationTrend = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const label = date.toLocaleDateString(undefined, { weekday: 'short' });
      const count = users.filter((user) => new Date(user.created_at).toDateString() === date.toDateString()).length;
      days.push({ label, count });
    }

    return days;
  }, [users]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-heading">⚙ Admin Panel</div>
          <div className="admin-sub">Manage users and monitor platform activity</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Platform Stats</button>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {toast ? <div className="toast-notice">{toast}</div> : null}

      {activeTab === 'users' ? (
        <div className="admin-table-wrap">
          <table className="admin-tbl">
            <thead>
              <tr>
                <th style={{ width: '44px' }} />
                <th style={{ width: '160px' }}>User</th>
                <th style={{ width: '160px' }}>Email</th>
                <th style={{ width: '240px' }}>Password Hash</th>
                <th style={{ width: '130px' }}>Created</th>
                <th style={{ width: '130px' }}>Last Login</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="av-circle">{user.name?.[0]?.toUpperCase() ?? '?'}</div>
                  </td>
                  <td>
                    <div className="u-name">{user.name}</div>
                  </td>
                  <td>
                    <div className="u-email">{user.email}</div>
                  </td>
                  <td>
                    <div className="hash-row">
                      <span className="hash-txt">{user.password_hash?.substring(0, 24)}...</span>
                      <button
                        type="button"
                        className="copy-hash"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(user.password_hash);
                            setCopiedUser(user.id);
                            setTimeout(() => setCopiedUser(null), 2000);
                          } catch (clipboardError) {
                            setError('Unable to copy password hash');
                          }
                        }}
                        title="Copy full hash"
                      >
                        ⧉
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="u-date">{formatCreated(user.created_at)}</div>
                  </td>
                  <td>
                    <div className="u-login">
                      {user.last_login ? formatRelative(user.last_login) : <span className="never">Never</span>}
                    </div>
                  </td>
                  <td>
                    <div className="status-col">
                      <span className={`sbadge ${user.status}`}>{user.status === 'active' ? 'Active' : 'Suspended'}</span>
                      {user.is_admin === 1 && <span className="sbadge admin-pill">Admin</span>}
                    </div>
                  </td>
                  <td>
                    <div className="act-row">
                      {user.is_admin === 1 ? (
                        <button className="btn-act disabled" disabled>Admin</button>
                      ) : (
                        <button
                          type="button"
                          className={user.status === 'active' ? 'btn-act suspend' : 'btn-act activate'}
                          onClick={() => handleSuspend(user.id, user.status)}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                      <button
                        type="button"
                        className={user.is_admin === 1 ? 'btn-act disabled' : 'btn-act delete'}
                        disabled={user.is_admin === 1}
                        onClick={() => user.is_admin !== 1 && handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-value">{stats?.totalUsers ?? 0}</div><div className="metric-label">Total Users</div></div>
            <div className="metric-card success"><div className="metric-value">{stats?.activeUsers ?? 0}</div><div className="metric-label">Active Users</div></div>
            <div className="metric-card danger"><div className="metric-value">{stats?.suspendedUsers ?? 0}</div><div className="metric-label">Suspended Users</div></div>
            <div className="metric-card"><div className="metric-value">{stats?.totalItems ?? 0}</div><div className="metric-label">Total Items</div></div>
            <div className="metric-card warning"><div className="metric-value">{stats?.totalTasks ?? 0}</div><div className="metric-label">Total Tasks</div></div>
            <div className="metric-card"><div className="metric-value">{stats?.totalNotes ?? 0}</div><div className="metric-label">Total Notes</div></div>
            <div className="metric-card accent"><div className="metric-value">{stats?.totalReminders ?? 0}</div><div className="metric-label">Total Reminders</div></div>
          </div>

          <div className="admin-chart-card">
            <div className="section-title">User registration trend</div>
            <svg viewBox="0 0 560 220" width="100%" height="220">
              <g>
                {registrationTrend.map((point, index) => {
                  const count = point.count
                  const x = 40 + index * 72
                  const height = Math.max(20, count * 22)
                  return (
                    <g key={point.label}>
                      <rect x={x} y={200 - height} width="32" height={height} rx="8" fill="var(--accent)" />
                      <text x={x + 16} y="215" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">{point.label}</text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">⚠️</div>
            <div className="confirm-title">Delete User?</div>
            <div className="confirm-body">This will permanently delete the user account and ALL their tasks, notes, and reminders. This cannot be undone.</div>
            <div className="confirm-actions">
              <button type="button" className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={confirmDeleteUser}>Delete Permanently</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
