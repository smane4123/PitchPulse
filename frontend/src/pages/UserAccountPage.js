import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaKey, FaSignOutAlt, FaEdit, FaEye, FaStar } from 'react-icons/fa'; // Added FaStar for review button
import { format } from 'date-fns'; // For date formatting
import '../App.css';

// --- Animated Background Component ---
const PageWithAnimatedBackground = ({ children }) => {
    useEffect(() => {
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
                /* OVERRIDE any global or layout grey backgrounds */
                body, .account-page-wrapper, .app-container, .main-content {
                    background: none !important;
                    background-color: transparent !important;
                }
                .fixed-background-layers {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    z-index: -1;
                    overflow: hidden;
                }
                .hero-bg, .hero-pattern, .overlay, .floating-elements {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .hero-bg { 
                    background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%);
                }
                .hero-pattern {
                    background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px),
                                repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px);
                    animation: patternShift 20s linear infinite;
                }
                .overlay {
                    background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%);
                }
                .floating-elements { pointer-events: none; }
                @keyframes patternShift { from { transform: translate(0,0); } to { transform: translate(50px,100px); } }
                @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear;}
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255,140,66,0.4); animation: float 6s ease-in-out infinite;}
                .ball:nth-child(1) { top: 15%; left: 10%; }
                .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; }
                .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%);}
                .sports-emoji:nth-child(4) { top:10%; right:8%; animation-delay: 1s;}
                .sports-emoji:nth-child(5) { top:50%; left:5%; animation-delay: 3s;}
                .sports-emoji:nth-child(6) { bottom:15%; right:10%; animation-delay: 5s;}
                .sports-emoji:nth-child(7) { top:30%; right:20%; animation-delay: 2s;}
                .sports-emoji:nth-child(8) { bottom:35%; left:12%; animation-delay: 4s;}
                .account-page-wrapper {
                    position: relative;
                    min-height: 100vh;
                    padding: 4rem 1rem;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .content-area {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .account-card {
                    background-color: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 2.5rem;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.18);
                    width: 100%;
                }
                .account-card h1 { margin-bottom: 0.5rem; color: #333;}
                .account-card > p { margin-bottom: 1.5rem; color: #555; }
                .owner-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;}
                .btn-add-turf { background-color: #ff8c42; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background-color 0.2s; border: none;}
                .btn-add-turf:hover { background-color: #ff7a2e;}
                .dashboard-content h2 { margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; color: #333;}
                .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;}
                .dashboard-card { background-color: #ffffff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.07); text-align: left; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #eee; display: flex; flex-direction: column;}
                .dashboard-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1);}
                .dashboard-card-content { flex-grow: 1;}
                .dashboard-card h3 { margin: 0 0 0.5rem 0; color: #333; font-size: 1.2rem;}
                .dashboard-card p { margin: 0 0 0.3rem 0; color: #666; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; line-height: 1.4;}
                .no-data-message { grid-column: 1 / -1; text-align: center; padding: 2rem; color: #777;}
                .dashboard-card-actions { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;}
                .btn-card-action { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 6px; text-decoration: none;}
                .btn-card-edit { background-color: #ff8c42; color: white; border: none;}
                .btn-card-edit:hover { background-color: #ff7a2e;}
                .account-footer-actions { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; display: flex; gap: 1rem; justify-content: flex-end;}
                .btn-account { padding: 0.75rem 1.5rem; border-radius: 8px; border: 2px solid transparent; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;}
                .btn-account-secondary { background-color: transparent; color: #555; border-color: #ccc;}
                .btn-account-secondary:hover { background-color: #f0f0f0; border-color: #bbb; color: #333;}
                .btn-account-danger { background-color: #e53935; color: white; border-color: #e53935;}
                .btn-account-danger:hover { background-color: #c62828; border-color: #c62828; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(229,57,53,0.3);}
                .loading-message, .error-message { padding: 2rem; text-align: center; font-size: 1.1rem;}
                .icon-spin { animation: spin 1s linear infinite; margin-right: 0.5rem;}
                .reviewed-text { color: #777; font-size: 0.9em; font-style: italic;}
            `}</style>

            <div className="fixed-background-layers">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="overlay"></div>
                <div className="floating-elements">
                    <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                    <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div>
                    <div className="sports-emoji">🏐</div><div className="sports-emoji">🎾</div><div className="sports-emoji">🏈</div>
                </div>
            </div>
            <div className="account-page-wrapper">
                <div className="content-area">{children}</div>
            </div>
        </>
    );
};


// --- Main UserAccountPage Component ---
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
        if (!token || !storedUser) { navigate('/login'); return; }
        setUserData(storedUser);
        const fetchDynamicData = async () => {
            setError(null); setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                if (storedUser.role === 'player') {
                    const response = await fetch(`http://localhost:5000/api/bookings/user`, { headers });
                    if (!response.ok) { let e = 'Failed to fetch bookings.'; try { e = (await response.json()).message || e; } catch {} throw new Error(e); }
                    setPlayerBookings(await response.json());
                } else if (storedUser.role === 'owner') {
                    const response = await fetch(`http://localhost:5000/api/turfs/owner/${storedUser._id}`, { headers });
                    if (!response.ok) { let e = 'Failed to fetch turfs.'; try { e = (await response.json()).message || e; } catch {} throw new Error(e); }
                    setOwnerTurfs(await response.json());
                }
            } catch (err) { console.error("Error fetching account data:", err); setError(err.message || "Could not connect."); }
            finally { setLoading(false); }
        };
        fetchDynamicData();
    }, [token, storedUser, navigate]);

    const handleLogoutClick = () => {
        localStorage.clear(); if (onLogout) onLogout(); navigate('/');
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

    const now = new Date();
    const upcomingBookings = playerBookings.filter(b => b.endTime && new Date(b.endTime) > now);
    const pastBookings = playerBookings.filter(b => b.endTime && new Date(b.endTime) <= now);
    const displayName = userData.email.split('@')[0];

    return (
        <PageWithAnimatedBackground>
            <div className="account-card">
                <h1>Welcome, {displayName}!</h1>
                <p>You are logged in as a <b>{userData.role === 'player' ? 'Player' : 'Turf Owner'}</b>.</p>

                {userData.role === 'owner' && (
                    <div className="owner-header">
                        <h2>My Turfs</h2>
                        <Link to="/addturf" className="btn-add-turf">+ Add New Turf</Link>
                    </div>
                )}

                <div className="dashboard-content">
                    {userData.role === 'player' && (
                        <>
                            <h2>Upcoming Bookings</h2>
                            <div className="dashboard-grid">
                                {upcomingBookings.length > 0 ? (
                                    upcomingBookings.map(booking => (
                                        <div key={booking._id} className="dashboard-card">
                                            <h3>{booking.turf?.name || 'Turf unavailable'}</h3>
                                            <p><FaCalendarAlt /> {format(new Date(booking.startTime), 'dd/MM/yyyy')} at {format(new Date(booking.startTime), 'p')}</p>
                                            {booking.turf?.address && <p><FaMapMarkerAlt /> {booking.turf.address}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-message"><p>No upcoming bookings found.</p></div>
                                )}
                            </div>

                            <h2 style={{ marginTop: '2rem' }}>Past Bookings</h2>
                            <div className="dashboard-grid">
                                {pastBookings.length > 0 ? (
                                    pastBookings.map(booking => (
                                        <div key={booking._id} className="dashboard-card">
                                            <h3>{booking.turf?.name || 'Turf unavailable'}</h3>
                                            <p><FaCalendarAlt /> {format(new Date(booking.startTime), 'dd/MM/yyyy')} at {format(new Date(booking.startTime), 'p')}</p>
                                            {booking.turf?.address && <p><FaMapMarkerAlt /> {booking.turf.address}</p>}
                                            <div className="dashboard-card-actions">
                                                {booking.hasBeenReviewed ? (
                                                    <span className="reviewed-text">Reviewed</span>
                                                ) : (
                                                    <Link
                                                        to={`/review/${booking._id}`}
                                                        className="btn-account btn-card-edit btn-card-action"
                                                    >
                                                        <FaStar style={{marginRight: '4px'}}/> Leave Review
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-message"><p>No past bookings found.</p></div>
                                )}
                            </div>
                        </>
                    )}

                    {userData.role === 'owner' && (
                        <div>
                            <div className="dashboard-grid">
                                {ownerTurfs.length > 0 ? (
                                    ownerTurfs.map(turf => (
                                        <div key={turf._id} className="dashboard-card">
                                            <div className="dashboard-card-content">
                                                <h3>{turf.name}</h3>
                                                <p><FaMapMarkerAlt /> {turf.address || 'No address specified'}</p>
                                            </div>
                                            <div className="dashboard-card-actions">
                                                <Link to={`/turf/${turf._id}`} className="btn-account btn-account-secondary btn-card-action"><FaEye /> View</Link>
                                                <Link to={`/edit-turf/${turf._id}`} className="btn-account btn-card-edit btn-card-action"><FaEdit /> Edit</Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-message"><p>No turfs listed yet. <Link to="/addturf" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Add your first turf.</Link></p></div>
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
