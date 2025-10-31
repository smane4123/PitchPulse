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
import PaymentPage from './pages/PaymentPage';

// Helper function
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
    // Re-check login status on every route change
    setIsLoggedIn(!!localStorage.getItem('token'));

    AOS.init({
      duration: 1000,
      once: true,
    });
  }, [location]); // Dependency array ensures this runs on route change

  const handleLoginSuccess = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Determine if Navbar and Footer should be shown
  const isLandingPageAndLoggedOut = location.pathname === '/' && !isLoggedIn;
  const showNavbarAndFooter = !isLandingPageAndLoggedOut;

  return (
    <div className="app-container">
      {showNavbarAndFooter && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <main className="main-content">
        <Routes>
          {/* Landing/Home Logic */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <LandingPage />} />
          <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/owner-login" element={<OwnerLoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/turf/:id" element={<TurfDetailsPage />} />

          {/* Protected Routes (for any logged-in user) */}
          <Route path="/account" element={isLoggedIn ? <UserAccountPage onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="/book/:id" element={isLoggedIn ? <BookingPage /> : <Navigate to="/login" replace />} />
          <Route path="/payment" element={isLoggedIn ? <PaymentPage /> : <Navigate to="/login" replace />} />

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

          {/* Optional: Catch-all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

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