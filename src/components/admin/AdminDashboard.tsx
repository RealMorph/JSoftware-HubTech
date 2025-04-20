import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../../core/firebase';

export const AdminDashboard: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const firestoreService = FirestoreService.getInstance();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get user count
        const users = await firestoreService.getAllDocuments('users');
        setUserCount(users.length);
        
        // Get active subscription count
        const subscriptions = await firestoreService.queryDocuments(
          'subscriptions',
          [firestoreService.whereEqual('status', 'active')]
        );
        setSubscriptionCount(subscriptions.length);
        
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return <div className="admin-dashboard loading">Loading dashboard data...</div>;
  }
  
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{userCount}</div>
        </div>
        
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <div className="stat-value">{subscriptionCount}</div>
        </div>
        
        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <div className="stat-value">
            {userCount > 0 
              ? `${((subscriptionCount / userCount) * 100).toFixed(1)}%` 
              : '0%'}
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button>Export User Data</button>
          <button>View System Logs</button>
          <button>Manage Subscriptions</button>
        </div>
      </div>
    </div>
  );
}; 