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
        unitId: selectedUnit._id,
        quantity,
      });
      console.log('Purchase Response:', response.data);
      if (onUnitPurchase) {
        onUnitPurchase();
      }
      // Reset after purchase
      setSelectedUnit(null);
      setQuantity(1);
    } catch (error) {
      console.error('Error purchasing unit:', error);
    }
  };

  const handleCancel = () => {
    setSelectedUnit(null);
    setQuantity(1);
  };

  return (
    <div>
      <h2>Units for Sale</h2>
      <ul>
        {units.length > 0 ? (
          units.map((unit, index) => (
            <li key={`${unit._id}-${index}`}>
              {unit.name} - Cost: {unit.cost}, Attack: {unit.attack}, Defense: {unit.defense}
              <button onClick={() => setSelectedUnit(unit)}>Select</button>
            </li>
          ))
        ) : (
          <p>No units available. Please create a unit first.</p>
        )}
      </ul>

      {selectedUnit && (
        <div>
          <h3>Purchase {selectedUnit.name}</h3>
          <p>Cost: {selectedUnit.cost}</p>
          <p>Attack: {selectedUnit.attack}</p>
          <p>Defense: {selectedUnit.defense}</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
          <button onClick={handlePurchase}>Purchase</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Units;
