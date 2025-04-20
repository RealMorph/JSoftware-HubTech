import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TelemetryContextType, 
  TelemetryProviderProps, 
  EventProperties,
  ConsentSettings
} from './types';
import posthogService from './PostHogService';
import { DEFAULT_CONSENT_SETTINGS } from './constants';
import { useLocation } from 'react-router-dom';
import { AppEvents } from './constants';

// Create context with default values
const TelemetryContext = createContext<TelemetryContextType>({
  service: posthogService,
  isEnabled: false,
  consentSettings: DEFAULT_CONSENT_SETTINGS,
  updateConsent: () => {},
  trackEvent: () => {}
});

/**
 * Telemetry Provider Component
 * 
 * This component provides telemetry capabilities to the entire application
 * through React Context. It handles initialization of the telemetry service,
 * automatic page view tracking, and exposes methods for event tracking.
 */
export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({ 
  config, 
  defaultConsent = DEFAULT_CONSENT_SETTINGS,
  children 
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    ...DEFAULT_CONSENT_SETTINGS,
    ...defaultConsent
  });
  const location = useLocation();
  
  // Initialize telemetry service
  useEffect(() => {
    posthogService.init(config);
    setIsEnabled(posthogService.isEnabled());
    
    // Apply initial consent settings from props
    posthogService.updateConsent(consentSettings);
    
    // Track initial page view if analytics is enabled
    if (posthogService.isEnabled() && consentSettings.analytics) {
      posthogService.trackEvent(AppEvents.PAGE_VIEW, {
        path: location.pathname,
        search: location.search,
        title: document.title
      });
    }
    
    // Clean up
    return () => {
      // No cleanup needed for PostHog
    };
  }, [config]);
  
  // Track page views when location changes
  useEffect(() => {
    if (posthogService.isEnabled() && consentSettings.analytics) {
      posthogService.trackEvent(AppEvents.PAGE_VIEW, {
        path: location.pathname,
        search: location.search,
        title: document.title
      });
    }
  }, [location, consentSettings.analytics]);
  
  // Update consent settings
  const updateConsent = (settings: ConsentSettings) => {
    setConsentSettings(settings);
    posthogService.updateConsent(settings);
    setIsEnabled(posthogService.isEnabled());
  };
  
  // Track an event
  const trackEvent = (eventName: string, properties?: EventProperties) => {
    posthogService.trackEvent(eventName, properties);
  };
  
  // Context value
  const contextValue: TelemetryContextType = {
    service: posthogService,
    isEnabled,
    consentSettings,
    updateConsent,
    trackEvent
  };
  
  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
};

/**
 * Custom hook to use telemetry context
 */
export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  
  return context;
};

export default TelemetryProvider; 