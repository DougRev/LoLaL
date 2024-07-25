import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Units = ({ units, onUnitPurchase }) => {
  const { user } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    console.log('Units prop updated:', units);
  }, [units]);

  const handlePurchase = async () => {
    if (!selectedUnit || !user) return;

    try {
      console.log('Purchasing unit:', selectedUnit, 'Quantity:', quantity);
      const response = await axios.post('http://localhost:3000/api/units/purchase', {
        userId: user._id,
        unitId: selectedUnit,
        quantity,
      });
      console.log('Purchase Response:', response.data);
      if (onUnitPurchase) {
        onUnitPurchase();
      }
    } catch (error) {
      console.error('Error purchasing unit:', error);
    }
  };

  return (
    <div>
      <h2>Units for Sale</h2>
      <ul>
        {units.length > 0 ? (
          units.map((unit, index) => (
            <li key={`${unit._id}-${index}`}>
              {unit.name} - Cost: {unit.cost}, Attack: {unit.attack}, Defense: {unit.defense}
              <button onClick={() => setSelectedUnit(unit._id)}>Select</button>
            </li>
          ))
        ) : (
          <p>No units available. Please create a unit first.</p>
        )}
      </ul>

      {selectedUnit && (
        <div>
          <h3>Purchase Units</h3>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
          <button onClick={handlePurchase}>Purchase</button>
        </div>
      )}
    </div>
  );
};

export default Units;
