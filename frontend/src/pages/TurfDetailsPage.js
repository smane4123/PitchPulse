import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Added FaFutbol - choose an appropriate icon if needed
import { FaWifi, FaParking, FaLightbulb, FaShower, FaMapMarkerAlt, FaRupeeSign, FaSpinner, FaStar, FaRegStar, FaFutbol } from 'react-icons/fa';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import '../App.css';

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Amenities icon helper
const getAmenityIcon = (amenity) => {
  const lower = amenity?.trim().toLowerCase();
  switch (lower) {
    case 'floodlights': return <FaLightbulb title="Floodlights" />;
    case 'parking': return <FaParking title="Parking" />;
    case 'washrooms': case 'changing rooms': case 'shower': return <FaShower title="Washrooms/Changing Rooms" />;
    case 'wifi': return <FaWifi title="WiFi" />;
    case 'drinking water':
    case 'seating':
    default: return null;
  }
};

// Star rating display
const DisplayStars = ({ rating }) => {
  const totalStars = 5;
  const numericRatingValue = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  const fullStars = Math.floor(numericRatingValue);
  const emptyStars = totalStars - fullStars;
  const formattedRating = typeof rating === 'number' && !isNaN(rating) ? rating.toFixed(1) : 'N/A';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ffc107' }}>
      {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
      {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} style={{ color: '#e4e5e9' }} />)}
      <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em', fontWeight: 'bold' }}>
        ({formattedRating})
      </span>
    </div>
  );
};

