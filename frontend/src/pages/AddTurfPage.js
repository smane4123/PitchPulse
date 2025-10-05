// PITCHPULSE/frontend/src/pages/AddTurfPage.js

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix for default Leaflet marker icons not displaying in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to recenter the map when the turf location is found via address search
const ChangeMapView = ({ center }) => {
    const map = useMap();
    // Use an effect to move the map whenever the center coordinates change
    React.useEffect(() => {
        if (center.latitude && center.longitude) {
            map.setView([center.latitude, center.longitude], center.zoom || 14);
        }
    }, [center, map]);
    return null;
};


// Component to handle map clicks and set the marker position
const LocationMarker = ({ setTurfData, reverseGeocode, initialLocation }) => {
    // Initial position is set from turfData.location (if it exists)
    const [position, setPosition] = useState(initialLocation ? { lat: initialLocation[1], lng: initialLocation[0] } : null);
    
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            
            // Update turfData with the new coordinates [lng, lat]
            setTurfData(prev => ({ ...prev, location: [lng, lat] }));
            
            // Reverse geocode to get the address
            reverseGeocode(lng, lat);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};


export default function AddTurfPage() {
    const navigate = useNavigate(); 

    const [turfData, setTurfData] = useState({
        name: "",
        address: "",
        contact: "",
        sport: "Football", // 🚨 ADDED: Sport Field
        amenities: [],
        pricePerHour: "",
        location: null, // [longitude, latitude]
    });

    const [images, setImages] = useState([]); // 🚨 ADDED: State for image files
    const [imagePreviews, setImagePreviews] = useState([]); // 🚨 ADDED: State for image URLs

    const [submissionStatus, setSubmissionStatus] = useState({ 
        loading: false, 
        error: null 
    });

    const [mapCenter, setMapCenter] = useState({
        longitude: 72.8777, // Default to Mumbai
        latitude: 19.076,
        zoom: 12,
    });

    // --- Geocoding/Reverse Geocoding Logic (Unchanged) ---
    const reverseGeocode = async (lng, lat) => {
        // ... (Reverse Geocoding logic remains the same)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            if (data && data.display_name) {
                setTurfData((prev) => ({
                    ...prev,
                    address: data.display_name,
                }));
            } else {
                setTurfData((prev) => ({
                    ...prev,
                    address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)} (Address not found)`,
                }));
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
    };

    const forwardGeocode = async () => {
        // ... (Forward Geocoding logic remains the same)
        if (!turfData.address) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    turfData.address
                )}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLon = parseFloat(lon);
                const newLat = parseFloat(lat);

                setTurfData((prev) => ({
                    ...prev,
                    location: [newLon, newLat],
                }));
                
                // Update map center to move the view
                setMapCenter({
                    longitude: newLon,
                    latitude: newLat,
                    zoom: 14,
                });
            } else {
                alert("Address not found. Try entering a more specific address.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Error fetching location. Please try again.");
        }
    };


    // --- Handler Functions ---

    const handleAddressGeocode = () => {
        forwardGeocode();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTurfData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (e) => {
        const { value, checked } = e.target;
        setTurfData((prev) => ({
            ...prev,
            amenities: checked
                ? [...prev.amenities, value]
                : prev.amenities.filter((a) => a !== value),
        }));
    };
    
    // 🚨 ADDED: Image change handler for file input
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus({ loading: true, error: null });

        if (!turfData.location) {
            setSubmissionStatus({ loading: false, error: "Please select a location on the map." });
            alert("Please select a location on the map.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setSubmissionStatus({ loading: false, error: "Authentication required. Please log in as an owner." });
            navigate('/owner-login');
            return;
        }
        
        // 🚨 CRITICAL CHANGE: Use FormData for sending files and JSON data
        const formData = new FormData();
        
        // 1. Append Turf Data (Convert to JSON string before appending)
        const turfJson = {
            name: turfData.name,
            address: turfData.address,
            contact: turfData.contact,
            sport: turfData.sport, // 🚨 ADDED
            amenities: turfData.amenities,
            pricePerHour: parseFloat(turfData.pricePerHour),
            location: {
                type: 'Point',
                coordinates: turfData.location 
            }
        };
        formData.append('turfData', JSON.stringify(turfJson));
        
        // 2. Append Image Files
        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            // Note: When using FormData, let the browser set the 'Content-Type' header
            const response = await fetch('http://localhost:5000/api/turfs', { 
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // DO NOT set 'Content-Type': 'multipart/form-data' here!
                },
                body: formData, // Send the FormData object
            });

            if (response.ok) {
                console.log('Successfully added turf:', await response.json());
                alert('Turf added successfully!');
                
                // Cleanup and Redirect
                setTurfData({ name: "", address: "", contact: "", sport: "Football", amenities: [], pricePerHour: "", location: null });
                setImages([]);
                setImagePreviews([]);
                setSubmissionStatus({ loading: false, error: null });
                navigate('/account'); 
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                setSubmissionStatus({ loading: false, error: errorData.message || 'Server error occurred during turf creation.' });
                alert(`Failed to add turf: ${errorData.message || 'Check server logs for validation errors.'}`);
            }
        } catch (error) {
            console.error('Network Error:', error);
            setSubmissionStatus({ loading: false, error: 'Cannot connect to server. Is your backend running?' });
            alert('An unexpected network error occurred. Is your backend running on port 5000?');
        }
    };

    // --- Component JSX and Styles (Unchanged) ---
    const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px", boxSizing: "border-box" };
    const buttonStyle = { padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", height: "45px", transition: "background-color 0.3s" };

    return (
        <div style={{ width: "100%", maxWidth: 800, margin: "20px auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>List Your New Turf</h2>
            
            {submissionStatus.error && (
                <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '5px' }}>
                    Error: {submissionStatus.error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Turf Name */}
                <input
                    type="text"
                    name="name"
                    placeholder="Enter turf name"
                    value={turfData.name}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                
                {/* 🚨 ADDED: Sport Selector */}
                <select
                    name="sport"
                    value={turfData.sport}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Mixed">Mixed (2+ Sports)</option>
                </select>

                {/* Address with Geocode */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                    <textarea
                        name="address"
                        placeholder="Enter address or click on the map"
                        value={turfData.address}
                        onChange={handleChange}
                        onBlur={handleAddressGeocode} 
                        required
                        style={{ ...inputStyle, flex: 1, height: "80px" }}
                    />
                    <button
                        type="button"
                        onClick={handleAddressGeocode}
                        style={buttonStyle}
                    >
                        Find
                    </button>
                </div>

                {/* Contact */}
                <input
                    type="text"
                    name="contact"
                    placeholder="Enter contact number"
                    value={turfData.contact}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                
                {/* Amenities */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold" }}>Amenities:</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "8px" }}>
                        {["Floodlights", "Parking", "Washrooms", "Seating", "Drinking Water"].map(
                            (amenity) => (
                                <label key={amenity}>
                                    <input
                                        type="checkbox"
                                        value={amenity}
                                        checked={turfData.amenities.includes(amenity)}
                                        onChange={handleAmenityChange}
                                    />
                                    {" "}{amenity}
                                </label>
                            )
                        )}
                    </div>
                </div>

                {/* Price */}
                <input
                    type="number"
                    name="pricePerHour"
                    placeholder="Enter price per hour (₹)"
                    value={turfData.pricePerHour}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                
                {/* 🚨 ADDED: Image Upload Input */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold", display: 'block', marginBottom: '8px' }}>Turf Images (Max 5):</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        style={{ ...inputStyle, padding: '10px 0', border: 'none' }}
                        // Limiting file selection to a reasonable number
                        max={5} 
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {imagePreviews.map((src, index) => (
                            <img 
                                key={index} 
                                src={src} 
                                alt={`Turf Preview ${index + 1}`} 
                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        ))}
                    </div>
                </div>

                {/* Map (Using Leaflet) */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold" }}>Select Turf Location (Click on Map):</label>
                    
                    <MapContainer
                        // Use mapCenter state to control the initial view
                        center={[mapCenter.latitude, mapCenter.longitude]} 
                        zoom={mapCenter.zoom}
                        style={{ width: "100%", height: "400px", borderRadius: "8px", marginTop: "10px" }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Component to update map center when geocoding is successful */}
                        <ChangeMapView center={mapCenter} />

                        {/* LocationMarker handles map clicks */}
                        <LocationMarker 
                            setTurfData={setTurfData} 
                            reverseGeocode={reverseGeocode}
                            initialLocation={turfData.location} 
                        />
                        
                        {/* Optional: Render an explicit marker if location is already set (e.g., from geocoding) */}
                         {/* Note: LocationMarker above already handles rendering the marker upon click. 
                             This ensures a marker is visible after address search. */}
                        {turfData.location && (
                            <Marker
                                position={[turfData.location[1], turfData.location[0]]} // Leaflet uses [lat, lng]
                            />
                        )}
                    </MapContainer>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    style={{ ...buttonStyle, width: "100%", backgroundColor: "#ff6b3d" }}
                    disabled={submissionStatus.loading}
                >
                    {submissionStatus.loading ? 'Saving...' : 'Save Turf'}
                </button>
            </form>

            {/* Display Turf Data Preview */}
            <div style={{ marginTop: "25px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>Entered Turf Details:</h3>
                <p><strong>Name:</strong> {turfData.name || "N/A"}</p>
                <p><strong>Sport:</strong> {turfData.sport || "N/A"}</p> 
                <p><strong>Address:</strong> {turfData.address || "N/A"}</p>
                <p><strong>Contact:</strong> {turfData.contact || "N/A"}</p>
                <p><strong>Amenities:</strong> {turfData.amenities.join(", ") || "None"}</p>
                <p><strong>Price per Hour:</strong> {turfData.pricePerHour ? `₹${turfData.pricePerHour}` : "N/A"}</p>
                <p>
                    <strong>Location (Lng, Lat):</strong>{" "}
                    {turfData.location
                        ? `${turfData.location[0].toFixed(5)}, ${turfData.location[1].toFixed(5)}`
                        : "Click on the map or enter an address"}
                </p>
                <p><strong>Images:</strong> {images.length} file(s) ready for upload.</p>
            </div>
        </div>
    );
}