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

  useEffect(() => {
    fetchDungeons();
  }, []);

  const fetchDungeons = async () => {
    try {
      const response = await axios.get('/api/dungeons/all');
      setDungeons(response.data);
    } catch (error) {
      console.error('Error fetching dungeons:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingDungeon) {
        await axios.put(`/api/dungeons/${editingDungeon._id}`, {
          name,
          level,
          boss: {
            name: bossName,
            attack: bossAttack,
            defense: bossDefense,
            health: bossHealth,
            speed: bossSpeed
          },
          reward: {
            gold: rewardGold,
            other: rewardOther,
          },
        });
        setSuccess('Dungeon updated successfully');
      } else {
        await axios.post('/api/dungeons', {
          name,
          level,
          boss: {
            name: bossName,
            attack: bossAttack,
            defense: bossDefense,
            health: bossHealth,
            speed: bossSpeed
          },
          reward: {
            gold: rewardGold,
            other: rewardOther,
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
    setName(dungeon.name);
    setLevel(dungeon.level);
    setBossName(dungeon.boss.name);
    setBossAttack(dungeon.boss.attack);
    setBossDefense(dungeon.boss.defense);
    setBossHealth(dungeon.boss.health);
    setBossSpeed(dungeon.boss.speed);
    setRewardGold(dungeon.reward.gold);
    setRewardOther(dungeon.reward.other);
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
  };

  return (
    <div className="dungeon-creation-container">
      <h2>{editingDungeon ? 'Edit Dungeon' : 'Create Dungeon'}</h2>
      <form className="dungeon-creation-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Level:</label>
          <input type="number" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} required />
        </div>
        <div className="form-group">
          <label>Boss Name:</label>
          <input type="text" value={bossName} onChange={(e) => setBossName(e.target.value)} required />
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
        <button type="submit">{editingDungeon ? 'Update' : 'Create'}</button>
        {editingDungeon && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      <h2>Existing Dungeons</h2>
      <ul className="existing-dungeons">
        {dungeons.map((dungeon) => (
          <li key={dungeon._id}>
            {dungeon.name} (Level: {dungeon.level}) - Boss: {dungeon.boss.name}, Attack: {dungeon.boss.attack}, Defense: {dungeon.boss.defense}, Health: {dungeon.boss.health}, Speed: {dungeon.boss.speed}, Reward: {dungeon.reward.gold} Gold, {dungeon.reward.other}
            <button onClick={() => handleEdit(dungeon)}>Edit</button>
            <button onClick={() => handleDelete(dungeon._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DungeonCreation;
