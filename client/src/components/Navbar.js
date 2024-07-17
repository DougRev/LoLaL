import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`navbar ${isOpen ? 'open' : ''}`}>
      <div className="hamburger" onClick={toggleNavbar}>
        {isOpen ? '✖' : '☰'}
      </div>
      <ul className="nav-links">
        <li><Link to="/" onClick={toggleNavbar}>Landing Page</Link></li>
        <li><Link to="/dashboard" onClick={toggleNavbar}>Dashboard</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default Navbar;
