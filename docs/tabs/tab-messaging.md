# Tab Messaging System

The Tab Messaging System allows tabs to communicate with each other, share state, and establish dependencies. This document explains how to use the system and provides examples of common usage patterns.

## Overview

The tab messaging system provides several key features:

1. **Message passing**: Send and receive messages between tabs
2. **State sharing**: Share and update state between tabs
3. **Dependencies**: Define dependencies between tabs that update automatically

## Components

The system consists of several key components:

- **TabMessagingManager**: Core implementation that handles message routing and state management
- **React Hooks**: Simplified hooks for React components to interact with the messaging system
- **TabConnector**: A ready-to-use component that demonstrates the messaging features

## Implementation

The tab messaging system is implemented in several files:

- `src/core/tabs/tab-messaging.ts`: Core messaging implementation
- `src/core/tabs/hooks/useTabMessaging.ts`: React hook for messaging
- `src/core/tabs/hooks/useTabState.ts`: React hook for state management
- `src/core/tabs/components/TabConnector.tsx`: Demo component

The implementation is fully tested with unit and integration tests:

- `src/core/tabs/hooks/__tests__/useTabMessaging.test.tsx`
- `src/core/tabs/hooks/__tests__/useTabState.test.tsx`
- `src/core/tabs/components/__tests__/TabConnector.test.tsx`

## Message Types

The system supports several built-in message types:

- **STATE_UPDATE**: Sent when a tab's state is updated
- **CUSTOM_EVENT**: Used for custom events between tabs
- **DEPENDENCY_UPDATE**: Sent when a tab dependency is updated
- **REQUEST_STATE**: Used to request the state of another tab

## React Hooks

### useTabMessaging

The `useTabMessaging` hook provides an easy way to send and receive messages between tabs.

```tsx
import { useTabMessaging } from '../core/tabs/hooks';
import { MessageType } from '../core/tabs/tab-messaging';

function MyTabComponent({ tabManager, tabId }) {
  const {
    messages,       // Array of all received messages
    lastMessage,    // The most recently received message
    sendMessage,    // Function to send a message to another tab
    sendEvent,      // Helper for sending custom events
    updateState,    // Function to update tab state
    requestState,   // Function to request state from another tab
    clearMessages   // Function to clear message history
  } = useTabMessaging(tabManager, tabId);
  
  // Example: Send a message to another tab
  const handleSendMessage = () => {
    sendMessage(
      MessageType.CUSTOM_EVENT,
      { content: 'Hello from another tab!' },
      'tab-123' // Target tab ID
    );
  };
  
  // Example: Send a custom event
  const handleSendEvent = () => {
    sendEvent(
      'dataUpdated',
      { updatedAt: new Date().toISOString() },
      'tab-123' // Target tab ID
    );
  };
  
  return (
    <div>
      <button onClick={handleSendMessage}>Send Message</button>
      <button onClick={handleSendEvent}>Send Event</button>
      
      <h4>Last Message:</h4>
      {lastMessage && <pre>{JSON.stringify(lastMessage, null, 2)}</pre>}
    </div>
  );
}
```

### useTabState

The `useTabState` hook makes it easy to manage tab state and dependencies.

```tsx
import { useTabState } from '../core/tabs/hooks';

function MyStatefulTab({ tabManager, tabId }) {
  const {
    state,           // Current tab state
    isInitialized,   // Whether state has been loaded
    updateState,     // Function to update state
    dependencies,    // Array of dependencies
    dependents,      // Array of tabs depending on this tab
    addDependency,   // Function to add a dependency
    removeDependency // Function to remove a dependency
  } = useTabState(tabManager, tabId);
  
  // Example: Update tab state
  const handleUpdateState = (value) => {
    updateState({
      content: value,
      updatedAt: new Date().toISOString()
    });
  };
  
  // Example: Add a dependency on another tab
  const handleAddDependency = (providerId) => {
    addDependency(providerId, 'data');
  };
  
  return (
    <div>
      <input
        type="text"
        onChange={(e) => handleUpdateState(e.target.value)}
        placeholder="Update state"
      />
      
      <h4>Current State:</h4>
      {isInitialized ? (
        <pre>{JSON.stringify(state, null, 2)}</pre>
      ) : (
        <p>Loading state...</p>
      )}
      
      <h4>Dependencies ({dependencies.length}):</h4>
      <ul>
        {dependencies.map((dep, index) => (
          <li key={index}>
            {dep.providerId} ({dep.type})
            <button onClick={() => removeDependency(dep.providerId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TabConnector Component

The `TabConnector` component demonstrates all the messaging and state sharing features in one place. Use it as a reference for how to implement these features in your own components.

```tsx
import { TabConnector } from '../core/tabs/components/TabConnector';

