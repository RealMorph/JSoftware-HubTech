import React, { useState, useEffect, useMemo } from 'react';
import { useActivityLog } from '../../core/hooks/useActivityLog';
import { ActivityType, ActivityLogMessage } from '../../core/firebase/websocket-service';
import { ActivityLogFilter, ActivityFilterOptions } from './ActivityLogFilter';

interface ActivityLogProps {
  filter?: {
    types?: ActivityType[];
    entityId?: string;
    entityType?: string;
  };
  maxActivities?: number;
  title?: string;
  className?: string;
  showFilters?: boolean;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  filter,
  maxActivities = 50,
  title = 'Activity Log',
  className = '',
  showFilters = true
}) => {
  const [localFilters, setLocalFilters] = useState<ActivityFilterOptions>({});
  const { 
    activities, 
    isConnected, 
    connect, 
    disconnect,
    clearActivities
  } = useActivityLog({
    autoConnect: true,
    maxActivities,
    filter: {
      ...filter,
      types: localFilters.types || filter?.types
    }
  });
  
  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get activity icon based on type
  const getActivityIcon = (type: ActivityType): string => {
    switch (type) {
      case 'contact_created':
        return '👤';
      case 'contact_updated':
        return '✏️';
      case 'contact_deleted':
        return '🗑️';
      case 'deal_created':
        return '💼';
      case 'deal_updated':
        return '📝';
      case 'deal_deleted':
        return '🗑️';
      case 'task_created':
        return '📋';
      case 'task_completed':
        return '✅';
      case 'payment_received':
        return '💰';
      case 'user_login':
        return '🔑';
      case 'subscription_updated':
        return '🔄';
      default:
        return '📣';
    }
  };
  
  // Get activity description
  const getActivityDescription = (activity: ActivityLogMessage): string => {
    switch (activity.type) {
      case 'contact_created':
        return `Contact created: ${activity.data?.name || 'New contact'}`;
      case 'contact_updated':
        return `Contact updated: ${activity.data?.name || 'Contact'}`;
      case 'contact_deleted':
        return `Contact deleted: ${activity.data?.name || 'Contact'}`;
      case 'deal_created':
        return `Deal created: ${activity.data?.name || 'New deal'}`;
      case 'deal_updated':
        return `Deal updated: ${activity.data?.name || 'Deal'}`;
      case 'deal_deleted':
        return `Deal deleted: ${activity.data?.name || 'Deal'}`;
      case 'task_created':
        return `Task created: ${activity.data?.title || 'New task'}`;
      case 'task_completed':
        return `Task completed: ${activity.data?.title || 'Task'}`;
      case 'payment_received':
        return `Payment received: ${activity.data?.amount ? `$${activity.data.amount}` : 'Payment'}`;
      case 'user_login':
        return 'User logged in';
      case 'subscription_updated':
        return `Subscription updated: ${activity.data?.plan || 'Subscription'}`;
      default:
        return 'Activity logged';
    }
  };

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filter by date range
      if (localFilters.dateFrom && new Date(activity.timestamp) < localFilters.dateFrom) {
        return false;
      }
      if (localFilters.dateTo) {
        const endOfDay = new Date(localFilters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (new Date(activity.timestamp) > endOfDay) {
          return false;
        }
      }

      // Filter by entity type
      if (localFilters.entityType && activity.entityType !== localFilters.entityType) {
        return false;
      }

      // Filter by search term
      if (localFilters.searchTerm) {
        const searchTerm = localFilters.searchTerm.toLowerCase();
        const description = getActivityDescription(activity).toLowerCase();
        const entityId = activity.entityId?.toLowerCase() || '';
        const entityType = activity.entityType?.toLowerCase() || '';
        const activityType = activity.type.toLowerCase();
        const dataString = activity.data ? JSON.stringify(activity.data).toLowerCase() : '';

        return description.includes(searchTerm) || 
               entityId.includes(searchTerm) || 
               entityType.includes(searchTerm) || 
               activityType.includes(searchTerm) || 
               dataString.includes(searchTerm);
      }

      return true;
    });
  }, [activities, localFilters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ActivityFilterOptions) => {
    setLocalFilters(newFilters);
  };
  
  return (
    <div className={`activity-log ${className}`}>
      <div className="activity-log-header">
        <h3>{title}</h3>
        <div className="activity-log-controls">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <button 
            onClick={isConnected ? disconnect : connect}
            className="connection-toggle"
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
          <button 
            onClick={clearActivities}
            className="clear-activities"
          >
            Clear
          </button>
        </div>
      </div>
      
      {showFilters && (
        <ActivityLogFilter 
          onFilterChange={handleFilterChange}
          className="activity-filters"
        />
      )}
      
      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">No activities to display</div>
        ) : (
          <>
            <div className="activity-count">{filteredActivities.length} activities</div>
            {filteredActivities.map(activity => (
              <div key={activity.id} className={`activity-item ${activity.type}`}>
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getActivityDescription(activity)}
                  </div>
                  <div className="activity-metadata">
                    {activity.entityType && (
                      <span className="activity-entity-type">
                        {activity.entityType}
                      </span>
                    )}
                    {activity.entityId && (
                      <span className="activity-entity-id">
                        ID: {activity.entityId}
                      </span>
                    )}
                  </div>
                  <div className="activity-timestamp">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}; 