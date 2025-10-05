import React, { useState, useEffect } from 'react';
import TurfCard from '../components/TurfCard'; 
import {
    FaFutbol, FaBaseballBall, FaSwimmer, FaVolleyballBall, FaHockeyPuck, FaSkating,
    FaTableTennis, FaGolfBall, FaChessPawn, FaDumbbell, FaCrosshairs, FaGamepad, FaHandshake, FaHandPointRight
} from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi'; 

const HomePage = () => {
    const [turfs, setTurfs] = useState([]); 
    const [selectedSport, setSelectedSport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const filteredTurfs = selectedSport
        ? turfs.filter(turf => turf.sport && turf.sport.toLowerCase() === selectedSport.toLowerCase())
        : turfs;

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading Turfs...</h2>
                <p>Connecting to the PitchPulse database.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <p>Please ensure your backend server is running on <code style={{ color: 'red' }}>http://localhost:5000</code> and your MongoDB connection is active.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="hero">
                <h1>Find Your Pitch <br />
                    Ignite Your Pulse</h1>
                <p>Discover premier turfs, courts, and fields across India for all your favorite sports.</p>
            </div>

            <div className="sport-selector">
                <button
                    onClick={() => setSelectedSport(null)}
                    className={`sport-selector-btn ${selectedSport === null ? 'active' : ''}`}
                >
                    All Sports
                </button>
                <button
                    onClick={() => setSelectedSport('Football')}
                    className={`sport-selector-btn ${selectedSport === 'Football' ? 'active' : ''}`}
                >
                    <FaFutbol /> Football
                </button>
                <button
                    onClick={() => setSelectedSport('Cricket')}
                    className={`sport-selector-btn ${selectedSport === 'Cricket' ? 'active' : ''}`}
                >
                    <FaBaseballBall /> Cricket
                </button>
                <button
                    onClick={() => setSelectedSport('Swimming')}
                    className={`sport-selector-btn ${selectedSport === 'Swimming' ? 'active' : ''}`}
                >
                    <FaSwimmer /> Swimming
                </button>
                <button
                    onClick={() => setSelectedSport('Badminton')}
                    className={`sport-selector-btn ${selectedSport === 'Badminton' ? 'active' : ''}`}
                >
                    <GiShuttlecock /> Badminton
                </button>
                <button
                    onClick={() => setSelectedSport('Hockey')}
                    className={`sport-selector-btn ${selectedSport === 'Hockey' ? 'active' : ''}`}
                >
                    <FaHockeyPuck /> Hockey
                </button>
                <button
                    onClick={() => setSelectedSport('Skating')}
                    className={`sport-selector-btn ${selectedSport === 'Skating' ? 'active' : ''}`}
                >
                    <FaSkating /> Skating
                </button>
                <button
                    onClick={() => setSelectedSport('Table Tennis')}
                    className={`sport-selector-btn ${selectedSport === 'Table Tennis' ? 'active' : ''}`}
                >
                    <FaTableTennis /> TT
                </button>
                <button
                    onClick={() => setSelectedSport('Squash')}
                    className={`sport-selector-btn ${selectedSport === 'Squash' ? 'active' : ''}`}
                >
                    <FaHandPointRight /> Squash
                </button>
                <button
                    onClick={() => setSelectedSport('Pickleball')}
                    className={`sport-selector-btn ${selectedSport === 'Pickleball' ? 'active' : ''}`}
                >
                    <FaHandshake /> Pickleball
                </button>
                <button
                    onClick={() => setSelectedSport('Volleyball')}
                    className={`sport-selector-btn ${selectedSport === 'Volleyball' ? 'active' : ''}`}
                >
                    <FaVolleyballBall /> Volleyball
                </button>
                <button
                    onClick={() => setSelectedSport('Golf')}
                    className={`sport-selector-btn ${selectedSport === 'Golf' ? 'active' : ''}`}
                >
                    <FaGolfBall /> Golf
                </button>
                <button
                    onClick={() => setSelectedSport('Chess')}
                    className={`sport-selector-btn ${selectedSport === 'Chess' ? 'active' : ''}`}
                >
                    <FaChessPawn /> Chess
                </button>
                <button
                    onClick={() => setSelectedSport('Gym')}
                    className={`sport-selector-btn ${selectedSport === 'Gym' ? 'active' : ''}`}
                >
                    <FaDumbbell /> Gym
                </button>
                <button
                    onClick={() => setSelectedSport('Shooting')}
                    className={`sport-selector-btn ${selectedSport === 'Shooting' ? 'active' : ''}`}
                >
                    <FaCrosshairs /> Shooting
                </button>
                <button
                    onClick={() => setSelectedSport('Console Gaming')}
                    className={`sport-selector-btn ${selectedSport === 'Console Gaming' ? 'active' : ''}`}
                >
                    <FaGamepad /> Gaming
                </button>
            </div>

            <div className="featured-section">
                <h2>Ready to Book Your Game?</h2>
                <p>Explore a wide variety of turfs and facilities for every sport. Find your perfect spot and book instantly!</p>
                <a href="#turf-list-section" className="btn-cta">Book Now! 🚀</a>
            </div>

            <h2 style={{ marginTop: '40px' }}>{selectedSport ? `${selectedSport} Listings` : 'All Available Turfs'}</h2>
            
            <div className="turf-list" id="turf-list-section">
                {filteredTurfs.length > 0 ? (
                    filteredTurfs.map(turf => (
                        <TurfCard key={turf._id} turf={turf} /> 
                    ))
                ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                        {selectedSport ? `No listings found for ${selectedSport}.` : 'No turfs have been added yet. Add one via the "AddTurf" page.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
