import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './LandingPage.css';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="landing-container">
      <div className="form-container">
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <button className="toggle-button" onClick={toggleForm}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
