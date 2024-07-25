import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('UserManagement: Sending token:', token);
      const response = await axios.get('/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      setUsers(response.data);
      console.log('Fetched users:', response.data);
    } catch (error) {
      console.error('UserManagement: Error fetching users:', error);
    }
  };

  const handleEditRole = (id, role) => {
    setEditUserId(id);
    setEditUserRole(role);
  };

  const handleSaveRole = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${id}`, { role: editUserRole }, {
        headers: { 'x-auth-token': token }
      });
      setEditUserId(null);
      setEditUserRole('');
      fetchUsers();
    } catch (error) {
      console.error('UserManagement: Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (error) {
      console.error('UserManagement: Error deleting user:', error);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {editUserId === user._id ? (
                  <input
                    type="text"
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editUserId === user._id ? (
                  <button className="edit-btn" onClick={() => handleSaveRole(user._id)}>Save</button>
                ) : (
                  <button className="edit-btn" onClick={() => handleEditRole(user._id, user.role)}>Edit</button>
                )}
                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
