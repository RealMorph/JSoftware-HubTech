# Tab System Documentation

This directory contains documentation for the tab system, which provides robust tab management capabilities for the application.

## Available Documentation

- [**Tab Messaging**](./tab-messaging.md) - Inter-tab communication, state sharing, and dependencies
- [**Tab Groups**](./tab-groups.md) - Creating and managing tab groups
- [**Drag and Drop**](./drag-and-drop.md) - Drag and drop functionality for tabs and groups

## Component Status

The tab system includes the following major features:

| Feature | Status | Description |
|---------|--------|-------------|
| Core Tab Implementation | ✅ Complete | Basic tab registry, lifecycle, state management |
| Tab Ordering | ✅ Complete | Manual and drag-and-drop reordering of tabs |
| Tab Groups | ✅ Complete | Group creation, management, and persistence |
| Tab Persistence | ✅ Complete | Storage and restoration of tab state |
| Tab Communication | ✅ Complete | Inter-tab messaging, state sharing, dependency system |
| Theme Integration | ✅ Complete | Theming and styling for tabs |

## Implementation

The tab system is implemented in the following directories:

- `src/core/tabs/` - Core tab management implementation
- `src/core/tabs/components/` - React components for tabs
- `src/core/tabs/hooks/` - React hooks for tab functionality

## Recent Updates

- **April 2025**: Added tab messaging system with React hooks for tab-to-tab communication
- **March 2025**: Completed tab groups functionality with drag and drop support
- **February 2025**: Implemented tab persistence and state management

## Getting Started

To use the tab system in your application, start with:

```tsx
import { TabContainer, TabManager } from '../core/tabs';

function App() {
  const tabManager = new TabManager();
  
  useEffect(() => {
    // Initialize tabs
    tabManager.initialize();
  }, []);
  
  return (
    <TabContainer 
      tabManager={tabManager}
      showGroups={true} // Enable tab groups
    />
  );
}
```

For further details, please refer to the specific documentation files. 