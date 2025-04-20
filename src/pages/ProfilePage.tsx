import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '../components/profile/ProfileForm';
import { useAuth } from '../core/hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="profile-page loading">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="profile-page unauthorized">
        <h2>Unauthorized</h2>
        <p>Please log in to view your profile.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="profile-content">
        <ProfileForm onSaved={() => {
          // You might want to show a success notification or refresh data
        }} />
      </div>
    </div>
  );
};

export default ProfilePage; 