import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection, addDoc, query, where,
  orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

function SessionNotes({ therapistId }) {
  const [notes, setNotes] = useState([]);
  const [clientName, setClientName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'session_notes'),
      where('therapistId', '==', therapistId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [therapistId]);

  const saveNote = async () => {
    if (!noteText.trim() || !clientName.trim()) return;
    setSaving(true);
    await addDoc(collection(db, 'session_notes'), {
      therapistId,
      clientName,
      note: noteText,
      createdAt: serverTimestamp(),
    });
    setNoteText('');
    setClientName('');
    setShowForm(false);
    setSaving(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString([], {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div>
      {/* Add Note Button */}
      <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
        {showForm ? '✕ Cancel' : '+ Write New Note'}
      </button>

      {/* Note Form */}
      {showForm && (
        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Client Name"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
          <textarea
            style={styles.textarea}
            placeholder="Write your session notes here..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={5}
          />
          <button
            style={styles.saveBtn}
            onClick={saveNote}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Note'}
          </button>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyText}>No session notes yet</div>
          <div style={styles.emptySubtext}>
            Click the button above to write your first note
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {notes.map(note => (
            <div key={note.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.clientName}>👤 {note.clientName}</div>
                <div style={styles.date}>{formatDate(note.createdAt)}</div>
              </div>
              <div style={styles.noteText}>{note.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  addBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  form: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '12px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: 'bold', color: '#0f172a' },
  emptySubtext: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: 'white',
    borderRadius: '14px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  clientName: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  date: { fontSize: '12px', color: '#94a3b8' },
  noteText: { fontSize: '14px', color: '#475569', lineHeight: '1.6' },
};

export default SessionNotes;