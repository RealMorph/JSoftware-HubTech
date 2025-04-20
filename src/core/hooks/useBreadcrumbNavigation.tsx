import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabManager } from '../../components/navigation/BreadcrumbsWithTabs';
import { BreadcrumbItem } from '../../components/navigation/Breadcrumbs';
import { createUrlWithParams } from '../utils/urlUtils';
import { IDeepLinkRouter, OpenInTabOptions } from '../routing/DeepLinkRouter';

interface UseBreadcrumbNavigationOptions {
  generateBreadcrumbs?: boolean;
  homeLabel?: string;
  homePath?: string;
  pathMap?: Record<string, string>;
  deepLinkRouter?: IDeepLinkRouter;
  separator?: string;
  maxItems?: number;
}

/**
 * Custom hook for handling breadcrumb navigation with tab support
 * Integrates with DeepLinkRouter and TabManager for advanced routing features
 */
export const useBreadcrumbNavigation = ({
  generateBreadcrumbs = false,
  homeLabel = 'Home',
  homePath = '/',
  pathMap = {},
  deepLinkRouter,
  separator = '/',
  maxItems = 8
}: UseBreadcrumbNavigationOptions = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabManager = useTabManager();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Generate breadcrumbs from the current path
  useEffect(() => {
    if (!generateBreadcrumbs) {
      return;
    }

    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    
    const generatedItems: BreadcrumbItem[] = [
      { label: homeLabel, path: homePath, active: pathSegments.length === 0 }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Use custom label from pathMap if available, otherwise format the segment
      const label = pathMap[segment] || 
        segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
      
      generatedItems.push({
        label,
        path: currentPath,
        active: isLast
      });
    });
    
    setBreadcrumbs(generatedItems);
  }, [location.pathname, generateBreadcrumbs, homeLabel, homePath, pathMap]);

  // Extract title from path
  const getTitleFromPath = useCallback((path: string): string => {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'New Tab';
    
    const segment = pathSegments[pathSegments.length - 1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }, []);

  // Navigate with tab support
  const navigateTo = useCallback((path: string, openInTab = false) => {
    if (openInTab && tabManager) {
      // Get a title from the path (ensures we always have a string)
      const title = getTitleFromPath(path);
      
      // Create tab options
      const tabOptions: OpenInTabOptions = {
        path,
        title,
        closable: true,
        data: { source: 'breadcrumb' }
      };
      
      // Use DeepLinkRouter if available
      if (deepLinkRouter) {
        deepLinkRouter.openInTab(tabOptions);
      } else if (tabManager) {
        // Open in new tab using TabManager directly
        tabManager.openTab({
          id: `tab-${Date.now()}`,
          title, // Always a string now
          route: path,
          closable: true,
          data: tabOptions.data
        });
      }
    } else {
      // Regular navigation
      if (deepLinkRouter) {
        deepLinkRouter.navigate(path);
      } else {
        navigate(path);
      }
    }
  }, [tabManager, navigate, deepLinkRouter, getTitleFromPath]);

  // Add "openInTab" capability to breadcrumb items
  const getBreadcrumbsWithTabSupport = useCallback(() => {
    return breadcrumbs.map(item => {
      // Skip modifications for active items (current page)
      if (item.active) {
        return item;
      }
      
      // Add context menu or right-click handler for "Open in tab" option
      const enhancedItem = {
        ...item,
        openInNewTab: () => navigateTo(item.path, true)
      };
      
      return enhancedItem;
    });
  }, [breadcrumbs, navigateTo]);

  // Create URL with openInTab parameter
  const createTabUrl = useCallback((path: string) => {
    return createUrlWithParams(path, { openInTab: 'true' });
  }, []);

  return {
    breadcrumbs,
    setBreadcrumbs,
    navigateTo,
    getBreadcrumbsWithTabSupport,
    createTabUrl
  };
};

export default useBreadcrumbNavigation; 