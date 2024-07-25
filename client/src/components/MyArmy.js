import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyArmy = ({ triggerFetch }) => {
  const { user } = useContext(AuthContext);
  const [army, setArmy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignQuantity, setAssignQuantity] = useState(1);

  const fetchArmy = async () => {
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
    if (user) {
      fetchArmy();
    }
  }, [user]);

  useEffect(() => {
    if (triggerFetch) {
      fetchArmy();
    }
  }, [triggerFetch]);

  const handleAssign = async (unitId, assignment) => {
    if (!user || !assignQuantity) return;

    try {
      const quantity = parseInt(assignQuantity, 10);
      if (isNaN(quantity) || quantity <= 0) return;

      console.log('Assigning unit:', unitId, 'to', assignment, 'Quantity:', quantity);
      const response = await axios.post('/api/units/assign', {
        userId: user._id,
        unitId,
        assignment,
        quantity,
      });
      console.log('Assign Response:', response.data);
      fetchArmy(); // Refetch the army to get updated data
    } catch (error) {
      console.error('Error assigning unit:', error);
    }
  };

  const renderUnitList = (units, assignment) => (
    <ul>
      {units
        .filter(unit => unit.assignedTo === assignment && (assignment !== 'unassigned' || unit.quantity > 0))
        .map((unit, index) => (
          <li key={`${unit.unit._id}-${index}`}>
            <strong>Amount: {unit.quantity}</strong> - {unit.unit.name}, Cost: {unit.unit.cost}, Attack: {unit.unit.attack}, Defense: {unit.unit.defense}
            {assignment === 'unassigned' && (
              <div>
                <input
                  type="number"
                  placeholder="Assign Quantity"
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(e.target.value)}
                />
                <button onClick={() => handleAssign(unit.unit._id, 'offensive')}>Assign to Offensive</button>
                <button onClick={() => handleAssign(unit.unit._id, 'defensive')}>Assign to Defensive</button>
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!army.length) {
    return <div>You have no units in your army.</div>;
  }

  return (
    <div>
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
