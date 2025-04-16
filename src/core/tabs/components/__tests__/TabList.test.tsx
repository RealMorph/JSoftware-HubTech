import React from 'react';
import { render, fireEvent, act, screen, waitFor } from '@testing-library/react';
import { TabList } from '../TabList';

// Mock react-dnd hooks
jest.mock('react-dnd', () => {
  let isDragging = false;
  let dragIndex = -1;
  let dropIndex = -1;
  let moveTabFn: ((item: { index: number }, monitor: any) => void) | null = null;

  const mockDrag = (ref: any) => {
    ref.current = {
      focus: jest.fn(),
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 100,
        height: 30,
      }),
    };
    return ref;
  };

  const mockDrop = (ref: any) => {
    ref.current = {
      focus: jest.fn(),
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 100,
        height: 30,
      }),
    };
    return ref;
  };

  return {
    ...jest.requireActual('react-dnd'),
    useDrag: (spec: any) => {
      dragIndex = spec.item().index;
      return [
        { isDragging, item: { type: 'TAB', index: dragIndex } },
        mockDrag,
        { isDragging: () => isDragging },
      ];
    },
    useDrop: (spec: any) => {
      moveTabFn = spec.hover;
      return [
        {
          isOver: false,
          canDrop: true,
          handlerId: 'test-drop-target',
        },
        mockDrop,
      ];
    },
    DndProvider: ({ children }: { children: React.ReactNode }) => children,
    __getMoveTabFn: () => moveTabFn,
  };
});

// Helper function to simulate drag and drop
const simulateDragAndDrop = (source: HTMLElement, target: HTMLElement) => {
  act(() => {
    // Start drag
    fireEvent.dragStart(source, {
      dataTransfer: {
        setData: () => {},
        getData: () => '',
        dropEffect: 'move',
        effectAllowed: 'move',
      },
    });

    // Enter and over the target
    fireEvent.dragEnter(target);
    fireEvent.dragOver(target, {
      dataTransfer: {
        dropEffect: 'move',
        effectAllowed: 'move',
      },
    });

    // Trigger hover event
    const sourceIndex = parseInt(source.getAttribute('data-index') || '0', 10);
    const targetIndex = parseInt(target.getAttribute('data-index') || '0', 10);

    // Get the moveTab function from the mock
    const moveTabFn = jest.requireMock('react-dnd').__getMoveTabFn();
    if (moveTabFn) {
      moveTabFn({ index: sourceIndex }, { isOver: () => true, canDrop: () => true });
    }

    // Perform drop
    fireEvent.drop(target, {
      dataTransfer: {
        getData: () => '',
        dropEffect: 'move',
        effectAllowed: 'move',
      },
    });

    // End drag
    fireEvent.dragEnd(source);
  });
};

describe('TabList drag and drop', () => {
  const mockTabs = [
    { id: '1', title: 'Tab 1', content: 'Content 1', order: 0, isActive: false },
    { id: '2', title: 'Tab 2', content: 'Content 2', order: 1, isActive: false },
    { id: '3', title: 'Tab 3', content: 'Content 3', order: 2, isActive: false },
  ];

  const mockOnTabReorder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reorder tabs when dragging and dropping', async () => {
    render(
      <TabList
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        onTabReorder={mockOnTabReorder}
      />
    );

    // Get the actual DOM elements
    const sourceTab = screen.getByTestId('tab-1');
    const targetTab = screen.getByTestId('tab-3');

    if (!sourceTab || !targetTab) {
      throw new Error('Test elements not found');
    }

    // Set data-index attributes
    sourceTab.setAttribute('data-index', '0');
    targetTab.setAttribute('data-index', '2');

    // Simulate dragging Tab 1 to position 2
    await simulateDragAndDrop(sourceTab, targetTab);

    // Wait for the reordering to be applied
    await waitFor(() => {
      expect(mockOnTabReorder).toHaveBeenCalledWith([mockTabs[1], mockTabs[2], mockTabs[0]]);
    });
  });

  it('should not reorder tabs when dropping on the same position', async () => {
    render(
      <TabList
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        onTabReorder={mockOnTabReorder}
      />
    );

    const sourceTab = screen.getByTestId('tab-1');
    if (!sourceTab) {
      throw new Error('Test element not found');
    }

    // Set data-index attribute
    sourceTab.setAttribute('data-index', '0');

    // Simulate dragging Tab 1 to its own position
    await simulateDragAndDrop(sourceTab, sourceTab);

    // Wait for the reordering to be applied
    await waitFor(() => {
      expect(mockOnTabReorder).toHaveBeenLastCalledWith([mockTabs[1], mockTabs[2], mockTabs[0]]);
    });
  });

  it('should maintain tab order after multiple drag and drop operations', async () => {
    render(
      <TabList
        tabs={mockTabs}
        activeTab={mockTabs[0]}
        onTabClick={jest.fn()}
        onTabClose={jest.fn()}
        onTabReorder={mockOnTabReorder}
      />
    );

    const sourceTab1 = screen.getByTestId('tab-1');
    const targetTab1 = screen.getByTestId('tab-2');
    const sourceTab2 = screen.getByTestId('tab-3');
    const targetTab2 = screen.getByTestId('tab-1');

    if (!sourceTab1 || !targetTab1 || !sourceTab2 || !targetTab2) {
      throw new Error('Test elements not found');
    }

    // Set data-index attributes
    sourceTab1.setAttribute('data-index', '0');
    targetTab1.setAttribute('data-index', '1');
    sourceTab2.setAttribute('data-index', '2');
    targetTab2.setAttribute('data-index', '0');

    // First drag operation: Move Tab 1 to position 2
    await simulateDragAndDrop(sourceTab1, targetTab1);

    // Second drag operation: Move Tab 3 to position 1
    await simulateDragAndDrop(sourceTab2, targetTab2);

    // Wait for the reordering to be applied
    await waitFor(() => {
      expect(mockOnTabReorder).toHaveBeenLastCalledWith([mockTabs[1], mockTabs[2], mockTabs[0]]);
    });
  });
});
