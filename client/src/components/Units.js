import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Units.css';

const Units = ({ units, onUnitPurchase, onKingdomUpdate }) => {
  const { user } = useContext(AuthContext);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);
  const [currentUnits, setCurrentUnits] = useState({});
  const [hoveredUnitId, setHoveredUnitId] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  useEffect(() => {
    const fetchCurrentUnits = async () => {
      if (user && user.kingdom && user.kingdom._id) {
        try {
          const response = await axios.get(`/api/kingdoms/${user.kingdom._id}`);
          const army = response.data.army;
          const unitCounts = army.reduce((acc, unit) => {
            const unitId = unit.unit._id || unit.unit;
            if (!acc[unitId]) {
              acc[unitId] = 0;
            }
            acc[unitId] += unit.quantity;
            return acc;
          }, {});
          setCurrentUnits(unitCounts);
        } catch (error) {
          console.error('Error fetching current units:', error);
        }
      }
    };

    fetchCurrentUnits();
  }, [user]);

  const handleQuantityChange = (e, unitId) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0) {
      setQuantities((prev) => ({ ...prev, [unitId]: parseInt(value, 10) }));
    } else {
      setQuantities((prev) => ({ ...prev, [unitId]: 0 }));
    }
  };

  const handlePurchase = async () => {
    if (!user) return;

    const selectedUnits = Object.entries(quantities).filter(([unitId, quantity]) => quantity > 0);

    if (selectedUnits.length === 0) {
      setError('Please select at least one unit to purchase.');
      return;
    }

    try {
      for (const [unitId, quantity] of selectedUnits) {
        console.log('Purchasing unit:', unitId, 'Quantity:', quantity);
        const response = await axios.post('http://localhost:3000/api/units/purchase', {
          userId: user._id,
          unitId,
          quantity,
        });
        console.log('Purchase Response:', response.data);
      }

      if (onUnitPurchase) onUnitPurchase();
      if (onKingdomUpdate) onKingdomUpdate();
      setQuantities({});
      setError(null);
      setPurchaseMessage('Units purchased successfully!');
      setTimeout(() => setPurchaseMessage(''), 3000); // Clear message after 3 seconds

      // Update the current units after purchase
      const updatedCurrentUnits = { ...currentUnits };
      selectedUnits.forEach(([unitId, quantity]) => {
        updatedCurrentUnits[unitId] = (updatedCurrentUnits[unitId] || 0) + quantity;
      });
      setCurrentUnits(updatedCurrentUnits);
    } catch (error) {
      console.error('Error purchasing unit:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while purchasing the unit.');
      }
    }
  };

  return (
    <div className="units-container">
      <h2>Units for Sale</h2>
      <div className="units-list">
        {units.length > 0 ? (
          units.map((unit, index) => (
            <div
              key={`${unit._id}-${index}`}
              className="unit-card"
              style={{
                backgroundImage: `url(/images/${unit.name.toLowerCase()}.png)`
              }}
              onMouseEnter={() => setHoveredUnitId(unit._id)}
              onMouseLeave={() => setHoveredUnitId(null)}
            >
              <div className="unit-info">
                <h3>{unit.name} <span className="info-icon">ℹ️</span></h3>
                {hoveredUnitId === unit._id && (
                  <div className="info-box">
                    <p>Cost: {unit.cost}</p>
                    <p>Attack: {unit.attack}</p>
                    <p>Defense: {unit.defense}</p>
                    <p>Health: {unit.health}</p>
                    <p>Speed: {unit.speed}</p>
                  </div>
                )}
                <p className="current-units">Current: {currentUnits[unit._id] || 0}</p>
              </div>
              <div className="quantity-input">
                <label htmlFor={`quantity-${unit._id}`}>{unit.name}:</label>
                <input
                  type="number"
                  id={`quantity-${unit._id}`}
                  value={quantities[unit._id] || 0}
                  onChange={(e) => handleQuantityChange(e, unit._id)}
                  min="0"
                />
              </div>
            </div>
          ))
        ) : (
          <p>No units available. Please create a unit first.</p>
        )}
      </div>

      <div className="purchase-section">
        <div className="purchase-buttons">
          <button onClick={handlePurchase}>Purchase</button>
        </div>
        {purchaseMessage && <div className="success-message">{purchaseMessage}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Units;
