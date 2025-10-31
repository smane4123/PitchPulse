import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../App.css'; // Your global styles

// --- Helper Functions for Date Manipulation (Unchanged) ---
const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday - Saturday : 0 - 6
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setHours(0, 0, 0, 0); // Reset time to start of the day
    return d;
};
const getWeekDates = (startDate) => {
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date;
    });
};
const generateTimeSlots = (start = '06:00', end = '23:00') => {
    const slots = [];
     // Ensure start and end are valid strings before splitting
    if (typeof start !== 'string' || typeof end !== 'string' || !start.includes(':') || !end.includes(':')) {
        console.warn("Invalid start/end time format, using defaults.");
        start = '06:00';
        end = '23:00';
    }
    let currentHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
     if (isNaN(currentHour) || isNaN(endHour)) { // Fallback if parsing fails
        console.error("Failed to parse start/end hours.");
        return []; // Return empty array on parse failure
    }
    while (currentHour < endHour) {
        slots.push(`${String(currentHour).padStart(2, '0')}:00`);
        currentHour++;
    }
    return slots;
};

// --- Background Component (Unchanged, matches UserAccountPage) ---
const PageWithAnimatedBackground = ({ children }) => {
    useEffect(() => {
        const handleParallax = (e) => {
            const floatingElements = document.querySelectorAll('.fixed-background-layers .ball, .fixed-background-layers .sports-emoji');
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            floatingElements.forEach((el, index) => {
                const speed = (index % 3 + 1) * 15;
                el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        };
        document.addEventListener('mousemove', handleParallax);
        return () => document.removeEventListener('mousemove', handleParallax);
    }, []);

    return (
        <>
            <style>{`
                 body, .app-container, .main-content {
                     background: none !important;
                     background-color: transparent !important;
                 }
                 .booking-page-wrapper { position: relative; width: 100%; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem 1rem; box-sizing: border-box; overflow: hidden; }
                 .fixed-background-layers { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; overflow: hidden; }
                 .hero-bg, .hero-pattern, .overlay, .floating-elements { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                 .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); z-index: 1; }
                 .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; z-index: 2; }
                 .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); z-index: 3; }
                 .floating-elements { z-index: 4; }
                 @keyframes patternShift { from { transform: translate(0,0); } to { transform: translate(50px,100px); } }
                 @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                 .floating-elements .ball, .floating-elements .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                 .floating-elements .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255,140,66,0.4); animation: float 6s ease-in-out infinite; }
                 .floating-elements .ball:nth-child(1) { top: 15%; left: 10%; } 
                 .floating-elements .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } 
                 .floating-elements .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                 .floating-elements .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                 .floating-elements .sports-emoji:nth-child(4){top:10%;right:8%;animation-delay:1s}
                 .floating-elements .sports-emoji:nth-child(5){top:50%;left:5%;animation-delay:3s}
                 .floating-elements .sports-emoji:nth-child(6){bottom:15%;right:10%;animation-delay:5s}
                 .content { position: relative; z-index: 10; width: 100%; }
                 .booking-card { max-width: 1000px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); padding: 2.5rem; border: 1px solid rgba(255, 255, 255, 0.18); position: relative; z-index: 10; animation: fadeIn 0.5s ease-out; }
                 .booking-card h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #333; }
                 .booking-card h2 { font-size: 1.5rem; color: #555; margin-bottom: 2rem; border-bottom: 2px solid #eee; padding-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
                 .week-navigation { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                 .week-navigation button { background: none; border: 1px solid #ccc; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.2s; color: #555; }
                 .week-navigation button:hover:not(:disabled) { background-color: #f0f0f0; border-color: #bbb; }
                 .week-navigation button:disabled { background-color: #f9f9f9; color: #ccc; cursor: not-allowed; border-color: #eee; }
                 .week-navigation h3 { margin: 0; font-size: 1.2rem; color: #333; text-align: center; font-weight: 600; }
                 .booking-grid-container { display: grid; grid-template-columns: 70px repeat(7, 1fr); gap: 5px; text-align: center; overflow-x: auto; padding-bottom: 10px; margin-bottom: 1rem; }
                 .grid-header, .time-label { font-weight: bold; padding: 10px 5px; background-color: #f7f7f7; border-radius: 6px; font-size: 0.85rem; min-width: 80px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                 .time-label { font-size: 0.8rem; background-color: #fff; }
                 .grid-slot { height: 50px; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; transition: all 0.2s ease-in-out; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
                 .grid-slot.available { background-color: #e8f5e9; color: #388e3c; }
                 .grid-slot.available:hover { background-color: #c8e6c9; border-color: #a5d6a7; transform: scale(1.03); }
                 .grid-slot.selected { background-color: var(--primary-color); color: white; border-color: #f07e33; transform: scale(1.05); box-shadow: 0 4px 15px rgba(255,140,66,0.4); z-index: 1; position: relative; }
                 .grid-slot.booked { background-color: #f5f5f5; color: #bdbdbd; cursor: not-allowed; }
                 .summary { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem; text-align: center; }
                 .summary h4 { margin-bottom: 0.5rem; color: #333; }
                 .summary p { color: #555; font-size: 1rem; }
                 .confirm-btn { width: 100%; padding: 1rem; margin-top: 1.5rem; background-color: #28a745; color: white; border: none; border-radius: 8px; font-size: 1.2rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                 .confirm-btn:hover:not(:disabled) { background-color: #218838; box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4); transform: translateY(-3px); }
                 .confirm-btn:disabled { background-color: #aaa; cursor: not-allowed; }
                 .error-message { color: #d93025; background-color: #fce4e4; border: 1px solid #e53935; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
                 @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                 .icon-spin { animation: spin 1s linear infinite; }
                 @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="booking-page-wrapper">
                <div className="fixed-background-layers">
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
                    </div>
                </div>
                <div className="content">
                    {children}
                </div>
            </div>
        </>
    );
};

// --- Main BookingPage Component ---
const BookingPage = () => {
    const { id: turfId } = useParams();
    const navigate = useNavigate();

    const [turf, setTurf] = useState(null);
    const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
    const [weekAvailability, setWeekAvailability] = useState({});
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const currentWeekStart = useMemo(() => getStartOfWeek(new Date()), []);
    
    // --- ⬇️ REMOVED maxDate LIMIT ⬇️ ---
    // const maxDate = useMemo(() => {
    //     const d = new Date();
    //     d.setMonth(d.getMonth() + 1);
    //     return d;
    // }, []);
    // --- ⬆️ END REMOVAL ⬆️ ---

    // Effect to fetch turf details (Unchanged)
    useEffect(() => {
        const fetchTurfDetails = async () => {
             setLoading(true);
             setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/turfs/${turfId}`);
                if (!response.ok) throw new Error('Could not fetch turf details.');
                setTurf(await response.json());
            } catch (err) {
                setError(`Failed to load turf info: ${err.message}`);
                setTurf(null);
            }
        };
        fetchTurfDetails();
    }, [turfId]);

    // Effect to fetch weekly availability (Unchanged)
    useEffect(() => {
        if (!turfId || !turf) {
            if (error && !turf) setLoading(false);
            return;
        }
        const fetchWeekAvailability = async () => {
            setLoading(true);
            setError(null);
            setWeekAvailability({});
            const weekOf = weekStartDate.toISOString().split('T')[0];
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/availability/week?turfId=${turfId}&weekOf=${weekOf}`);
                if (!response.ok) throw new Error('Could not fetch weekly availability.');
                setWeekAvailability(await response.json());
            } catch (err) {
                setError(`Failed to load slots: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchWeekAvailability();
    }, [turfId, weekStartDate, turf]);

    const weekDates = useMemo(() => getWeekDates(weekStartDate), [weekStartDate]);
    const timeIntervals = useMemo(() => generateTimeSlots(turf?.openingTime, turf?.closingTime), [turf]);

    // handleSlotClick (Unchanged)
    const handleSlotClick = (slotIdentifier, isAvailable) => {
        if (!isAvailable) return;
        setSelectedSlots(prev =>
            prev.includes(slotIdentifier)
                ? prev.filter(s => s !== slotIdentifier)
                : [...prev, slotIdentifier]
        );
    };

    // handleProceedToPayment (Unchanged)
    const handleProceedToPayment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to proceed.");
            return navigate('/login');
        }
        if (selectedSlots.length === 0 || !turf) {
             setError("Please select at least one slot.");
            return;
        }
        
        const singleSlotToBook = selectedSlots[0]; 
        const [datePart, timePart] = singleSlotToBook.split('T');

        navigate('/payment', {
            state: {
                turfDetails: turf,
                selectedDate: datePart, // YYYY-MM-DD
                selectedSlot: timePart.substring(0, 5), // HH:MM
                price: turf.pricePerHour
            }
        });
    };

    // changeWeek (Unchanged)
    const changeWeek = (direction) => {
        setWeekStartDate(current => {
            const newDate = new Date(current);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
        setSelectedSlots([]);
    };

    const isPrevDisabled = weekStartDate.getTime() <= currentWeekStart.getTime();

    // --- ⬇️ REMOVED maxDate LIMIT ⬇️ ---
    // const nextWeekStartDate = new Date(weekStartDate);
    // nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);
    // const isNextDisabled = nextWeekStartDate.getTime() > maxDate.getTime();
    // --- ⬆️ END REMOVAL ⬆️ ---


    // --- Render Logic (Loading/Error) (Unchanged) ---
    if (loading && !turf && !error) {
        return (
            <PageWithAnimatedBackground>
                <div className="booking-card" style={{ textAlign: 'center' }}>
                    <h2><FaSpinner className="icon-spin" /> Loading Turf Details...</h2>
                </div>
            </PageWithAnimatedBackground>
        );
    }
    if (!turf) {
        return (
            <PageWithAnimatedBackground>
                <div className="booking-card" style={{ textAlign: 'center' }}>
                    <h2>Error Loading Turf</h2>
                    <p className="error-message">{error || 'Could not find turf details.'}</p>
                    <button onClick={() => navigate(-1)} style={{marginTop: '1rem'}}>Go Back</button>
                </div>
            </PageWithAnimatedBackground>
        );
    }

    const totalPrice = selectedSlots.length * turf.pricePerHour;
    const now = new Date();

    // Main render
    return (
        <PageWithAnimatedBackground>
            <div className="booking-card">
                <h1>{turf.name}</h1>
                <h2><FaCalendarAlt /> Select Your Time Slots</h2>
                {error && <p className="error-message">{error}</p>}

                <div className="week-navigation">
                    <button onClick={() => changeWeek('prev')} aria-label="Previous Week" disabled={isPrevDisabled}>
                        <FaArrowLeft />
                    </button>
                    <h3>
                        {weekDates[0].toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} - {weekDates[6].toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                    </h3>
                    {/* --- ⬇️ MODIFIED: Removed disabled logic ⬇️ --- */}
                    <button onClick={() => changeWeek('next')} aria-label="Next Week" disabled={false}>
                        <FaArrowRight />
                    </button>
                    {/* --- ⬆️ END MODIFICATION ⬆️ --- */}
                </div>

                <div className="booking-grid-container">
                    <div className="grid-header"></div> {/* Empty top-left */}
                    {weekDates.map(date => (
                        <div key={date.toISOString()} className="grid-header">
                            <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div>{date.getDate()}</div>
                        </div>
                    ))}

                    {loading ? (
                        <div style={{gridColumn: 'span 8', padding: '2rem', textAlign: 'center'}}>
                            <FaSpinner className="icon-spin" /> Fetching slots...
                        </div>
                    ) : (
                        timeIntervals.map(time => (
                            <React.Fragment key={time}>
                                <div className="time-label">{time}</div>
                                {weekDates.map(date => {
                                    const [hour, minute] = time.split(':').map(Number);
                                    const slotDateTime = new Date(date);
                                    slotDateTime.setHours(hour, minute, 0, 0); 
                                    const isPast = slotDateTime < now;
                                    const dateString = date.toISOString().split('T')[0];
                                    const slotIdentifier = `${dateString}T${time}`;
                                    const daySlots = weekAvailability[dateString] || [];
                                    const slotInfo = daySlots.find(s => s.time === time);
                                    const isAvailable = slotInfo ? slotInfo.isAvailable && !isPast : false;
                                    const isSelected = selectedSlots.includes(slotIdentifier);
                                    let slotClass = 'grid-slot ';
                                    
                                    if (isSelected) slotClass += 'selected';
                                    else if (isAvailable) slotClass += 'available';
                                    else slotClass += 'booked';

                                    return (
                                        <div
                                            key={slotIdentifier}
                                            className={slotClass}
                                            onClick={() => handleSlotClick(slotIdentifier, isAvailable)}
                                            role="button"
                                            aria-pressed={isSelected}
                                            aria-label={`${time} on ${date.toLocaleDateString()}${isAvailable ? '' : ' (Not Available)'}`}
                                        >
                                            {isAvailable ? `₹${turf.pricePerHour}` : ''}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))
                    )}
                </div>

                <div className="summary">
                    <h4>Booking Summary</h4>
                    {selectedSlots.length > 0 ? (
                        <p>You have selected {selectedSlots.length} slot(s). Total: <strong>₹{totalPrice}</strong></p>
                    ) : (
                        <p>Please select one or more available time slots from the grid.</p>
                    )}
                </div>

                <button
                    className="confirm-btn"
                    onClick={handleProceedToPayment}
                    disabled={selectedSlots.length === 0 || bookingLoading}
                >
                   Proceed to Payment ({selectedSlots.length} Slot(s) - ₹{totalPrice})
                </button>
            </div>
        </PageWithAnimatedBackground>
    );
};

export default BookingPage;