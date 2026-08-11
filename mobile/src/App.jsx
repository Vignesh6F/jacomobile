import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Home as HomeIcon, Search as SearchIcon, Plus, MessageSquare, User } from 'lucide-react';

import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import PetDetail from './pages/PetDetail';
import PostPet from './pages/PostPet';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#3b82f6' }).catch(() => {});

      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then(h => h.remove()).catch(() => {});
      };
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <Link to="/" className="brand">
          🐾 Jacotail<span>.</span>
        </Link>
        <div className="mobile-header-actions">
          {user ? (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Hi, {user.name || 'User'}
            </span>
          ) : (
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          <Route path="/post" element={<PostPet user={user} />} />
          <Route path="/messages" element={<Messages user={user} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
        </Routes>
      </main>

      <nav className="mobile-bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <HomeIcon size={20} />
          <span>Home</span>
        </Link>
        <Link to="/search" className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
          <SearchIcon size={20} />
          <span>Explore</span>
        </Link>
        <Link to="/post" className="nav-item post-tab-btn">
          <Plus size={24} />
        </Link>
        <Link to="/messages" className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
          <MessageSquare size={20} />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          <span>Messages</span>
        </Link>
        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default App;
