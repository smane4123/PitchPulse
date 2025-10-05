// src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Make sure the path is correct

const Navbar = ({ isLoggedIn }) => {
    return (
        <header className="navbar">
            <Link to="/" className="navbar-brand">
                PitchPulse
            </Link>
            <nav className="navbar-links">
                <Link to="/home">Home</Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/account">Account</Link>
                        {/* Logout button can be added here later */}
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-login">Login</Link>
                        <Link to="/register" className="btn-register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Navbar;