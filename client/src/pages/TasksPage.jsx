import React, { useEffect, useState } from 'react';
import axios from 'axios';

const columns = [
  { key: 'pending', title: 'To Do', className: 'task-col-todo', border: 'var(--warning)' },
  { key: 'in-progress', title: 'In Progress', className: 'task-col-progress', border: 'var(--accent)' },
  { key: 'completed', title: 'Done', className: 'task-col-done', border: 'var(--success)' }
];

function getStatusGroup(status) {
  if (status === 'completed') return 'completed';
  if (status === 'in-progress') return 'in-progress';
  return 'pending';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/items?type=task');
      setTasks(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;

    try {
      await axios.post('/api/items', { content: draft.trim(), type: 'task', tags: [] });
      setDraft('');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/items/${id}`, { status });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const groupedTasks = {
    pending: tasks.filter((task) => getStatusGroup(task.status) === 'pending'),
    'in-progress': tasks.filter((task) => getStatusGroup(task.status) === 'in-progress'),
    completed: tasks.filter((task) => getStatusGroup(task.status) === 'completed')
  };

  return (
    <div className="summary-page">
      <form onSubmit={handleAddTask} className="capture-card" style={{ marginBottom: 16 }}>
        <div className="capture-label">Quick add task</div>
        <input className="form-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Capture a new task" />
        <div className="capture-footer" style={{ marginTop: 12 }}>
          <span className="item-time">Type: task</span>
          <button className="capture-btn" type="submit">Add task</button>
        </div>
      </form>

      {isLoading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div className="columns-grid">
          {columns.map((column) => (
            <div key={column.key} className={`column-card ${column.className}`}>
              <div className="column-header" style={{ borderTop: `3px solid ${column.border}` }}>
                <span className="column-title">{column.title}</span>
                <span className="section-count">{groupedTasks[column.key].length}</span>
              </div>
              <div className="column-body">
                {groupedTasks[column.key].length === 0 ? (
                  <div className="empty-state">No tasks here yet.</div>
                ) : (
                  groupedTasks[column.key].map((task) => (
                    <div key={task.id} className="item-card">
                      <div className="item-header">
                        <div className="item-content">{task.content}</div>
                        <div className="item-actions">
                          <button className="action-btn complete" onClick={() => handleStatusChange(task.id, 'completed')} title="Complete">✓</button>
                          <button className="action-btn delete" onClick={() => handleDelete(task.id)} title="Delete">✕</button>
                        </div>
                      </div>
                      <div className="item-meta">
                        <span className="item-time">{new Date(task.created_at).toLocaleDateString()}</span>
                        {task.tags && task.tags !== '[]' ? <span className="tags">{JSON.parse(task.tags).map((tag) => <span key={tag} className="tag-pill">#{tag}</span>)}</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
