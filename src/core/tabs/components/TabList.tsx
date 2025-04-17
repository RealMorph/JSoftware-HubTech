import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../types';
import { DndProvider, useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './tab-container.css';

interface TabListProps {
  tabs: Tab[];
  activeTab: Tab | null;
  onTabClick: (tab: Tab) => void;
  onTabClose: (tab: Tab) => void;
  onTabReorder: (newOrder: Tab[]) => void;
}

interface DraggableTabProps {
  tab: Tab;
  index: number;
  isActive: boolean;
  onTabClick: (tab: Tab) => void;
  onTabClose: (tab: Tab) => void;
  moveTab: (dragIndex: number, hoverIndex: number) => void;
  onTabReorder: (newOrder: Tab[]) => void;
  tabs: Tab[];
}

const DraggableTab: React.FC<DraggableTabProps> = ({
  tab,
  index,
  isActive,
  onTabClick,
  onTabClose,
  moveTab,
  onTabReorder,
  tabs,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'TAB',
    item: () => ({
      type: 'TAB',
      id: tab.id,
      index,
      groupId: tab.groupId,
    }),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TAB',
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
    },
    drop: (item: { index: number }) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        // When dropping on the same position, maintain the original order
        onTabReorder([...tabs]);
      }
    },
  });

  drag(drop(ref));

  // Add a visual indicator if the tab belongs to a group
  const groupIndicator = tab.groupId ? (
    <span className="tab-group-badge" title="Part of a group">
      •
    </span>
  ) : null;

  return (
    <div
      ref={ref}
      className={`tab ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-panel-${tab.id}`}
      data-testid={`tab-${tab.id}`}
      data-index={index}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onTabClick(tab)}
    >
      {groupIndicator}
      <span className="tab-title" data-testid={`tab-title-${tab.id}`}>
        {tab.title}
      </span>
      <button
        className="tab-close"
        onClick={e => {
          e.stopPropagation();
          onTabClose(tab);
        }}
        aria-label={`Close ${tab.title} tab`}
        data-testid={`tab-close-${tab.id}`}
      >
        ×
      </button>
    </div>
  );
};

export const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onTabReorder,
}) => {
  const moveTab = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) {
      // When dropping on the same position, maintain the original order
      // No need to do anything here as the drop handler will handle it
      return;
    }
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(dragIndex, 1);
    newTabs.splice(hoverIndex, 0, draggedTab);
    onTabReorder(newTabs);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tab-list" role="tablist" data-testid="tab-list">
        {tabs.map((tab, index) => (
          <DraggableTab
            key={tab.id}
            tab={tab}
            index={index}
            isActive={tab.id === activeTab?.id}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
            moveTab={moveTab}
            onTabReorder={onTabReorder}
            tabs={tabs}
          />
        ))}
      </div>
    </DndProvider>
  );
};
