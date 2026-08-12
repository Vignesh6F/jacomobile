import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { MapPin, ShieldCheck } from 'lucide-react';

function Home() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/pets`)
      .then(res => {
        const petList = res.data.pets || res.data || [];
        setPets(Array.isArray(petList) ? petList : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch pets:', err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'All', name: 'All Pets', icon: '🐾' },
    { id: 'Dog', name: 'Dogs', icon: '🐶' },
    { id: 'Cat', name: 'Cats', icon: '🐱' },
    { id: 'Bird', name: 'Birds', icon: '🦜' },
    { id: 'Fish', name: 'Fish', icon: '🐠' },
    { id: 'Parrots', name: 'Parrots', icon: '🦜' }
  ];

  const filteredPets = activeCategory === 'All' 
    ? pets 
    : pets.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

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
        Available Listings ({filteredPets.length})
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
          {filteredPets.map(pet => {
            const now = new Date();
            const isProBoosted = pet.isBoosted && pet.boostExpiresAt && new Date(pet.boostExpiresAt) > now;
            const isCatFeatured = pet.isFeaturedCategory && pet.featuredCategoryExpiresAt && new Date(pet.featuredCategoryExpiresAt) > now;
            const isAdminFeatured = pet.isFeatured && !pet.isBoosted && !pet.isFeaturedCategory;
            const isPromoted = isProBoosted || isCatFeatured || isAdminFeatured;

            return (
              <Link to={`/pet/${pet._id || pet.id}`} key={pet._id || pet.id} className="pet-card" style={{ position: 'relative', textDecoration: 'none' }}>
                {isPromoted && (
                  <span 
                    style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      left: '8px', 
                      backgroundColor: isProBoosted ? '#7c3aed' : '#eab308', 
                      color: 'white', 
                      padding: '3px 7px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold', 
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                    }}
                  >
                    ★ {isProBoosted ? 'Boosted' : 'Featured'}
                  </span>
                )}

                <img 
                  src={(pet.images && pet.images[0]) || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60'} 
                  alt={pet.title || pet.name} 
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                <div className="pet-card-body">
                  <div className="pet-card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet.title || pet.name || 'Pet Listing'}</span>
                    {(pet.sellerId?.isVerifiedSeller || pet.sellerId?.businessVerified) && (
                      <ShieldCheck size={14} color="#1D4ED8" title="Verified Store" />
                    )}
                  </div>
                  <div className="pet-card-price">₹{pet.price?.toLocaleString('en-IN') || 0}</div>
                  <div className="pet-card-location">
                    <MapPin size={12} />
                    <span>{pet.location || pet.city || 'Location N/A'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;
