import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { ProfileForm } from '../components/profile/ProfileForm';
import { SubscriptionSettings } from '../components/settings/SubscriptionSettings';
import { PaymentMethodSettings } from '../components/settings/PaymentMethodSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';

type SettingsTabs = 'profile' | 'subscription' | 'payment' | 'security' | 'privacy';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabs>('profile');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="settings-page loading">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="settings-page unauthorized">
        <h2>Unauthorized</h2>
        <p>Please log in to access your settings.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileForm />;
      case 'subscription':
        return <SubscriptionSettings />;
      case 'payment':
        return <PaymentMethodSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return <ProfileForm />;
    }
  };
  
  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <ul className="settings-tabs">
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </li>
            <li 
              className={activeTab === 'subscription' ? 'active' : ''}
              onClick={() => setActiveTab('subscription')}
            >
              Subscription
            </li>
            <li 
              className={activeTab === 'payment' ? 'active' : ''}
              onClick={() => setActiveTab('payment')}
            >
              Payment Methods
            </li>
            <li 
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              Security
            </li>
            <li 
              className={activeTab === 'privacy' ? 'active' : ''}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy & Data
            </li>
          </ul>
        </div>
        
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 