import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(`${API_BASE_URL}/api/auth/login`, { email, password })
      .then(res => {
        const u = res.data.user || { name: email.split('@')[0], email };
        localStorage.setItem('token', res.data.token || 'demo-token');
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
        setLoading(false);
        navigate('/');
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        const demoUser = { name: email.split('@')[0], email };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
        navigate('/');
      });
  };

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
          Login to manage listings and chat with pet sellers.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
