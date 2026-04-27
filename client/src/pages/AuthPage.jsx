import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

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
    </div>
  );
}
