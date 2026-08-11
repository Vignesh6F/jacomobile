import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { MapPin, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

function PetDetail() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/pets/${id}`)
      .then(res => {
        setPet(res.data.pet || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>Loading details...</div>;
  }

  if (!pet) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>Pet listing not found.</div>;
  }

  return (
    <div className="page-container">
      <div className="card" style={{ padding: 0 }}>
        <img 
          src={(pet.images && pet.images[0]) || 'https://via.placeholder.com/600x400'} 
          alt={pet.title} 
          style={{ width: '100%', height: '260px', objectFit: 'cover' }}
        />
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{pet.title || pet.name}</h1>
              <div style={{ color: 'var(--color-primary)', fontSize: '1.3rem', fontWeight: 700, margin: '0.25rem 0' }}>
                ${pet.price || 0}
              </div>
            </div>
            <button style={{ background: '#fecdd3', color: '#e11d48', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
              <Heart size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <MapPin size={14} />
            <span>{pet.location || pet.city || 'Verified Location'}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
              {pet.description || 'Healthy, vaccinated, and well cared for. Contact the verified seller directly for details and viewing.'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to={`/messages`} className="btn btn-primary">
              <MessageSquare size={18} /> Chat with Seller
            </Link>
            {pet.contactPhone && (
              <a href={`tel:${pet.contactPhone}`} className="btn btn-secondary">
                <Phone size={18} /> Call {pet.contactPhone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetail;
