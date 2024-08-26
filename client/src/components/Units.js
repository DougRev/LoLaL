import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Units.css';

const Units = ({ onUnitPurchase, onKingdomUpdate }) => {
  const { user, fetchKingdom } = useContext(AuthContext); 
  const [units, setUnits] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);
  const [currentUnits, setCurrentUnits] = useState({});
  const [expandedUnitId, setExpandedUnitId] = useState(null);
  const [selectedTier, setSelectedTier] = useState('All'); // New state for tier filtering
  const detailsRef = useRef(null);

  useEffect(() => {
    const fetchAvailableUnits = async () => {
      if (user) {
        try {
          const response = await axios.get(`/api/units/available?userId=${user._id}`);
          console.log("Fetched units:", response.data); // Log the response
          setUnits(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
        } catch (error) {
          console.error('Error fetching available units:', error);
          setError('Failed to fetch units. Please try again.');
        }
      }
    };
  
    fetchAvailableUnits();
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
  
    // Calculate the total cost of the selected units
    const totalCost = selectedUnits.reduce((total, [unitId, quantity]) => {
      const unit = units.find((u) => u._id === unitId);
      return total + (unit.cost * quantity);
    }, 0);
  
    // Check if the user has enough gold before proceeding
    if (user.kingdom.gold < totalCost) {
      setError('Not enough gold to purchase the selected units.');
      return;
    }
  
    try {
      const purchasePromises = selectedUnits.map(([unitId, quantity]) =>
        axios.post('/api/units/purchase', {
          userId: user._id,
          unitId,
          quantity,
        })
      );
  
      await Promise.all(purchasePromises);
  
      // Update kingdom data after purchase
      await fetchKingdom(user.kingdom._id);
  
      if (onUnitPurchase) onUnitPurchase();
      if (onKingdomUpdate) onKingdomUpdate();
      setQuantities({});
      setError(null);
  
      const updatedCurrentUnits = { ...currentUnits };
      selectedUnits.forEach(([unitId, quantity]) => {
        updatedCurrentUnits[unitId] = (updatedCurrentUnits[unitId] || 0) + quantity;
      });
      setCurrentUnits(updatedCurrentUnits);
  
    } catch (error) {
      console.error('Error purchasing units:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while purchasing the unit. Please try again.');
      }
    }
  };

  const toggleDetails = (unitId) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);

    if (detailsRef.current) {
      const detailsBox = detailsRef.current;
      detailsBox.style.height = 'auto';
      const height = detailsBox.clientHeight + 'px';
      detailsBox.style.height = '0px';
      setTimeout(() => {
        detailsBox.style.height = height;
      }, 0);
    }
  };

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
  };

  const filteredUnits = Array.isArray(units) ? units.filter((unit) => {
    if (selectedTier === 'All') return true;
    return unit.tier === selectedTier;
  }) : [];
  

  const selectedUnits = Object.entries(quantities)
    .filter(([_, quantity]) => quantity > 0)
    .map(([unitId, quantity]) => {
      const unit = units.find((u) => u._id === unitId);
      return { ...unit, quantity };
    });

  const totalCost = selectedUnits.reduce((total, unit) => total + unit.cost * unit.quantity, 0);

  return (
    <div className="units-container">
      <h2>Units for Sale</h2>
      <p>Your army is everything to defending your empire and expanding it. Recruitment is just a few gold coins away.</p>

      {/* Tier Filters */}
      <div className="tier-filters">
        <button onClick={() => handleTierChange('All')} className={selectedTier === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => handleTierChange('Basic')} className={selectedTier === 'Basic' ? 'active' : ''}>Basic</button>
        <button onClick={() => handleTierChange('Intermediate')} className={selectedTier === 'Intermediate' ? 'active' : ''}>Intermediate</button>
        <button onClick={() => handleTierChange('Advanced')} className={selectedTier === 'Advanced' ? 'active' : ''}>Advanced</button>
      </div>

      <div className="units-list">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit, index) => (
            <div key={`${unit._id}-${index}`} className="unit-wrapper">
              <div
                className="unit-card"
                style={{ backgroundImage: `url(${unit.image})` }}
                onClick={() => toggleDetails(unit._id)}
              >
                <div className="unit-info">
                  <h3>{unit.name}</h3>
                  <p className="current-units">Current: {currentUnits[unit._id] || 0}</p>
                  <p className="cost">Cost: {unit.cost}</p>
                </div>
                <div className="quantity-input">
                  <input
                    type="number"
                    id={`quantity-${unit._id}`}
                    value={quantities[unit._id] || 0}
                    onChange={(e) => handleQuantityChange(e, unit._id)}
                    onClick={(e) => e.stopPropagation()}
                    min="0"
                  />
                </div>
              </div>
              <div
                ref={detailsRef}
                className={`details-box ${expandedUnitId === unit._id ? 'expanded' : ''}`}
              >
                <div className="details-row">
                  <p>Attack: {unit.attack}</p>
                  <p>Defense: {unit.defense}</p>
                  <p>Health: {unit.health}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No units available. Try Upgrading your Barracks.</p>
        )}
      </div>

      {selectedUnits.length > 0 && (
        <div className="recap-section">
          <h3>Selected Units</h3>
          <table className="recap-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {selectedUnits.map((unit, index) => (
                <tr key={index}>
                  <td>{unit.name}</td>
                  <td>{unit.quantity}</td>
                  <td>{unit.cost * unit.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">Total</td>
                <td>{totalCost}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="purchase-section">
        <button onClick={handlePurchase}>Purchase</button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Units;
