import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; 

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('player');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Parallax effect logic
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
        return () => {
            document.removeEventListener('mousemove', handleParallax);
        };
    }, []);

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
                setSuccess('Registration successful! Redirecting to login...');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    if (role === 'owner') {
                        navigate('/owner-login');
                    } else {
                        navigate('/login');
                    }
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed. Please check the details.');
                setLoading(false);
            }
        } catch (err) {
            setError('Could not connect to the server. Please ensure your backend is running.');
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                /* All previous background styles remain the same */
                .hero {
                    position: relative; height: 100vh; width: 100%;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                }
                .content {
                    position: relative; z-index: 10; text-align: center;
                    color: #333; padding: 2rem;
                }
                .hero-bg {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%);
                    z-index: 1;
                }
                .hero-pattern {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0, 0, 0, 0.02) 48px, rgba(0, 0, 0, 0.02) 50px), 
                                repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0, 0, 0, 0.03) 98px, rgba(0, 0, 0, 0.03) 100px);
                    animation: patternShift 20s linear infinite;
                    z-index: 2;
                }
                .overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200, 200, 200, 0.2) 100%);
                    z-index: 3;
                }
                .floating-elements {
                    position: absolute; width: 100%; height: 100%;
                    top: 0; left: 0; pointer-events: none; z-index: 4;
                }
                .ball, .sports-emoji {
                    position: absolute; transition: transform 0.2s linear;
                }
                .ball {
                    width: 60px; height: 60px; background: #ff8c42;
                    border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4);
                    animation: float 6s ease-in-out infinite;
                }
                .ball:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
                .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; }
                .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji {
                    font-size: 3rem; opacity: 0.15;
                    animation: float 8s ease-in-out infinite; filter: grayscale(20%);
                }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; }
                .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; }
                .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; }
                .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; }
                .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }

                /* --- NEW CSS FOR RADIO BUTTONS --- */
                .radio-group-container {
                    display: flex;
                    justify-content: flex-start; /* Aligns items to the left */
                    align-items: center;
                    gap: 24px; /* Space between the two radio buttons */
                    padding: 8px 0; /* Some vertical spacing */
                }

                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 8px; /* Space between the radio circle and its text */
                    cursor: pointer;
                    font-size: 1rem;
                }

                .radio-label input[type="radio"] {
                    /* Modern look for radio buttons */
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ccc;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .radio-label input[type="radio"]:checked {
                    border-color: #ff8c42;
                    background-color: #ff8c42;
                    box-shadow: 0 0 0 3px white inset;
                }
                /* --- END OF NEW CSS --- */
            `}</style>
            
            <div className="hero">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="overlay"></div>
                <div className="floating-elements">
                    <div className="ball"></div>
                    <div className="ball"></div>
                    <div className="ball"></div>
                    <div className="sports-emoji">⚽</div>
                    <div className="sports-emoji">🏀</div>
                    <div className="sports-emoji">🏐</div>
                    <div className="sports-emoji">🎾</div>
                    <div className="sports-emoji">🏈</div>
                </div>

                <div className="content">
                    <div className="login-form-card">
                        <h2>Register</h2>
                        <p>Create your new account.</p>
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <form className="login-form" onSubmit={handleRegister}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email" id="email" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required disabled={loading}
                                />
                            </div>

                            {/* --- THIS IS THE MODIFIED JSX FOR RADIO BUTTONS --- */}
                            <div className="form-group">
                                <label>User Type</label>
                                <div className="radio-group-container">
                                    <label className="radio-label">
                                        <input 
                                            type="radio" 
                                            value="player" 
                                            checked={role === 'player'}
                                            onChange={() => setRole('player')} 
                                            disabled={loading}
                                        /> 
                                        Player
                                    </label>
                                    <label className="radio-label">
                                        <input 
                                            type="radio" 
                                            value="owner" 
                                            checked={role === 'owner'}
                                            onChange={() => setRole('owner')} 
                                            disabled={loading}
                                        /> 
                                        Owner
                                    </label>
                                </div>
                            </div>
                            {/* --- END OF MODIFIED JSX --- */}

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password" id="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    type="password" id="confirm-password" value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required disabled={loading}
                                />
                            </div>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                            <p style={{ marginTop: '20px' }}>
                                Already have an account? <Link to="/login" style={{ color: '#ff6b3d', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;