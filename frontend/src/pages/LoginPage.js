import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Your global styles for the form card will still apply

const LoginPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user.role, data.user.email);
                navigate('/home');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password.');
            }
        } catch (err) {
            setError('Could not connect to the server. Is your backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* All background styles are now self-contained in this component */}
            <style>{`
                /* Main container for full-screen background */
                .hero {
                    position: relative;
                    height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                /* Content wrapper to center content and keep it on top */
                .content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    color: #333;
                    padding: 2rem;
                }
                /* Background layers */
                .hero-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%);
                    z-index: 1;
                }
                .hero-pattern {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0, 0, 0, 0.02) 48px, rgba(0, 0, 0, 0.02) 50px), 
                                repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0, 0, 0, 0.03) 98px, rgba(0, 0, 0, 0.03) 100px);
                    animation: patternShift 20s linear infinite;
                    z-index: 2;
                }
                .overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200, 200, 200, 0.2) 100%);
                    z-index: 3;
                }
                /* Floating elements for parallax effect */
                .floating-elements {
                    position: absolute;
                    width: 100%; height: 100%;
                    top: 0; left: 0;
                    pointer-events: none;
                    z-index: 4;
                }
                .ball, .sports-emoji {
                    position: absolute;
                    transition: transform 0.2s linear;
                }
                .ball {
                    width: 60px; height: 60px;
                    background: #ff8c42;
                    border-radius: 50%;
                    box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4);
                    animation: float 6s ease-in-out infinite;
                }
                .ball:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
                .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; }
                .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji {
                    font-size: 3rem;
                    opacity: 0.15;
                    animation: float 8s ease-in-out infinite;
                    filter: grayscale(20%);
                }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; }
                .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; }
                .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; }
                .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; }
                .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                /* Keyframe Animations */
                @keyframes patternShift {
                    from { transform: translate(0, 0); }
                    to { transform: translate(50px, 100px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(180deg); }
                }
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
                    {/* Your existing login form card is placed here */}
                    <div className="login-form-card">
                        <h2>Player Login</h2>
                        <p>Log in to book a turf and more.</p>
                        {error && <div className="error-message">{error}</div>}
                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email" id="email" name="email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    required disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password" id="password" name="password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    required disabled={loading}
                                />
                            </div>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: '#ff6b3d', fontWeight: 'bold' }}>
                                    Register Here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;