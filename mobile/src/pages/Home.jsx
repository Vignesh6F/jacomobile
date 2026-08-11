import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Search, MapPin, Tag } from 'lucide-react';

function Home() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/pets`)
      .then(res => {
        setPets(res.data.pets || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch pets:', err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', name: 'All Pets', icon: '🐾' },
    { id: 'dogs', name: 'Dogs', icon: '🐶' },
    { id: 'cats', name: 'Cats', icon: '🐱' },
    { id: 'birds', name: 'Birds', icon: '🦜' },
    { id: 'fish', name: 'Fish', icon: '🐠' }
  ];

  const filteredPets = activeCategory === 'all' 
    ? pets 
    : pets.filter(p => (p.category || '').toLowerCase() === activeCategory);

  return (
    <div className="page-container">
      <div className="hero-banner">
        <h1>Find Your Perfect Pet Companion</h1>
        <p>Verified pets, direct seller connection, safe & transparent marketplace.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--color-primary)' : '#fff',
              color: activeCategory === cat.id ? '#fff' : 'var(--color-text)',
              fontWeight: 600,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Featured Pets ({filteredPets.length})
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
          Loading pets...
        </div>
      ) : filteredPets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '12px' }}>
          <p style={{ color: 'var(--color-muted)' }}>No pet listings available under this category.</p>
        </div>
      ) : (
        <div className="pet-grid">
          {filteredPets.map(pet => (
            <Link to={`/pet/${pet._id || pet.id}`} key={pet._id || pet.id} className="pet-card">
              <img 
                src={(pet.images && pet.images[0]) || 'https://via.placeholder.com/300x200?text=Pet+Photo'} 
                alt={pet.title || pet.name} 
              />
              <div className="pet-card-body">
                <div className="pet-card-title">{pet.title || pet.name || 'Pet Listing'}</div>
                <div className="pet-card-price">${pet.price || pet.cost || 0}</div>
                <div className="pet-card-location">
                  <MapPin size={12} />
                  <span>{pet.location || pet.city || 'Location N/A'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
