import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ProfileInfo.css';

const ProfileInfo = () => {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUsername(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`/api/users/${user._id}`, {
        name: username,
        email,
      });
      setUser(response.data);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage('Error updating profile.');
    }
  };

  return (
    <div className="profile-info">
      <h2>Profile Information</h2>
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button onClick={handleUpdate}>Update Profile</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfileInfo;
