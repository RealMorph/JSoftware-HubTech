import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Interface for analytics event
export interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// Interface for analytics provider
export interface AnalyticsProvider {
  trackPageView: (path: string, data?: Record<string, any>) => void;
  trackEvent: (event: AnalyticsEvent) => void;
  initialize: () => void;
}

// Default analytics provider (logs to console)
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  initialize(): void {
    console.log('Analytics initialized');
  }
  
  trackPageView(path: string, data?: Record<string, any>): void {
    console.log('Page view:', path, data || {});
  }
  
  trackEvent(event: AnalyticsEvent): void {
    console.log('Event:', event.type, event.data);
  }
}

// Props for the component
interface NavigationAnalyticsProps {
  children: React.ReactNode;
  provider?: AnalyticsProvider;
  excludePaths?: string[];
  enableDeepLinking?: boolean;
}

// Main component
export const NavigationAnalytics: React.FC<NavigationAnalyticsProps> = ({
  children,
  provider = new ConsoleAnalyticsProvider(),
  excludePaths = ['/login', '/register'],
  enableDeepLinking = true,
}) => {
  const location = useLocation();
  
  // Initialize analytics provider
  useEffect(() => {
    provider.initialize();
  }, [provider]);
  
  // Track page views
  useEffect(() => {
    const path = location.pathname;
    
    // Skip tracking for excluded paths
    if (excludePaths.some(excludePath => path.startsWith(excludePath))) {
      return;
    }
    
    // Track page view
    provider.trackPageView(path, {
      search: location.search,
      hash: location.hash,
      state: location.state || {},
      timestamp: Date.now(),
    });
    
    // Handle deep linking if enabled
    if (enableDeepLinking && location.hash) {
      const elementId = location.hash.slice(1); // Remove the # character
      const element = document.getElementById(elementId);
      
      if (element) {
        // Scroll to the element
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Track deep link usage
        provider.trackEvent({
          type: 'deep_link_used',
          data: {
            path,
            elementId,
            found: !!element,
          },
          timestamp: Date.now(),
        });
      }
    }
  }, [location, provider, excludePaths, enableDeepLinking]);
  
  return <>{children}</>;
};

// Custom hook for tracking custom events
export const useAnalytics = (provider: AnalyticsProvider = new ConsoleAnalyticsProvider()) => {
  return {
    trackEvent: (type: string, data: Record<string, any> = {}) => {
      provider.trackEvent({
        type,
        data,
        timestamp: Date.now(),
      });
    },
  };
}; 