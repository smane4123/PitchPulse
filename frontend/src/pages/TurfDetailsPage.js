// PITCHPULSE/frontend/src/pages/TurfDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaWifi, FaParking, FaLightbulb, FaShower, FaMapMarkerAlt, FaRupeeSign, FaSpinner } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Leaflet default marker icon fix (for React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper function to map amenities to icons
const getAmenityIcon = (amenity) => {
  switch (amenity) {
    case 'Floodlights':
    case 'Rental Clubs':
    case 'Safety Gear':
    case 'Locker Rooms':
    case 'Restrooms':
    case 'Vending Machines':
    case 'Snack Bar':
    case 'Air Conditioning':
    case 'Heated Pool':
    case 'Bowling Machines':
    case 'Spectator Stands':
    case 'Golf Carts':
      return <FaLightbulb />;
    case 'Changing Rooms':
    case 'Water Stations':
      return <FaShower />;
    case 'Parking':
      return <FaParking />;
    case 'WiFi':
      return <FaWifi />;
    default:
      return null;
  }
};

// Time Slot Selector Booking Component
const TimeSlotSelector = ({ turfId, price, onBookingSuccess }) => {
  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
  ];
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const navigate = useNavigate();

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      setBookingError("Please select a time slot first.");
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to book a slot.");
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    setBookingError(null);

    const bookingDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          turfId,
          startTime: selectedSlot,
          date: bookingDate,
          price, 
          duration: 1, // 1 hour
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Booking successful! Confirmation ID: ${data.booking._id}`);
        onBookingSuccess();
      } else {
        const errorData = await response.json();
        setBookingError(errorData.message || "Booking failed. Slot may be unavailable.");
      }
    } catch (err) {
      setBookingError('Network error during booking. Is the backend running?');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="time-slots-container">
      <h3>Available Time Slots (Today)</h3>
      <div className="slots">
        {timeSlots.map((slot, index) => (
          <button 
            key={index} 
            className={`time-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
            onClick={() => setSelectedSlot(slot)}
            disabled={bookingLoading}
          >
            {slot}
          </button>
        ))}
      </div>
      {bookingError && <p style={{ color: 'red', marginTop: '15px' }}>{bookingError}</p>}
      <button 
        className="btn-book-slot-final" 
        onClick={handleBookSlot}
        disabled={!selectedSlot || bookingLoading}
      >
        {bookingLoading ? <FaSpinner className="icon-spin" /> : `Confirm Booking for ${selectedSlot || '...'} (${price})`}
      </button>
    </div>
  );
};

// Main Turf Details Component
const TurfDetailsPage = () => {
  const { id: turfId } = useParams();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  useEffect(() => {
    if (!turfId || turfId === 'undefined') {
      setError("Error: Invalid Turf ID in URL. Please check the link you clicked.");
      setLoading(false);
      return;
    }
    const fetchTurfDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/turfs/${turfId}`); 
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Turf not found with this ID.");
          }
          throw new Error(`Failed to fetch turf details. Status: ${response.status}`);
        }
        const data = await response.json();
        setTurf(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Could not load turf details. Please check the turf ID and server status.");
      } finally {
        setLoading(false);
      }
    };
    fetchTurfDetails();
  }, [turfId]);

  const handleBookNowClick = () => {
    setShowTimeSlots(!showTimeSlots);
  };

  const handleBookingSuccess = () => {
    setShowTimeSlots(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <FaSpinner className="icon-spin" /> Loading Turf Details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2><p>{error}</p>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        Turf data is empty.
      </div>
    );
  }

  const displayPrice = turf.pricePerHour ? `₹${turf.pricePerHour}/hr` : 'Price not specified';
  const displayLocation = turf.location?.coordinates?.length === 2 
    ? `${turf.location.coordinates[1]}, ${turf.location.coordinates[0]}`
    : turf.address || 'Location not specified';

  return (
    <div className="container">
      <div className="turf-details-container">
        <div className="turf-details-image-container">
          <img 
            src={turf.image || turf.images?.[0] || 'placeholder.jpg'} 
            alt={turf.name} 
            className="turf-details-image" 
          />
        </div>
        <div className="turf-details-content">
          <h1>{turf.name}</h1>
          <p className="turf-description">{turf.description}</p>
          <div className="turf-details-info">
            <h2>Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <FaMapMarkerAlt /> Location: <span>{displayLocation}</span>
              </div>
              <div className="info-item">
                <FaRupeeSign /> Price: <span>{displayPrice}</span>
              </div>
            </div>
          </div>
          <div className="turf-details-info">
            <h2>Amenities</h2>
            <div className="amenities-list">
              {turf.amenities && turf.amenities.map(amenity => (
                <div key={amenity} className="amenity-item">
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleBookNowClick} className="btn-book-now">
            {showTimeSlots ? 'Hide Booking Options' : 'Book Now'}
          </button>
          {showTimeSlots && (
            <TimeSlotSelector 
              turfId={turf._id} 
              price={turf.pricePerHour} 
              onBookingSuccess={handleBookingSuccess} 
            />
          )}
        </div>
      </div>
      <div className="map-container" style={{ marginTop: '40px', height: '400px' }}>
        {turf.location?.coordinates?.length === 2 ? (
          <MapContainer
            center={[turf.location.coordinates[1], turf.location.coordinates[0]]} // [lat, lng]
            zoom={14}
            style={{ width: "100%", height: "100%", borderRadius: "8px" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[turf.location.coordinates[1], turf.location.coordinates[0]]} />
          </MapContainer>
        ) : (
          <div style={{ color: 'grey', textAlign: 'center', paddingTop: '120px' }}>
            Map location not available
          </div>
        )}
      </div>
    </div>
  );
};

export default TurfDetailsPage;
