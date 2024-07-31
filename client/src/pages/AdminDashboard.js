import React, { useState } from 'react';
import UserManagement from '../components/UserManagement';
import UnitManager from '../components/UnitManager';
import DungeonCreation from '../components/DungeonCreation';
import './AdminDashboard.css';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('UserManagement');

  const addUnit = (unit) => {
    // Implement addUnit functionality if needed
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button
          className={activeTab === 'UserManagement' ? 'active' : ''}
          onClick={() => setActiveTab('UserManagement')}
        >
          User Management
        </button>
        <button
          className={activeTab === 'UnitManager' ? 'active' : ''}
          onClick={() => setActiveTab('UnitManager')}
        >
          Unit Management
        </button>
        <button
          className={activeTab === 'DungeonCreation' ? 'active' : ''}
          onClick={() => setActiveTab('DungeonCreation')}
        >
          Dungeon Management
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'UserManagement' && <UserManagement />}
        {activeTab === 'UnitManager' && <UnitManager />}
        {activeTab === 'DungeonCreation' && <DungeonCreation />}
      </div>
    </div>
  );
};

export default AdminDashboard;
