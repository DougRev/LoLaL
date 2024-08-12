import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyArmy.css';

const MyArmy = ({ triggerFetch, onUnitAssign, onKingdomUpdate }) => {
  const { user } = useContext(AuthContext);
  const [army, setArmy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignQuantity, setAssignQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState('unassigned');
  const [inputError, setInputError] = useState(null);

  const fetchArmy = async () => {
    if (!user || !user._id) return;
    try {
      const response = await axios.get(`/api/users/${user._id}/army`);
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
      setAssignQuantity(0);  
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
      setAssignQuantity(0); 
      onUnitAssign();
    } catch (error) {
      console.error('Error reassigning unit:', error);
    }
  };

  const handleMaxQuantity = (maxQuantity) => {
    setAssignQuantity(maxQuantity);
    setInputError(null);  
  };

  const handleQuantityChange = (e, maxQuantity) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      setAssignQuantity(0);
      setInputError('Quantity must be at least 1');
    } else if (value > maxQuantity) {
      setAssignQuantity(maxQuantity);
      setInputError(`Quantity cannot exceed ${maxQuantity}`);
    } else {
      setAssignQuantity(value);
      setInputError(null);  
    }
  };

  const renderUnit = (unit, assignment) => {
    if (!unit.unit) {
      return (
        <tr className="army-row" key={unit._id}>
          <td colSpan="3" className="unit-details" style={{ color: 'red' }}>
            Unit data unavailable
          </td>
        </tr>
      );
    }

    return (
      <tr className="army-row" key={`${unit.unit._id}-${unit.quantity}`}>
        <td className="army-details">
          <strong>{unit.unit.name}</strong> (Qty: {unit.quantity})
        </td>
        <td className="army-actions">
          <input
            type="number"
            placeholder="Qty"
            value={assignQuantity}
            onChange={(e) => handleQuantityChange(e, unit.quantity)}
            min="1"
            max={unit.quantity}
            className="assign-input"
          />
          <button
            onClick={() => handleMaxQuantity(unit.quantity)}
            className="assign-button"
          >
            Max
          </button>
          {assignment === 'unassigned' && (
            <>
              <button onClick={() => handleAssign(unit.unit._id, 'offensive')} className="assign-button">Offensive</button>
              <button onClick={() => handleAssign(unit.unit._id, 'defensive')} className="assign-button">Defensive</button>
            </>
          )}
          {assignment === 'offensive' && (
            <>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'defensive')} className="assign-button">Defensive</button>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'unassigned')} className="assign-button">Unassign</button>
            </>
          )}
          {assignment === 'defensive' && (
            <>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'offensive')} className="assign-button">Offensive</button>
              <button onClick={() => handleReassign(unit.unit._id, assignment, 'unassigned')} className="assign-button">Unassign</button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const renderUnitList = (units, assignment) => (
    <table className="army-table">
      <thead>
        <tr>
          <th>Unit</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {units.filter(unit => unit.assignedTo === assignment && unit.quantity > 0)
          .map(unit => renderUnit(unit, assignment))}
      </tbody>
    </table>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'unassigned':
        return renderUnitList(army, 'unassigned');
      case 'offensive':
        return renderUnitList(army, 'offensive');
      case 'defensive':
        return renderUnitList(army, 'defensive');
      default:
        return null;
    }
  };

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
      <div className="army-tabs">
        <button className={activeTab === 'unassigned' ? 'active' : ''} onClick={() => setActiveTab('unassigned')}>Unassigned Units</button>
        <button className={activeTab === 'offensive' ? 'active' : ''} onClick={() => setActiveTab('offensive')}>Offensive Units</button>
        <button className={activeTab === 'defensive' ? 'active' : ''} onClick={() => setActiveTab('defensive')}>Defensive Units</button>
      </div>
      {inputError && <p className="input-error">{inputError}</p>} 
      {renderTabContent()}
    </div>
  );
};

export default MyArmy;
