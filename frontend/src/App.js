import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TurfDetailsPage from './pages/TurfDetailsPage';
import UserAccountPage from './pages/UserAccountPage';
import OwnerLoginPage from './pages/OwnerLoginPage';
import AddTurfPage from './pages/AddTurfPage';
import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import ReviewFormPage from './pages/ReviewFormPage'; // <-- 1. IMPORT ReviewFormPage

// Helper function (Keep as is)
const isOwner = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'owner';
  } catch {
    return false;
  }
};

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    // Re-check login status on route change
    setIsLoggedIn(!!localStorage.getItem('token'));

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, [location]); // Rerun this effect whenever the URL changes

  const handleLoginSuccess = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Determine if the Navbar and Footer should be shown
  const isLandingPageAndLoggedOut = location.pathname === '/' && !isLoggedIn;
  const showNavbarAndFooter = !isLandingPageAndLoggedOut;

  return (
    <div className="app-container">
      {showNavbarAndFooter && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <main className="main-content">
        <Routes>
          {/* Landing/Home Logic */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LandingPage />} />
          <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />

          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/owner-login" element={<OwnerLoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/turf/:id" element={<TurfDetailsPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />


          {/* Protected Routes (for any logged-in user) */}
          <Route path="/account" element={isLoggedIn ? <UserAccountPage onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* --- 2. ADDED: Protected route for the Review Form --- */}
          <Route path="/review/:bookingId" element={
            isLoggedIn
              ? <ReviewFormPage />
              : <Navigate to="/login" replace /> // Redirect to login if not logged in
          } />
          {/* --------------------------------------------------- */}


          {/* Protected Routes (for Owners only) */}
          <Route path="/addturf" element={
            isLoggedIn && isOwner()
              ? <AddTurfPage />
              : <Navigate to="/owner-login" replace />
          } />
          <Route path="/edit-turf/:id" element={
            isLoggedIn && isOwner()
              ? <AddTurfPage />
              : <Navigate to="/owner-login" replace />
          } />
        </Routes>
      </main>
      {showNavbarAndFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;