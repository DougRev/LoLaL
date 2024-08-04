import React from 'react';
import './HealthBar.css';

const HealthBar = ({ currentHealth, maxHealth, label }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;
  console.log('Current Health:', currentHealth, 'Max Health:', maxHealth);

  return (
    <div className={`health-bar ${label === 'Boss Health' ? 'boss' : 'user'}`}>
      <div 
        className="health-bar-inner" 
        style={{ width: `${healthPercentage}%` }}
      >
        <span className="health-text">
          {currentHealth}
        </span>
      </div>
    </div>
  );
};

export default HealthBar;
