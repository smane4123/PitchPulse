import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- LEAFLET HELPER COMPONENTS ---
const ChangeMapView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center.latitude && center.longitude) {
            map.setView([center.latitude, center.longitude], center.zoom || 15);
        }
    }, [center, map]);
    return null;
};

const LocationMarker = ({ setTurfData, reverseGeocode, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation ? { lat: initialLocation[1], lng: initialLocation[0] } : null);
    
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            setTurfData(prev => ({ ...prev, location: [lng, lat] }));
            reverseGeocode(lng, lat);
        },
    });

    useEffect(() => {
        if (initialLocation) {
            setPosition({ lat: initialLocation[1], lng: initialLocation[0] });
        }
    }, [initialLocation]);

    return position === null ? null : <Marker position={position} />;
};

// --- BACKGROUND WRAPPER COMPONENT ---
const PageWithAnimatedBackground = ({ children }) => {
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
        return () => document.removeEventListener('mousemove', handleParallax);
    }, []);

    return (
        <>
            <style>{`
                /* --- BACKGROUND STYLES --- */
                .hero {
                    position: relative; width: 100%; min-height: 100vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow-x: hidden; padding: 4rem 1rem; box-sizing: border-box;
                }
                .content { position: relative; z-index: 10; width: 100%; }
                .hero-bg, .hero-pattern, .overlay, .floating-elements { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                .hero-bg { background: linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 50%, #f8f8f8 100%); z-index: 1; }
                .hero-pattern { background: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,0,0,0.02) 48px, rgba(0,0,0,0.02) 50px), repeating-linear-gradient(0deg, transparent, transparent 98px, rgba(0,0,0,0.03) 98px, rgba(0,0,0,0.03) 100px); animation: patternShift 20s linear infinite; z-index: 2; }
                .overlay { background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(200,200,200,0.2) 100%); z-index: 3; }
                .floating-elements { pointer-events: none; z-index: 4; }
                .ball, .sports-emoji { position: absolute; transition: transform 0.2s linear; }
                .ball { width: 60px; height: 60px; background: #ff8c42; border-radius: 50%; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); animation: float 6s ease-in-out infinite; }
                .ball:nth-child(1) { top: 15%; left: 10%; } .ball:nth-child(2) { top: 70%; right: 15%; animation-delay: 2s; } .ball:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 4s; }
                .sports-emoji { font-size: 3rem; opacity: 0.15; animation: float 8s ease-in-out infinite; filter: grayscale(20%); }
                .sports-emoji:nth-child(4) { top: 10%; right: 8%; animation-delay: 1s; } .sports-emoji:nth-child(5) { top: 50%; left: 5%; animation-delay: 3s; } .sports-emoji:nth-child(6) { bottom: 15%; right: 10%; animation-delay: 5s; } .sports-emoji:nth-child(7) { top: 30%; right: 20%; animation-delay: 2s; } .sports-emoji:nth-child(8) { bottom: 35%; left: 12%; animation-delay: 4s; }
                @keyframes patternShift { from { transform: translate(0, 0); } to { transform: translate(50px, 100px); } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(180deg); } }
                
                /* --- UI IMPROVEMENT STYLES --- */
                .add-turf-card {
                    width: 100%; max-width: 900px; margin: 2rem auto; padding: 2.5rem;
                    background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
                    border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .add-turf-card h2 { text-align: center; margin-bottom: 2rem; color: #333; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-label { font-weight: 600; margin-bottom: 0.5rem; color: #555; }
                .form-input, .form-textarea, .form-select {
                    width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;
                    transition: border-color 0.2s, box-shadow 0.2s; background-color: white;
                }
                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none; border-color: #ff8c42; box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.2);
                }
                .address-group { display: flex; gap: 0.5rem; align-items: stretch; }
                .address-group .form-textarea { flex: 1; }
                .btn { padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
                .btn-secondary { background-color: #6c757d; color: white; height: 100%; }
                .btn-secondary:hover { background-color: #5a6268; }
                .btn-primary { background-color: #ff8c42; color: white; width: 100%; font-size: 1.1rem; padding: 1rem; }
                .btn-primary:hover { background-color: #ff7a2e; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255, 140, 66, 0.4); }
                .btn-primary:disabled { background-color: #f0c3a8; cursor: not-allowed; transform: none; box-shadow: none; }
                .amenities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
                .amenity-label { display: flex; align-items: center; background: #f8f9fa; padding: 0.75rem; border-radius: 6px; cursor: pointer; border: 1px solid #eee; transition: background-color 0.2s; }
                .amenity-label:hover { background-color: #f1f3f5; }
                .amenity-label input { margin-right: 0.75rem; transform: scale(1.2); }
                .image-upload-box { border: 2px dashed #ddd; border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer; background-color: #fafafa; transition: all 0.2s; }
                .image-upload-box:hover { border-color: #ff8c42; background-color: #fff8f2; }
                .image-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .image-preview-item { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
                
                .leaflet-container {
                    height: 400px; width: 100%; border-radius: 8px;
                    margin-top: 10px; z-index: 5;
                }
            `}</style>
            
            <div className="hero">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="overlay"></div>
                <div className="floating-elements">
                    <div className="ball"></div><div className="ball"></div><div className="ball"></div>
                    <div className="sports-emoji">⚽</div><div className="sports-emoji">🏀</div><div className="sports-emoji">🏐</div>
                    <div className="sports-emoji">🎾</div><div className="sports-emoji">🏈</div>
                </div>
                <div className="content">
                    {children}
                </div>
            </div>
        </>
    );
};


