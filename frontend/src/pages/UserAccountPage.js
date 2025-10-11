import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaKey, FaSignOutAlt } from 'react-icons/fa';
import '../App.css'; 

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
                /* --- BACKGROUND & UI STYLES --- */
                .hero {
                    position: relative; width: 100%; min-height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; padding: 4rem 1rem; box-sizing: border-box;
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
                .account-card { background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
                .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
                .dashboard-card { background-color: #ffffff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07); text-align: left; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #eee; }
                .dashboard-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
                .dashboard-card h3 { margin: 0 0 0.5rem 0; color: #333; font-size: 1.2rem; }
                .dashboard-card p { margin: 0; color: #666; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
                .no-data-message { grid-column: 1 / -1; text-align: center; padding: 2rem; }
                .account-footer-actions { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; display: flex; gap: 1rem; justify-content: flex-end; }
                .btn-account { padding: 0.75rem 1.5rem; border-radius: 8px; border: 2px solid transparent; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; gap: 0.5rem; }
                .btn-account-secondary { background-color: transparent; color: #555; border-color: #ccc; }
                .btn-account-secondary:hover { background-color: #f0f0f0; border-color: #bbb; color: #333; }
                .btn-account-danger { background-color: #e53935; color: white; border-color: #e53935; }
                .btn-account-danger:hover { background-color: #c62828; border-color: #c62828; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(229, 57, 53, 0.3); }
            `}</style>
            
            <div className="hero">
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


const UserAccountPage = ({ onLogout }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [playerBookings, setPlayerBookings] = useState([]);
    const [ownerTurfs, setOwnerTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useMemo(() => localStorage.getItem('token'), []);
    const storedUser = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    }, []);

    useEffect(() => {
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        setUserData(storedUser); 
        const fetchDynamicData = async () => {
            setError(null);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                if (storedUser.role === 'player') {
                    const response = await fetch(`http://localhost:5000/api/bookings/user/${storedUser._id}`, { headers });
                    if (!response.ok) throw new Error('Failed to fetch bookings.');
                    const data = await response.json();
                    setPlayerBookings(data);
                } else if (storedUser.role === 'owner') {
                    const response = await fetch(`http://localhost:5000/api/turfs/owner/${storedUser._id}`, { headers });
                    if (!response.ok) throw new Error('Failed to fetch turfs.');
                    const data = await response.json();
                    setOwnerTurfs(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDynamicData();
    }, [token, storedUser, navigate]); 

    const handleLogoutClick = () => {
        localStorage.clear();
        if (onLogout) onLogout();
        navigate('/'); 
    };

    if (loading || !userData) {
        return (
            <PageWithAnimatedBackground>
                <div className="account-card" style={{ textAlign: 'center' }}>
                    <p className="loading-message"><FaSpinner className="icon-spin" /> Loading your dashboard...</p>
                </div>
            </PageWithAnimatedBackground>
        );
    }
    if (error) {
        return (
            <PageWithAnimatedBackground>
                <div className="account-card" style={{ textAlign: 'center' }}>
                    <p className="error-message" style={{ color: 'red' }}>Error: {error}</p>
                </div>
            </PageWithAnimatedBackground>
        );
    }

    // --- THIS IS THE NEW LOGIC ---
    // Extracts the username from the email address
    const displayName = userData.email.split('@')[0];

    return (
        <PageWithAnimatedBackground>
            <div className="account-card">
                {/* --- THIS IS THE MODIFIED WELCOME MESSAGE --- */}
                <h1>Welcome, {displayName}!</h1>
                <p>You are logged in as a <b>{userData.role === 'player' ? 'Player' : 'Turf Owner'}</b>.</p>
                
                {userData.role === 'owner' && (
                    <div className="owner-header">
                        <Link to="/addturf" className="btn-add-turf">+ Add New Turf</Link>
                    </div>
                )}
                <div className="dashboard-content">
                    {userData.role === 'player' ? (
                        <div>
                            <h2>My Bookings</h2>
                            <div className="dashboard-grid">
                                {playerBookings.length > 0 ? (
                                    playerBookings.map(booking => (
                                        <div key={booking._id} className="dashboard-card">
                                            <h3>{booking.turfId?.name || 'Unknown Turf'}</h3>
                                            <p><FaCalendarAlt /> {new Date(booking.date).toLocaleDateString('en-GB')} at {booking.startTime}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-message">
                                        <p>You have no bookings. <Link to="/" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Book a Turf Now!</Link></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : ( 
                        <div>
                            <h2>My Turfs</h2>
                            <div className="dashboard-grid">
                                {ownerTurfs.length > 0 ? (
                                    ownerTurfs.map(turf => (
                                        <Link to={`/turf/${turf._id}`} key={turf._id} style={{ textDecoration: 'none' }}>
                                            <div className="dashboard-card">
                                                <h3>{turf.name}</h3>
                                                <p><FaMapMarkerAlt /> {turf.address || 'No address specified'}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="no-data-message">
                                        <p>You haven't listed any turfs yet. <Link to="/addturf" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Add your first turf.</Link></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="account-footer-actions">
                    <button onClick={() => alert("Feature coming soon!")} className="btn-account btn-account-secondary">
                        <FaKey /> Change Password
                    </button>
                    <button onClick={handleLogoutClick} className="btn-account btn-account-danger">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        </PageWithAnimatedBackground>
    );
};

export default UserAccountPage;