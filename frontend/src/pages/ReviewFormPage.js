// PITCHPULSE/frontend/src/pages/ReviewFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaSpinner } from 'react-icons/fa';
import '../App.css'; // Assuming App.css contains base styles

// --- Background Component ---
// (Copied from UserAccountPage, ensures consistent background)
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
            {/* Styles are self-contained within this component */}
            <style>{`
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow-x: hidden; }
                .page-wrapper-with-bg { position: relative; min-height: 100vh; padding: 4rem 1rem; box-sizing: border-box; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .fixed-background-layers { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
                .hero-bg, .hero-pattern, .overlay, .floating-elements { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); }
                .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0, 0, 0, 0.02) 48px, rgba(0, 0, 0, 0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0, 0, 0, 0.03) 98px, rgba(0, 0, 0, 0.03) 100px); animation: patternShift 20s linear infinite; }
                .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200, 200, 200, 0.2) 100%); }
                .floating-elements { pointer-events: none; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
                .ball:nth-child(1) { top: 15%; left: 10%; } .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; } .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; } .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; } .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; } .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                .content-area { position: relative; z-index: 10; width: 100%; max-width: 600px; /* Max width for form */ margin: 0 auto; }
                 /* Generic Card Style */
                 .form-card, .account-card, .details-card { /* Apply consistent card style */
                    background-color: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 2.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    width: 100%;
                    text-align: left; /* Default alignment */
                }
                .form-card h2 { text-align: center; margin-bottom: 2rem; color: #333; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: #555; }
                .star-rating-container { display: flex; gap: 5px; margin-bottom: 1rem; }
                .star-rating-container svg { cursor: pointer; transition: color 0.2s; }
                textarea.form-control { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; resize: vertical; min-height: 100px; }
                .char-count { display: block; margin-top: 5px; color: #888; font-size: 0.85em; text-align: right; }
                .error-message { color: red; margin-bottom: 1rem; background-color: #fdd; padding: 10px; border-radius: 5px; border: 1px solid #fbb; font-size: 0.9rem; }
                .btn-submit-review { width: 100%; padding: 12px; font-size: 1.1rem; background-color: #ff8c42; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
                .btn-submit-review:hover:not(:disabled) { background-color: #ff7a2e; }
                .btn-submit-review:disabled { background-color: #ccc; cursor: not-allowed; }
                .icon-spin { animation: spin 1s linear infinite; margin-right: 0.5rem; }
            `}</style>
            
            <div className="page-wrapper-with-bg">
                <div className="fixed-background-layers">
                    <div className="hero-bg"></div>
                    <div className="hero-pattern"></div>
                    <div className="overlay"></div>
                    <div className="floating-elements">
                        <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                        <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div>
                        <div className="sports-emoji">🏐</div><div className="sports-emoji">🎾</div>
                        <div className="sports-emoji">🏈</div>
                    </div>
                </div>
                <div className="content-area">
                    {children}
                </div>
            </div>
        </>
    );
};

// Simple Star Rating Component
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="star-rating-container">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <FaStar
                        key={ratingValue}
                        size={30}
                        color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ffda6a'}
                        onMouseLeave={(e) => e.currentTarget.style.color = ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
                    />
                );
            })}
        </div>
    );
};

// Main Review Form Page Component
const ReviewFormPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.'); return;
        }
        setLoading(true); setError('');
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            const response = await fetch(`http://localhost:5000/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ bookingId, rating, comment })
            });
            if (!response.ok) {
                const errData = await response.json(); throw new Error(errData.message || 'Failed to submit review.');
            }
            alert('Review submitted successfully!');
            navigate('/account');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <PageWithAnimatedBackground>
            <div className="form-card"> {/* Use the consistent card style */}
                <h2>Leave a Review</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Rating *</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Your Comments (Optional)</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength="500"
                            placeholder="Tell us about your experience..."
                            className="form-control"
                        />
                        <small className="char-count">{500 - comment.length} characters remaining</small>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-submit-review" disabled={loading}>
                        {loading ? <FaSpinner className="icon-spin" /> : 'Submit Review'}
                    </button>
                </form>
            </div>
        </PageWithAnimatedBackground>
    );
};

export default ReviewFormPage;