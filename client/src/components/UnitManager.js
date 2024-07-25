import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UnitManager = ({ addUnit }) => {
  const [units, setUnits] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitAttack, setUnitAttack] = useState('');
  const [unitDefense, setUnitDefense] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);

  useEffect(() => {
    console.log('UnitManager useEffect called');
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await axios.get('/api/units');
      setUnits(response.data);
      console.log('Fetched units:', response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreateUnit = async () => {
    try {
      const response = await axios.post('/api/units', {
        name: unitName,
        cost: unitCost,
        attack: unitAttack,
        defense: unitDefense,
      });
      console.log('Unit created:', response.data);
      fetchUnits();
      clearForm();
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleEditUnit = async (id) => {
    try {
      const response = await axios.put(`/api/units/${id}`, {
        name: unitName,
        cost: unitCost,
        attack: unitAttack,
        defense: unitDefense,
      });
      console.log('Unit edited:', response.data);
      fetchUnits();
      clearForm();
    } catch (error) {
      console.error('Error editing unit:', error);
    }
  };

  const handleDeleteUnit = async (id) => {
    try {
      await axios.delete(`/api/units/${id}`);
      console.log('Unit deleted');
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const startEditing = (unit) => {
    setUnitName(unit.name);
    setUnitCost(unit.cost);
    setUnitAttack(unit.attack);
    setUnitDefense(unit.defense);
    setCurrentUnitId(unit._id);
    setIsEditing(true);
  };

  const clearForm = () => {
    setUnitName('');
    setUnitCost('');
    setUnitAttack('');
    setUnitDefense('');
    setCurrentUnitId(null);
    setIsEditing(false);
  };

  const handleSubmit = () => {
    if (isEditing) {
      handleEditUnit(currentUnitId);
    } else {
      handleCreateUnit();
    }
  };

  return (
    <div className="unit-manager">
      <h2>Unit Management</h2>
      <input
        type="text"
        placeholder="Unit Name"
        value={unitName}
        onChange={(e) => setUnitName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Cost"
        value={unitCost}
        onChange={(e) => setUnitCost(e.target.value)}
      />
      <input
        type="number"
        placeholder="Attack"
        value={unitAttack}
        onChange={(e) => setUnitAttack(e.target.value)}
      />
      <input
        type="number"
        placeholder="Defense"
        value={unitDefense}
        onChange={(e) => setUnitDefense(e.target.value)}
      />
      <button onClick={handleSubmit}>
        {isEditing ? 'Save Changes' : 'Create Unit'}
      </button>
      <button onClick={clearForm} disabled={!isEditing}>
        Cancel Edit
      </button>
      <ul>
        {units.map(unit => (
          <li key={unit._id}>
            {unit.name} - Cost: {unit.cost}, Attack: {unit.attack}, Defense: {unit.defense}
            <button onClick={() => startEditing(unit)}>Edit</button>
            <button onClick={() => handleDeleteUnit(unit._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnitManager;
