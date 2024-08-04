import React, { useState } from 'react';
import UserManagement from '../components/UserManagement';
import UnitManager from '../components/UnitManager';
import DungeonCreation from '../components/DungeonCreation';
import RegionManagement from '../components/RegionManagement'; // Import RegionManagement component
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('UserManagement');

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
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
        <button
          className={activeTab === 'RegionManagement' ? 'active' : ''}
          onClick={() => setActiveTab('RegionManagement')}
        >
          Region Management
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'UserManagement' && <UserManagement />}
        {activeTab === 'UnitManager' && <UnitManager />}
        {activeTab === 'DungeonCreation' && <DungeonCreation />}
        {activeTab === 'RegionManagement' && <RegionManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
