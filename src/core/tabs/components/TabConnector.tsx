import React, { useState, useEffect } from 'react';
import { TabManager } from '../tab-manager';
import { MessageType } from '../tab-messaging';
import { useTabMessaging, useTabState } from '../hooks';
import './tab-connector.css';

interface TabConnectorProps {
  tabManager: TabManager;
  tabId: string;
  targetTabId?: string; // Optional tab to connect with
}

/**
 * Component that demonstrates tab messaging and state sharing
 */
export const TabConnector: React.FC<TabConnectorProps> = ({
  tabManager,
  tabId,
  targetTabId
}) => {
  const [message, setMessage] = useState('');
  const [stateUpdate, setStateUpdate] = useState('');
  
  // Use the messaging hook
  const {
    messages,
    lastMessage,
    sendMessage,
    sendEvent,
    clearMessages
  } = useTabMessaging(tabManager, tabId);
  
  // Use the state hook
  const {
    state,
    updateState,
    dependencies,
    addDependency,
    removeDependency
  } = useTabState(tabManager, tabId);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (message && targetTabId) {
      sendMessage(
        MessageType.CUSTOM_EVENT,
        { content: message },
        targetTabId
      );
      setMessage('');
    }
  };
  
  // Handle updating state
  const handleUpdateState = () => {
    if (stateUpdate) {
      updateState({
        content: stateUpdate,
        timestamp: new Date().toISOString()
      });
      setStateUpdate('');
    }
  };
  
  // Handle adding a dependency
  const handleAddDependency = () => {
    if (targetTabId) {
      addDependency(targetTabId, 'content');
    }
  };
  
  // Handle removing a dependency
  const handleRemoveDependency = () => {
    if (targetTabId) {
      removeDependency(targetTabId);
    }
  };
  
  return (
    <div className="tab-connector">
      <h3>Tab Connector</h3>
      <p>Tab ID: {tabId}</p>
      
      {/* State section */}
      <div className="state-section">
        <h4>Tab State</h4>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        
        <div className="state-update">
          <input
            type="text"
            value={stateUpdate}
            onChange={(e) => setStateUpdate(e.target.value)}
            placeholder="Enter new state content"
          />
          <button onClick={handleUpdateState}>Update State</button>
        </div>
      </div>
      
      {/* Dependencies section */}
      <div className="dependencies-section">
        <h4>Dependencies ({dependencies.length})</h4>
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
        
        {targetTabId && (
          <div className="dependency-controls">
            <button onClick={handleAddDependency}>
              Add Dependency to {targetTabId}
            </button>
            <button onClick={handleRemoveDependency}>
              Remove Dependency
            </button>
          </div>
        )}
      </div>
      
      {/* Messaging section */}
      <div className="messaging-section">
        <h4>Messages ({messages.length})</h4>
        
        {lastMessage && (
          <div className="last-message">
            <h5>Last Message:</h5>
            <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
          </div>
        )}
        
        <div className="message-list">
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>
                {msg.type} from {msg.senderId} at {new Date(msg.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
          {messages.length > 0 && (
            <button onClick={clearMessages}>Clear Messages</button>
          )}
        </div>
        
        {targetTabId && (
          <div className="message-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message"
            />
            <button onClick={handleSendMessage}>
              Send to {targetTabId}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 