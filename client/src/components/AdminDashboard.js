import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserRole, setEditUserRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEditRole = (id, role) => {
    setEditUserId(id);
    setEditUserRole(role);
  };

  const handleSaveRole = async (id) => {
    try {
      await axios.put(`/api/admin/users/${id}`, { role: editUserRole });
      setEditUserId(null);
      setEditUserRole('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
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
                  <button onClick={() => handleSaveRole(user._id)}>Save</button>
                ) : (
                  <button onClick={() => handleEditRole(user._id, user.role)}>Edit</button>
                )}
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
