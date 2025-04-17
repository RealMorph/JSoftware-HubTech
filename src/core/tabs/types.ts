import * as React from 'react';

export interface TabConfig {
  id: string;
  title: string;
  icon?: string;
  component: React.ComponentType<any>;
  isDefault?: boolean;
  isHidden?: boolean;
  permissions?: string[];
  dependencies?: string[]; // IDs of tabs this tab depends on
  groupId?: string; // ID of the group this tab belongs to
}

export interface TabGroup {
  id: string;
  title: string;
  icon?: string;
  color?: string;
  isCollapsed?: boolean; // Whether the group is collapsed in the UI
  tabIds: string[]; // IDs of tabs in this group
}

export interface TabState {
  activeTab: string;
  tabs: TabConfig[];
  tabOrder: string[];
  tabStates: Record<string, any>;
  groups: TabGroup[]; // Tab groups
  groupOrder: string[]; // Order of groups in the UI
}

export interface TabManager {
  registerTab: (config: TabConfig) => void;
  unregisterTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  getTabState: (id: string) => any;
  setTabState: (id: string, state: any) => void;
  subscribe: (callback: (state: TabState) => void) => () => void;
  getDependencies: (id: string) => TabConfig[];
  reorderTabs: (newOrder: string[]) => void;

  // New methods for tab groups
  createGroup: (title: string, tabs?: string[]) => string; // Returns new group ID
  deleteGroup: (groupId: string, keepTabs?: boolean) => void;
  addTabToGroup: (tabId: string, groupId: string) => void;
  removeTabFromGroup: (tabId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Omit<TabGroup, 'id' | 'tabIds'>>) => void;
  reorderGroups: (newOrder: string[]) => void;
  getGroupTabs: (groupId: string) => TabConfig[];
  collapseGroup: (groupId: string, collapsed: boolean) => void;
}

// Define Tab and TabGroup interfaces
export interface Tab {
  id: string;
  title: string;
  icon?: string;
  content: string;
  isActive: boolean;
  isDirty?: boolean;
  canClose?: boolean;
  order: number;
  groupId?: string; // ID of the group this tab belongs to
}

export interface TabGroup {
  id: string;
  title: string;
  icon?: string;
  color?: string;
  isCollapsed?: boolean; // Whether the group is collapsed in the UI
  order: number; // Order in the UI
}

// Tab dependencies
export interface TabDependency {
  providerId: string;
  type: string;
  metadata?: any;
}

export interface TabDependent {
  dependentId: string;
  type: string;
  metadata?: any;
}

// Tab state
export interface TabState {
  [key: string]: any;
}

// Stored data structure
export interface StoredTabData {
  tabs: Tab[];
  groups: TabGroup[];
}

// Tab communication
export interface TabMessage {
  id: string;
  sourceId: string;
  targetId?: string;
  type: string;
  payload: any;
  timestamp: number;
}
