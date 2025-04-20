# Breadcrumb, Tab and Routing Integration

This document explains how the Breadcrumb component integrates with the Tab Management System and Deep Link Routing to enable advanced navigation features.

## Overview

The integration between these systems provides:

1. **Tab-aware breadcrumb navigation** - Breadcrumbs can open pages in new tabs
2. **Deep link support** - URL parameters can control navigation behavior
3. **Consistent navigation experience** - Common UI patterns across the application

## Components and Hooks

The integration consists of several components and hooks:

### Components

- **BreadcrumbsWithTabs** - Enhanced breadcrumb component with tab support
- **TabManagerProvider** - Context provider for TabManager access
- **DeepLinkRouter** - Router component for enhanced routing features

### Hooks

- **useBreadcrumbNavigation** - Custom hook for breadcrumb navigation with tab support
- **useTabManager** - Access the TabManager from React components

## Implementation Details

### BreadcrumbsWithTabs Component

The `BreadcrumbsWithTabs` component extends the basic `Breadcrumbs` component to add tab integration:

```tsx
import BreadcrumbsWithTabs from '../components/navigation/BreadcrumbsWithTabs';
import { TabManager } from '../core/tabs/TabManager';
import { TabStorage } from '../core/tabs/tab-storage';

// Initialize TabManager
const tabManager = new TabManager();
tabManager.initialize(new TabStorage());

// Define breadcrumb items with tab support
const breadcrumbItems = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  // This item will open in a new tab when clicked
  { label: 'Electronics', path: '/products/electronics', openInTab: true },
  { label: 'Smartphones', path: '/products/electronics/smartphones', active: true },
];

// Use in your component
function MyComponent() {
  return (
    <BreadcrumbsWithTabs 
      items={breadcrumbItems} 
      tabManager={tabManager}
      onNavigate={(path, openInTab) => {
        console.log(`Navigating to ${path}${openInTab ? ' in new tab' : ''}`);
      }}
    />
  );
}
```

### useBreadcrumbNavigation Hook

The `useBreadcrumbNavigation` hook provides an easy way to manage breadcrumb navigation with tab support:

```tsx
import { useBreadcrumbNavigation } from '../core/hooks/useBreadcrumbNavigation';
import { useTabManager } from '../components/navigation/BreadcrumbsWithTabs';

function MyComponent() {
  const tabManager = useTabManager();
  
  const {
    breadcrumbs,
    navigateTo,
    getBreadcrumbsWithTabSupport,
    createTabUrl
  } = useBreadcrumbNavigation({
    generateBreadcrumbs: true,  // Auto-generate from current path
    homeLabel: 'Dashboard',
    homePath: '/dashboard',
    pathMap: {
      'products': 'All Products',
      'electronics': 'Electronics Dept'
    },
  });
  
  // Use navigateTo to navigate with tab support
  const handleButtonClick = () => {
    navigateTo('/products/electronics', true); // true = open in tab
  };
  
  // Use getBreadcrumbsWithTabSupport to get enhanced breadcrumb items
  const enhancedBreadcrumbs = getBreadcrumbsWithTabSupport();
  
  return (
    <div>
      <BreadcrumbsWithTabs
        items={enhancedBreadcrumbs}
        tabManager={tabManager}
      />
      <button onClick={handleButtonClick}>
        Open Electronics in Tab
      </button>
      
      {/* Create a link that opens in a tab */}
      <a href={createTabUrl('/products/electronics')}>
        Open in Tab
      </a>
    </div>
  );
}
```

### DeepLinkRouter Integration

To enable deep linking with URL parameters:

```tsx
import { DeepLinkRouter } from '../core/routing/DeepLinkRouter';
import { TabManager } from '../core/tabs/TabManager';
import { BrowserRouter } from 'react-router-dom';

function App() {
  const tabManager = new TabManager();
  
  return (
    <BrowserRouter>
      <DeepLinkRouter tabManager={tabManager}>
        <Routes>
          {/* Your routes */}
        </Routes>
      </DeepLinkRouter>
    </BrowserRouter>
  );
}
```

With this setup, users can create deep links with special parameters:

- `/products/electronics?openInTab=true` - Opens the page in a new tab
- `/products/electronics?source=email` - Tracks the navigation source
- `/products/electronics?state={"filter":"new"}` - Passes initial state

## URL Parameter Handling

The integration supports several URL parameters for controlling navigation:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `openInTab` | Opens the page in a new tab | `?openInTab=true` |
| `preserveHistory` | Doesn't add to browser history | `?preserveHistory=true` |
| `source` | Tracks navigation source | `?source=email` |
| `state` | Initial state (JSON) | `?state={"filter":"new"}` |

## Best Practices

1. **Use Context for TabManager** - Access TabManager through the TabManagerProvider/useTabManager hook
2. **Consistent Navigation** - Use the useBreadcrumbNavigation hook for consistent navigation
3. **Deep Link Support** - Create URLs with the createTabUrl helper to ensure correct parameters
4. **Proper Types** - Use the TabBreadcrumbItem interface for type safety

## Example Integration

A complete example:

```tsx
import React from 'react';
import { TabManagerProvider } from '../components/navigation/BreadcrumbsWithTabs';
import BreadcrumbsWithTabs from '../components/navigation/BreadcrumbsWithTabs';
import { useBreadcrumbNavigation } from '../core/hooks/useBreadcrumbNavigation';
import { DeepLinkRouter } from '../core/routing/DeepLinkRouter';
import { TabManager } from '../core/tabs/TabManager';
import { TabStorage } from '../core/tabs/tab-storage';

function AppLayout() {
  // Initialize services
  const tabManager = React.useMemo(() => {
    const manager = new TabManager();
    manager.initialize(new TabStorage());
    return manager;
  }, []);
  
  return (
    <TabManagerProvider tabManager={tabManager}>
      <DeepLinkRouter tabManager={tabManager}>
        <AppContent />
      </DeepLinkRouter>
    </TabManagerProvider>
  );
}

function AppContent() {
  const { 
    breadcrumbs,
    navigateTo
  } = useBreadcrumbNavigation({
    generateBreadcrumbs: true,
    homeLabel: 'Dashboard',
  });
  
  const tabManager = useTabManager();
  
  return (
    <div>
      <header>
        <BreadcrumbsWithTabs
          items={breadcrumbs}
          tabManager={tabManager}
          onNavigate={navigateTo}
        />
      </header>
      <main>
        {/* Application content */}
      </main>
    </div>
  );
}
```

## Troubleshooting

If you encounter issues with the integration:

1. Check that TabManager is properly initialized with TabStorage
2. Ensure DeepLinkRouter has access to the TabManager instance
3. Verify that BreadcrumbsWithTabs receives the correct tabManager prop
4. Check for URL encoding issues when passing state parameters

## Related Documentation

- [Tab System Documentation](../tabs/README.md)
- [Routing System Documentation](../routing/README.md)
- [Navigation Components Documentation](../components/navigation.md) 