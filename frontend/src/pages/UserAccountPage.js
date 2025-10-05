import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import '../App.css'; 

const UserAccountPage = ({ onLogout }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [playerBookings, setPlayerBookings] = useState([]);
    const [ownerTurfs, setOwnerTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
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
                if (storedUser.role === 'player') {
                    const response = await fetch(`http://localhost:5000/api/bookings/user/${storedUser._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch player bookings.');
                    }
                    const data = await response.json();
                    setPlayerBookings(data);
                } else if (storedUser.role === 'owner') {
                    const response = await fetch(`http://localhost:5000/api/turfs/owner/${storedUser._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch owner turfs.');
                    }
                    const data = await response.json();
                    setOwnerTurfs(data);
                }
            } catch (err) {
                setError(err.message || 'Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDynamicData();
    }, [token, storedUser, navigate]); 

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) {
            onLogout();
        }
        navigate('/'); 
    };

    const handleChangePasswordClick = () => {
        alert("This feature is currently under development.");
    };

    if (loading) {
        return (
            <div className="account-page-container">
                <div className="account-card" style={{ textAlign: 'center' }}>
                    <p className="loading-message"><FaSpinner className="icon-spin" /> Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="account-page-container">
                <div className="account-card" style={{ textAlign: 'center' }}>
                    <p className="error-message" style={{ color: 'red' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return null;
    }

    return (
        <div className="account-page-container">
            <div className="account-card">
                <h1>Welcome, {userData.email}!</h1>
                <p>You are logged in as a <b>{userData.role === 'player' ? 'Player' : 'Turf Owner'}</b>.</p>
                {userData.role === 'owner' && (
                    <div className="owner-header">
                        <Link to="/addturf" className="btn-add-turf">
                            + Add New Turf
                        </Link>
                    </div>
                )}
                <div className="dashboard-content">
                    {userData.role === 'player' ? (
                        <div>
                            <h2>My Bookings</h2>
                            {playerBookings.length > 0 ? (
                                <ul className="turf-list">
                                    {playerBookings.map(booking => (
                                        <li key={booking._id} className="booking-item">
                                            <span className="turf-title">{booking.turfId?.name || 'Unknown Turf'}</span>
                                            <span className="turf-details">
                                                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>You have no upcoming bookings. <Link to="/" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Book a Turf Now!</Link></p>
                            )}
                        </div>
                    ) : ( 
                        <div>
                            <h2>My Turfs</h2>
                            {ownerTurfs.length > 0 ? (
                                <ul className="turf-list">
                                    {ownerTurfs.map(turf => (
                                        <li key={turf._id} className="turf-item">
                                            <Link to={`/turf/${turf._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <span className="turf-title">{turf.name}</span>
                                                <span className="turf-details">
                                                    {turf.address
                                                        ? turf.address
                                                        : (turf.location?.coordinates?.length === 2
                                                                ? `${turf.location.coordinates[1]}, ${turf.location.coordinates[0]}`
                                                                : 'No location data')}
                                                    {" - "}{turf.sport}
                                                </span>
                                                <div className="turf-actions">
                                                    <button className="btn-account-action">View Bookings</button>
                                                    <button className="btn-account-secondary">Edit</button>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>You haven't listed any turfs yet. <Link to="/addturf" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Add your first turf.</Link></p>
                            )}
                        </div>
                    )}
                </div>
                <div className="account-footer-actions">
                    <button onClick={handleChangePasswordClick} className="btn-account-secondary">Change Password</button>
                    <button onClick={handleLogoutClick} className="btn-account-action" style={{ background: '#e53935' }}>Logout</button>
                </div>
            </div>
        </div>
    );
};

export default UserAccountPage;
