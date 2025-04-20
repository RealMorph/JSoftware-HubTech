import React, { useState } from 'react';
import { ActivityLog } from './ActivityLog';
import { WebSocketService, ActivityType } from '../../core/firebase/websocket-service';

interface ActivityLogPageProps {
  className?: string;
}

export const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  
  // Generate demo activity
  const generateDemoActivity = (type: ActivityType) => {
    const websocketService = WebSocketService.getInstance();
    
    const demoActivities = {
      contact_created: {
        entityId: `contact-${Math.floor(Math.random() * 1000)}`,
        entityType: 'contact',
        data: { name: `Demo Contact ${Math.floor(Math.random() * 100)}` }
      },
      contact_updated: {
        entityId: `contact-${Math.floor(Math.random() * 1000)}`,
        entityType: 'contact',
        data: { name: `Updated Contact ${Math.floor(Math.random() * 100)}` }
      },
      deal_created: {
        entityId: `deal-${Math.floor(Math.random() * 1000)}`,
        entityType: 'deal',
        data: { name: `New Deal ${Math.floor(Math.random() * 100)}`, value: Math.floor(Math.random() * 10000) }
      },
      task_created: {
        entityId: `task-${Math.floor(Math.random() * 1000)}`,
        entityType: 'task',
        data: { title: `New Task ${Math.floor(Math.random() * 100)}` }
      },
      task_completed: {
        entityId: `task-${Math.floor(Math.random() * 1000)}`,
        entityType: 'task',
        data: { title: `Completed Task ${Math.floor(Math.random() * 100)}` }
      },
      payment_received: {
        entityId: `payment-${Math.floor(Math.random() * 1000)}`,
        entityType: 'payment',
        data: { amount: Math.floor(Math.random() * 1000), currency: 'USD' }
      }
    };
    
    const activityData = demoActivities[type] || {};
    
    websocketService.publishActivity({
      type,
      ...activityData
    });
  };
  
  return (
    <div className={`activity-log-page ${className}`}>
      <div className="page-header">
        <h1>Activity Logging</h1>
        <p>Real-time activity monitoring with WebSockets</p>
      </div>
      
      <div className="demo-controls">
        <h3>Generate Demo Activities</h3>
        <div className="demo-buttons">
          <button
            onClick={() => generateDemoActivity('contact_created')}
            className="demo-button contact"
          >
            Create Contact
          </button>
          <button
            onClick={() => generateDemoActivity('contact_updated')}
            className="demo-button contact"
          >
            Update Contact
          </button>
          <button
            onClick={() => generateDemoActivity('deal_created')}
            className="demo-button deal"
          >
            Create Deal
          </button>
          <button
            onClick={() => generateDemoActivity('task_created')}
            className="demo-button task"
          >
            Create Task
          </button>
          <button
            onClick={() => generateDemoActivity('task_completed')}
            className="demo-button task"
          >
            Complete Task
          </button>
          <button
            onClick={() => generateDemoActivity('payment_received')}
            className="demo-button payment"
          >
            Record Payment
          </button>
        </div>
      </div>
      
      <div className="activity-tabs">
        <div className="tab-header">
          <button
            className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            All Activities
          </button>
          <button
            className={`tab ${selectedTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setSelectedTab('contacts')}
          >
            Contacts
          </button>
          <button
            className={`tab ${selectedTab === 'deals' ? 'active' : ''}`}
            onClick={() => setSelectedTab('deals')}
          >
            Deals
          </button>
          <button
            className={`tab ${selectedTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setSelectedTab('tasks')}
          >
            Tasks
          </button>
        </div>
        
        <div className="tab-content">
          {selectedTab === 'all' && (
            <ActivityLog
              title="All Activities"
              maxActivities={100}
              showFilters={true}
            />
          )}
          
          {selectedTab === 'contacts' && (
            <ActivityLog
              title="Contact Activities"
              filter={{
                types: ['contact_created', 'contact_updated', 'contact_deleted'],
                entityType: 'contact'
              }}
              maxActivities={50}
              showFilters={true}
            />
          )}
          
          {selectedTab === 'deals' && (
            <ActivityLog
              title="Deal Activities"
              filter={{
                types: ['deal_created', 'deal_updated', 'deal_deleted'],
                entityType: 'deal'
              }}
              maxActivities={50}
              showFilters={true}
            />
          )}
          
          {selectedTab === 'tasks' && (
            <ActivityLog
              title="Task Activities"
              filter={{
                types: ['task_created', 'task_completed'],
                entityType: 'task'
              }}
              maxActivities={50}
              showFilters={true}
            />
          )}
        </div>
      </div>
      
      <div className="developer-info">
        <h3>Integration Information</h3>
        <p>The activity logging system uses WebSockets for real-time updates and can be easily integrated into any component.</p>
        <pre>
          {`
// Using the useActivityLog hook in any component
import { useActivityLog } from 'core/hooks/useActivityLog';

// Inside your component:
const { 
  activities, 
  isConnected, 
  publishActivity 
} = useActivityLog({
  autoConnect: true,
  filter: {
    types: ['contact_created', 'contact_updated'],
    entityType: 'contact'
  }
});

// Publishing a new activity:
publishActivity({
  type: 'contact_created',
  entityId: 'contact-123',
  entityType: 'contact',
  data: { name: 'New Contact' }
});
          `}
        </pre>
      </div>
    </div>
  );
}; 