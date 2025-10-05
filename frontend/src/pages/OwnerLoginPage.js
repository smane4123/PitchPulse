import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const OwnerLoginPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/auth/owner-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('Owner Login successful! User Role:', data.user.role);

                onLoginSuccess(data.user.role, data.user.email);
                navigate('/addturf');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password for owner account.');
            }
        } catch (err) {
            console.error('Network Error:', err);
            setError('Could not connect to the server. Is your backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-card">
                <h2>Owner Login</h2>
                <p>Log in to manage your turf bookings and details.</p>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="owner-email">Email</label>
                        <input
                            type="email"
                            id="owner-email"
                            name="owner-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="owner-password">Password</label>
                        <input
                            type="password"
                            id="owner-password"
                            name="owner-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OwnerLoginPage;
