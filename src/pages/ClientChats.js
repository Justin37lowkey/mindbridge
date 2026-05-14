import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function ClientChats({ therapistId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Get all users who are clients
        const usersSnap = await getDocs(
          query(collection(db, 'users'))
        );
        const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const clientUsers = allUsers.filter(u => u.role === 'client');

        // For each client check if there's a chat with this therapist
        const clientsWithChats = await Promise.all(
          clientUsers.map(async (client) => {
            const chatId = [client.id, therapistId].sort().join('_');
            try {
              const msgsSnap = await getDocs(
                query(
                  collection(db, 'chats', chatId, 'messages'),
                  orderBy('createdAt', 'desc'),
                  limit(1)
                )
              );
              if (!msgsSnap.empty) {
                const lastMsg = msgsSnap.docs[0].data();
                return {
                  ...client,
                  lastMessage: lastMsg.text,
                  lastMessageTime: lastMsg.createdAt,
                  chatId,
                };
              }
            } catch (e) {}
            return null;
          })
        );

        const filtered = clientsWithChats.filter(c => c !== null);
        setClients(filtered);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchClients();
  }, [therapistId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <div style={styles.loading}>Loading client chats...</div>
  );

  if (clients.length === 0) return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>💬</div>
      <div style={styles.emptyText}>No client chats yet</div>
      <div style={styles.emptySubtext}>
        When clients message you they will appear here
      </div>
    </div>
  );

  return (
    <div style={styles.list}>
      {clients.map(client => (
        <div
          key={client.id}
          style={styles.card}
          onClick={() => navigate(`/chat/${client.id}`)}
        >
          <div style={styles.avatar}>
            {client.fullName?.charAt(0) || '?'}
          </div>
          <div style={styles.info}>
            <div style={styles.name}>{client.fullName}</div>
            <div style={styles.lastMsg}>
              {client.lastMessage?.length > 50
                ? client.lastMessage.substring(0, 50) + '...'
                : client.lastMessage}
            </div>
          </div>
          <div style={styles.meta}>
            <div style={styles.time}>{formatTime(client.lastMessageTime)}</div>
            <div style={styles.arrow}>›</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', color: '#64748b' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: 'bold', color: '#0f172a' },
  emptySubtext: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: 'white',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  lastMsg: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  meta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  time: { fontSize: '11px', color: '#94a3b8' },
  arrow: { fontSize: '20px', color: '#94a3b8' },
};

export default ClientChats;