import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosMessage, setSosMessage] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();
  }, [user]);

  const handleSOS = async () => {
    setSosActive(true);
    setSosMessage('🚨 SOS Alert sent! A counselor will contact you immediately.');
    await addDoc(collection(db, 'sos_alerts'), {
      clientId: user.uid,
      clientEmail: user.email,
      clientName: userData?.fullName || 'Unknown',
      triggeredAt: serverTimestamp(),
      status: 'pending',
    });
    setTimeout(() => {
      setSosMessage('✅ A counselor has been notified and will reach you shortly. You are not alone.');
    }, 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!userData) return (
    <div style={styles.loading}>
      <div style={styles.loadingText}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.logo}>🧠 MindBridge</div>
          <div style={styles.welcome}>Welcome, {userData.fullName}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>

      {/* SOS Button */}
      <div style={styles.sosSection}>
        <button
          onClick={handleSOS}
          style={{...styles.sosButton, background: sosActive ? '#dc2626' : 'linear-gradient(135deg, #dc2626, #991b1b)'}}
          disabled={sosActive}
        >
          🆘 {sosActive ? 'SOS SENT' : 'SOS EMERGENCY'}
        </button>
        {sosMessage && <p style={styles.sosMessage}>{sosMessage}</p>}
        <p style={styles.sosHint}>Press SOS if you are in crisis and need immediate help</p>
      </div>

      {/* Role Badge */}
      <div style={styles.roleBadge}>
        <span style={{...styles.badge, background: userData.role === 'therapist' ? '#7c3aed' : '#2563eb'}}>
          {userData.role === 'therapist' ? '👨‍⚕️ Therapist' : '👤 Client'}
        </span>
      </div>

      {/* Quick Actions */}
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/therapists')}>
          <div style={styles.cardIcon}>👥</div>
          <div style={styles.cardTitle}>Find a Therapist</div>
          <div style={styles.cardDesc}>Browse and connect with licensed counselors</div>
        </div>

        <div style={styles.card} onClick={() => navigate('/therapists')}>
          <div style={styles.cardIcon}>💬</div>
          <div style={styles.cardTitle}>Start a Chat</div>
          <div style={styles.cardDesc}>Send encrypted messages to your therapist</div>
        </div>

        <div style={styles.card} onClick={() => navigate('/history')}>
  <div style={styles.cardIcon}>📋</div>
  <div style={styles.cardTitle}>Session History</div>
  <div style={styles.cardDesc}>View your past consultation sessions</div>
</div>

<div style={styles.card} onClick={() => navigate('/notifications')}>
  <div style={styles.cardIcon}>🔔</div>
  <div style={styles.cardTitle}>Notifications</div>
  <div style={styles.cardDesc}>Check your latest alerts and messages</div>
</div>

        {userData.role === 'therapist' && (
          <div style={styles.card} onClick={() => navigate('/admin')}>
            <div style={styles.cardIcon}>⚙️</div>
            <div style={styles.cardTitle}>Admin Panel</div>
            <div style={styles.cardDesc}>Manage users and view SOS alerts</div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔒</div>
          <div>
            <div style={styles.infoTitle}>End-to-End Encrypted</div>
            <div style={styles.infoDesc}>All your conversations are private and secure</div>
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>⏰</div>
          <div>
            <div style={styles.infoTitle}>24/7 Crisis Support</div>
            <div style={styles.infoDesc}>Our SOS system connects you instantly to help</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: '0 0 40px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f172a',
  },
  loadingText: { color: 'white', fontSize: '18px' },
  header: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { color: 'white', fontSize: '20px', fontWeight: 'bold' },
  welcome: { color: '#94a3b8', fontSize: '13px', marginTop: '4px' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  sosSection: {
    background: '#0f172a',
    padding: '28px 24px',
    textAlign: 'center',
  },
  sosButton: {
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '18px 48px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(220,38,38,0.5)',
    letterSpacing: '1px',
  },
  sosMessage: {
    color: '#fbbf24',
    marginTop: '16px',
    fontSize: '15px',
    fontWeight: '600',
  },
  sosHint: { color: '#64748b', fontSize: '12px', marginTop: '8px' },
  roleBadge: { padding: '16px 24px' },
  badge: {
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    padding: '0 16px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardIcon: { fontSize: '32px', marginBottom: '10px' },
  cardTitle: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a', marginBottom: '6px' },
  cardDesc: { fontSize: '12px', color: '#64748b', lineHeight: '1.4' },
  infoSection: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  infoIcon: { fontSize: '28px' },
  infoTitle: { fontWeight: 'bold', fontSize: '14px', color: '#0f172a' },
  infoDesc: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
};

export default Dashboard;