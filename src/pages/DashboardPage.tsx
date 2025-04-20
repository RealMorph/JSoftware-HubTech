import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/hooks/useAuth';
import { ActivityLog } from '../components/activity/ActivityLog';
import { useContacts } from '../core/hooks/useContacts';
import { useDeals } from '../core/hooks/useDeals';

const DashboardPage: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="dashboard-page loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="dashboard-page unauthorized">
        <h2>Unauthorized</h2>
        <p>Please log in to access your dashboard.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-stats">
          <div className="stats-card">
            <h3>Contacts</h3>
            <div className="stats-number">{contacts.length}</div>
          </div>
          
          <div className="stats-card">
            <h3>Deals</h3>
            <div className="stats-number">{deals.length}</div>
          </div>
          
          <div className="stats-card">
            <h3>Tasks</h3>
            <div className="stats-number">0</div>
          </div>
        </div>
        
        <div className="dashboard-activity">
          <ActivityLog 
            title="Recent Activity"
            className="dashboard-activity-log"
          />
        </div>
        
        <div className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => navigate('/contacts/new')}>
              Add Contact
            </button>
            <button onClick={() => navigate('/deals/new')}>
              Create Deal
            </button>
            <button onClick={() => navigate('/tasks')}>
              View Tasks
            </button>
          </div>
        </div>
        
        <div className="dashboard-recent">
          <h3>Recent Contacts</h3>
          {contacts.length > 0 ? (
            <ul className="recent-contacts">
              {contacts.slice(0, 5).map(contact => (
                <li key={contact.id} className="recent-contact">
                  <div className="contact-info">
                    <div className="contact-name">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="contact-email">{contact.email}</div>
                  </div>
                  <button onClick={() => navigate(`/contacts/${contact.id}`)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">No contacts yet</p>
          )}
        </div>
        
        <div className="dashboard-recent">
          <h3>Recent Deals</h3>
          {deals.length > 0 ? (
            <ul className="recent-deals">
              {deals.slice(0, 5).map(deal => (
                <li key={deal.id} className="recent-deal">
                  <div className="deal-info">
                    <div className="deal-name">{deal.name}</div>
                    <div className="deal-amount">${deal.amount} - {deal.stage}</div>
                  </div>
                  <button onClick={() => navigate(`/deals/${deal.id}`)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">No deals yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 