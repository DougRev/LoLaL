import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyArmy.css';

const MyArmy = ({ triggerFetch, onUnitAssign, onKingdomUpdate }) => {
  const { user } = useContext(AuthContext);
  const [army, setArmy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignQuantity, setAssignQuantity] = useState(1);

  const fetchArmy = async () => {
    if (!user || !user._id) return;
    try {
      const response = await axios.get(`/api/users/${user._id}/army`);
      console.log('Army data:', response.data.army); // Log the entire army data
      setArmy(response.data.army);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching army:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchArmy();
  }, [user, triggerFetch]);

  const handleAssign = async (unitId, assignment) => {
    if (!user || !assignQuantity) return;

    try {
      const quantity = parseInt(assignQuantity, 10);
      if (isNaN(quantity) || quantity <= 0) return;

      await axios.post('/api/units/assign', {
        userId: user._id,
        unitId,
        assignment,
        quantity,
      });
      fetchArmy();
      onUnitAssign();
    } catch (error) {
      console.error('Error assigning unit:', error);
    }
  };

  const handleReassign = async (unitId, currentAssignment, newAssignment) => {
    if (!user || !assignQuantity) return;

    try {
      const quantity = parseInt(assignQuantity, 10);
      if (isNaN(quantity) || quantity <= 0) return;

      await axios.post('/api/units/reassign', {
        userId: user._id,
        unitId,
        currentAssignment,
        newAssignment,
        quantity,
      });
      fetchArmy();
      onUnitAssign();
    } catch (error) {
      console.error('Error reassigning unit:', error);
    }
  };

  const renderUnit = (unit, assignment) => {
    if (!unit.unit) {
      return (
        <div className="unit-item" key={unit._id}>
          <div className="unit-details">
            <strong>Amount: {unit.quantity}</strong> - <span style={{ color: 'red' }}>Unit data unavailable</span>
          </div>
        </div>
      );
    }
  
    return (
      <div className="unit-item" key={`${unit.unit._id}-${unit.quantity}`}>
        <div className="unit-details">
          <strong>Amount: {unit.quantity}</strong> - {unit.unit.name}, Cost: {unit.unit.cost}, Attack: {unit.unit.attack}, Defense: {unit.unit.defense}
        </div>
        <div>
          <input
            type="number"
            placeholder="Quantity"
            value={assignQuantity}
            onChange={(e) => setAssignQuantity(Math.max(1, Math.min(e.target.value, unit.quantity)))}
            min="1"
            max={unit.quantity}
            className="assign-input"
          />
          {assignment === 'unassigned' && (
            <>
              <button onClick={() => handleAssign(unit.unit._id, 'offensive')} className="assign-button">Assign to Offensive</button>
              <button onClick={() => handleAssign(unit.unit._id, 'defensive')} className="assign-button">Assign to Defensive</button>
            </>
          )}
          {assignment === 'offensive' && (
            <>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'defensive')} className="assign-button">Reassign to Defensive</button>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'unassigned')} className="assign-button">Unassign</button>
            </>
          )}
          {assignment === 'defensive' && (
            <>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'offensive')} className="assign-button">Reassign to Offensive</button>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'unassigned')} className="assign-button">Unassign</button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderUnitList = (units, assignment) => (
    <div className="unit-container">
      {units.filter(unit => unit.assignedTo === assignment && unit.quantity > 0)
        .map(unit => renderUnit(unit, assignment))}
    </div>
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!army.length) {
    return <div className="no-units">You have no units in your army.</div>;
  }

  return (
    <div className="my-army">
      <h2>My Army</h2>
      <h3>Unassigned Units</h3>
      {renderUnitList(army, 'unassigned')}
      <h3>Offensive Units</h3>
      {renderUnitList(army, 'offensive')}
      <h3>Defensive Units</h3>
      {renderUnitList(army, 'defensive')}
    </div>
  );
};

export default MyArmy;
