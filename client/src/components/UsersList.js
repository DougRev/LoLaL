import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './UsersList.css'; // Ensure you have a CSS file for styling if needed

const UsersList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAttack = (targetUserId) => {
    console.log(`Attacking user with ID: ${targetUserId}`);
    // Add logic for initiating an attack here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="users-list-container">
      <h2 className="users-list-title">Battlegrounds</h2>
      <ul className="users-list">
        {users.map((otherUser) => (
          <li key={otherUser._id} className="user-item">
            {otherUser.name} - Faction: {otherUser.faction ? otherUser.faction.name : 'No Faction'}
            {otherUser.faction && otherUser.faction.name !== user.faction?.name && (
              <button onClick={() => handleAttack(otherUser._id)}>Attack</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
