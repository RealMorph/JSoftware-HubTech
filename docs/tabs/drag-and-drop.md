# Tab Drag and Drop Functionality

## Overview

The tab system implements drag and drop functionality to allow users to reorder tabs by dragging them to a new position. This document describes how the drag and drop system works and important implementation details.

## Implementation

The drag and drop functionality is implemented using the `react-dnd` library, which provides hooks for creating drag sources and drop targets.

### Key Components

- **TabList**: The container component that renders the individual tabs and manages the tab order.
- **DraggableTab**: A wrapper component that makes each tab draggable using the `useDrag` and `useDrop` hooks from react-dnd.

### Core Logic

The main logic for tab reordering is in the `moveTab` function within the `TabList` component:

```tsx
const moveTab = (dragIndex: number, hoverIndex: number) => {
  if (dragIndex === hoverIndex) {
    // When dropping on the same position, maintain the original order
    return;
  }
  const newTabs = [...tabs];
  const [draggedTab] = newTabs.splice(dragIndex, 1);
  newTabs.splice(hoverIndex, 0, draggedTab);
  onTabReorder(newTabs);
};
```

This function:
1. Checks if the drag index matches the hover index (same position)
2. If not, creates a new array of tabs, removes the tab from its current position, and inserts it at the new position
3. Calls the `onTabReorder` callback with the new tab order

### Preventing Reordering on Same Position

A key feature is that tabs do not reorder when they are dropped in their original position. This is handled in two places:

1. **In the hover handler**: When a dragged tab is hovering over its original position, the hover handler returns early:

```tsx
hover: (item: { index: number }, monitor) => {
  if (!ref.current) return;
  const dragIndex = item.index;
  const hoverIndex = index;
  
  if (dragIndex === hoverIndex) {
    return;
  }
  
  moveTab(dragIndex, hoverIndex);
  
  // Update the item's index to reflect its new position
  item.index = hoverIndex;
}
```

2. **In the drop handler**: When a dragged tab is dropped in its original position, the drop handler maintains the original order:

```tsx
drop: (item: { index: number }) => {
  const dragIndex = item.index;
  const hoverIndex = index;
  
  if (dragIndex === hoverIndex) {
    // When dropping on the same position, maintain the original order
    onTabReorder([...tabs]);
  }
}
```

## Edge Cases Handled

- **Dropping on same position**: Tabs maintain their original order when dropped on their original position
- **Multiple drag operations**: Tab order is correctly maintained after multiple drag and drop operations
- **Updating drag index**: The `item.index` is updated after moving a tab to ensure subsequent drag operations behave correctly

## Testing

The drag and drop functionality is thoroughly tested to ensure it works as expected:

- Tests verify that tabs reorder correctly when dragged to a new position
- Tests confirm that tabs do not reorder when dropped in the same position
- Tests validate that tab order is maintained after multiple drag and drop operations

## Usage

The drag and drop functionality is automatically enabled for all tabs in the `TabList` component. No additional configuration is needed.

## Customization

The drag and drop behavior can be customized by:

1. Modifying the `moveTab` function to implement custom reordering logic
2. Customizing the `DraggableTab` component to change the drag preview or drop behavior
3. Adding animation effects or visual feedback during dragging 