import React from 'react';

function Messages({ user }) {
  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Messages & Inquiries</h1>
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          {user ? 'No active chat conversations yet.' : 'Please log in to view your chat messages with sellers and buyers.'}
        </p>
      </div>
    </div>
  );
}

export default Messages;
