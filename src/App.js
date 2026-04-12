import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Therapists from './pages/Therapists';
import Admin from './pages/Admin';
import History from './pages/History';
import Notifications from './pages/Notifications';
import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0f172a'}}>
      <div style={{color:'white',fontSize:'18px'}}>Loading...</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/chat/:therapistId" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/therapists" element={user ? <Therapists /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
<Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;