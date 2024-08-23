import React, { useState } from 'react';
import ProfileInfo from '../components/ProfileInfo';
import AccountSecurity from '../components/AccountSecurity';
import './Profile.css';


const Profile = () => {
  const [activeSection, setActiveSection] = useState('profileInfo');

  const renderSection = () => {
    switch (activeSection) {
      case 'profileInfo':
        return <ProfileInfo />;
      case 'accountSecurity':
        return <AccountSecurity />;
      // Add cases for other components as needed
      default:
        return <ProfileInfo />;
    }
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <nav className="profile-nav">
        <button onClick={() => setActiveSection('profileInfo')}>Profile Info</button>
        <button onClick={() => setActiveSection('accountSecurity')}>Account Security</button>
        {/* Add more buttons for other sections */}
      </nav>
      <div className="profile-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default Profile;
