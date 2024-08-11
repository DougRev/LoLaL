import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FactionSelection.css';

const FactionManagement = () => {
  const [factions, setFactions] = useState([]);
  const [newFaction, setNewFaction] = useState({ name: '', description: '', advantage: '', disadvantage: '' });
  const [newImage, setNewImage] = useState(null); // State for the new image file
  const [editFaction, setEditFaction] = useState(null);
  const [editImage, setEditImage] = useState(null); // State for the edit image file

  useEffect(() => {
    fetchFactions();
  }, []);

  const fetchFactions = async () => {
    try {
      const res = await axios.get('/api/factions');
      setFactions(res.data);
    } catch (error) {
      console.error('Error fetching factions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaction({ ...newFaction, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFaction({ ...editFaction, [name]: value });
  };

  const handleNewImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleEditImageChange = (e) => {
    setEditImage(e.target.files[0]);
  };

  const createFaction = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newFaction.name);
      formData.append('description', newFaction.description);
      formData.append('advantage', newFaction.advantage);
      formData.append('disadvantage', newFaction.disadvantage);
      if (newImage) formData.append('image', newImage);

      await axios.post('/api/factions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchFactions();
      setNewFaction({ name: '', description: '', advantage: '', disadvantage: '' });
      setNewImage(null);
    } catch (error) {
      console.error('Error creating faction:', error);
    }
  };

  const updateFaction = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editFaction.name);
      formData.append('description', editFaction.description);
      formData.append('advantage', editFaction.advantage);
      formData.append('disadvantage', editFaction.disadvantage);
      if (editImage) formData.append('image', editImage);

      await axios.put(`/api/factions/${editFaction._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchFactions();
      setEditFaction(null);
      setEditImage(null);
    } catch (error) {
      console.error('Error updating faction:', error);
    }
  };

  const deleteFaction = async (id) => {
    try {
      await axios.delete(`/api/factions/${id}`);
      fetchFactions();
    } catch (error) {
      console.error('Error deleting faction:', error);
    }
  };

  return (
    <div>
      <h2>Faction Management</h2>

      {/* Create Faction */}
      <div>
        <h3>Create New Faction</h3>
        <input type="text" name="name" placeholder="Name" value={newFaction.name} onChange={handleInputChange} />
        <input type="text" name="description" placeholder="Description" value={newFaction.description} onChange={handleInputChange} />
        <input type="text" name="advantage" placeholder="Advantage" value={newFaction.advantage} onChange={handleInputChange} />
        <input type="text" name="disadvantage" placeholder="Disadvantage" value={newFaction.disadvantage} onChange={handleInputChange} />
        <input type="file" name="image" onChange={handleNewImageChange} />
        <button onClick={createFaction}>Create Faction</button>
      </div>

      {/* Edit Faction */}
      {editFaction && (
        <div>
          <h3>Edit Faction</h3>
          <input type="text" name="name" placeholder="Name" value={editFaction.name} onChange={handleEditInputChange} />
          <input type="text" name="description" placeholder="Description" value={editFaction.description} onChange={handleEditInputChange} />
          <input type="text" name="advantage" placeholder="Advantage" value={editFaction.advantage} onChange={handleEditInputChange} />
          <input type="text" name="disadvantage" placeholder="Disadvantage" value={editFaction.disadvantage} onChange={handleEditInputChange} />
          <input type="file" name="image" onChange={handleEditImageChange} />
          <button onClick={updateFaction}>Update Faction</button>
          <button onClick={() => setEditFaction(null)}>Cancel</button>
        </div>
      )}

      {/* Faction List */}
      <div>
        <h3>Existing Factions</h3>
        <ul>
          {factions.map((faction) => (
            <li key={faction._id}>
              <h4>{faction.name}</h4>
              <p>{faction.description}</p>
              <p>Advantage: {faction.advantage}</p>
              <p>Disadvantage: {faction.disadvantage}</p>
              <img src={faction.image} alt={`${faction.name} logo`} style={{ width: '100px' }} />
              <button onClick={() => setEditFaction(faction)}>Edit</button>
              <button onClick={() => deleteFaction(faction._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FactionManagement;
