import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../images/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminNavigate = () => {
    setIsOpen(false);
    navigate('/admin');
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="LoLaL Logo" className="logo" />
        </div>
        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          {isAuthenticated && (
            <>
              <li><Link to="/dashboard" onClick={toggleNavbar}>Dashboard</Link></li>
              <li><Link to="/dungeons" onClick={toggleNavbar}>Dungeons</Link></li>
              <li><Link to="/profile" onClick={toggleNavbar}>Profile</Link></li> {/* Profile link */}
              {user && user.role === 'admin' && (
                <li><button onClick={handleAdminNavigate}>Admin Dashboard</button></li>
              )}
              <li><Link to="/battlegrounds" onClick={toggleNavbar}>Battlegrounds</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}

          {!isAuthenticated && (
            <>
              <li><Link to="/login" onClick={toggleNavbar}>Login</Link></li>
              <li><Link to="/register" onClick={toggleNavbar}>Register</Link></li>
            </>
          )}
        </ul>
        <button className="hamburger" onClick={toggleNavbar}>
          {isOpen ? (
            <span className="close-icon">&times;</span>
          ) : (
            <>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </>
          )}
        </button>
      </div>

      {isOpen && <div className="overlay" onClick={toggleNavbar}></div>}
    </>
  );
};

export default Navbar;
