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
import LandingPage from './pages/LandingPage'; // Newly added

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleLoginSuccess = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Helper to check for owner role in local storage
  const isOwner = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.role === 'owner';
    } catch {
      return false;
    }
  };

  // Show navbar unless it's landing page AND user not logged in
  const isLandingPageNoLogin = location.pathname === '/' && !isLoggedIn;
  const showNavbar = !isLandingPageNoLogin;

  return (
    <div className="app-container">
      {showNavbar && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={isLoggedIn ? <HomePage /> : <LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/turf/:id" element={<TurfDetailsPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/owner-login" element={<OwnerLoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/account" element={<UserAccountPage onLogout={handleLogout} />} />
          <Route path="/addturf" element={
            isLoggedIn && isOwner() 
              ? <AddTurfPage /> 
              : <Navigate to="/owner-login" replace />
          } />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
