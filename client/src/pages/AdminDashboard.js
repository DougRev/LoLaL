import React from 'react';
import UserManagement from '../components/UserManagement';
import UnitManager from '../components/UnitManager';

const AdminDashboard = () => {
  console.log('AdminDashboard rendered');

  const addUnit = (unit) => {
    // Implement addUnit functionality if needed
    console.log('addUnit called with:', unit);
  };

  return (
    <div>
      {console.log('Rendering UserManagement and UnitManager')}
      <h1>Admin Dashboard</h1>
      <UserManagement />
      <UnitManager addUnit={addUnit} />
    </div>
  );
};

export default AdminDashboard;
