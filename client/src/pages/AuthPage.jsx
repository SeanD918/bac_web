import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Info, Activity } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking...');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      try {
        await axios.get(`${API}/health`);
        setServerStatus('Online');
      } catch (e) {
        setServerStatus('Offline or Unreachable');
      }
    };
    checkServer();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/community');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          {isLogin ? 'Welcome Back' : 'Join the Community'}
        </h2>
        
        {error && <div style={{ color: '#ef4444', marginBottom: 16, textAlign: 'center', fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="search-input" 
              style={{ width: '100%', paddingLeft: 40 }}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="search-input" 
              style={{ width: '100%', paddingLeft: 40 }}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            className="btn btn-ghost" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ fontSize: 13 }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>

      {/* Debug & Persistence Info Section */}
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 20, fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 'bold', color: 'var(--accent)' }}>
          <Info size={16} /> Connection Info
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>API Endpoint:</span>
          <code style={{ color: 'var(--accent-purple)' }}>{API}</code>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span>Server Status:</span>
          <span style={{ color: serverStatus === 'Online' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
            <Activity size={12} style={{ marginRight: 4 }} /> {serverStatus}
          </span>
        </div>

        <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Test Accounts (Static):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ opacity: 0.8 }}>User: <code style={{ color: '#fff' }}>slim</code></div>
            <div style={{ opacity: 0.8 }}>Pass: <code style={{ color: '#fff' }}>slim123</code></div>
            <div style={{ opacity: 0.8 }}>User: <code style={{ color: '#fff' }}>abes</code></div>
            <div style={{ opacity: 0.8 }}>Pass: <code style={{ color: '#fff' }}>123</code></div>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.4 }}>
          ⚠️ <strong>Persistence Note:</strong> On Vercel, new registrations are stored in temporary memory. 
          If you register on one device, you may not be able to log in from another until you use a static account or register again on that device.
        </p>
      </div>
    </div>
  );
}
