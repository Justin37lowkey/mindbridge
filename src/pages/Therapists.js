import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapists = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'therapist'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTherapists(list);
      setLoading(false);
    };
    fetchTherapists();
  }, []);

  const demoTherapists = [
    { id: 'demo1', fullName: 'Dr. Abena Mensah', specialization: 'Depression & Anxiety', rating: 4.9, available: true, experience: '8 years', email: 'abena@mindbridge.com' },
    { id: 'demo2', fullName: 'Dr. Kwame Asante', specialization: 'Trauma & PTSD', rating: 4.8, available: true, experience: '12 years', email: 'kwame@mindbridge.com' },
    { id: 'demo3', fullName: 'Dr. Ama Owusu', specialization: 'Grief & Loss', rating: 4.7, available: false, experience: '6 years', email: 'ama@mindbridge.com' },
    { id: 'demo4', fullName: 'Dr. Kofi Boateng', specialization: 'Stress & Burnout', rating: 4.9, available: true, experience: '10 years', email: 'kofi@mindbridge.com' },
  ];

  const allTherapists = [...demoTherapists, ...therapists];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Find a Therapist</h1>
        <div style={styles.placeholder} />
      </div>

      <div style={styles.content}>
        <p style={styles.subtitle}>
          Connect with licensed mental health professionals
        </p>

        {loading ? (
          <div style={styles.loadingText}>Loading therapists...</div>
        ) : (
          <div style={styles.list}>
            {allTherapists.map(therapist => (
              <div key={therapist.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {therapist.fullName?.charAt(0) || 'T'}
                  </div>
                  <div style={styles.info}>
                    <div style={styles.name}>{therapist.fullName}</div>
                    <div style={styles.spec}>
                      {therapist.specialization || 'General Counseling'}
                    </div>
                    <div style={styles.meta}>
                      ⭐ {therapist.rating || '4.8'} • {therapist.experience || '5 years'}
                    </div>
                  </div>
                  <div style={{
                    ...styles.statusDot,
                    background: therapist.available ? '#22c55e' : '#94a3b8'
                  }} />
                </div>

                <div style={styles.availText}>
                  {therapist.available ? '🟢 Available now' : '🔴 Currently busy'}
                </div>

                <div style={styles.cardActions}>
                  <button
                    style={styles.chatBtn}
                    onClick={() => navigate(`/chat/${therapist.id}`)}
                  >
                    💬 Start Chat
                  </button>
                  <button style={styles.videoBtn}>
                    📹 Video Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
  },
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
  title: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  placeholder: { width: '70px' },
  content: { padding: '20px 16px' },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  loadingText: { textAlign: 'center', color: '#64748b', padding: '40px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: '16px', color: '#0f172a' },
  spec: { fontSize: '13px', color: '#7c3aed', marginTop: '2px' },
  meta: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  availText: { fontSize: '13px', color: '#64748b', marginBottom: '14px' },
  cardActions: { display: 'flex', gap: '10px' },
  chatBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  videoBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Therapists;