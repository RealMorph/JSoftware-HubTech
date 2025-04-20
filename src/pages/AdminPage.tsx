import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { useAuthorization, AuthorizationGuard } from '../core/hooks/useAuthorization';
import { UserRoleManagement } from '../components/admin/UserRoleManagement';
import { AdminDashboard } from '../components/admin/AdminDashboard';

type AdminTabs = 'dashboard' | 'users' | 'roles' | 'settings';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTabs>('dashboard');
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="admin-page loading">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="admin-page unauthorized">
        <h2>Unauthorized</h2>
        <p>Please log in to access the admin panel.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserRoleManagement />;
      case 'roles':
        return <div>Role Definitions (Coming Soon)</div>;
      case 'settings':
        return <div>Admin Settings (Coming Soon)</div>;
      default:
        return <AdminDashboard />;
    }
  };
  
  return (
    <AuthorizationGuard
      requiredRole="admin"
      fallback={
        <div className="admin-page unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin panel.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      }
    >
      <div className="admin-page">
        <h1>Admin Panel</h1>
        
        <div className="admin-container">
          <div className="admin-sidebar">
            <ul className="admin-tabs">
              <li 
                className={activeTab === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </li>
              <li 
                className={activeTab === 'users' ? 'active' : ''}
                onClick={() => setActiveTab('users')}
              >
                User Management
              </li>
              <li 
                className={activeTab === 'roles' ? 'active' : ''}
                onClick={() => setActiveTab('roles')}
              >
                Role Definitions
              </li>
              <li 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                Admin Settings
              </li>
            </ul>
          </div>
          
          <div className="admin-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AuthorizationGuard>
  );
};

export default AdminPage; 