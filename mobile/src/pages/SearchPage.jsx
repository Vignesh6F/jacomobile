import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Search, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    axios.get(`${API_BASE_URL}/api/pets/search?q=${encodeURIComponent(query)}`)
      .then(res => {
        const petList = res.data.pets || res.data || [];
        setResults(Array.isArray(petList) ? petList : []);
        setSearched(true);
      })
      .catch(err => {
        console.error(err);
        setSearched(true);
      });
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search pets, breeds, locations..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.8rem 1.25rem' }}>
          <Search size={18} />
        </button>
      </form>

      {searched && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Results for "{query}" ({results.length})
          </h2>
          {results.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
              No matching pets found. Try searching for "Golden Retriever", "Persian Cat", or "Parrot".
            </p>
          ) : (
            <div className="pet-grid">
              {results.map(pet => {
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

                    <img src={(pet.images && pet.images[0]) || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60'} alt={pet.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div className="pet-card-body">
                      <div className="pet-card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet.title || pet.name}</span>
                        {(pet.sellerId?.isVerifiedSeller || pet.sellerId?.businessVerified) && (
                          <ShieldCheck size={14} color="#1D4ED8" title="Verified Store" />
                        )}
                      </div>
                      <div className="pet-card-price">₹{pet.price?.toLocaleString('en-IN') || 0}</div>
                      <div className="pet-card-location">
                        <MapPin size={12} />
                        <span>{pet.location || 'N/A'}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
