import React, { useState, useEffect, useRef } from 'react';
import TurfCard from '../components/TurfCard';
import {
  FaFutbol, FaBaseballBall, FaBasketballBall, FaSwimmer, FaVolleyballBall, // ADDED: FaBasketballBall
  FaHockeyPuck, FaSkating, FaTableTennis, FaGolfBall, FaChessPawn,
  FaDumbbell, FaCrosshairs, FaGamepad, FaSpinner
} from 'react-icons/fa';
import { GiShuttlecock, GiTennisRacket, GiPingPongBat } from 'react-icons/gi';

// This wrapper component correctly adds the animated background.
const PageWithAnimatedBackground = ({ children }) => {
    useEffect(() => {
        const handleParallax = (e) => {
            const floatingElements = document.querySelectorAll('.background-container .ball, .background-container .sports-emoji');
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
        <div className="background-container">
            <style>{`
                /* This is the main container for the page */
                .background-container {
                    position: relative; /* Establishes a stacking context */
                    background-color: #f5f5f5; /* Fallback background */
                }
                /* This div holds all fixed background layers */
                .fixed-background-layers {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0; /* Sits at the bottom of the stacking context */
                    overflow: hidden;
                }
                /* Your original page content will be in this wrapper */
                .content-wrapper {
                    position: relative; /* Allows content to scroll over the fixed background */
                    z-index: 1; /* Ensures content is on top of the background */
                }
                .hero-bg, .hero-pattern, .overlay, .floating-elements {
                    position: absolute; /* Positioned relative to the fixed container */
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); }
                .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; }
                .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); }
                .floating-elements { pointer-events: none; }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
                .ball:nth-child(1) { top: 15%; left: 10%; } .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; } .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; } .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; } .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; } .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
            `}</style>

            <div className="fixed-background-layers">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="overlay"></div>
                <div className="floating-elements">
                    <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                    <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div><div className="sports-emoji">🏐</div>
                    <div className="sports-emoji">🎾</div><div className="sports-emoji">🏈</div>
                </div>
            </div>
            
            <div className="content-wrapper">
                {children}
            </div>
        </div>
    );
};


const HomePage = () => {
  const [turfs, setTurfs] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const turfListRef = useRef(null);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/turfs');
        if (!response.ok) {
          throw new Error(`Failed to fetch turfs. Status: ${response.status}`);
        }
        const data = await response.json();
        setTurfs(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching turf data:", err);
        setError("Could not connect to the server or fetch listings. Please ensure your backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchTurfs();
  }, []);

  const handleSportSelection = (sport) => {
    setSelectedSport(sport);
    setTimeout(() => {
      turfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredTurfs = selectedSport
    ? turfs.filter(turf => turf.sport && turf.sport.toLowerCase() === selectedSport.toLowerCase())
    : turfs;

  if (loading) {
    return (
      <PageWithAnimatedBackground>
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
            <h2><FaSpinner className="icon-spin"/> Loading Turfs...</h2>
            <p>Connecting to the PitchPulse database.</p>
        </div>
      </PageWithAnimatedBackground>
    );
  }

  if (error) {
    return (
      <PageWithAnimatedBackground>
        <div className="container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
            <h2>Connection Error</h2>
            <p>{error}</p>
            <p>Please ensure your backend server is running on <code style={{ color: 'red' }}>http://localhost:5000</code> and your MongoDB connection is active.</p>
        </div>
      </PageWithAnimatedBackground>
    );
  }

  return (
    <PageWithAnimatedBackground>
      {/* YOUR ORIGINAL JSX IS PLACED HERE, UNCHANGED */}
      <div className="container">
        <div className="hero">
          <h1>Find Your Pitch <br />
            Ignite Your Pulse</h1>
          <p>Discover premier turfs, courts, and fields across India for all your favorite sports.</p>
        </div>

        <div className="sport-selector">
            <button onClick={() => handleSportSelection(null)} className={`sport-selector-btn ${selectedSport === null ? 'active' : ''}`}>
                All Sports
            </button>
            <button onClick={() => handleSportSelection('Football')} className={`sport-selector-btn ${selectedSport === 'Football' ? 'active' : ''}`}>
                <FaFutbol /> Football
            </button>
            <button onClick={() => handleSportSelection('Cricket')} className={`sport-selector-btn ${selectedSport === 'Cricket' ? 'active' : ''}`}>
                <FaBaseballBall /> Cricket
            </button>
            {/* ADDED BASKETBALL BUTTON */}
            <button onClick={() => handleSportSelection('Basketball')} className={`sport-selector-btn ${selectedSport === 'Basketball' ? 'active' : ''}`}>
                <FaBasketballBall /> Basketball
            </button>
            <button onClick={() => handleSportSelection('Swimming')} className={`sport-selector-btn ${selectedSport === 'Swimming' ? 'active' : ''}`}>
                <FaSwimmer /> Swimming
            </button>
            <button onClick={() => handleSportSelection('Badminton')} className={`sport-selector-btn ${selectedSport === 'Badminton' ? 'active' : ''}`}>
                <GiShuttlecock /> Badminton
            </button>
            <button onClick={() => handleSportSelection('Hockey')} className={`sport-selector-btn ${selectedSport === 'Hockey' ? 'active' : ''}`}>
                <FaHockeyPuck /> Hockey
            </button>
            <button onClick={() => handleSportSelection('Skating')} className={`sport-selector-btn ${selectedSport === 'Skating' ? 'active' : ''}`}>
                <FaSkating /> Skating
            </button>
            <button onClick={() => handleSportSelection('Table Tennis')} className={`sport-selector-btn ${selectedSport === 'Table Tennis' ? 'active' : ''}`}>
                <FaTableTennis /> TT
            </button>
            <button onClick={() => handleSportSelection('Squash')} className={`sport-selector-btn ${selectedSport === 'Squash' ? 'active' : ''}`}>
                <GiTennisRacket /> Squash
            </button>
            <button onClick={() => handleSportSelection('Pickleball')} className={`sport-selector-btn ${selectedSport === 'Pickleball' ? 'active' : ''}`}>
                <GiPingPongBat /> Pickleball
            </button>
            <button onClick={() => handleSportSelection('Volleyball')} className={`sport-selector-btn ${selectedSport === 'Volleyball' ? 'active' : ''}`}>
                <FaVolleyballBall /> Volleyball
            </button>
            <button onClick={() => handleSportSelection('Golf')} className={`sport-selector-btn ${selectedSport === 'Golf' ? 'active' : ''}`}>
                <FaGolfBall /> Golf
            </button>
            <button onClick={() => handleSportSelection('Chess')} className={`sport-selector-btn ${selectedSport === 'Chess' ? 'active' : ''}`}>
                <FaChessPawn /> Chess
            </button>
            <button onClick={() => handleSportSelection('Gym')} className={`sport-selector-btn ${selectedSport === 'Gym' ? 'active' : ''}`}>
                <FaDumbbell /> Gym
            </button>
            <button onClick={() => handleSportSelection('Shooting')} className={`sport-selector-btn ${selectedSport === 'Shooting' ? 'active' : ''}`}>
                <FaCrosshairs /> Shooting
            </button>
            <button onClick={() => handleSportSelection('Console Gaming')} className={`sport-selector-btn ${selectedSport === 'Console Gaming' ? 'active' : ''}`}>
                <FaGamepad /> Gaming
            </button>
        </div>

        <div className="featured-section">
          <h2>Ready to Book Your Game?</h2>
          <p>Explore a wide variety of turfs and facilities for every sport. Find your perfect spot and book instantly!</p>
          <a href="#turf-list-section" className="btn-cta">Book Now! 🚀</a>
        </div>

        <h2 style={{ marginTop: '40px' }} ref={turfListRef}>
          {selectedSport ? `${selectedSport} Listings` : 'All Available Turfs'}
        </h2>
        
        <div className="turf-list" id="turf-list-section">
          {filteredTurfs.length > 0 ? (
            filteredTurfs.map(turf => (
              <TurfCard key={turf._id} turf={turf} />
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              {selectedSport ? `No listings found for ${selectedSport}.` : 'No turfs have been added yet.'}
            </p>
          )}
        </div>
      </div>
    </PageWithAnimatedBackground>
  );
};

export default HomePage;
