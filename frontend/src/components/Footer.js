// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Make sure this line exists to import styles

const Footer = () => {
  return (
    <footer className="footer"> {/* This class name comes from App.css */}
      <div className="container"> {/* This class name comes from App.css */}
        <p>&copy; 2025 PitchPulse. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Link to="/privacy-policy" className="footer-link"> {/* This class name comes from App.css */}
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="footer-link"> {/* This class name comes from App.css */}
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;