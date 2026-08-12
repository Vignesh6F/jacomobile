import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User, LogOut, Heart, List, Shield, Copy, Check, Rocket, Star } from 'lucide-react';

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [myPets, setMyPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const token = localStorage.getItem('token');
  const plan = user?.subscriptionPlan || 'free';

  useEffect(() => {
    if (user && token) {
      setLoadingPets(true);
      axios.get(`${API_BASE_URL}/api/pets/seller/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setMyPets(res.data.pets || res.data || []);
        setLoadingPets(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPets(false);
      });
    }
  }, [user, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBoost = async (petId) => {
    setActionMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/pets/${petId}/boost`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMsg('🚀 Listing boosted for 7 days!');
      // Refresh list
      const refreshed = await axios.get(`${API_BASE_URL}/api/pets/seller/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPets(refreshed.data.pets || refreshed.data || []);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to boost listing.');
    }
  };

  const handleFeatureCategory = async (petId) => {
    setActionMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/pets/${petId}/feature-category`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionMsg('⭐ Category featured for 7 days!');
      // Refresh list
      const refreshed = await axios.get(`${API_BASE_URL}/api/pets/seller/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPets(refreshed.data.pets || refreshed.data || []);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to feature listing.');
    }
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {user ? user.name : 'Guest User'}
          {user && (
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: plan === 'pro' ? '#7C3AED' : plan === 'growth' ? '#D97706' : '#3B82F6',
              color: 'white',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}>
              {plan}
            </span>
          )}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{user ? user.email : 'Log in to manage listings & favorites'}</p>

        {/* Seller Referral Code Section */}
        {user && user.referralCode && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px dashed #BFDBFE' }}>
            <span style={{ fontSize: '0.75rem', color: '#1E40AF', display: 'block', fontWeight: 600 }}>Your Referral Code</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1rem', color: '#1D4ED8', letterSpacing: '1px' }}>{user.referralCode}</strong>
              <button onClick={handleCopyReferral} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8' }}>
                {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {actionMsg && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
          {actionMsg}
        </div>
      )}

      {/* Seller Listings Section with Boost Controls */}
      {user && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>My Pet Listings</h3>
          {loadingPets ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Loading your listings...</p>
          ) : myPets.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>No active listings posted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myPets.map(pet => {
                const now = new Date();
                const isBoosted = pet.isBoosted && pet.boostExpiresAt && new Date(pet.boostExpiresAt) > now;
                const isCatFeatured = pet.isFeaturedCategory && pet.featuredCategoryExpiresAt && new Date(pet.featuredCategoryExpiresAt) > now;

                return (
                  <div key={pet._id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{pet.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>₹{pet.price}</span>
                    </div>
                    
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {plan === 'pro' && (
                        <button 
                          onClick={() => handleBoost(pet._id)}
                          style={{
                            flex: 1,
                            padding: '0.4rem',
                            borderRadius: '6px',
                            border: '1px solid #7C3AED',
                            backgroundColor: isBoosted ? '#7C3AED' : '#F3E8FF',
                            color: isBoosted ? 'white' : '#7C3AED',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Rocket size={12} /> {isBoosted ? 'Boosted' : 'Boost (7 Days)'}
                        </button>
                      )}

                      {['growth', 'pro'].includes(plan) && (
                        <button 
                          onClick={() => handleFeatureCategory(pet._id)}
                          style={{
                            flex: 1,
                            padding: '0.4rem',
                            borderRadius: '6px',
                            border: '1px solid #D97706',
                            backgroundColor: isCatFeatured ? '#D97706' : '#FEF3C7',
                            color: isCatFeatured ? 'white' : '#B45309',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Star size={12} /> {isCatFeatured ? 'Featured' : 'Feature (7 Days)'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
            <Heart size={18} color="var(--color-primary)" /> Saved Favorites
          </Link>
        </div>
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/post" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
            <List size={18} color="var(--color-primary)" /> Post New Listing
          </Link>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', color: 'inherit', fontWeight: 500 }}>
            <Shield size={18} color="var(--color-primary)" /> Buyer &amp; Seller Protection
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
