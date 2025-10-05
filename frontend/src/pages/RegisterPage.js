import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import loginBg from '../assets/loginimage.jpg';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('player'); // default to player
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        setSuccess('Registration successful! You can now log in with your new account.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('player');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed. Please check the details.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please ensure your backend is running.');
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
        <h2>Register</h2>
        <p>Create your new account.</p>
        
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}

        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>User Type</label>
            <div>
              <label style={{ marginRight: '15px' }}>
                <input 
                  type="radio" 
                  value="player" 
                  checked={role === 'player'}
                  onChange={() => setRole('player')} 
                  disabled={loading}
                /> Player
              </label>
              <label>
                <input 
                  type="radio" 
                  value="owner" 
                  checked={role === 'owner'}
                  onChange={() => setRole('owner')} 
                  disabled={loading}
                /> Owner
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p style={{ marginTop: '20px', color: 'var(--text-medium)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
