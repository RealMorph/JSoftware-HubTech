import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Types for the navigation history
export interface NavigationEntry {
  path: string;
  state: any;
  timestamp: number;
}

// Types for the context
export interface NavigationHistoryContextType {
  // Navigation history
  history: NavigationEntry[];
  
  // Current entry
  currentEntry: NavigationEntry | null;
  
  // Navigation actions
  goBack: () => void;
  goForward: () => void;
  navigateTo: (path: string, state?: any) => void;
  
  // State persistence
  getPersistedState: (key: string) => any;
  persistState: (key: string, state: any) => void;
  clearPersistedState: (key?: string) => void;
}

// Create context with default values
const NavigationHistoryContext = createContext<NavigationHistoryContextType>({
  history: [],
  currentEntry: null,
  goBack: () => {},
  goForward: () => {},
  navigateTo: () => {},
  getPersistedState: () => null,
  persistState: () => {},
  clearPersistedState: () => {},
});

// Props for the provider
interface NavigationHistoryProviderProps {
  children: React.ReactNode;
  maxHistoryLength?: number;
}

// Provider component
export const NavigationHistoryProvider: React.FC<NavigationHistoryProviderProps> = ({
  children,
  maxHistoryLength = 50,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for navigation history
  const [history, setHistory] = useState<NavigationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  
  // Get current entry
  const currentEntry = currentIndex >= 0 && currentIndex < history.length 
    ? history[currentIndex] 
    : null;
  
  // Handle location changes
  useEffect(() => {
    if (isNavigating) {
      // Skip if navigating programmatically
      setIsNavigating(false);
      return;
    }
    
    const entry: NavigationEntry = {
      path: location.pathname,
      state: location.state || {},
      timestamp: Date.now(),
    };
    
    // Add entry to history and trim if needed
    setHistory(prev => {
      // If we're not at the end of history, truncate forward history
      const newHistory = currentIndex < prev.length - 1 
        ? prev.slice(0, currentIndex + 1) 
        : prev;
      
      // Add new entry and limit to maxHistoryLength
      return [...newHistory, entry].slice(-maxHistoryLength);
    });
    
    // Update current index
    setCurrentIndex(prev => {
      const newIndex = prev < history.length - 1 ? prev + 1 : history.length;
      return newIndex;
    });
  }, [location, isNavigating, maxHistoryLength, currentIndex, history.length]);
  
  // Navigation actions
  const goBack = () => {
    if (currentIndex > 0) {
      setIsNavigating(true);
      setCurrentIndex(currentIndex - 1);
      navigate(history[currentIndex - 1].path, { 
        state: history[currentIndex - 1].state,
        replace: false,
      });
    }
  };
  
  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setIsNavigating(true);
      setCurrentIndex(currentIndex + 1);
      navigate(history[currentIndex + 1].path, { 
        state: history[currentIndex + 1].state,
        replace: false,
      });
    }
  };
  
  const navigateTo = (path: string, state: any = {}) => {
    setIsNavigating(true);
    navigate(path, { state, replace: false });
  };
  
  // State persistence
  const getPersistedState = (key: string): any => {
    try {
      const persistedState = localStorage.getItem(`nav_state_${key}`);
      return persistedState ? JSON.parse(persistedState) : null;
    } catch (error) {
      console.error('Error retrieving persisted state:', error);
      return null;
    }
  };
  
  const persistState = (key: string, state: any): void => {
    try {
      localStorage.setItem(`nav_state_${key}`, JSON.stringify(state));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  };
  
  const clearPersistedState = (key?: string): void => {
    try {
      if (key) {
        localStorage.removeItem(`nav_state_${key}`);
      } else {
        // Clear all persisted nav states if no key is provided
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith('nav_state_')) {
            localStorage.removeItem(storageKey);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing persisted state:', error);
    }
  };
  
  // Context value
  const value: NavigationHistoryContextType = {
    history,
    currentEntry,
    goBack,
    goForward,
    navigateTo,
    getPersistedState,
    persistState,
    clearPersistedState,
  };
  
  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

// Hook for using the navigation history context
export const useNavigationHistory = () => useContext(NavigationHistoryContext); 