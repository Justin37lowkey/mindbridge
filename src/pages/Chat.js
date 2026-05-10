import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { therapistId } = useParams();
  const navigate = useNavigate();
 const user = auth.currentUser;
  const bottomRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const chatId = [user.uid, therapistId].sort().join('_');

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      senderEmail: user.email,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/therapists')} style={styles.backBtn}>← Back</button>
        <div style={styles.headerCenter}>
          <div style={styles.avatar}>T</div>
          <div>
            <div style={styles.headerName}>Therapist Session</div>
            <div style={styles.headerStatus}>🟢 Secure Connection</div>
          </div>
        </div>
        <div style={styles.placeholder} />
      </div>

      {/* Encryption Notice */}
      <div style={styles.notice}>
        🔒 Messages are securely stored and transmitted. Your privacy is protected.
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <div style={styles.emptyText}>Start your conversation</div>
            <div style={styles.emptySubtext}>
              Your messages are private and secure
            </div>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.senderId === user.uid;
          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              {!isMe && <div style={styles.msgAvatar}>T</div>}
              <div style={{
                ...styles.bubble,
                background: isMe
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : 'white',
                color: isMe ? 'white' : '#0f172a',
                borderBottomRightRadius: isMe ? '4px' : '18px',
                borderBottomLeftRadius: isMe ? '18px' : '4px',
              }}>
                <div style={styles.msgText}>{msg.text}</div>
                <div style={{
                  ...styles.msgTime,
                  color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                }}>
                  {formatTime(msg.createdAt)}
                  {isMe && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={styles.inputArea}>
        <input
          style={styles.input}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button
          type="submit"
          style={styles.sendBtn}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f1f5f9',
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  headerName: { color: 'white', fontWeight: 'bold', fontSize: '15px' },
  headerStatus: { color: '#94a3b8', fontSize: '11px' },
  placeholder: { width: '60px' },
  notice: {
    background: '#ecfdf5',
    color: '#065f46',
    padding: '8px 16px',
    fontSize: '12px',
    textAlign: 'center',
    borderBottom: '1px solid #d1fae5',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '18px', fontWeight: 'bold', color: '#0f172a' },
  emptySubtext: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  msgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  msgText: { fontSize: '15px', lineHeight: '1.4' },
  msgTime: { fontSize: '10px', marginTop: '4px', textAlign: 'right' },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    background: 'white',
    borderTop: '1px solid #e2e8f0',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '25px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    background: '#f8fafc',
  },
  sendBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Chat;