import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tab, TabGroup } from '../types';
import './tab-container.css';

interface TabGroupListProps {
  groups: TabGroup[];
  tabs: Tab[];
  activeTab: Tab | null;
  onTabClick: (tab: Tab) => void;
  onTabClose: (tab: Tab) => void;
  onTabReorder: (newOrder: Tab[]) => void;
  onGroupCreate: (title: string) => Promise<TabGroup>;
  onGroupDelete: (groupId: string, keepTabs?: boolean) => Promise<void>;
  onGroupRename: (groupId: string, newTitle: string) => Promise<void>;
  onGroupReorder: (newOrder: string[]) => Promise<void>;
  onGroupCollapse: (groupId: string) => Promise<void>;
  onTabAddToGroup: (tabId: string, groupId: string) => Promise<void>;
  onTabRemoveFromGroup: (tabId: string) => Promise<void>;
}

interface DraggableGroupProps {
  group: TabGroup;
  tabs: Tab[];
  index: number;
  activeTab: Tab | null;
  onTabClick: (tab: Tab) => void;
  onTabClose: (tab: Tab) => void;
  onTabReorder: (newOrder: Tab[]) => void;
  onGroupRename: (groupId: string, newTitle: string) => Promise<void>;
  onGroupDelete: (groupId: string, keepTabs?: boolean) => Promise<void>;
  onGroupCollapse: (groupId: string) => Promise<void>;
  onTabAddToGroup: (tabId: string, groupId: string) => Promise<void>;
  onTabRemoveFromGroup: (tabId: string) => Promise<void>;
  moveGroup: (dragIndex: number, hoverIndex: number) => void;
}

// Component for draggable group
const DraggableGroup: React.FC<DraggableGroupProps> = ({
  group,
  tabs,
  index,
  activeTab,
  onTabClick,
  onTabClose,
  onTabReorder,
  onGroupRename,
  onGroupDelete,
  onGroupCollapse,
  onTabAddToGroup,
  onTabRemoveFromGroup,
  moveGroup,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dropTabRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(group.title);

  // Get tabs for this group
  const groupTabs = tabs.filter(tab => tab.groupId === group.id);

  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'GROUP',
    item: () => ({ id: group.id, index }),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'GROUP',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveGroup(dragIndex, hoverIndex);

      // Update the item's index to reflect its new position
      item.index = hoverIndex;
    },
  });

  // Also accept tabs being dropped into the group
  const [, dropTab] = useDrop({
    accept: 'TAB',
    drop: (item: { id: string; index: number }) => {
      const tab = tabs.find(t => t.id === item.id);
      if (tab) {
        onTabAddToGroup(tab.id, group.id);
      }
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));
  dropTab(dropTabRef);

  // Handle renaming the group
  const handleRename = () => {
    if (newTitle.trim() !== '') {
      onGroupRename(group.id, newTitle);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={ref}
      className={`tab-group ${isDragging ? 'dragging' : ''}`}
      data-testid={`tab-group-${group.id}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="tab-group-header" ref={dropTabRef}>
        <div className="tab-group-indicator" style={{ backgroundColor: group.color || '#666' }} />

        {isEditing ? (
          <div className="tab-group-title-edit">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setNewTitle(group.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="tab-group-title" onDoubleClick={() => setIsEditing(true)}>
            {group.title} <span className="tab-group-count">({groupTabs.length})</span>
          </div>
        )}

        <div className="tab-group-actions">
          <button
            className="tab-group-action"
            onClick={() => onGroupCollapse(group.id)}
            aria-label={group.isCollapsed ? 'Expand group' : 'Collapse group'}
          >
            {group.isCollapsed ? '▶' : '▼'}
          </button>
          <button
            className="tab-group-action"
            onClick={() => onGroupDelete(group.id, true)}
            aria-label="Delete group"
          >
            ×
          </button>
        </div>
      </div>

      {!group.isCollapsed && (
        <div className="tab-group-content">
          {groupTabs.length > 0 ? (
            groupTabs.map((tab, tabIndex) => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTab?.id ? 'active' : ''}`}
                onClick={() => onTabClick(tab)}
              >
                <span className="tab-title">{tab.title}</span>
                <div className="tab-actions">
                  <button
                    className="tab-action"
                    onClick={e => {
                      e.stopPropagation();
                      onTabRemoveFromGroup(tab.id);
                    }}
                    aria-label="Remove from group"
                  >
                    🔗
                  </button>
                  <button
                    className="tab-close"
                    onClick={e => {
                      e.stopPropagation();
                      onTabClose(tab);
                    }}
                    aria-label={`Close ${tab.title}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="tab-group-empty">Drop tabs here</div>
          )}
        </div>
      )}
    </div>
  );
};

// Main component for the tab group list
export const TabGroupList: React.FC<TabGroupListProps> = ({
  groups,
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onTabReorder,
  onGroupCreate,
  onGroupDelete,
  onGroupRename,
  onGroupReorder,
  onGroupCollapse,
  onTabAddToGroup,
  onTabRemoveFromGroup,
}) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  // Handle creating a new group
  const handleCreateGroup = async () => {
    if (newGroupTitle.trim() !== '') {
      await onGroupCreate(newGroupTitle);
      setNewGroupTitle('');
      setIsCreatingGroup(false);
    }
  };

  // Handle group reordering
  const moveGroup = (dragIndex: number, hoverIndex: number) => {
    const sortedGroups = [...(groups || [])].sort((a, b) => a.order - b.order);
    const newOrder = sortedGroups.map(group => group.id);
    const [movedId] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, movedId);
    onGroupReorder(newOrder);
  };

  // Sort groups by order
  const sortedGroups = [...(groups || [])].sort((a, b) => a.order - b.order);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tab-group-list">
        {sortedGroups.map((group, index) => (
          <DraggableGroup
            key={group.id}
            group={group}
            tabs={tabs}
            index={index}
            activeTab={activeTab}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
            onTabReorder={onTabReorder}
            onGroupRename={onGroupRename}
            onGroupDelete={onGroupDelete}
            onGroupCollapse={onGroupCollapse}
            onTabAddToGroup={onTabAddToGroup}
            onTabRemoveFromGroup={onTabRemoveFromGroup}
            moveGroup={moveGroup}
          />
        ))}

        {isCreatingGroup ? (
          <div className="tab-group-create">
            <input
              type="text"
              placeholder="New Group Name"
              value={newGroupTitle}
              onChange={e => setNewGroupTitle(e.target.value)}
              onBlur={() => {
                handleCreateGroup();
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateGroup();
                if (e.key === 'Escape') {
                  setNewGroupTitle('');
                  setIsCreatingGroup(false);
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <button className="tab-group-add" onClick={() => setIsCreatingGroup(true)}>
            + Add Group
          </button>
        )}
      </div>
    </DndProvider>
  );
};
