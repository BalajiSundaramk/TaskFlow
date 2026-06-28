import React, { useEffect, useState } from 'react'

const typeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'note', label: 'Note' },
  { value: 'reminder', label: 'Reminder' }
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function QuickAddModal({ isOpen, onClose, onCreate }) {
  const [content, setContent] = useState('')
  const [type, setType] = useState('task')
  const [pendingTag, setPendingTag] = useState('')
  const [tags, setTags] = useState([])
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    if (isOpen) {
      setContent('')
      setType('task')
      setTags([])
      setPendingTag('')
      setDueAt('')
      setPriority('medium')
    }
  }, [isOpen])

  const addTag = () => {
    const raw = pendingTag.trim().replace(/^#/, '')
    if (!raw) return
    const newTags = raw
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((tag) => tag.toLowerCase())
    setTags((prev) => Array.from(new Set([...prev, ...newTags])))
    setPendingTag('')
  }

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((value) => value !== tag))
  }

  const submit = () => {
    if (!content.trim()) return
    const payload = {
      content: content.trim(),
      type,
      tags,
      remind_at: type === 'reminder' && dueAt ? new Date(dueAt).toISOString() : null,
      priority: type === 'task' ? priority : undefined
    }
    onCreate(payload)
  }

  const placeholderMap = {
    task: 'Add a task like “Finish the report”',
    note: 'Capture a quick note or idea...',
    reminder: 'Set a reminder for something important...'
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quick-add-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Quick Add</h2>
            <p className="modal-description">Capture a task, note, or reminder instantly.</p>
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose}>×</button>
        </div>

        <div className="form-row type-toggle-row">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`type-toggle-btn ${type === option.value ? 'active' : ''}`}
              onClick={() => setType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="form-row">
          <label htmlFor="quick-add-content" className="form-label">Content</label>
          <textarea
            id="quick-add-content"
            className="form-input"
            rows="4"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={placeholderMap[type]}
          />
        </div>

        {type === 'task' ? (
          <div className="form-row priority-row">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`priority-btn ${priority === option.value ? 'active' : ''}`}
                  onClick={() => setPriority(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {type === 'reminder' ? (
          <div className="form-row">
            <label htmlFor="quick-add-due" className="form-label">Reminder time</label>
            <input
              id="quick-add-due"
              type="datetime-local"
              className="form-input"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </div>
        ) : null}

        <div className="form-row">
          <label className="form-label">Tags</label>
          <div className="tag-entry-row">
            <input
              type="text"
              className="form-input"
              value={pendingTag}
              onKeyDown={handleKeyDown}
              onChange={(event) => setPendingTag(event.target.value)}
              placeholder="Add tags separated by commas"
            />
            <button className="btn-secondary" type="button" onClick={addTag}>Add</button>
          </div>
          <div className="tags-row">
            {tags.map((tag) => (
              <button key={tag} type="button" className="tag-pill" onClick={() => removeTag(tag)}>
                #{tag} ×
              </button>
            ))}
          </div>
        </div>

        <div className="button-row">
          <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn-primary" type="button" onClick={submit}>Add {type}</button>
        </div>
      </div>
    </div>
  )
}