// Animated background wrapper component
const PageWithAnimatedBackground = ({ children }) => {
  React.useEffect(() => {
    const handleParallax = (e) => {
      const floatingElements = document.querySelectorAll('.fixed-background-layers .ball, .fixed-background-layers .sports-emoji');
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
        body, .app-container, .main-content { background: none !important; background-color: transparent !important; }
        .fixed-background-layers { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; overflow: hidden; }
        .hero-bg, .hero-pattern, .overlay, .floating-elements { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); z-index: 1; }
        .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; z-index: 2; }
        .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); z-index: 3; }
        .floating-elements { pointer-events: none; z-index: 4; }
        @keyframes patternShift { from { transform: translate(0,0); } to { transform: translate(50px,100px); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
        .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255,140,66,0.4); animation: float 6s ease-in-out infinite; }
        .ball:nth-child(1) { top: 15%; left: 10%; } .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
        .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite alternate; filter: grayscale(20%); }
        .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; } .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; } .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; }

        .turf-details-page-wrapper { position: relative; min-height: 100vh; padding: 4rem 1rem; box-sizing: border-box; display: flex; justify-content: center; overflow: hidden; }
        .content { position: relative; z-index: 10; max-width: 1200px; width: 100%; }
        .turf-details-container { background-color: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 2rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1); animation: fadeIn 0.5s ease-out; }
        .turf-details-content h1 { word-wrap: break-word; white-space: normal; margin-bottom: 0.2rem; color: var(--text-dark); }
        .turf-address { color: #666; font-style: italic; margin-bottom: 1rem; }
        .turf-details-image-container img { width: 100%; border-radius: 12px; object-fit: cover; max-height: 400px; margin-bottom: 1.5rem; }
        .rating-summary { margin-bottom: 1rem; }
        .rating-summary p { margin-top: 0.25rem; font-size: 0.9rem; color: #777; }
        .turf-details-info { margin-top: 1.5rem; }
        .turf-details-info h2 { font-size: 1.3rem; color: #444; margin-bottom: 0.8rem; border-bottom: 1px solid #eee; padding-bottom: 0.4rem; }
        .info-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; font-weight: 600; }
        .info-item { display: flex; align-items: center; gap: 0.5rem; color: #555; font-size: 0.95rem; }
        .info-item svg { color: var(--primary-color); }
        .amenities-list { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
        .amenity-item { display: flex; align-items: center; gap: 0.5rem; border: 1px solid #eee; padding: 0.4rem 0.8rem; border-radius: 6px; background-color: #fafafa; font-size: 0.9rem; color: #555; }
        .btn-book-now { margin-top: 2rem; background-color: var(--primary-color); color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; text-align: center; display: block; width: 100%; font-size: 1.1rem; text-decoration: none; }
        .btn-book-now:hover { background-color: var(--secondary-color); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3); }
        .map-container { margin-top: 2.5rem; height: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid rgba(255, 255, 255, 0.18); }
        .icon-spin { animation: spin 1s linear infinite; margin-right: 0.5rem; font-size: 1.5rem; }
        .reviews-card { background-color: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 2rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1); margin-top: 2.5rem; animation: fadeIn 0.5s ease-out 0.2s backwards; }
        .reviews-card h2 { font-size: 1.5rem; color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
        .review-item { border-bottom: 1px dashed #eee; padding: 1.5rem 0; }
        .review-item:last-child { border-bottom: none; padding-bottom: 0; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
        .review-user { font-weight: bold; color: #555; }
        .review-date { font-size: 0.85em; color: #888; }
        .review-comment { font-style: italic; color: #444; margin: 0.75rem 0; line-height: 1.5; }
        .no-reviews-message { color: #777; font-style: italic; text-align: center; padding: 1rem 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="fixed-background-layers">
        <div className="hero-bg"></div>
        <div className="hero-pattern"></div>
        <div className="overlay"></div>
        <div className="floating-elements">
          <div className="ball"></div><div className="ball"></div><div className="ball"></div>
          <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div><div className="sports-emoji">🏐</div>
        </div>
      </div>
      <div className="turf-details-page-wrapper">
        <div className="content">{children}</div>
      </div>
    </>
  );
};

// Main Component
const TurfDetailsPage = () => {
  const { id: turfId } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!turfId || turfId === 'undefined') {
      setError("Invalid Turf ID.");
      setLoading(false);
      return;
    }
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [turfRes, reviewsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/turfs/${turfId}`),
          fetch(`http://localhost:5000/api/reviews/turf/${turfId}`)
        ]);

        if (!turfRes.ok) throw new Error(turfRes.status === 404 ? "Turf not found." : "Failed to fetch details.");
        const turfData = await turfRes.json();
        setTurf(turfData);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        } else {
          console.warn('Could not fetch reviews or no reviews found.');
          setReviews([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [turfId]);

  if (loading) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#333', fontSize: '1.5rem', textAlign: 'center' }}>
          <FaSpinner className="icon-spin" /> Loading Turf Details...
        </div>
      </PageWithAnimatedBackground>
    );
  }

  if (error) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#d93025', background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/home')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Go Home</button>
        </div>
      </PageWithAnimatedBackground>
    );
  }

  if (!turf) {
    return (
      <PageWithAnimatedBackground>
        <div style={{ color: '#333', textAlign: 'center' }}>
          Turf not found.
          <button onClick={() => navigate('/home')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Go Home</button>
        </div>
      </PageWithAnimatedBackground>
    );
  }

  const imageUrl = turf.images?.[0] ? `http://localhost:5000${turf.images[0]}` : 'https://via.placeholder.com/800x400.png?text=PitchPulse';
  const displayPrice = turf.pricePerHour ? `₹${turf.pricePerHour}/hr` : 'N/A';
  const hasCoords = turf.location?.coordinates?.length === 2;

  return (
    <PageWithAnimatedBackground>
      <div className="turf-details-container">
        <div className="turf-details-image-container">
          <img src={imageUrl} alt={turf.name} className="turf-details-image" />
        </div>
        <div className="turf-details-content">
          <h1>{turf.name}</h1>
          {turf.address && <p className="turf-address">{turf.address}</p>}

          <div className="rating-summary">
            {turf.numberOfReviews > 0 ? (
              <>
                <DisplayStars rating={turf.averageRating} />
                <p>({turf.numberOfReviews} reviews)</p>
              </>
            ) : (
              <p style={{ color: '#777', fontStyle: 'italic' }}>No reviews yet.</p>
            )}
          </div>

          <p className="turf-description">{turf.description || 'No description available.'}</p>

          <div className="turf-details-info">
            <h2>Details</h2>
            <div className="info-grid">
              <div className="info-item"><FaMapMarkerAlt /> <span>{turf.address || 'N/A'}</span></div>
              <div className="info-item"><FaRupeeSign /> <span>{displayPrice}</span></div>
              <div className="info-item"><FaFutbol /> <span>{turf.sport || 'Sport not specified'}</span></div>
            </div>
          </div>

          <div className="turf-details-info">
            <h2>Amenities</h2>
            <div className="amenities-list">
              {turf.amenities && turf.amenities.length > 0 ? turf.amenities.map(amenity => (
                <div key={amenity} className="amenity-item">
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              )) : <p style={{color: '#777'}}>No amenities listed.</p>}
            </div>
          </div>

          {/* --- THIS IS THE CORRECTED LINE --- */}
          <button
            onClick={() => navigate(`/book/${turf._id}`)} // Changed from /book/ to /booking/
            className="btn-book-now"
          >
            Proceed to Booking
          </button>
          {/* --------------------------------- */}
        </div>
      </div>

      {hasCoords && (
        <div className="map-container">
          <MapContainer
            center={[turf.location.coordinates[1], turf.location.coordinates[0]]}
            zoom={14}
            style={{ width: '100%', height: '100%', borderRadius: '16px' }}
            scrollWheelZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/>
            <Marker position={[turf.location.coordinates[1], turf.location.coordinates[0]]} />
          </MapContainer>
        </div>
      )}

      <div className="reviews-card">
        <h2>Reviews</h2>
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <span className="review-user">{review.user?.email?.split('@')[0] || review.user?.name || 'Anonymous'}</span>
              <span className="review-date">{review.createdAt ? format(new Date(review.createdAt), 'dd MMM yyyy') : ''}</span>
            </div>
            <DisplayStars rating={review.rating} />
            <p className="review-comment">"{review.comment || 'No comment provided.'}"</p>
          </div>
        )) : <p className="no-reviews-message">Be the first to share your experience!</p>}
      </div>
    </PageWithAnimatedBackground>
  );
};

export default TurfDetailsPage;