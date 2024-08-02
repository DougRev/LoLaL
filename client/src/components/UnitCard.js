import React, { useState } from 'react';
import './UnitCard.css';

const UnitCard = ({ unit, quantity, onChange }) => {
  const [selectedCount, setSelectedCount] = useState(0);

  const handleIncrement = () => {
    if (selectedCount < quantity) {
      const newCount = selectedCount + 1;
      console.log(`Incrementing: ${unit.name}, newCount: ${newCount}`);
      setSelectedCount(newCount);
      onChange(unit._id, newCount);
    }
  };
  
  const handleDecrement = () => {
    if (selectedCount > 0) {
      const newCount = selectedCount - 1;
      console.log(`Decrementing: ${unit.name}, newCount: ${newCount}`);
      setSelectedCount(newCount);
      onChange(unit._id, newCount);
    }
  };
  

  return (
    <div className="unit-card">
      <h4>{unit.name}</h4>
      <p>Available: {quantity}</p>
      <div className="unit-selection">
        <button onClick={handleDecrement}>-</button>
        <span>{selectedCount}</span>
        <button onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
};

export default UnitCard;
