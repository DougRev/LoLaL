import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DungeonCreation.css';

const DungeonCreation = () => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [bossName, setBossName] = useState('');
  const [bossAttack, setBossAttack] = useState(0);
  const [bossDefense, setBossDefense] = useState(0);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossSpeed, setBossSpeed] = useState(0);
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardOther, setRewardOther] = useState('');
  const [dungeons, setDungeons] = useState([]);
  const [editingDungeon, setEditingDungeon] = useState(false); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [image, setImage] = useState(null);
  const [bossImage, setBossImage] = useState(null);

  useEffect(() => {
    fetchDungeons();
    fetchRegions();
  }, []);

  const fetchDungeons = async () => {
    try {
      const response = await axios.get('/api/dungeons/all');
      setDungeons(response.data);
      console.log('Dungeons:', response.data);
    } catch (error) {
      console.error('Error fetching dungeons:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await axios.get('/api/dungeons/regions');
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const handleRegionChange = async (e) => {
    const selectedRegionId = e.target.value;
    setSelectedRegion(selectedRegionId);
  
    try {
      const response = await axios.get(`/api/dungeons/region/${selectedRegionId}`);
      const regionDungeons = response.data;
      setLevel(regionDungeons.length + 1);  // Auto set level to the next available level
    } catch (error) {
      console.error('Error fetching dungeons for region:', error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('level', level);
    formData.append('boss[name]', bossName);
    formData.append('boss[attack]', bossAttack);
    formData.append('boss[defense]', bossDefense);
    formData.append('boss[health]', bossHealth);
    formData.append('boss[speed]', bossSpeed);
    formData.append('reward[gold]', rewardGold);
    formData.append('reward[other]', rewardOther);
    formData.append('regionId', selectedRegion);
    if (image) formData.append('dungeonImage', image);
    if (bossImage) formData.append('bossImage', bossImage);

    try {
      if (editingDungeon) {
        await axios.put(`/api/dungeons/${editingDungeon._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Dungeon updated successfully');
      } else {
        await axios.post('/api/dungeons', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Dungeon created successfully');
      }
      fetchDungeons();
      resetForm();
    } catch (error) {
      console.error('Error creating/updating dungeon:', error);
      setError('Error creating/updating dungeon');
    }
  };

  const handleEdit = (dungeon) => {
    setEditingDungeon(dungeon);
    setName(dungeon.name || '');
    setLevel(dungeon.level || 1);
    setBossName(dungeon.boss.name || '');
    setBossAttack(dungeon.boss.attack || 0);
    setBossDefense(dungeon.boss.defense || 0);
    setBossHealth(dungeon.boss.health || 0);
    setBossSpeed(dungeon.boss.speed || 0);
    setRewardGold(dungeon.reward.gold || 0);
    setRewardOther(dungeon.reward.other || '');
    setSelectedRegion(dungeon.region ? dungeon.region._id : '');
    setImage(null);
    setBossImage(null);
  };

  const handleDelete = async (dungeonId) => {
    try {
      await axios.delete(`/api/dungeons/${dungeonId}`);
      setSuccess('Dungeon deleted successfully');
      fetchDungeons();
    } catch (error) {
      console.error('Error deleting dungeon:', error);
      setError('Error deleting dungeon');
    }
  };

  const resetForm = () => {
    setEditingDungeon(false); // Reset to false instead of null
    setName('');
    setLevel(1);
    setBossName('');
    setBossAttack(0);
    setBossDefense(0);
    setBossHealth(0);
    setBossSpeed(0);
    setRewardGold(0);
    setRewardOther('');
    setSelectedRegion('');
    setImage(null);
    setBossImage(null);
  };

  const sortedDungeons = dungeons.reduce((acc, dungeon) => {
    const regionName = dungeon.region ? dungeon.region.name : 'Unknown Region';
    if (!acc[regionName]) {
      acc[regionName] = [];
    }
    acc[regionName].push(dungeon);
    acc[regionName].sort((a, b) => a.level - b.level);
    return acc;
  }, {});


  return (
    <div className="dungeon-creation-container">
      <div className="tabs">
        <button className="tab-button" onClick={() => setEditingDungeon('manage')}>
          Manage Dungeons
        </button>
        <button className="tab-button" onClick={() => setEditingDungeon(false)}>
          Create Dungeon
        </button>
      </div>
      {editingDungeon === 'manage' ? (
        <div>
          <h2>Manage Dungeons</h2>
          {Object.keys(sortedDungeons).map((regionName) => (
            <div key={regionName}>
              <h3>{regionName}</h3>
              <table className="dungeon-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Dungeon Name</th>
                    <th>Boss Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDungeons[regionName].map((dungeon) => (
                    <tr key={dungeon._id}>
                      <td>{dungeon.level}</td>
                      <td>{dungeon.name}</td>
                      <td>{dungeon.boss.name}</td>
                      <td>
                        <button onClick={() => handleEdit(dungeon)}>Edit</button>
                        <button onClick={() => handleDelete(dungeon._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>{editingDungeon ? 'Edit Dungeon' : 'Create Dungeon'}</h2>
          <form className="dungeon-creation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Region:</label>
              <select
                value={selectedRegion || ''}
                onChange={handleRegionChange}
                required
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Level:</label>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                required
                disabled // Disable manual input for level
              />
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Boss Name:</label>
              <input
                type="text"
                value={bossName}
                onChange={(e) => setBossName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Boss Image:</label>
              <input type="file" onChange={(e) => setBossImage(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label>Boss Attack:</label>
              <input
                type="number"
                value={bossAttack}
                onChange={(e) => setBossAttack(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Boss Defense:</label>
              <input
                type="number"
                value={bossDefense}
                onChange={(e) => setBossDefense(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Boss Health:</label>
              <input
                type="number"
                value={bossHealth}
                onChange={(e) => setBossHealth(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Boss Speed:</label>
              <input
                type="number"
                value={bossSpeed}
                onChange={(e) => setBossSpeed(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Reward Gold:</label>
              <input
                type="number"
                value={rewardGold}
                onChange={(e) => setRewardGold(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Reward Other:</label>
              <input
                type="text"
                value={rewardOther}
                onChange={(e) => setRewardOther(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Dungeon Image:</label>
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <button type="submit">{editingDungeon ? 'Update' : 'Create'}</button>
            {editingDungeon && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
    </div>
  );
};

export default DungeonCreation;
