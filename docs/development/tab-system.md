# Tab System Documentation

This document outlines the implementation, usage, and testing of the tab management system in the modular frontend project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Tab Registry](#tab-registry)
4. [Tab State Management](#tab-state-management)
5. [Tab Lifecycle](#tab-lifecycle)
6. [Usage in Applications](#usage-in-applications)
7. [Testing](#testing)

## Architecture Overview

The tab system follows a modular architecture that enables flexible, dynamic tab management:

1. **Tab Manager** - Core service for tab creation, lifecycle, and state management
2. **Tab Registry** - Registry of available tab types and their factories
3. **Tab Components** - UI components for rendering tabs and tab panels
4. **Tab State** - State management for tab-specific data

This architecture ensures:
- Dynamic tab creation and disposal
- Type-safe tab configuration
- Consistent tab behavior across the application
- Tab state persistence
- Tab-specific features like pinning, grouping, and reordering

## Core Components

### TabManager

The `TabManager` is the central service that manages tabs throughout their lifecycle.

**Key methods:**
- `addTab(config)` - Creates a new tab
- `removeTab(id)` - Removes a tab
- `activateTab(id)` - Activates a specific tab
- `getTabs()` - Returns all tabs
- `getActiveTab()` - Returns the currently active tab
- `moveTab(id, position)` - Reorders tabs
- `updateTabState(id, state)` - Updates tab-specific state

```typescript
import { TabManager } from './tab-manager';

// Create a tab manager instance
const tabManager = new TabManager(tabRegistry);

// Add a new tab
const newTabId = tabManager.addTab({
  type: 'document',
  initialState: { documentId: '123' }
});

// Activate the tab
tabManager.activateTab(newTabId);
```

### Tab Interface

Tabs implement a common interface:

```typescript
export interface Tab<TState = any> {
  id: string;
  type: string;
  title: string;
  icon?: string;
  closeable: boolean;
  active: boolean;
  pinned: boolean;
  state: TState;
  groupId?: string;
}

export interface TabConfig<TState = any> {
  type: string;
  initialState?: TState;
  title?: string;
  icon?: string;
  closeable?: boolean;
  pinned?: boolean;
  groupId?: string;
}
```

## Tab Registry

The `TabRegistry` maintains a collection of tab types and their factory functions:

```typescript
import { TabRegistry } from './tab-registry';

// Create a tab registry
const tabRegistry = new TabRegistry();

// Register a tab type
tabRegistry.registerTab('document', {
  createComponent: (tab) => <DocumentTab tabState={tab.state} />,
  getTitle: (state) => state.documentName || 'Untitled Document',
  getIcon: (state) => 'document-icon',
  defaultState: { content: '' }
});
```

## Tab State Management

Each tab maintains its own state, which can be updated throughout the tab's lifecycle:

```typescript
// Update tab state
tabManager.updateTabState(tabId, {
  ...currentState,
  documentName: 'New Document Name'
});

// Subscribe to tab changes
tabManager.subscribe((tabs) => {
  console.log('Tabs have changed:', tabs);
});
```

## Tab Lifecycle

The tab lifecycle includes these key phases:

1. **Creation** - Tab is created with initial configuration
2. **Activation** - Tab becomes the active/focused tab
3. **Deactivation** - Tab loses focus when another tab is activated
4. **State Updates** - Tab state is modified during usage
5. **Closure** - Tab is closed and resources are released

## Usage in Applications

### Tab Container Component

```tsx
import { useEffect, useState } from 'react';
import { TabManager, TabRegistry } from '../core/tabs';

function TabContainer() {
  const [tabs, setTabs] = useState([]);
  const [tabManager] = useState(() => new TabManager(tabRegistry));
  
  useEffect(() => {
    const unsubscribe = tabManager.subscribe(setTabs);
    return unsubscribe;
  }, [tabManager]);
  
  return (
    <div className="tab-container">
      <div className="tab-header">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab ${tab.active ? 'active' : ''}`}
            onClick={() => tabManager.activateTab(tab.id)}
          >
            {tab.title}
            {tab.closeable && (
              <button onClick={() => tabManager.removeTab(tab.id)}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab-panel ${tab.active ? 'active' : ''}`}
          >
            {tabRegistry.createComponent(tab)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Creating Custom Tab Types

```typescript
// Define a type for document tab state
interface DocumentTabState {
  documentId: string;
  documentName: string;
  content: string;
  isDirty: boolean;
}

// Register document tab type
tabRegistry.registerTab<DocumentTabState>('document', {
  createComponent: (tab) => <DocumentTabContent state={tab.state} />,
  getTitle: (state) => state.documentName || 'Untitled',
  getIcon: (state) => state.isDirty ? 'document-unsaved' : 'document',
  defaultState: {
    documentId: '',
    documentName: 'Untitled',
    content: '',
    isDirty: false
  }
});
```

## Testing

### Tab Manager Testing

The tab management system has comprehensive tests covering all aspects of tab lifecycle:

```typescript
import { TabManager } from '../tab-manager';
import { TabRegistry } from '../tab-registry';

describe('TabManager', () => {
  let tabManager: TabManager;
  let tabRegistry: TabRegistry;
  
  beforeEach(() => {
    tabRegistry = new TabRegistry();
    tabRegistry.registerTab('test', {
      getTitle: (state) => state.title || 'Test Tab',
      getIcon: () => 'test-icon',
      createComponent: () => null,
      defaultState: { title: 'Test' }
    });
    
    tabManager = new TabManager(tabRegistry);
  });
  
  test('should create a new tab', () => {
    const tabId = tabManager.addTab({ type: 'test' });
    const tabs = tabManager.getTabs();
    
    expect(tabs.length).toBe(1);
    expect(tabs[0].id).toBe(tabId);
    expect(tabs[0].type).toBe('test');
  });
  
  test('should activate a tab', () => {
    const tabId1 = tabManager.addTab({ type: 'test' });
    const tabId2 = tabManager.addTab({ type: 'test' });
    
    tabManager.activateTab(tabId1);
    expect(tabManager.getActiveTab().id).toBe(tabId1);
    
    tabManager.activateTab(tabId2);
    expect(tabManager.getActiveTab().id).toBe(tabId2);
  });
  
  // Additional tests for other tab operations
});
```

### UUID Generation in Tests

For environments where `crypto.randomUUID()` is not available (like Jest), we use a polyfill:

```typescript
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Simple UUID v4 fallback implementation for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
```

### Integration Testing with Tab Components

When testing UI components that interact with the tab system:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TabManager, TabRegistry } from '../core/tabs';
import { TabContainer } from './TabContainer';

describe('TabContainer', () => {
  let tabManager: TabManager;
  let tabRegistry: TabRegistry;
  
  beforeEach(() => {
    tabRegistry = new TabRegistry();
    // Register test tab types
    
    tabManager = new TabManager(tabRegistry);
    
    // Mock the tab manager provider
    jest.spyOn(TabManagerContext, 'useTabManager').mockReturnValue(tabManager);
  });
  
  test('should render tabs', () => {
    tabManager.addTab({ 
      type: 'test', 
      initialState: { title: 'Test Tab 1' } 
    });
    
    tabManager.addTab({ 
      type: 'test', 
      initialState: { title: 'Test Tab 2' } 
    });
    
    render(<TabContainer />);
    
    expect(screen.getByText('Test Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Test Tab 2')).toBeInTheDocument();
  });
  
  test('should switch between tabs', () => {
    const tab1 = tabManager.addTab({ 
      type: 'test', 
      initialState: { content: 'Content 1' } 
    });
    
    const tab2 = tabManager.addTab({ 
      type: 'test', 
      initialState: { content: 'Content 2' } 
    });
    
    render(<TabContainer />);
    
    // First tab should be active by default
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.queryByText('Content 2')).not.toBeVisible();
    
    // Click the second tab
    fireEvent.click(screen.getByText('Test Tab 2'));
    
    // Second tab should now be active
    expect(screen.queryByText('Content 1')).not.toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });
}); 