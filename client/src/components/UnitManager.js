import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UnitManager.css';

const UnitManager = () => {
  const [units, setUnits] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [unitTier, setUnitTier] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitAttack, setUnitAttack] = useState('');
  const [unitDefense, setUnitDefense] = useState('');
  const [unitHealth, setUnitHealth] = useState(''); 
  const [unitSpeed, setUnitSpeed] = useState('');
  const [unitImage, setUnitImage] = useState(null); 
  const [barracksLevel, setBarracksLevel] = useState(''); 
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [filterTier, setFilterTier] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (isEditing && barracksLevel === '') {
      setBarracksLevel(0);
    }
  }, [isEditing, barracksLevel]);
  

  const fetchUnits = async () => {
    try {
      const response = await axios.get('/api/units');
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreateUnit = async () => {
    const formData = new FormData();
    formData.append('name', unitName);
    formData.append('tier', unitTier);
    formData.append('cost', unitCost);
    formData.append('attack', unitAttack);
    formData.append('defense', unitDefense);
    formData.append('health', unitHealth);
    formData.append('speed', unitSpeed);
    formData.append('barracksLevel', barracksLevel); 
    if (unitImage) {
      formData.append('image', unitImage);
    }

    try {
      await axios.post('/api/units', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchUnits();
      clearForm();
    } catch (error) {
      console.error('Error creating unit:', error);
    }
  };

  const handleEditUnit = async (id) => {
    const formData = new FormData();
    formData.append('name', unitName);
    formData.append('tier', unitTier);
    formData.append('cost', unitCost);
    formData.append('attack', unitAttack);
    formData.append('defense', unitDefense);
    formData.append('health', unitHealth);
    formData.append('speed', unitSpeed);
    formData.append('barracksLevel', barracksLevel); 
    if (unitImage) {
      formData.append('image', unitImage);
    }   

    try {
      await axios.put(`/api/units/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchUnits();
      clearForm();
    } catch (error) {
      console.error('Error editing unit:', error);
    }
  };

  const handleDeleteUnit = async (id) => {
    try {
      await axios.delete(`/api/units/${id}`);
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const startEditing = (unit) => {
    setUnitName(unit.name);
    setUnitTier(unit.tier);
    setUnitCost(unit.cost);
    setUnitAttack(unit.attack);
    setUnitDefense(unit.defense);
    setUnitHealth(unit.health);
    setUnitSpeed(unit.speed);
    setBarracksLevel(unit.barracksLevel); 
    setCurrentUnitId(unit._id);
    setIsEditing(true);
  };

  const clearForm = () => {
    setUnitName('');
    setUnitTier('');
    setUnitCost('');
    setUnitAttack('');
    setUnitDefense('');
    setUnitHealth('');
    setUnitSpeed('');
    setUnitImage(null); 
    setBarracksLevel(''); 
    setCurrentUnitId(null);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await handleEditUnit(currentUnitId);
        alert('Unit updated successfully!');
      } else {
        await handleCreateUnit();
        alert('Unit created successfully!');
      }
      clearForm();
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the unit.');
    }
  };
  
  
  // Filter units by tier
  const filteredUnits = filterTier
    ? units.filter((unit) => unit.tier === filterTier)
    : units;

  return (
    <div className="unit-manager">
      <h2>Unit Management</h2>
      <form className="unit-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Unit Name</label>
          <input type="text" value={unitName} onChange={(e) => setUnitName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Tier</label>
          <select value={unitTier} onChange={(e) => setUnitTier(e.target.value)} required>
            <option value="">Tier</option>
            <option value="Basic">Basic</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Elite">Elite</option>
            <option value="Mythic">Mythic</option>
          </select>
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
        <div className="form-group">
          <label>Required Barracks Level</label>
          <input
            type="number"
            value={barracksLevel}
            onChange={(e) => setBarracksLevel(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Image</label>
          <input type="file" onChange={(e) => setUnitImage(e.target.files[0])} />
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

      {/* Tier Filter */}
      <div className="tier-filter">
        <label>Filter Units by Tier:</label>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="filter-select"
        >
          <option value="">All Tiers</option>
          <option value="Basic">Basic</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Elite">Elite</option>
          <option value="Mythic">Mythic</option>
        </select>
      </div>

      {/* Display Units in a Table */}
      <table className="units-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Tier</th>
            <th>Cost</th>
            <th>Attack</th>
            <th>Defense</th>
            <th>Health</th>
            <th>Speed</th>
            <th>Barracks Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUnits.map((unit) => (
            <tr key={unit._id}>
              <td className="unit-image-cell">
                {unit.image && (
                  <img
                    src={unit.image}
                    alt={`${unit.name} image`}
                    className="unit-image-preview"
                  />
                )}
              </td>
              <td>{unit.name}</td>
              <td>{unit.tier}</td>
              <td>{unit.cost}</td>
              <td>{unit.attack}</td>
              <td>{unit.defense}</td>
              <td>{unit.health}</td>
              <td>{unit.speed}</td>
              <td>{unit.barracksLevel}</td> 
              <td>
                <button onClick={() => startEditing(unit)}>Edit</button>
                <button onClick={() => handleDeleteUnit(unit._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnitManager;
