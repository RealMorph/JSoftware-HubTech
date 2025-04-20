import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseQueryString } from '../utils/urlUtils';

// Configuration interface for deep linking
export interface DeepLinkConfig {
  // Map of URL parameters to enable deep linking features
  paramMap: {
    // Parameter name for opening in a new tab
    openInTab?: string;
    // Parameter name for preserving URL history
    preserveHistory?: string;
    // Parameter name for tracking source of navigation
    source?: string;
    // Parameter name for setting initial state
    state?: string;
  };
  // Custom handlers for deep link parameters
  handlers?: Record<string, (value: string) => void>;
}

// Default configuration
const defaultConfig: DeepLinkConfig = {
  paramMap: {
    openInTab: 'openInTab',
    preserveHistory: 'preserveHistory',
    source: 'source',
    state: 'state'
  }
};

export interface DeepLinkRouterProps {
  config?: DeepLinkConfig;
  tabManager?: any; // TabManager instance
  children: React.ReactNode;
}

/**
 * DeepLinkRouter enhances routing with deep linking capabilities.
 * It processes URL parameters to support features like:
 * - Opening routes in tabs
 * - Preserving navigation history
 * - Tracking navigation sources
 * - Passing initial state via URL
 */
export const DeepLinkRouter: React.FC<DeepLinkRouterProps> = ({ 
  config = defaultConfig, 
  tabManager,
  children 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processingDeepLink, setProcessingDeepLink] = useState(false);
  
  useEffect(() => {
    const processDeepLink = async () => {
      if (processingDeepLink) return;
      
      setProcessingDeepLink(true);
      
      try {
        const queryParams = parseQueryString(location.search);
        const { paramMap, handlers } = config;
        const cleanParams: Record<string, string> = {};
        let shouldRewriteUrl = false;
        
        // Process special parameters
        for (const [key, value] of Object.entries(queryParams)) {
          // Process openInTab parameter
          if (key === paramMap.openInTab && tabManager) {
            const shouldOpenInTab = value === 'true' || value === '1';
            if (shouldOpenInTab) {
              await openInNewTab(location.pathname, queryParams);
              shouldRewriteUrl = true;
            }
          } 
          // Process preserveHistory parameter
          else if (key === paramMap.preserveHistory) {
            shouldRewriteUrl = true;
          }
          // Process source parameter (just track it, don't remove)
          else if (key === paramMap.source) {
            // Could log the source for analytics here
            shouldRewriteUrl = true;
          }
          // Process state parameter
          else if (key === paramMap.state) {
            try {
              const stateObj = JSON.parse(decodeURIComponent(value));
              // Update location state with the parsed value
              navigate(location.pathname, { state: stateObj, replace: true });
              shouldRewriteUrl = true;
            } catch (e) {
              console.error('Failed to parse state parameter:', e);
            }
          }
          // Process custom handlers
          else if (handlers && handlers[key]) {
            handlers[key](value);
            shouldRewriteUrl = true;
          }
          // Keep other parameters
          else {
            cleanParams[key] = value;
          }
        }
        
        // Clean up URL if needed by removing processed parameters
        if (shouldRewriteUrl) {
          const newSearch = Object.keys(cleanParams).length > 0
            ? '?' + new URLSearchParams(cleanParams).toString()
            : '';
          
          navigate({
            pathname: location.pathname,
            search: newSearch
          }, { replace: true });
        }
      } finally {
        setProcessingDeepLink(false);
      }
    };
    
    processDeepLink();
  }, [location.search, location.pathname, config, tabManager, navigate]);
  
  // Function to open current route in a new tab
  const openInNewTab = async (path: string, queryParams: Record<string, string>) => {
    if (!tabManager) return;
    
    // Create clean parameters (without the special ones)
    const { paramMap } = config;
    const cleanParams = { ...queryParams };
    delete cleanParams[paramMap.openInTab!];
    delete cleanParams[paramMap.preserveHistory!];
    delete cleanParams[paramMap.source!];
    
    // Build clean URL for the tab
    const search = Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams).toString()
      : '';
    
    // Extract title from path
    const pathSegments = path.split('/').filter(Boolean);
    const title = pathSegments.length > 0 
      ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + 
        pathSegments[pathSegments.length - 1].slice(1)
      : 'New Tab';
    
    // Open in new tab
    const newTab = await tabManager.addTab({
      title,
      content: path + search,
      type: 'route',
      icon: 'link'
    });
    
    // Activate the new tab
    await tabManager.activateTab(newTab.id);
  };
  
  return <>{children}</>;
};

export default DeepLinkRouter; 