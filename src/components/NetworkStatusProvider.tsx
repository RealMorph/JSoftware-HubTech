import React, { createContext, useContext, useEffect, useState } from 'react';
import { addNetworkStatusListeners, isOnline } from '../utils/sw-register';

// Define the context interface
interface NetworkContextType {
  isOnline: boolean;
  lastOnlineAt: Date | null;
  showOfflineNotification: boolean;
  hideOfflineNotification: () => void;
}

// Create context with default values
const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  lastOnlineAt: null,
  showOfflineNotification: false,
  hideOfflineNotification: () => {},
});

// Hook for consuming network context
export const useNetworkStatus = (): NetworkContextType => useContext(NetworkContext);

interface NetworkStatusProviderProps {
  children: React.ReactNode;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ children }) => {
  // Initial state based on browser's navigator.onLine
  const [networkState, setNetworkState] = useState({
    isOnline: isOnline(),
    lastOnlineAt: isOnline() ? new Date() : null,
    showOfflineNotification: false,
  });

  useEffect(() => {
    // Handle online event
    const handleOnline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
        showOfflineNotification: false,
      }));
    };

    // Handle offline event
    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        showOfflineNotification: true,
      }));
    };

    // Add event listeners for online/offline status changes
    const cleanup = addNetworkStatusListeners(handleOnline, handleOffline);

    // Clean up event listeners on unmount
    return cleanup;
  }, []);

  // Function to hide the offline notification
  const hideOfflineNotification = () => {
    setNetworkState(prev => ({
      ...prev,
      showOfflineNotification: false,
    }));
  };

  // Context value
  const contextValue = {
    ...networkState,
    hideOfflineNotification,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkStatusProvider; 