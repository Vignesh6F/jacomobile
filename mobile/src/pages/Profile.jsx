import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Heart, List, Settings, Shield } from 'lucide-react';

function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 700, margin: '0 auto 0.75rem'
        }}>
          {user && user.name ? user.name.charAt(0).toUpperCase() : <User size={36} />}
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user ? user.name : 'Guest User'}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{user ? user.email : 'Log in to manage listings & favorites'}</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
            <Heart size={18} color="var(--color-primary)" /> Saved Favorites
          </Link>
        </div>
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/post" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
            <List size={18} color="var(--color-primary)" /> My Pet Listings
          </Link>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', color: 'inherit', fontWeight: 500 }}>
            <Shield size={18} color="var(--color-primary)" /> Buyer & Seller Protection
          </div>
        </div>
      </div>

      {user ? (
        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: '1rem', color: 'var(--color-danger)' }}>
          <LogOut size={18} /> Logout
        </button>
      ) : (
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Login / Register
        </Link>
      )}
    </div>
  );
}

export default Profile;
