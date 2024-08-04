import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './AccountSecurity.css';

const AccountSecurity = () => {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      await axios.put(`/api/users/${user._id}/password`, {
        currentPassword,
        newPassword,
      });
      setMessage('Password updated successfully.');
    } catch (error) {
      setMessage('Error updating password.');
    }
  };

  return (
    <div className="account-security">
      <h2>Account Security</h2>
      <div className="form-group">
        <label>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </div>
      <button onClick={handleChangePassword}>Change Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AccountSecurity;
