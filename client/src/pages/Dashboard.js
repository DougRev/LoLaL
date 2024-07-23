import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, {user.name}!</p>
      <p>Your faction: {user.faction}</p>
    </div>
  );
};

export default Dashboard;
