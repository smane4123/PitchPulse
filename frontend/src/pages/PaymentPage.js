// PITCHPULSE/frontend/src/pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaLock, FaCalendarAlt, FaClock, FaRupeeSign } from 'react-icons/fa';
import '../App.css'; 

// --- Background Component ---
const PageWithAnimatedBackground = ({ children }) => (
    <>
        <style>{`
            /* Ensure body is transparent */
            body, .app-container, .main-content {
                background: none !important;
                background-color: transparent !important;
            }
            .payment-page-wrapper { position: relative; width: 100%; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem 1rem; box-sizing: border-box; overflow: hidden; }
            .fixed-background-layers { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; overflow: hidden; }
            .hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); z-index: 1; }
            /* ... (Your other background styles: .hero-pattern, .overlay, .floating-elements, .ball, .sports-emoji, animations) ... */
            .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; z-index: 2; }
            .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); z-index: 3; }
            .floating-elements { z-index: 4; pointer-events: none; }
            .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
            .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
            @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
            @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }

            /* Payment Card Styles */
            .content { position: relative; z-index: 10; width: 100%; }
            .payment-card { 
                max-width: 500px; 
                margin: 0 auto; 
                background-color: rgba(255, 255, 255, 0.95); 
                backdrop-filter: blur(10px); 
                border-radius: 16px; 
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
                padding: 2.5rem; 
                border: 1px solid rgba(255, 255, 255, 0.18); 
            }
            .payment-card h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #333; text-align: center; }
            .payment-card h2 { font-size: 1.2rem; color: #555; margin-bottom: 1.5rem; text-align: center; }
            .summary-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
            .summary-item { display: flex; align-items: center; gap: 0.75rem; color: #444; margin-bottom: 1rem; font-size: 1rem; }
            .summary-item:last-child { margin-bottom: 0; }
            .summary-item svg { color: #ff8c42; }
            .total-amount { font-size: 1.5rem; font-weight: 600; color: #333; text-align: center; margin-bottom: 1rem; }
            .secure-lock { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #777; font-size: 0.9rem; margin-top: 1rem; }
            .error-message { color: #d93025; background-color: #fce4e4; border: 1px solid #e53935; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center; }
            .icon-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            /* Razorpay Button Style */
            .btn-razorpay {
                width: 100%;
                padding: 1rem;
                font-size: 1.2rem;
                font-weight: 600;
                color: white;
                background-color: #ff8c42; /* Your primary color */
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-razorpay:hover:not(:disabled) {
                background-color: #ff7a2e;
                box-shadow: 0 5px 15px rgba(255, 140, 66, 0.4);
                transform: translateY(-3px);
            }
            .btn-razorpay:disabled {
                background-color: #aaa;
                cursor: not-allowed;
            }
        `}</style>
        <div className="payment-page-wrapper">
            <div className="fixed-background-layers">
                 {/* Re-add your background elements here if they are missing */ }
                 <div className="hero-bg"></div>
                 <div className="hero-pattern"></div>
                 <div className="overlay"></div>
                 <div className="floating-elements">
                     <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                     <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div>
                 </div>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    </>
);


const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [bookingDetails, setBookingDetails] = useState(location.state || null);
    const [error, setError] = useState(null);
    const [razorpayKey, setRazorpayKey] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!location.state) {
            setError("No booking details found. Redirecting...");
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        // Fetch Razorpay Key ID from our backend
        const fetchKey = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/payment/get-key', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error('Could not get payment key');
                setRazorpayKey(data.key);
            } catch (err) {
                setError('Failed to connect to payment gateway.');
            }
        };
        fetchKey();
    }, [location.state, navigate, token]);

    // Main function to display Razorpay popup
    const displayRazorpay = async () => {
        if (!razorpayKey) {
            setError('Payment gateway key not loaded.');
            return;
        }

        setPaymentLoading(true);
        setError(null);

        try {
            // 1. Create Order
            const { turfDetails, selectedDate, selectedSlot, price } = bookingDetails;
            // Construct full ISO Date strings
            const startTime = new Date(`${selectedDate}T${selectedSlot}:00`).toISOString();
            const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

            const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    turfId: turfDetails._id,
                    startTime: startTime,
                    endTime: endTime,
                    price: price,
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');

            const { order } = orderData;

            // 2. Configure Razorpay Options
            const options = {
                key: razorpayKey,
                amount: order.amount,
                currency: "INR",
                name: "PitchPulse",
                description: `Booking for ${turfDetails.name}`,
                image: "https://i.imgur.com/gxttL5D.png", // Placeholder icon
                order_id: order.id,
                
                // 3. Handler function (on success)
                handler: async (response) => {
                    setPaymentLoading(true); // Show spinner during verification
                    try {
                        const verifyRes = await fetch('http://localhost:5000/api/payment/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');
                        
                        // SUCCESS!
                        alert('Booking confirmed! Your payment was successful.');
                        navigate('/account');

                    } catch (err) {
                        setError(`Payment verification failed: ${err.message}`);
                        setPaymentLoading(false);
                    }
                },
                prefill: {
                    name: user?.email.split('@')[0],
                    email: user?.email,
                },
                theme: {
                    color: "#ff8c42" // Your primary color
                }
            };

            // 4. Open Razorpay Popup
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setError(`Payment Failed: ${response.error.description}`);
                setPaymentLoading(false);
            });
            rzp.open();
            // Razorpay opening is async, but we set loading false to re-enable button if they close it
            setPaymentLoading(false); 

        } catch (err) {
            setError(err.message);
            setPaymentLoading(false);
        }
    };

    if (!bookingDetails) {
        return (
            <PageWithAnimatedBackground>
                <div className="payment-card">
                    {error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <p style={{textAlign: 'center'}}><FaSpinner className="icon-spin" /> Loading...</p>
                    )}
                </div>
            </PageWithAnimatedBackground>
        );
    }

    const { turfDetails, selectedDate, selectedSlot, price } = bookingDetails;

    return (
        <PageWithAnimatedBackground>
            <div className="payment-card">
                <h1>Confirm Your Booking</h1>
                <h2>{turfDetails.name}</h2>

                <div className="summary-box">
                    <div className="summary-item">
                        <FaCalendarAlt />
                        <span>{new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="summary-item">
                        <FaClock />
                        <span>{selectedSlot} - {String(parseInt(selectedSlot.split(':')[0]) + 1).padStart(2, '0')}:00</span>
                    </div>
                    <div className="summary-item">
                        <FaRupeeSign />
                        <strong>Total Amount: {price} INR</strong>
                    </div>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <button 
                    className="btn-razorpay"
                    onClick={displayRazorpay}
                    disabled={!razorpayKey || paymentLoading}
                >
                    {paymentLoading ? <FaSpinner className="icon-spin" /> : `Pay ₹${price} Securely`}
                </button>
                
                <div className="secure-lock">
                    <FaLock /> <span>Secure Payment powered by Razorpay</span>
                </div>
            </div>
        </PageWithAnimatedBackground>
    );
};

export default PaymentPage;