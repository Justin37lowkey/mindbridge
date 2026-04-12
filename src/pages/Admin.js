import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch SOS alerts
      const alertsSnap = await getDocs(
        query(collection(db, 'sos_alerts'), orderBy('triggeredAt', 'desc'))
      );
      setSosAlerts(alertsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      setLoading(false);
    };
    fetchData();
  }, []);

  const resolveAlert = async (alertId) => {
    await updateDoc(doc(db, 'sos_alerts', alertId), { status: 'resolved' });
    setSosAlerts(prev =>
      prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a)
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const stats = {
    totalUsers: users.length,
    clients: users.filter(u => u.role === 'client').length,
    therapists: users.filter(u => u.role === 'therapist').length,
    pendingAlerts: sosAlerts.filter(a => a.status === 'pending').length,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading dashboard...</div>
      ) : (
        <>
          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.clients}</div>
              <div style={styles.statLabel}>Clients</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.therapists}</div>
              <div style={styles.statLabel}>Therapists</div>
            </div>
            <div style={{...styles.statCard, background: stats.pendingAlerts > 0 ? '#fef2f2' : '#f0fdf4'}}>
              <div style={{...styles.statNumber, color: stats.pendingAlerts > 0 ? '#dc2626' : '#16a34a'}}>
                {stats.pendingAlerts}
              </div>
              <div style={styles.statLabel}>Pending SOS</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{...styles.tab, ...(activeTab === 'alerts' ? styles.activeTab : {})}}
              onClick={() => setActiveTab('alerts')}
            >
              🚨 SOS Alerts
            </button>
            <button
              style={{...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {})}}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
          </div>

          {/* SOS Alerts Tab */}
          {activeTab === 'alerts' && (
            <div style={styles.content}>
              {sosAlerts.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>✅</div>
                  <div style={styles.emptyText}>No SOS alerts yet</div>
                </div>
              ) : (
                sosAlerts.map(alert => (
                  <div key={alert.id} style={{
                    ...styles.alertCard,
                    borderLeft: `4px solid ${alert.status === 'pending' ? '#dc2626' : '#22c55e'}`
                  }}>
                    <div style={styles.alertTop}>
                      <div>
                        <div style={styles.alertName}>{alert.clientName || 'Unknown User'}</div>
                        <div style={styles.alertEmail}>{alert.clientEmail}</div>
                        <div style={styles.alertTime}>
                          {alert.triggeredAt?.toDate().toLocaleString() || 'Just now'}
                        </div>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        background: alert.status === 'pending' ? '#fef2f2' : '#f0fdf4',
                        color: alert.status === 'pending' ? '#dc2626' : '#16a34a',
                      }}>
                        {alert.status === 'pending' ? '🔴 Pending' : '✅ Resolved'}
                      </span>
                    </div>
                    {alert.status === 'pending' && (
                      <button
                        style={styles.resolveBtn}
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div style={styles.content}>
              {users.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>👥</div>
                  <div style={styles.emptyText}>No users registered yet</div>
                </div>
              ) : (
                users.map(user => (
                  <div key={user.id} style={styles.userCard}>
                    <div style={styles.userAvatar}>
                      {user.fullName?.charAt(0) || '?'}
                    </div>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.fullName}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                    <span style={{
                      ...styles.roleBadge,
                      background: user.role === 'therapist' ? '#f5f3ff' : '#eff6ff',
                      color: user.role === 'therapist' ? '#7c3aed' : '#2563eb',
                    }}>
                      {user.role === 'therapist' ? '👨‍⚕️' : '👤'} {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
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
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  loadingText: { textAlign: 'center', padding: '40px', color: '#64748b' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
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
  statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: '11px', color: '#64748b', marginTop: '4px' },
  tabs: {
    display: 'flex',
    padding: '0 16px',
    gap: '8px',
    marginBottom: '8px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    color: 'white',
  },
  content: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', color: '#64748b' },
  alertCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  alertTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  alertName: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  alertEmail: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  alertTime: { fontSize: '11px', color: '#94a3b8', marginTop: '4px' },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  resolveBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  userCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  userAvatar: {
    width: '42px',
    height: '42px',
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
  userInfo: { flex: 1 },
  userName: { fontWeight: 'bold', fontSize: '15px', color: '#0f172a' },
  userEmail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default Admin;