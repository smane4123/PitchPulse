import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaWifi, FaParking, FaLightbulb, FaShower, FaMapMarkerAlt, FaRupeeSign, FaSpinner } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Leaflet default marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper function to map amenities to icons
const getAmenityIcon = (amenity) => {
  switch (amenity) {
    case 'Floodlights': case 'Rental Clubs': case 'Safety Gear':
    case 'Locker Rooms': case 'Restrooms': case 'Vending Machines':
    case 'Snack Bar': case 'Air Conditioning': case 'Heated Pool':
    case 'Bowling Machines': case 'Spectator Stands': case 'Golf Carts':
      return <FaLightbulb />;
    case 'Changing Rooms': case 'Water Stations':
      return <FaShower />;
    case 'Parking':
      return <FaParking />;
    case 'WiFi':
      return <FaWifi />;
    default:
      return null;
  }
};

// Time Slot Selector Booking Component (No changes needed here)
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
    const bookingDate = new Date().toISOString().split('T')[0];

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
          duration: 1,
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
        {bookingLoading ? <FaSpinner className="icon-spin" /> : `Confirm Booking for ${selectedSlot || '...'} (₹${price})`}
      </button>
    </div>
  );
};


// --- BACKGROUND WRAPPER COMPONENT ---
const PageWithAnimatedBackground = ({ children }) => {
    useEffect(() => {
        const handleParallax = (e) => {
            const floatingElements = document.querySelectorAll('.ball, .sports-emoji');
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            floatingElements.forEach((el, index) => {
                const speed = (index % 3 + 1) * 20;
                el.style.transform = `translate(${x * speed}px, ${y * speed}px)`; 
            });
        };
        document.addEventListener('mousemove', handleParallax);
        return () => document.removeEventListener('mousemove', handleParallax);
    }, []);

    return (
        <>
            <style>{`
                .turf-details-page-wrapper { min-height: 100vh; }
                .hero {
                    position: relative; width: 100%; min-height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; padding: 4rem 0;
                }
                .content { position: relative; z-index: 10; width: 100%; }
                .hero-bg, .hero-pattern, .overlay, .floating-elements { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); z-index: 1; }
                .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; z-index: 2; }
                .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); z-index: 3; }
                .floating-elements { pointer-events: none; z-index: 4; }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
                .ball:nth-child(1) { top: 15%; left: 10%; } .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; } .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; } .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; } .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; } .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                .turf-details-container { background-color: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }

                /* --- THIS IS THE NEW CSS RULE TO FIX THE TURF NAME --- */
                .turf-details-content h1 {
                    word-wrap: break-word; /* Allows long words to break and wrap */
                    white-space: normal;   /* Ensures text wraps to a new line */
                }
            `}</style>

            <div className="hero turf-details-page-wrapper">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="overlay"></div>
                <div className="floating-elements">
                    <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                    <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div><div className="sports-emoji">🏐</div>
                    <div className="sports-emoji">🎾</div><div className="sports-emoji">🏈</div>
                </div>
                <div className="content">
                    {children}
                </div>
            </div>
        </>
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
      setError("Error: Invalid Turf ID in URL.");
      setLoading(false);
      return;
    }
    const fetchTurfDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/turfs/${turfId}`); 
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Turf not found." : "Failed to fetch details.");
        }
        const data = await response.json();
        setTurf(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTurfDetails();
  }, [turfId]);

  const handleBookingSuccess = () => setShowTimeSlots(false);
  
  if (loading) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#333', fontSize: '1.5rem' }}>
            <FaSpinner className="icon-spin" /> Loading Turf Details...
        </div>
      </PageWithAnimatedBackground>
    );
  }

  if (error) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#d93025', background: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h2>Error</h2><p>{error}</p>
        </div>
      </PageWithAnimatedBackground>
    );
  }

  if (!turf) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#333' }}>Turf data could not be loaded.</div>
      </PageWithAnimatedBackground>
    );
  }

  // Main component render
  const displayPrice = turf.pricePerHour ? `₹${turf.pricePerHour}/hr` : 'Price not specified';
  const hasCoords = turf.location?.coordinates?.length === 2;

  return (
    <PageWithAnimatedBackground>
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
                <div className="info-item"><FaMapMarkerAlt /> Location: <span>{turf.address || 'Not specified'}</span></div>
                <div className="info-item"><FaRupeeSign /> Price: <span>{displayPrice}</span></div>
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
            <button onClick={() => setShowTimeSlots(!showTimeSlots)} className="btn-book-now">
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
        {hasCoords && (
          <div className="map-container" style={{ marginTop: '40px', height: '400px' }}>
            <MapContainer
              center={[turf.location.coordinates[1], turf.location.coordinates[0]]}
              zoom={14}
              style={{ width: "100%", height: "100%", borderRadius: "8px" }}
              scrollWheelZoom={true}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <Marker position={[turf.location.coordinates[1], turf.location.coordinates[0]]} />
            </MapContainer>
          </div>
        )}
      </div>
    </PageWithAnimatedBackground>
  );
};

export default TurfDetailsPage;