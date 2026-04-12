import React from 'react';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    { id: 1, icon: '💬', title: 'New message', desc: 'Dr. Abena Mensah sent you a message', time: '2 hours ago', unread: true },
    { id: 2, icon: '📅', title: 'Session Reminder', desc: 'You have a session tomorrow at 10am', time: '5 hours ago', unread: true },
    { id: 3, icon: '✅', title: 'Session Completed', desc: 'Your session with Dr. Kwame has ended', time: 'Yesterday', unread: false },
    { id: 4, icon: '🆘', title: 'SOS Response', desc: 'A counselor responded to your SOS alert', time: '2 days ago', unread: false },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Notifications</h1>
        <div style={styles.placeholder} />
      </div>

      <div style={styles.content}>
        {notifications.map(notif => (
          <div key={notif.id} style={{
            ...styles.card,
            background: notif.unread ? '#eff6ff' : 'white',
            borderLeft: notif.unread ? '4px solid #2563eb' : '4px solid transparent',
          }}>
            <div style={styles.iconBox}>{notif.icon}</div>
            <div style={styles.info}>
              <div style={styles.notifTitle}>{notif.title}</div>
              <div style={styles.notifDesc}>{notif.desc}</div>
              <div style={styles.notifTime}>{notif.time}</div>
            </div>
            {notif.unread && <div style={styles.unreadDot} />}
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
  content: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  iconBox: { fontSize: '28px', flexShrink: 0 },
  info: { flex: 1 },
  notifTitle: { fontWeight: 'bold', fontSize: '14px', color: '#0f172a' },
  notifDesc: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  notifTime: { fontSize: '11px', color: '#94a3b8', marginTop: '4px' },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#2563eb',
    flexShrink: 0,
  },
};

export default Notifications;