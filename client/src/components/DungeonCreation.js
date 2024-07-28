import React, { useState } from 'react';
import axios from 'axios';

const DungeonCreation = () => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [bossName, setBossName] = useState('');
  const [bossAttack, setBossAttack] = useState(0);
  const [bossDefense, setBossDefense] = useState(0);
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardOther, setRewardOther] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/dungeons', {
        name,
        level,
        boss: {
          name: bossName,
          attack: bossAttack,
          defense: bossDefense,
        },
        reward: {
          gold: rewardGold,
          other: rewardOther,
        },
      });
      setSuccess('Dungeon created successfully');
    } catch (error) {
      console.error('Error creating dungeon:', error);
      setError('Error creating dungeon');
    }
  };

  return (
    <div>
      <h2>Create Dungeon</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Level:</label>
          <input type="number" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} required />
        </div>
        <div>
          <label>Boss Name:</label>
          <input type="text" value={bossName} onChange={(e) => setBossName(e.target.value)} required />
        </div>
        <div>
          <label>Boss Attack:</label>
          <input type="number" value={bossAttack} onChange={(e) => setBossAttack(parseInt(e.target.value))} required />
        </div>
        <div>
          <label>Boss Defense:</label>
          <input type="number" value={bossDefense} onChange={(e) => setBossDefense(parseInt(e.target.value))} required />
        </div>
        <div>
          <label>Reward Gold:</label>
          <input type="number" value={rewardGold} onChange={(e) => setRewardGold(parseInt(e.target.value))} required />
        </div>
        <div>
          <label>Reward Other:</label>
          <input type="text" value={rewardOther} onChange={(e) => setRewardOther(e.target.value)} />
        </div>
        <button type="submit">Create</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </div>
  );
};

export default DungeonCreation;
