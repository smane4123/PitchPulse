import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import loginBg from '../assets/loginimage.jpg';

const LoginPage = ({ onLoginSuccess }) => {
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
            const response = await fetch('http://localhost:5000/api/auth/login', {
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
                console.log('Login successful! User Role:', data.user.role);

                onLoginSuccess(data.user.role, data.user.email);
                navigate('/home');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password.');
                alert(errorData.message || 'Login failed.');
            }
        } catch (err) {
            console.error('Network Error:', err);
            setError('Could not connect to the server. Is your backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="login-page-container login-page-bg" 
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            <div className="login-form-card">
                <h2>Player Login</h2>
                <p>Log in to book a turf and more.</p>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>
                        Don't have an account? <a href="/register" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>Register Here</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
