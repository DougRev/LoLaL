import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { googleLogin, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleGoogleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      googleLogin().catch(() => {
        // handle error or ignore if unauthenticated
      });
    }
  }, [googleLogin, isAuthenticated, navigate]);

  return (
    <div className="landing-container">
      <div className="form-container">
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <button className="toggle-button" onClick={toggleForm}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
        <button className="google-button" onClick={handleGoogleLogin}>
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
