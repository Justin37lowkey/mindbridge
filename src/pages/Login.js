import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError('Could not send reset email. Check the email and try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🧠</div>
        <h1 style={styles.title}>MindBridge</h1>
        <p style={styles.subtitle}>Online Consultation & Therapy System</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {resetSent ? (
            <p style={styles.successMsg}>✅ Reset link sent! Check your email.</p>
          ) : (
            <p style={styles.forgotText} onClick={handleForgotPassword}>
              Forgot password?
            </p>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.linkText}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  logo: { fontSize: '48px', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
  },
  forgotText: {
    textAlign: 'right',
    fontSize: '13px',
    color: '#2563eb',
    cursor: 'pointer',
    margin: '0',
  },
  successMsg: {
    textAlign: 'right',
    fontSize: '13px',
    color: '#16a34a',
    margin: '0',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: { color: '#ef4444', fontSize: '13px', margin: '0' },
  link: { marginTop: '20px', fontSize: '14px', color: '#64748b' },
  linkText: { color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' },
};

export default Login;