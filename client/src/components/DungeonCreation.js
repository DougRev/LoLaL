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
  const [editingDungeon, setEditingDungeon] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(''); // Ensure it's always a string
  const [newRegionName, setNewRegionName] = useState('')
  const [newRegionImage, setNewRegionImage] = useState(null); // New state for region image
  const [image, setImage] = useState(null); // For image file
  const [bossImage, setBossImage] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get('/api/dungeons/regions');
        setRegions(response.data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
  
    fetchDungeons();
    fetchRegions();
  }, []);

  const fetchDungeons = async () => {
    try {
      const response = await axios.get('/api/dungeons/all');
      setDungeons(response.data);
      console.log('Dungeons:',response.data);
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
    if (image) formData.append('dungeonImage', image); // Dungeon image
    if (bossImage) formData.append('bossImage', bossImage); // Boss image
  
    try {
      if (editingDungeon) {
        await axios.put(`/api/dungeons/${editingDungeon._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Dungeon updated successfully');
      } else {
        await axios.post('/api/dungeons', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
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
    setSelectedRegion(dungeon.region ? dungeon.region._id : ''); // Make sure this is correctly set
    setImage(null); // Reset the image input
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


  const handleCreateRegion = async () => {
    setError(null);
    setSuccess(null);
  
    if (!newRegionName.trim()) {
      setError('Region name is required.');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', newRegionName);
    if (newRegionImage) {
      formData.append('image', newRegionImage);
    }
  
    // Debugging: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      await axios.post('/api/dungeons/regions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setSuccess('Region created successfully');
      setNewRegionName('');
      setNewRegionImage(null);
  
      fetchRegions();
    } catch (error) {
      console.error('Error creating region:', error);
      setError('Error creating region');
    }
  };
  

  const resetForm = () => {
    setEditingDungeon(null);
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
    setImage(null); // Reset the image

  };

  return (
    <div className="dungeon-creation-container">
      <h2>{editingDungeon ? 'Edit Dungeon' : 'Create Dungeon'}</h2>
      <form className="dungeon-creation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Level:</label>
          <input type="number" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Region:</label>
          <select value={selectedRegion || ''} onChange={(e) => setSelectedRegion(e.target.value)} required>
            <option value="">Select Region</option>
            {regions.map(region => (
                <option key={region._id} value={region._id}>{region.name}</option>
            ))}
            </select>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Boss Name:</label>
          <input type="text" value={bossName} onChange={(e) => setBossName(e.target.value)} required />
        </div>
        <div className="form-group">
        <label>Boss Image:</label> 
        <input type="file" onChange={(e) => setBossImage(e.target.files[0])} />
      </div>
        <div className="form-group">
          <label>Boss Attack:</label>
          <input type="number" value={bossAttack} onChange={(e) => setBossAttack(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Boss Defense:</label>
          <input type="number" value={bossDefense} onChange={(e) => setBossDefense(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Boss Health:</label>
          <input type="number" value={bossHealth} onChange={(e) => setBossHealth(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Boss Speed:</label>
          <input type="number" value={bossSpeed} onChange={(e) => setBossSpeed(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Reward Gold:</label>
          <input type="number" value={rewardGold} onChange={(e) => setRewardGold(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Reward Other:</label>
          <input type="text" value={rewardOther} onChange={(e) => setRewardOther(e.target.value)} />
        </div>
        <div className="form-group">
        <label>Dungeon Image:</label> 
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      </div>

        
        <button type="submit">{editingDungeon ? 'Update' : 'Create'}</button>
        {editingDungeon && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="region-creation">
        <h2>Create Region</h2>
        <div className="form-group">
          <label>Region Name:</label>
          <input type="text" value={newRegionName} onChange={(e) => setNewRegionName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Region Image:</label> 
          <input type="file" onChange={(e) => setNewRegionImage(e.target.files[0])} />
        </div>
        <button onClick={handleCreateRegion}>Create Region</button>
      </div>

      <h2>Existing Dungeons</h2>
<ul className="existing-dungeons">
  {dungeons.map((dungeon) => (
    <li key={dungeon._id}>
      {dungeon.name} (Level: {dungeon.level}) - Boss: {dungeon.boss.name}, Attack: {dungeon.boss.attack}, Defense: {dungeon.boss.defense}, Health: {dungeon.boss.health}, Speed: {dungeon.boss.speed}, Reward: {dungeon.reward ? dungeon.reward.gold : 'N/A'} Gold, {dungeon.reward ? dungeon.reward.other : ''} Region: {dungeon.region ? dungeon.region.name : 'N/A'}
      <button onClick={() => handleEdit(dungeon)}>Edit</button>
      <button onClick={() => handleDelete(dungeon._id)}>Delete</button>
    </li>
  ))}
</ul>

    </div>
  );
};

export default DungeonCreation;