export default function AddTurfPage() {
    const navigate = useNavigate();
    const [turfData, setTurfData] = useState({
        name: "", address: "", contact: "", sport: "Football",
        amenities: [], pricePerHour: "", location: null,
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submissionStatus, setSubmissionStatus] = useState({ loading: false, error: null });
    const [mapCenter, setMapCenter] = useState({ longitude: 72.9781, latitude: 19.1942, zoom: 12 });

    const reverseGeocode = async (lng, lat) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setTurfData(prev => ({ ...prev, address: data.display_name }));
            }
        } catch (error) { console.error("Reverse geocoding error:", error); }
    };
    const forwardGeocode = async () => {
        if (!turfData.address) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(turfData.address)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLon = parseFloat(lon), newLat = parseFloat(lat);
                setTurfData(prev => ({ ...prev, location: [newLon, newLat] }));
                setMapCenter({ longitude: newLon, latitude: newLat, zoom: 15 });
            } else {
                alert("Address not found.");
            }
        } catch (error) { console.error("Geocoding error:", error); }
    };
    const handleChange = (e) => setTurfData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleAmenityChange = (e) => {
        const { value, checked } = e.target;
        setTurfData(prev => ({
            ...prev,
            amenities: checked ? [...prev.amenities, value] : prev.amenities.filter(a => a !== value),
        }));
    };
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setImages(files);
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus({ loading: true, error: null });
        if (!turfData.location) return setSubmissionStatus({ loading: false, error: "Please select a location on the map." });
        const token = localStorage.getItem('token');
        if (!token) return navigate('/owner-login');
        
        const formData = new FormData();
        formData.append('turfData', JSON.stringify({
            ...turfData,
            pricePerHour: parseFloat(turfData.pricePerHour),
            location: { type: 'Point', coordinates: turfData.location }
        }));
        images.forEach(image => formData.append('images', image));

        try {
            const response = await fetch('http://localhost:5000/api/turfs', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                alert('Turf added successfully!');
                navigate('/account');
            } else {
                const errorData = await response.json();
                setSubmissionStatus({ loading: false, error: errorData.message || 'Server error.' });
            }
        } catch (error) {
            setSubmissionStatus({ loading: false, error: 'Cannot connect to server.' });
        }
    };

    return (
        <PageWithAnimatedBackground>
            <div className="add-turf-card">
                <h2>List Your New Turf</h2>
                {submissionStatus.error && (
                    // --- THIS IS THE FIX ---
                    <div className="error-message" style={{marginBottom: '1rem'}}>{submissionStatus.error}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Turf Name</label>
                            <input id="name" type="text" name="name" placeholder="E.g., Elite Sports Arena" value={turfData.name} onChange={handleChange} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="sport">Primary Sport</label>
                            <select id="sport" name="sport" value={turfData.sport} onChange={handleChange} required className="form-select">
                                <option>Football</option><option>Cricket</option><option>Badminton</option>
                                <option>Basketball</option><option>Tennis</option><option>Mixed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="contact">Contact Number</label>
                            <input id="contact" type="tel" name="contact" placeholder="Enter contact number" value={turfData.contact} onChange={handleChange} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="pricePerHour">Price per Hour (₹)</label>
                            <input id="pricePerHour" type="number" name="pricePerHour" placeholder="E.g., 1200" value={turfData.pricePerHour} onChange={handleChange} required className="form-input" />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label" htmlFor="address">Address</label>
                            <div className="address-group">
                                <textarea id="address" name="address" placeholder="Enter full address and click Find, or click on the map" value={turfData.address} onChange={handleChange} required className="form-textarea" rows={2}/>
                                <button type="button" onClick={forwardGeocode} className="btn btn-secondary">Find</button>
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Amenities</label>
                            <div className="amenities-grid">
                                {["Floodlights", "Parking", "Washrooms", "Seating", "Drinking Water"].map(amenity => (
                                    <label key={amenity} className="amenity-label">
                                        <input type="checkbox" value={amenity} checked={turfData.amenities.includes(amenity)} onChange={handleAmenityChange} />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Turf Images (Max 5)</label>
                            <label htmlFor="image-upload" className="image-upload-box">
                                <FaUpload style={{ marginRight: '8px' }} />
                                Click or Drag to Upload
                            </label>
                            <input id="image-upload" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                            {imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                    {imagePreviews.map((src, index) => (
                                        <img key={index} src={src} alt={`Preview ${index + 1}`} className="image-preview-item" />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Set Location on Map</label>
                            <MapContainer center={[mapCenter.latitude, mapCenter.longitude]} zoom={mapCenter.zoom} scrollWheelZoom={true}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <ChangeMapView center={mapCenter} />
                                <LocationMarker setTurfData={setTurfData} reverseGeocode={reverseGeocode} initialLocation={turfData.location} />
                            </MapContainer>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={submissionStatus.loading} style={{ marginTop: '2rem' }}>
                        {submissionStatus.loading ? 'Saving...' : 'Save Turf'}
                    </button>
                </form>
            </div>
        </PageWithAnimatedBackground>
    );
}