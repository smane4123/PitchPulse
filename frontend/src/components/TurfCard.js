// src/components/TurfCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const TurfCard = ({ turf }) => {
  return (
    <div
      className="turf-card"
      data-aos="fade-up"
      data-aos-delay={`${Math.floor(Math.random() * 200)}`} // small stagger effect
    >
      <img
        src={turf.image || '/images/default-turf.jpg'}
        alt={turf.name || 'Turf'}
        className="turf-card-image"
      />

      <div className="turf-card-content">
        <h3>{turf.name || 'Unnamed Turf'}</h3>
        <p>
          {turf.address
            ? turf.address
            : turf.location?.coordinates
            ? turf.location.coordinates.join(', ')
            : 'No location data'}
        </p>
        <p className="turf-price">
          {turf.price ? `₹${turf.price} / hr` : 'Price not available'}
        </p>

        {/* ✅ Fixed the route ID from turf.id → turf._id */}
        <Link to={`/turf/${turf._id}`} className="btn-details">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TurfCard;