function MyTabPage({ tabManager }) {
  return (
    <div>
      <h2>Tab Communication Demo</h2>
      
      <TabConnector
        tabManager={tabManager}
        tabId="tab-1"
        targetTabId="tab-2" // Optional tab to connect with
      />
    </div>
  );
}
```

## Common Use Cases

### 1. Data Synchronization Between Tabs

Use tab messaging to keep data in sync between multiple tabs:

```tsx
function DataProviderTab({ tabManager, tabId }) {
  const { updateState } = useTabState(tabManager, tabId);
  
  const updateData = (data) => {
    // Update this tab's state
    updateState({ data, lastUpdated: Date.now() });
    // Other tabs with dependencies will automatically get the update
  };
  
  return (/* Component implementation */);
}

function DataConsumerTab({ tabManager, tabId, providerTabId }) {
  const { state, addDependency } = useTabState(tabManager, tabId);
  
  // Set up dependency when the component mounts
  useEffect(() => {
    addDependency(providerTabId, 'data');
  }, [addDependency, providerTabId]);
  
  return (
    <div>
      {state?.data ? (
        <div>Synced Data: {state.data}</div>
      ) : (
        <div>Waiting for data...</div>
      )}
    </div>
  );
}
```

### 2. Coordinated Actions Across Tabs

Coordinate actions between multiple tabs:

```tsx
function CoordinatorTab({ tabManager, tabId, targetTabIds }) {
  const { sendEvent } = useTabMessaging(tabManager, tabId);
  
  const broadcastAction = (action) => {
    // Send the same action to all target tabs
    targetTabIds.forEach(targetId => {
      sendEvent('action', { type: action, timestamp: Date.now() }, targetId);
    });
  };
  
  return (
    <div>
      <button onClick={() => broadcastAction('refresh')}>
        Refresh All Tabs
      </button>
      <button onClick={() => broadcastAction('reset')}>
        Reset All Tabs
      </button>
    </div>
  );
}
```

### 3. Master-Detail Pattern

Implement a master-detail pattern with tab messaging:

```tsx
function MasterTab({ tabManager, tabId, detailTabId }) {
  const { sendEvent } = useTabMessaging(tabManager, tabId);
  const [items, setItems] = useState([]);
  
  const selectItem = (item) => {
    // Notify the detail tab about the selected item
    sendEvent('itemSelected', { item }, detailTabId);
  };
  
  return (
    <div>
      <h3>Items</h3>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => selectItem(item)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailTab({ tabManager, tabId }) {
  const { messages } = useTabMessaging(tabManager, tabId);
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    // Process the messages
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === MessageType.CUSTOM_EVENT && 
        lastMessage?.payload?.eventName === 'itemSelected') {
      setSelectedItem(lastMessage.payload.data.item);
    }
  }, [messages]);
  
  return (
    <div>
      <h3>Item Detail</h3>
      {selectedItem ? (
        <div>
          <h4>{selectedItem.name}</h4>
          <p>{selectedItem.description}</p>
        </div>
      ) : (
        <p>Select an item from the list</p>
      )}
    </div>
  );
}
```

## Advanced Usage

### Creating Tab Dependencies

Tab dependencies allow one tab to automatically receive updates when another tab's state changes:

```tsx
// In the dependent tab
useEffect(() => {
  // Add dependency on another tab
  tabManager.addTabDependency(
    currentTabId,    // Dependent tab ID (this tab)
    providerTabId,   // Provider tab ID 
    'dataProvider',  // Type of dependency
    { field: 'data' } // Optional metadata
  );
  
  return () => {
    // Clean up dependency when component unmounts
    tabManager.removeTabDependency(currentTabId, providerTabId);
  };
}, [tabManager, currentTabId, providerTabId]);
```

### Filtering Messages

You can filter messages by type or sender ID:

```tsx
// Only receive STATE_UPDATE messages
const { messages } = useTabMessaging(
  tabManager,
  tabId,
  MessageType.STATE_UPDATE
);

// Only receive messages from a specific tab
const { messages } = useTabMessaging(
  tabManager,
  tabId,
  undefined, // No message type filter
  'specific-tab-id' // Only from this sender
);
```

## Performance Considerations

- **Message history**: By default, the messaging system stores the last 100 messages. You can customize this limit when creating the messaging manager.
- **State size**: Keep tab state sizes manageable to avoid performance issues when updating or transferring state.
- **Message frequency**: Avoid sending messages at high frequency to prevent performance degradation.
- **Cleanup**: Always clean up subscriptions and dependencies when components unmount.

## Best Practices

1. **Clean up subscriptions**: Always unsubscribe from messages when components unmount
2. **Use appropriate message types**: Use the built-in message types for their intended purposes
3. **Minimize message size**: Keep payloads small for better performance
4. **Handle errors**: Add error handling when processing messages
5. **Validate inputs**: Validate message data before processing it
6. **Use state management efficiently**: Update only what has changed rather than replacing the entire state
7. **Implement fallbacks**: Handle cases where dependencies might not be available
8. **Test messaging flows**: Write tests for your message handling code

## Status

✅ The tab messaging system is fully implemented and tested.
   - Inter-tab messaging ✅
   - Tab state sharing ✅
   - Tab dependency system ✅ 