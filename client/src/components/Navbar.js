import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  console.log('User in Navbar:', user);

  return (
    <div className={`navbar ${isOpen ? 'open' : ''}`}>
      <div className="hamburger" onClick={toggleNavbar}>
        {isOpen ? '✖' : '☰'}
      </div>
      <ul className="nav-links">
        {isAuthenticated && (
          <>
            <li><Link to="/dashboard" onClick={toggleNavbar}>Dashboard</Link></li>
            {user && user.role === 'admin' && (
              <li><Link to="/admin" onClick={toggleNavbar}>Admin Dashboard</Link></li>
            )}
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
    </div>
  );
};

export default Navbar;
