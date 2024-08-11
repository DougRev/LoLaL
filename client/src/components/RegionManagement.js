import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegionManagement.css';

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [editingRegion, setEditingRegion] = useState(null);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionLevel, setNewRegionLevel] = useState('');
  const [newRegionImage, setNewRegionImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await axios.get('/api/dungeons/all-regions');
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Error fetching regions');
    }
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newRegionName.trim()) {
      setError('Region name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newRegionName);
    formData.append('level', newRegionLevel);
    if (newRegionImage) formData.append('image', newRegionImage);

    try {
      if (editingRegion) {
        await axios.put(`/api/dungeons/regions/${editingRegion._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Region updated successfully');
      } else {
        await axios.post('/api/dungeons/regions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Region created successfully');
      }

      fetchRegions();
      resetForm();
    } catch (error) {
      console.error('Error creating/updating region:', error);
      setError('Error creating/updating region');
    }
  };

  const handleEditRegion = (region) => {
    setEditingRegion(region);
    setNewRegionName(region.name || '');
    setNewRegionLevel(region.level || '');
    setNewRegionImage(null);
  };

  const handleDeleteRegion = async (regionId) => {
    try {
      await axios.delete(`/api/dungeons/regions/${regionId}`);
      setSuccess('Region deleted successfully');
      fetchRegions();
    } catch (error) {
      console.error('Error deleting region:', error);
      setError('Error deleting region');
    }
  };

  const resetForm = () => {
    setEditingRegion(null);
    setNewRegionName('');
    setNewRegionImage(null);
  };

  return (
    <div className="region-management-container">
      <h2>{editingRegion ? 'Edit Region' : 'Create Region'}</h2>
      <form className="region-form" onSubmit={handleCreateRegion}>
        <div className="form-group">
          <label>Region Name:</label>
          <input
            type="text"
            value={newRegionName}
            onChange={(e) => setNewRegionName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Region Level:</label>
          <input
            type="number"
            value={newRegionLevel}
            onChange={(e) => setNewRegionLevel(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Region Image:</label>
          <input
            type="file"
            onChange={(e) => setNewRegionImage(e.target.files[0])}
          />
        </div>
        <div className="button-group">
          <button type="submit">{editingRegion ? 'Update Region' : 'Create Region'}</button>
          {editingRegion && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <h2>Existing Regions</h2>
      <ul className="existing-regions">
        {regions.map((region) => (
          <li key={region._id}>
            <div className="region-details">
              <span>{region.name} (Level: {region.level})</span>
              <button onClick={() => handleEditRegion(region)}>Edit</button>
              <button onClick={() => handleDeleteRegion(region._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegionManagement;
