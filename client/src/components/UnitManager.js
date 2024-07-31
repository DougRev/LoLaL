import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UnitManager.css';

const UnitManager = ({ addUnit }) => {
  const [units, setUnits] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitAttack, setUnitAttack] = useState('');
  const [unitDefense, setUnitDefense] = useState('');
  const [unitHealth, setUnitHealth] = useState(''); 
  const [unitSpeed, setUnitSpeed] = useState('');
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
        health: unitHealth,
        speed: unitSpeed,
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
        health: unitHealth,
        speed: unitSpeed,
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
    setUnitHealth(unit.health);
    setUnitSpeed(unit.speed);
    setCurrentUnitId(unit._id);
    setIsEditing(true);
  };

  const clearForm = () => {
    setUnitName('');
    setUnitCost('');
    setUnitAttack('');
    setUnitDefense('');
    setUnitHealth('');
    setUnitSpeed('');
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
      <form className="unit-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Unit Name</label>
          <input type="text" value={unitName} onChange={(e) => setUnitName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Cost</label>
          <input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Attack</label>
          <input type="number" value={unitAttack} onChange={(e) => setUnitAttack(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Defense</label>
          <input type="number" value={unitDefense} onChange={(e) => setUnitDefense(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Health</label>
          <input type="number" value={unitHealth} onChange={(e) => setUnitHealth(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Speed</label>
          <input type="number" value={unitSpeed} onChange={(e) => setUnitSpeed(e.target.value)} required />
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Unit'}
          </button>
          {isEditing && (
            <button type="button" onClick={clearForm} className="cancel-button">
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      <h3>Existing Units</h3>
      <ul className="units-list">
        {units.map((unit) => (
          <li key={unit._id}>
            <div className="unit-details">
              <span className="unit-name">{unit.name}</span>
              <span>Cost: {unit.cost}</span>
              <span>Attack: {unit.attack}</span>
              <span>Defense: {unit.defense}</span>
              <span>Health: {unit.health}</span>
              <span>Speed: {unit.speed}</span>
            </div>
            <div className="unit-actions">
              <button onClick={() => startEditing(unit)}>Edit</button>
              <button onClick={() => handleDeleteUnit(unit._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnitManager;
