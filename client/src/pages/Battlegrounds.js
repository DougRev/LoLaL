import React from 'react';
import KingdomList from '../components/KingdomList';
import './Battlegrounds.css';

const Battlegrounds = () => {
  return (
    <div className="battlegrounds">
      <h1>Kingdoms Battleground</h1>
      <KingdomList />
    </div>
  );
};

export default Battlegrounds;
