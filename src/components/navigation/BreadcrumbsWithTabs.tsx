import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs';
import { ITabManager } from '../../core/tabs/TabManager';
import { useNavigate } from 'react-router-dom';
import { createUrlWithParams } from '../../core/utils/urlUtils';

interface TabBreadcrumbItem extends BreadcrumbItem {
  openInTab?: boolean;
}

interface BreadcrumbsWithTabsProps extends Omit<BreadcrumbsProps, 'items'> {
  items?: TabBreadcrumbItem[];
  tabManager: ITabManager;
  onNavigate?: (path: string, openInTab: boolean) => void;
}

/**
 * TabManagerContext for providing access to the TabManager throughout the app
 */
export const TabManagerContext = React.createContext<ITabManager | null>(null);

/**
 * Hook to access the TabManager from context
 */
export const useTabManager = (): ITabManager | null => {
  return useContext(TabManagerContext);
};

/**
 * Enhanced Breadcrumbs component with TabManager integration
 * Extends the basic Breadcrumbs component to support opening links in tabs
 */
export const BreadcrumbsWithTabs: React.FC<BreadcrumbsWithTabsProps> = ({
  items: propItems,
  tabManager,
  onNavigate,
  ...breadcrumbProps
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [enhancedItems, setEnhancedItems] = useState<TabBreadcrumbItem[]>([]);

  // Convert standard items to tab-enabled items
  useEffect(() => {
    if (!propItems) {
      setEnhancedItems([]);
      return;
    }

    // Map the original items to enhanced items with click handlers
    const items = propItems.map(item => ({
      ...item
    }));

    setEnhancedItems(items);
  }, [propItems]);

  // Handle navigation with tab support
  const handleNavigate = useCallback((path: string, openInTab: boolean) => {
    if (openInTab && tabManager) {
      // Extract title from path
      const pathSegments = path.split('/').filter(Boolean);
      const title = pathSegments.length > 0 
        ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + 
          pathSegments[pathSegments.length - 1].slice(1)
        : 'New Tab';
      
      // Open in new tab
      tabManager.openTab({
        id: `tab-${Date.now()}`,
        title,
        route: path,
        closable: true,
        data: { source: 'breadcrumb' }
      });
      
      if (onNavigate) {
        onNavigate(path, true);
      }
    } else {
      // Regular navigation
      navigate(path);
      
      if (onNavigate) {
        onNavigate(path, false);
      }
    }
  }, [tabManager, navigate, onNavigate]);

  // Create custom breadcrumb items with tab support
  const breadcrumbItems = enhancedItems.map(item => {
    // Skip modifications for active items (current page)
    if (item.active) {
      return item;
    }

    // Create a new item with a path that includes the openInTab parameter if needed
    const enhancedItem: TabBreadcrumbItem = {
      ...item,
      path: item.openInTab 
        ? createUrlWithParams(item.path, { openInTab: 'true' }) 
        : item.path
    };

    return enhancedItem;
  });

  return (
    <Breadcrumbs
      {...breadcrumbProps}
      items={breadcrumbItems}
    />
  );
};

/**
 * TabManagerProvider component
 * Provides the TabManager instance through context
 */
export const TabManagerProvider: React.FC<{
  tabManager: ITabManager;
  children: React.ReactNode;
}> = ({ tabManager, children }) => {
  return (
    <TabManagerContext.Provider value={tabManager}>
      {children}
    </TabManagerContext.Provider>
  );
};

export default BreadcrumbsWithTabs; 