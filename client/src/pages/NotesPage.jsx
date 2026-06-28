import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');

  const fetchNotes = async () => {
    const response = await axios.get('/api/items?type=note');
    setNotes(response.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const search = query.toLowerCase();
    return note.content.toLowerCase().includes(search) || JSON.stringify(note.tags).toLowerCase().includes(search);
  });

  const handleDelete = async (id) => {
    await axios.delete(`/api/items/${id}`);
    fetchNotes();
  };

  return (
    <div className="summary-page">
      <div className="search-wrapper" style={{ marginBottom: 16 }}>
        <span className="search-icon">⌕</span>
        <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" />
      </div>
      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="item-header">
              <div className="item-content">{note.content}</div>
              <button className="action-btn delete" onClick={() => handleDelete(note.id)} title="Delete">✕</button>
            </div>
            <div className="item-meta">
              <span className="item-time">{new Date(note.created_at).toLocaleDateString()}</span>
              {note.tags && note.tags !== '[]' ? (
                <span className="tags">{JSON.parse(note.tags).map((tag) => <span key={tag} className="tag-pill">#{tag}</span>)}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {filteredNotes.length === 0 ? <div className="empty-state" style={{ marginTop: 16 }}>No notes found.</div> : null}
    </div>
  );
}
