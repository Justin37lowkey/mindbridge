import React from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  const navigate = useNavigate();

  const demoSessions = [
    { id: 1, therapist: 'Dr. Abena Mensah', type: 'Chat Session', date: 'April 14, 2026', duration: '45 mins', status: 'Completed' },
    { id: 2, therapist: 'Dr. Kwame Asante', type: 'Video Call', date: 'April 10, 2026', duration: '30 mins', status: 'Completed' },
    { id: 3, therapist: 'Dr. Ama Owusu', type: 'Chat Session', date: 'April 5, 2026', duration: '60 mins', status: 'Completed' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Session History</h1>
        <div style={styles.placeholder} />
      </div>

      <div style={styles.content}>
        <p style={styles.subtitle}>Your past consultation sessions</p>
        {demoSessions.map(session => (
          <div key={session.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.avatar}>{session.therapist.charAt(0)}</div>
              <div style={styles.info}>
                <div style={styles.therapistName}>{session.therapist}</div>
                <div style={styles.sessionType}>{session.type}</div>
              </div>
              <span style={styles.statusBadge}>✅ {session.status}</span>
            </div>
            <div style={styles.cardBottom}>
              <span style={styles.meta}>📅 {session.date}</span>
              <span style={styles.meta}>⏱ {session.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f1f5f9' },
  header: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: { color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 },
  placeholder: { width: '70px' },
  content: { padding: '20px 16px' },
  subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '20px', textAlign: 'center' },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0,
  },
  info: { flex: 1 },
  therapistName: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  sessionType: { fontSize: '13px', color: '#7c3aed', marginTop: '2px' },
  statusBadge: {
    fontSize: '12px',
    color: '#16a34a',
    background: '#f0fdf4',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  cardBottom: { display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },
  meta: { fontSize: '13px', color: '#64748b' },
};

export default History;