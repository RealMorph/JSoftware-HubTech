# Tab Groups Feature

## Overview

Tab Groups allow users to organize related tabs together, improving tab management and navigation in applications with many open tabs. The Tab Groups feature lets users:

- Create, rename, and delete groups
- Add tabs to groups
- Remove tabs from groups
- Collapse/expand groups to save space
- Reorder groups via drag and drop
- Move tabs between groups via drag and drop

## Components

The Tab Groups implementation consists of several key components:

1. **TabGroup Interface**: Defines the structure of a tab group
2. **TabGroupList Component**: Renders the list of tab groups and their tabs
3. **DraggableGroup Component**: Handles drag and drop functionality for groups
4. **TabManager Extensions**: Methods for creating, updating, and managing groups

## Usage

### Basic Setup

To use Tab Groups in your application, simply enable the `showGroups` prop on the TabContainer component:

```tsx
import { TabContainer } from './core/tabs/components/TabContainer';
import { tabManager } from './core/tabs/tab-manager';

function App() {
  return (
    <TabContainer 
      tabManager={tabManager}
      showGroups={true} // Enable tab groups (true by default)
    />
  );
}
```

### Creating Groups

Users can create new groups by clicking the "+ Add Group" button in the tab groups panel. They'll be prompted to enter a name for the new group.

Programmatically, you can create groups like this:

```tsx
// Create a new group
const newGroup = await tabManager.createGroup({ 
  title: "Documentation", 
  color: "#0078d7" // Optional custom color
});
```

### Adding Tabs to Groups

Users can add tabs to groups by dragging a tab from the tab list and dropping it onto a group.

Programmatically:

```tsx
// Add a tab to a group
await tabManager.addTabToGroup(tabId, groupId);
```

### Removing Tabs from Groups

Users can remove a tab from a group by clicking the 🔗 button on the tab within the group view.

Programmatically:

```tsx
// Remove a tab from its group
await tabManager.removeTabFromGroup(tabId);
```

### Deleting Groups

Users can delete a group by clicking the × button in the group header. This keeps the tabs but removes them from the group.

Programmatically:

```tsx
// Delete a group but keep its tabs (default)
await tabManager.removeGroup(groupId, true);

// Delete a group and all its tabs
await tabManager.removeGroup(groupId, false);
```

### Collapsing/Expanding Groups

Users can collapse or expand a group by clicking the ▼/▶ button in the group header.

Programmatically:

```tsx
// Toggle group collapse state
await tabManager.toggleGroupCollapse(groupId);
```

## Styling

Tab Groups come with default styling that matches the overall tab system theme. You can customize the appearance by modifying the following CSS variables:

```css
:root {
  --tab-group-bg-color: #f5f5f5;
  --tab-group-header-bg-color: #e5e5e5;
  --tab-group-badge-color: #0078d7;
  --tab-group-add-bg-color: #e5e5e5;
  --tab-group-add-hover-bg-color: #d5d5d5;
  --tab-empty-color: #999;
  --tab-count-color: #666;
  --tab-action-hover-bg-color: rgba(0, 0, 0, 0.1);
}
```

## API Reference

### TabGroup Interface

```typescript
interface TabGroup {
  id: string;            // Unique identifier for the group
  title: string;         // Group display name
  icon?: string;         // Optional icon for the group
  color?: string;        // Optional color for the group indicator
  isCollapsed?: boolean; // Whether the group is collapsed in the UI
  order: number;         // Order in the UI
}
```

### Tab Interface Extensions

The Tab interface has been extended with a `groupId` property:

```typescript
interface Tab {
  // ...existing properties
  groupId?: string; // ID of the group this tab belongs to
}
```

### TabManager Group Methods

```typescript
interface TabManager {
  // ...existing methods
  
  // Group management
  createGroup(group: Omit<TabGroup, 'id' | 'order'>): Promise<TabGroup>;
  removeGroup(id: string, keepTabs?: boolean): Promise<void>;
  updateGroup(id: string, updates: Partial<Omit<TabGroup, 'id' | 'order'>>): Promise<TabGroup>;
  reorderGroups(newOrder: string[]): Promise<void>;
  moveGroup(id: string, newIndex: number): Promise<void>;
  toggleGroupCollapse(id: string): Promise<void>;
  
  // Tab-group relationships
  addTabToGroup(tabId: string, groupId: string): Promise<void>;
  removeTabFromGroup(tabId: string): Promise<void>;
  getGroupTabs(groupId: string): Promise<Tab[]>;
}
```

## Implementation Details

### Storage

Tab groups are stored alongside tabs in the local storage (or other storage medium), using a combined data structure:

```typescript
interface StoredTabData {
  tabs: Tab[];
  groups: TabGroup[];
}
```

This ensures that tab group information persists across sessions, maintaining user organization.

### Drag and Drop

The drag and drop functionality is implemented using react-dnd. There are multiple interaction types:

1. **Group Reordering**: Dragging a group header to reorder groups
2. **Tab Grouping**: Dragging a tab onto a group to add it to that group
3. **Tab Reordering within Group**: Reordering tabs within a group

Each of these interactions is handled by specific drag sources and drop targets defined in the components.

## Accessibility

The tab groups implementation adheres to accessibility best practices:

- Group headers have appropriate ARIA roles and labels
- Keyboard navigation support for all group operations
- High contrast visual indicators
- Collapsed state is communicated to screen readers

## Future Enhancements

Potential future enhancements to the Tab Groups feature include:

1. Group nesting (subgroups)
2. Group color customization by user
3. Group templates/presets
4. Group sharing between users
5. Auto-grouping based on tab content or patterns 