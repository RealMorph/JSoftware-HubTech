# Activity Logging System

This document provides an overview of the activity logging system, which enables real-time tracking and display of user activities throughout the application.

## Overview

The activity logging system uses a WebSocket connection to broadcast user activities in real-time. It is designed to:

1. Provide a centralized way to log user activities
2. Enable real-time updates across the application
3. Support activity filtering and rendering
4. Be easily integrated into any component or service

## Architecture

The system consists of several key components:

1. **WebSocketService**: Core service that manages WebSocket connections and message broadcasting
2. **useActivityLog**: React hook for consuming and publishing activity messages
3. **ActivityLog**: UI component for displaying activity logs
4. **Service integrations**: Various services (AuthService, ContactService, DealService, etc.) that publish activities

## Activity Types

The system supports the following activity types:

| Activity Type | Description |
|---------------|-------------|
| user_login | User login/logout events |
| contact_created | New contact creation |
| contact_updated | Contact information updates |
| contact_deleted | Contact deletion |
| deal_created | New deal creation |
| deal_updated | Deal updates |
| deal_deleted | Deal deletion |
| task_created | New task creation |
| task_completed | Task completion |
| payment_received | Payment processing |
| subscription_updated | Subscription changes |

## Integration Guide

### Publishing Activities

To publish an activity from a service:

```typescript
// 1. Import WebSocketService
import { WebSocketService } from '../firebase/websocket-service';

// 2. Get instance in your service
private webSocketService: WebSocketService = WebSocketService.getInstance();

// 3. Publish activity when an event occurs
this.webSocketService.publishActivity({
  type: 'contact_created',  // Activity type
  entityType: 'contact',    // Entity type
  entityId: 'contact-123',  // Related entity ID
  data: {                   // Additional data
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

### Consuming Activities in Components

Use the `useActivityLog` hook to consume activities in React components:

```typescript
import { useActivityLog } from '../../core/hooks/useActivityLog';

function MyComponent() {
  // Set up activity log with optional filters
  const { 
    activities,        // List of activities
    isConnected,       // Connection status
    publishActivity,   // Function to publish new activities
    connect,           // Connect to WebSocket
    disconnect         // Disconnect from WebSocket
  } = useActivityLog({
    autoConnect: true,               // Auto-connect on mount
    maxActivities: 50,               // Max activities to store
    filter: {                        // Optional filters
      types: ['contact_created', 'contact_updated'],
      entityType: 'contact',
      entityId: 'contact-123'
    }
  });
  
  // Render activities
  return (
    <div>
      <h2>Recent Activities</h2>
      {activities.map(activity => (
        <div key={activity.id}>
          {formatActivity(activity)}
        </div>
      ))}
    </div>
  );
}
```

## Implementation Examples

### AuthService

The AuthService logs user login and logout events:

```typescript
// Login activity
this.webSocketService.publishActivity({
  type: 'user_login',
  entityType: 'user',
  entityId: user.id,
  data: {
    email: user.email,
    timestamp: new Date().toISOString()
  }
});

// Logout activity
this.webSocketService.publishActivity({
  type: 'user_login',
  entityType: 'user',
  entityId: user.id,
  data: {
    email: user.email,
    action: 'logout',
    timestamp: new Date().toISOString()
  }
});
```

### ContactService

The ContactService logs contact-related activities:

```typescript
// Contact creation
this.webSocketService.publishActivity({
  type: 'contact_created',
  entityType: 'contact',
  entityId: contactId,
  data: {
    name: `${contact.firstName} ${contact.lastName}`,
    email: contact.email
  }
});
```

### DealService

The DealService logs deal and task activities:

```typescript
// Deal update
this.webSocketService.publishActivity({
  type: 'deal_updated',
  entityType: 'deal',
  entityId: dealId,
  data: {
    name: deal.name,
    changedFields: Object.keys(updatedFields)
  }
});

// Task completion
this.webSocketService.publishActivity({
  type: 'task_completed',
  entityType: 'task',
  entityId: taskId,
  data: {
    title: task.title,
    dealId: task.dealId,
    completedAt: now
  }
});
```

## Security Considerations

- Activities are only published for authenticated users
- WebSocket connections require a valid authentication token
- Activity data should never contain sensitive information
- Subscription filtering ensures clients only receive relevant activities

## Best Practices

1. Always include the minimum necessary data in activity payloads
2. Add activity logging after the operation has succeeded
3. Use consistent entity types and IDs across the application
4. Handle WebSocket connection failures gracefully
5. Implement appropriate filtering on both client and server sides 