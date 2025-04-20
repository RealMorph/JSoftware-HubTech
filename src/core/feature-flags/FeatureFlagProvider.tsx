import React, { createContext, useContext, useState, useEffect } from 'react';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { FeatureFlagService, FeatureFlagConfig } from './FeatureFlagService';

// Create context for the feature flag service
interface FeatureFlagContextType {
  isInitialized: boolean;
  service: FeatureFlagService;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

// Props for the provider component
interface FeatureFlagProviderProps {
  children: React.ReactNode;
  config?: FeatureFlagConfig;
}

// Provider component
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  config,
}) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [service] = useState<FeatureFlagService>(() => FeatureFlagService.getInstance(config));
  const growthbook = service.getGrowthBook();
  
  // Initialize the service
  useEffect(() => {
    const initializeFeatureFlags = async () => {
      try {
        await service.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize feature flags:', error);
        // Still set as initialized so the app can continue
        setIsInitialized(true);
      }
    };
    
    initializeFeatureFlags();
  }, [service]);
  
  // Provide the service instance and initialization status
  const contextValue: FeatureFlagContextType = {
    isInitialized,
    service,
  };
  
  return (
    <FeatureFlagContext.Provider value={contextValue}>
      <GrowthBookProvider growthbook={growthbook}>
        {children}
      </GrowthBookProvider>
    </FeatureFlagContext.Provider>
  );
};

// Custom hook for accessing the feature flag service
export const useFeatureFlagService = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error('useFeatureFlagService must be used within a FeatureFlagProvider');
  }
  
  return context;
}; 