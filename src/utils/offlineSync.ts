import { registerBackgroundSync, isOnline } from './sw-register';

// Local storage key for pending actions
const PENDING_ACTIONS_KEY = 'pending_offline_actions';

// Interface for API actions
export interface ApiAction {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  timestamp: number;
  retryCount: number;
}

// Save an action to local storage for offline sync
export const saveActionForSync = (action: Omit<ApiAction, 'id' | 'timestamp' | 'retryCount'>): string => {
  const pendingActions = getPendingActions();
  
  // Create a unique ID for this action
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add the action to the pending actions list
  const newAction: ApiAction = {
    ...action,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  };
  
  pendingActions.push(newAction);
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  
  // Register for background sync if offline
  if (!isOnline()) {
    registerBackgroundSync('api-queue', () => {
      // This callback will be called if background sync is not supported
      console.log('Background sync is not supported. Will retry when online.');
    });
  }
  
  return id;
};

// Get all pending actions from local storage
export const getPendingActions = (): ApiAction[] => {
  const actions = localStorage.getItem(PENDING_ACTIONS_KEY);
  return actions ? JSON.parse(actions) : [];
};

// Remove a completed action from local storage
export const removeAction = (id: string): void => {
  const pendingActions = getPendingActions();
  const updatedActions = pendingActions.filter(action => action.id !== id);
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(updatedActions));
};

// Process all pending actions
export const processPendingActions = async (): Promise<void> => {
  if (isOnline()) {
    const pendingActions = getPendingActions();
    
    if (pendingActions.length === 0) {
      return;
    }
    
    console.log(`Processing ${pendingActions.length} pending actions`);
    
    // Process each action in sequence
    for (const action of pendingActions) {
      try {
        await processAction(action);
        // Remove the action on success
        removeAction(action.id);
      } catch (error) {
        console.error(`Failed to process action ${action.id}:`, error);
        // Update retry count
        updateRetryCount(action.id);
      }
    }
  }
};

// Update retry count for a failed action
const updateRetryCount = (id: string): void => {
  const pendingActions = getPendingActions();
  const updatedActions = pendingActions.map(action => {
    if (action.id === id) {
      return {
        ...action,
        retryCount: action.retryCount + 1,
      };
    }
    return action;
  });
  
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(updatedActions));
};

// Process a single action
const processAction = async (action: ApiAction): Promise<Response> => {
  const { endpoint, method, data } = action;
  
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response;
};

// Initialize offline sync - call this when the app starts
export const initOfflineSync = (): void => {
  // Process pending actions when the app comes online
  window.addEventListener('online', () => {
    processPendingActions();
  });
  
  // Process any pending actions on startup if we're online
  if (isOnline()) {
    processPendingActions();
  }
}; 