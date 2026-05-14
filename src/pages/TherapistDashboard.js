import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function TherapistDashboard() {
  const [userData, setUserData] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [available, setAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setAvailable(data.available !== false);
      }
    };
    fetchUser();

    // Listen for SOS alerts in real time
    const q = query(collection(db, 'sos_alerts'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, snapshot => {
      setSosAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const toggleAvailability = async () => {
    const newVal = !available;
    setAvailable(newVal);
    await updateDoc(doc(db, 'users', user.uid), { available: newVal });
  };

  const resolveAlert = async (alertId) => {
    await updateDoc(doc(db, 'sos_alerts', alertId), { status: 'resolved' });
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
          <div style={styles.welcome}>Dr. {userData.fullName}</div>
        </div>
        <div style={styles.headerRight}>
          <div
            style={{...styles.availBadge, background: available ? '#16a34a' : '#dc2626'}}
            onClick={toggleAvailability}
          >
            {available ? '🟢 Available' : '🔴 Unavailable'}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{sosAlerts.length}</div>
          <div style={styles.statLabel}>Pending SOS</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>0</div>
          <div style={styles.statLabel}>Active Chats</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>0</div>
          <div style={styles.statLabel}>Sessions Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'sos', 'chats', 'notes'].map(tab => (
          <button
            key={tab}
            style={{...styles.tab, ...(activeTab === tab ? styles.activeTab : {})}}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '🏠 Overview'}
            {tab === 'sos' && `🚨 SOS (${sosAlerts.length})`}
            {tab === 'chats' && '💬 Chats'}
            {tab === 'notes' && '📋 Notes'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.overviewGrid}>
            <div style={styles.actionCard} onClick={() => setActiveTab('sos')}>
              <div style={styles.actionIcon}>🚨</div>
              <div style={styles.actionTitle}>SOS Alerts</div>
              <div style={styles.actionDesc}>
                {sosAlerts.length > 0
                  ? `${sosAlerts.length} client(s) need immediate help`
                  : 'No pending alerts'}
              </div>
            </div>
            <div style={styles.actionCard} onClick={() => setActiveTab('chats')}>
              <div style={styles.actionIcon}>💬</div>
              <div style={styles.actionTitle}>Client Chats</div>
              <div style={styles.actionDesc}>View and respond to messages</div>
            </div>
            <div style={styles.actionCard} onClick={() => navigate('/therapists')}>
              <div style={styles.actionIcon}>👥</div>
              <div style={styles.actionTitle}>My Profile</div>
              <div style={styles.actionDesc}>See how clients see your profile</div>
            </div>
            <div style={styles.actionCard} onClick={() => setActiveTab('notes')}>
              <div style={styles.actionIcon}>📋</div>
              <div style={styles.actionTitle}>Session Notes</div>
              <div style={styles.actionDesc}>Write and view session notes</div>
            </div>
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div style={styles.list}>
            {sosAlerts.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>✅</div>
                <div style={styles.emptyText}>No pending SOS alerts</div>
              </div>
            ) : sosAlerts.map(alert => (
              <div key={alert.id} style={styles.alertCard}>
                <div style={styles.alertInfo}>
                  <div style={styles.alertName}>{alert.clientName || 'Unknown Client'}</div>
                  <div style={styles.alertEmail}>{alert.clientEmail}</div>
                  <div style={styles.alertTime}>
                    {alert.triggeredAt?.toDate().toLocaleString() || 'Just now'}
                  </div>
                </div>
                <div style={styles.alertActions}>
                  <button
                    style={styles.chatAlertBtn}
                    onClick={() => navigate(`/chat/${alert.clientId}`)}
                  >
                    💬 Chat
                  </button>
                  <button
                    style={styles.resolveBtn}
                    onClick={() => resolveAlert(alert.id)}
                  >
                    ✅ Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <div style={styles.emptyText}>No active chats yet</div>
            <div style={styles.emptySubtext}>
              When clients message you, they will appear here
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📋</div>
            <div style={styles.emptyText}>No session notes yet</div>
            <div style={styles.emptySubtext}>
              Notes you write after sessions will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f1f5f9' },
  loading: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a' },
  loadingText: { color: 'white', fontSize: '18px' },
  header: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { color: 'white', fontSize: '18px', fontWeight: 'bold' },
  welcome: { color: '#94a3b8', fontSize: '13px', marginTop: '4px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  availBadge: {
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '16px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statNum: { fontSize: '28px', fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: '11px', color: '#64748b', marginTop: '4px' },
  tabs: {
    display: 'flex',
    gap: '6px',
    padding: '0 16px',
    overflowX: 'auto',
    marginBottom: '8px',
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '10px',
    background: 'white',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    color: 'white',
  },
  content: { padding: '0 16px' },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  actionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  actionIcon: { fontSize: '32px', marginBottom: '10px' },
  actionTitle: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a', marginBottom: '6px' },
  actionDesc: { fontSize: '12px', color: '#64748b', lineHeight: '1.4' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  alertCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid #dc2626',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  alertInfo: {},
  alertName: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  alertEmail: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  alertTime: { fontSize: '11px', color: '#94a3b8', marginTop: '4px' },
  alertActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chatAlertBtn: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  resolveBtn: {
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: 'bold', color: '#0f172a' },
  emptySubtext: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
};

export default TherapistDashboard;