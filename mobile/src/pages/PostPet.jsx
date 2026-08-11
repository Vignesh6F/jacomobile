import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function PostPet({ user }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('dogs');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/pets`, {
      title,
      category,
      price: Number(price),
      location,
      description
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setLoading(false);
      navigate('/');
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
      alert('Listing created successfully!');
      navigate('/');
    });
  };

  return (
    <div className="page-container">
      <div className="card" style={{ padding: '1.25rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Post a Pet Listing</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title / Breed Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Cute Golden Retriever Puppy"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="dogs">Dogs</option>
              <option value="cats">Cats</option>
              <option value="birds">Birds</option>
              <option value="fish">Fish</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="e.g. 350"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. New York, NY"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              rows="4"
              placeholder="Include details about health, vaccination, age, and temperament..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Pet Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostPet;
