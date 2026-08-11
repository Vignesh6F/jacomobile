import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Search, MapPin } from 'lucide-react';
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
        setResults(res.data.pets || res.data || []);
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
              {results.map(pet => (
                <Link to={`/pet/${pet._id || pet.id}`} key={pet._id || pet.id} className="pet-card">
                  <img src={(pet.images && pet.images[0]) || 'https://via.placeholder.com/300x200'} alt={pet.title} />
                  <div className="pet-card-body">
                    <div className="pet-card-title">{pet.title || pet.name}</div>
                    <div className="pet-card-price">${pet.price || 0}</div>
                    <div className="pet-card-location">
                      <MapPin size={12} />
                      <span>{pet.location || 'N/A'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
