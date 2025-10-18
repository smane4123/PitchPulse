// src/components/TurfCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Optional: for better UI

const TurfCard = ({ turf }) => {
  // --- THIS IS THE CORRECTED LOGIC ---
  // 1. Check if the 'images' array exists and has at least one image path.
  // 2. Construct the full URL to the image on your backend server.
  const imageUrl = turf.images && turf.images.length > 0
    // The .replace() part fixes potential path issues if you are on Windows
    ? `http://localhost:5000${turf.images[0]}`.replace(/\\/g, '/')
    // A reliable placeholder if no image was uploaded
    : 'https://via.placeholder.com/400x220.png?text=PitchPulse';

  return (
    // The entire card is a link to the details page for better user experience
    <Link to={`/turf/${turf._id}`} className="turf-card">
      <img
        src={imageUrl}
        alt={turf.name || 'Turf'}
        className="turf-card-image"
      />

      <div className="turf-card-content">
        <h3>{turf.name || 'Unnamed Turf'}</h3>
        
        <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaMapMarkerAlt style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          {turf.address || 'No location data'}
        </p>

        {/* Corrected to use 'pricePerHour' which matches your database model */}
        <p className="turf-price">
          {turf.pricePerHour ? `₹${turf.pricePerHour} / hr` : 'Price not available'}
        </p>

      </div>
    </Link>
  );
};

export default TurfCard;