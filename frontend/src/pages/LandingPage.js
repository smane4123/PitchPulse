import React, { useEffect } from 'react';
// CHANGED: We now need useNavigate instead of Link
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    // NEW: Initialize the useNavigate hook
    const navigate = useNavigate();

    const handleRippleClick = (e) => {
        const button = e.currentTarget;
        if (!document.getElementById('ripple-style')) {
            let style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        let ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: 100px;
            height: 100px;
            left: ${x - 50}px;
            top: ${y - 50}px;
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        button.style.position = 'relative'; 
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    // NEW: A combined handler for click events
    const handleNavClick = (e, path) => {
        // First, trigger the visual ripple effect
        handleRippleClick(e);
        // Then, navigate to the new page after a short delay to allow the ripple to be seen
        setTimeout(() => {
            navigate(path);
        }, 150);
    };

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

    return (
        <>
            <style>{`
                /* All styles remain the same */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow-x: hidden; background: #f5f5f5; }
                .hero { position: relative; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); }
                .hero-pattern { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0, 0, 0, 0.02) 48px, rgba(0, 0, 0, 0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0, 0, 0, 0.03) 98px, rgba(0, 0, 0, 0.03) 100px); animation: patternShift 20s linear infinite; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200, 200, 200, 0.2) 100%); }
                .content { position: relative; z-index: 10; text-align: center; color: #333; padding: 2rem; max-width: 900px; }
                .logo { font-size: 4.5rem; font-weight: 800; letter-spacing: -2px; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ff8c42 0%, #ffa500 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: fadeInDown 1s ease-out; text-shadow: 0 0 40px rgba(255, 140, 66, 0.3); }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
                .tagline { font-size: 1.5rem; font-weight: 300; margin-bottom: 3rem; opacity: 0.95; animation: fadeInUp 1s ease-out 0.3s both; letter-spacing: 1px; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .cta-container { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; animation: fadeInUp 1s ease-out 0.6s both; }
                .btn { padding: 1.2rem 3rem; font-size: 1.1rem; font-weight: 600; border: none; border-radius: 50px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-decoration: none; display: inline-block; }
                .btn-primary { background: #ff8c42; color: white; box-shadow: 0 10px 40px rgba(255, 140, 66, 0.3); }
                .btn-primary:hover { transform: translateY(-5px); box-shadow: 0 15px 50px rgba(255, 140, 66, 0.5); background: #ff7a2e; }
                .btn-secondary { background: transparent; color: #333; border: 2px solid #333; }
                .btn-secondary:hover { background: #333; color: white; transform: translateY(-5px); }
                .features { position: absolute; bottom: 4rem; left: 0; width: 100%; display: flex; gap: 4rem; justify-content: center; align-items: center; animation: fadeInUp 1s ease-out 0.9s both; }
                .feature { color: #333; display: flex; flex-direction: column; align-items: center; }
                .feature-icon { font-size: 2.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1)); }
                .feature-text { font-size: 0.9rem; font-weight: 500; opacity: 0.8; }
                .floating-elements { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
                .ball:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
                .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; }
                .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; }
                .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; }
                .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; }
                .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; }
                .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                @media (max-width: 768px) { .logo { font-size: 3rem; } .tagline { font-size: 1.2rem; } .features { width: 100%; flex-direction: row; justify-content: space-around; gap: 1rem; bottom: 2rem; } .cta-container { flex-direction: column; align-items: center; } .btn { width: 100%; max-width: 300px; } }
                @media (max-width: 480px) { .features { flex-direction: column; gap: 2rem; } }
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
                    <h1 className="logo">PitchPulse</h1>
                    <p className="tagline">Find your Pitch Ignite your Pulse.</p>
                    
                    {/* CHANGED: Replaced <Link> with <button> and used the new onClick handler */}
                    <div className="cta-container">
                        <button className="btn btn-primary" onClick={(e) => handleNavClick(e, '/login')}>
                            Player Login
                        </button>
                        <button className="btn btn-secondary" onClick={(e) => handleNavClick(e, '/owner-login')}>
                            Owner Login
                        </button>
                    </div>
                </div>
                
                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">⚡</div>
                        <div className="feature-text">Instant Booking</div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">📍</div>
                        <div className="feature-text">Prime Locations</div>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">💎</div>
                        <div className="feature-text">Premium Quality</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingPage;