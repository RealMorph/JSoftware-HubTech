import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketService, ActivityLogMessage, ActivityType } from '../firebase/websocket-service';

interface UseActivityLogReturn {
  activities: ActivityLogMessage[];
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publishActivity: (
    message: Omit<ActivityLogMessage, 'id' | 'userId' | 'timestamp'>
  ) => void;
  clearActivities: () => void;
}

interface UseActivityLogOptions {
  autoConnect?: boolean;
  maxActivities?: number;
  filter?: {
    types?: ActivityType[];
    entityId?: string;
    entityType?: string;
  };
}

/**
 * Hook for activity logging with WebSockets
 */
export const useActivityLog = (
  options: UseActivityLogOptions = {}
): UseActivityLogReturn => {
  const { 
    autoConnect = true,
    maxActivities = 100,
    filter
  } = options;
  
  const [activities, setActivities] = useState<ActivityLogMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const subscriptionIdRef = useRef<string | null>(null);
  
  const websocketService = WebSocketService.getInstance();
  
  // Connect to WebSocket if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      // Clean up subscription and disconnect when component unmounts
      if (subscriptionIdRef.current) {
        websocketService.unsubscribe(subscriptionIdRef.current);
      }
    };
  }, []);
  
  // Handle new activity messages
  const handleActivityMessage = useCallback((message: ActivityLogMessage) => {
    setActivities(prevActivities => {
      // Add new message at the beginning of the array
      const updatedActivities = [message, ...prevActivities];
      
      // Limit the number of activities stored
      if (updatedActivities.length > maxActivities) {
        return updatedActivities.slice(0, maxActivities);
      }
      
      return updatedActivities;
    });
  }, [maxActivities]);
  
  // Connect to WebSocket
  const connect = useCallback(async (): Promise<void> => {
    try {
      // Connect to WebSocket
      await websocketService.connect();
      setIsConnected(true);
      
      // Subscribe to activity messages
      if (subscriptionIdRef.current) {
        websocketService.unsubscribe(subscriptionIdRef.current);
      }
      
      subscriptionIdRef.current = websocketService.subscribe(
        handleActivityMessage,
        filter
      );
    } catch (err) {
      console.error('Error connecting to activity log:', err);
      setIsConnected(false);
    }
  }, [handleActivityMessage, filter]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback((): void => {
    if (subscriptionIdRef.current) {
      websocketService.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
    
    websocketService.disconnect();
    setIsConnected(false);
  }, []);
  
  // Publish activity message
  const publishActivity = useCallback((
    message: Omit<ActivityLogMessage, 'id' | 'userId' | 'timestamp'>
  ): void => {
    websocketService.publishActivity(message);
  }, []);
  
  // Clear activities
  const clearActivities = useCallback((): void => {
    setActivities([]);
  }, []);
  
  return {
    activities,
    isConnected,
    connect,
    disconnect,
    publishActivity,
    clearActivities
  };
}; 