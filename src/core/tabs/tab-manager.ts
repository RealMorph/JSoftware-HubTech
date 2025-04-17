import { generateUUID } from '../utils/uuid';
import { TabStorage } from './tab-storage';
import { Tab, TabGroup, TabDependency, TabDependent, TabState } from './types';
import { DefaultTabMessagingManager, TabMessagingManager, MessageType } from './tab-messaging';

export interface TabManager {
  tabs: Tab[];
  groups: TabGroup[];
  activeTab: Tab | null;
  initialize(): Promise<void>;
  addTab(tab: Omit<Tab, 'id' | 'isActive' | 'order'>): Promise<Tab>;
  removeTab(id: string): Promise<void>;
  activateTab(id: string): Promise<void>;
  updateTab(id: string, updates: Partial<Omit<Tab, 'id' | 'isActive' | 'order'>>): Promise<Tab>;
  getTabs(): Promise<Tab[]>;
  getActiveTab(): Promise<Tab | null>;
  reorderTabs(newOrder: string[]): Promise<void>;
  moveTab(id: string, newIndex: number): Promise<void>;

  // Tab group methods
  createGroup(group: Omit<TabGroup, 'id' | 'order'>): Promise<TabGroup>;
  removeGroup(id: string, keepTabs?: boolean): Promise<void>;
  addTabToGroup(tabId: string, groupId: string): Promise<void>;
  removeTabFromGroup(tabId: string): Promise<void>;
  getGroupTabs(groupId: string): Promise<Tab[]>;
  updateGroup(id: string, updates: Partial<Omit<TabGroup, 'id' | 'order'>>): Promise<TabGroup>;
  reorderGroups(newOrder: string[]): Promise<void>;
  moveGroup(id: string, newIndex: number): Promise<void>;
  toggleGroupCollapse(id: string): Promise<void>;

  // Messaging
  getMessagingManager(): TabMessagingManager;
  sendTabMessage(tabId: string, type: string, payload: any, targetId?: string): Promise<void>;
  subscribeToTabMessages(
    tabId: string,
    callback: (message: any) => void,
    messageType?: MessageType
  ): string;
  unsubscribeFromTabMessages(subscriptionId: string): void;

  // State sharing
  getTabState(tabId: string): any;
  updateTabState(tabId: string, state: any, broadcast?: boolean): Promise<void>;

  // Tab dependencies
  addTabDependency(
    dependentId: string,
    providerId: string,
    type: string,
    metadata?: any
  ): Promise<void>;
  removeTabDependency(dependentId: string, providerId: string): Promise<void>;
  getTabDependencies(tabId: string): Array<{ providerId: string; type: string; metadata?: any }>;
  getTabDependents(tabId: string): Array<{ dependentId: string; type: string; metadata?: any }>;
}

export class DefaultTabManager implements TabManager {
  private _tabs: Tab[] = [];
  private _groups: TabGroup[] = [];
  private _activeTab: Tab | null = null;
  private storage: TabStorage;
  private messagingManager: TabMessagingManager;
  private listeners: Set<(tabs: Tab[], groups: TabGroup[]) => void> = new Set();
  private deps: Map<string, TabDependency[]> = new Map();
  private tabState: Map<string, TabState> = new Map();

  constructor(storage: TabStorage) {
    this.storage = storage;
    this.messagingManager = new DefaultTabMessagingManager();
    this.loadTabs();
  }

  private async loadTabs(): Promise<void> {
    try {
      // Load saved tabs from storage
      const savedTabs = await this.storage.loadTabs();
      if (savedTabs.length > 0) {
        this._tabs = savedTabs;
        this._activeTab = this._tabs.find(tab => tab.isActive) || null;
      }

      // Load saved groups from storage
      const savedGroups = await this.storage.loadGroups();
      if (savedGroups.length > 0) {
        this._groups = savedGroups;
      }
    } catch (error) {
      console.error('Error loading tabs and groups:', error);
    }
  }

  get tabs(): Tab[] {
    return [...this._tabs];
  }

  get groups(): TabGroup[] {
    return [...this._groups];
  }

  get activeTab(): Tab | null {
    return this._activeTab;
  }

  async initialize(): Promise<void> {
    // Clear existing tabs and groups
    this._tabs = [];
    this._groups = [];
    this._activeTab = null;

    // Load saved tabs from storage
    const savedTabs = await this.storage.loadTabs();
    if (savedTabs.length > 0) {
      this._tabs = savedTabs;
      this._activeTab = this._tabs.find(tab => tab.isActive) || null;
    }

    // Load saved groups from storage
    const savedGroups = await this.storage.loadGroups();
    if (savedGroups.length > 0) {
      this._groups = savedGroups;
    }
  }

  async addTab(tab: Omit<Tab, 'id' | 'isActive' | 'order'>): Promise<Tab> {
    const newTab: Tab = {
      ...tab,
      id: generateUUID(),
      isActive: this._tabs.length === 0, // First tab is active by default
      order: this._tabs.length,
    };

    this._tabs.push(newTab);

    if (newTab.isActive) {
      this._activeTab = newTab;
    }

    await this.saveTabs();
    return newTab;
  }

  async removeTab(id: string): Promise<void> {
    const index = this._tabs.findIndex(tab => tab.id === id);
    if (index === -1) {
      throw new Error(`Tab with id ${id} not found`);
    }

    const [removedTab] = this._tabs.splice(index, 1);

    // Update order of remaining tabs
    this._tabs.forEach((tab, i) => {
      tab.order = i;
    });

    if (removedTab.isActive && this._tabs.length > 0) {
      // Activate the next tab, or the last tab if we removed the last one
      const nextTab = this._tabs[index] || this._tabs[this._tabs.length - 1];
      await this.activateTab(nextTab.id);
    } else if (this._tabs.length === 0) {
      this._activeTab = null;
    }

    await this.saveTabs();
  }

  async activateTab(id: string): Promise<void> {
    const tab = this._tabs.find(t => t.id === id);
    if (!tab) {
      throw new Error(`Tab with id ${id} not found`);
    }

    if (this._activeTab) {
      this._activeTab.isActive = false;
    }

    tab.isActive = true;
    this._activeTab = tab;

    await this.saveTabs();
  }

  async updateTab(
    id: string,
    updates: Partial<Omit<Tab, 'id' | 'isActive' | 'order'>>
  ): Promise<Tab> {
    const tab = this._tabs.find(t => t.id === id);
    if (!tab) {
      throw new Error(`Tab with id ${id} not found`);
    }

    Object.assign(tab, updates);
    await this.saveTabs();
    return tab;
  }

  async getTabs(): Promise<Tab[]> {
    return this.tabs;
  }

  async getActiveTab(): Promise<Tab | null> {
    return this.activeTab;
  }

  async reorderTabs(newOrder: string[]): Promise<void> {
    // Validate that all tabs are included
    if (newOrder.length !== this._tabs.length) {
      throw new Error('New order must include all existing tabs');
    }

    // Create a map of new positions
    const newPositions = new Map<string, number>();
    newOrder.forEach((id, index) => {
      newPositions.set(id, index);
    });

    // Update tab orders
    this._tabs.forEach(tab => {
      const newPosition = newPositions.get(tab.id);
      if (newPosition === undefined) {
        throw new Error(`Tab with id ${tab.id} not found in new order`);
      }
      tab.order = newPosition;
    });

    // Sort tabs by new order
    this._tabs.sort((a, b) => a.order - b.order);

    await this.saveTabs();
  }

  async moveTab(id: string, newIndex: number): Promise<void> {
    if (newIndex < 0 || newIndex >= this._tabs.length) {
      throw new Error('Invalid index');
    }

    const currentIndex = this._tabs.findIndex(tab => tab.id === id);
    if (currentIndex === -1) {
      throw new Error(`Tab with id ${id} not found`);
    }

    // Create new order array
    const newOrder = this.tabs.map(tab => tab.id);
    const [movedId] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedId);

    await this.reorderTabs(newOrder);
  }

  // Tab group methods implementation
  async createGroup(group: Omit<TabGroup, 'id' | 'order'>): Promise<TabGroup> {
    const newGroup: TabGroup = {
      ...group,
      id: generateUUID(),
      order: this._groups.length,
      isCollapsed: group.isCollapsed || false,
    };

    this._groups.push(newGroup);
    await this.saveTabs();
    return newGroup;
  }

  async removeGroup(id: string, keepTabs: boolean = true): Promise<void> {
    const index = this._groups.findIndex(group => group.id === id);
    if (index === -1) {
      throw new Error(`Group with id ${id} not found`);
    }

    const [removedGroup] = this._groups.splice(index, 1);

    // Handle tabs in this group
    if (keepTabs) {
      // Remove the group association but keep the tabs
      this._tabs.forEach(tab => {
        if (tab.groupId === id) {
          tab.groupId = undefined;
        }
      });
    } else {
      // Remove all tabs in this group
      const tabsToRemove = this._tabs.filter(tab => tab.groupId === id);
      for (const tab of tabsToRemove) {
        await this.removeTab(tab.id);
      }
    }

    // Update order of remaining groups
    this._groups.forEach((group, i) => {
      group.order = i;
    });

    await this.saveTabs();
  }

  async addTabToGroup(tabId: string, groupId: string): Promise<void> {
    const tab = this._tabs.find(t => t.id === tabId);
    if (!tab) {
      throw new Error(`Tab with id ${tabId} not found`);
    }

    const group = this._groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }

    tab.groupId = groupId;
    await this.saveTabs();
  }

  async removeTabFromGroup(tabId: string): Promise<void> {
    const tab = this._tabs.find(t => t.id === tabId);
    if (!tab) {
      throw new Error(`Tab with id ${tabId} not found`);
    }

    tab.groupId = undefined;
    await this.saveTabs();
  }

  async getGroupTabs(groupId: string): Promise<Tab[]> {
    return this._tabs.filter(tab => tab.groupId === groupId);
  }

  async updateGroup(
    id: string,
    updates: Partial<Omit<TabGroup, 'id' | 'order'>>
  ): Promise<TabGroup> {
    const group = this._groups.find(g => g.id === id);
    if (!group) {
      throw new Error(`Group with id ${id} not found`);
    }

    Object.assign(group, updates);
    await this.saveTabs();
    return group;
  }

  async reorderGroups(newOrder: string[]): Promise<void> {
    // Validate that all groups are included
    if (newOrder.length !== this._groups.length) {
      throw new Error('New order must include all existing groups');
    }

    // Create a map of new positions
    const newPositions = new Map<string, number>();
    newOrder.forEach((id, index) => {
      newPositions.set(id, index);
    });

    // Update group orders
    this._groups.forEach(group => {
      const newPosition = newPositions.get(group.id);
      if (newPosition === undefined) {
        throw new Error(`Group with id ${group.id} not found in new order`);
      }
      group.order = newPosition;
    });

    // Sort groups by new order
    this._groups.sort((a, b) => a.order - b.order);

    await this.saveTabs();
  }

  async moveGroup(id: string, newIndex: number): Promise<void> {
    if (newIndex < 0 || newIndex >= this._groups.length) {
      throw new Error('Invalid index');
    }

    const currentIndex = this._groups.findIndex(group => group.id === id);
    if (currentIndex === -1) {
      throw new Error(`Group with id ${id} not found`);
    }

    // Create new order array
    const newOrder = this.groups.map(group => group.id);
    const [movedId] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedId);

    await this.reorderGroups(newOrder);
  }

  async toggleGroupCollapse(id: string): Promise<void> {
    const group = this._groups.find(g => g.id === id);
    if (!group) {
      throw new Error(`Group with id ${id} not found`);
    }

    group.isCollapsed = !group.isCollapsed;
    await this.saveTabs();
  }

  // Update the saveTabs method to include groups
  private async saveTabs(): Promise<void> {
    await this.storage.saveTabs(this._tabs, this._groups);
  }

  // Messaging system methods
  getMessagingManager(): TabMessagingManager {
    return this.messagingManager;
  }

  async sendTabMessage(
    tabId: string,
    type: string,
    payload: any,
    targetId?: string
  ): Promise<void> {
    await this.messagingManager.sendMessage({
      type: type as MessageType,
      senderId: tabId,
      targetId,
      payload,
    });
  }

  subscribeToTabMessages(
    tabId: string,
    callback: (message: any) => void,
    messageType?: MessageType
  ): string {
    return this.messagingManager.subscribe({
      tabId,
      messageType,
      callback,
    });
  }

  unsubscribeFromTabMessages(subscriptionId: string): void {
    this.messagingManager.unsubscribe(subscriptionId);
  }

  // State sharing methods
  getTabState(tabId: string): any {
    return this.messagingManager.getTabState(tabId);
  }

  async updateTabState(tabId: string, state: any, broadcast: boolean = true): Promise<void> {
    await this.messagingManager.updateTabState(tabId, state, broadcast);
  }

  // Tab dependency methods
  async addTabDependency(
    dependentId: string,
    providerId: string,
    type: string,
    metadata?: any
  ): Promise<void> {
    await this.messagingManager.addDependency({
      dependentId,
      providerId,
      type,
      metadata,
    });
  }

  async removeTabDependency(dependentId: string, providerId: string): Promise<void> {
    await this.messagingManager.removeDependency(dependentId, providerId);
  }

  getTabDependencies(tabId: string): Array<{ providerId: string; type: string; metadata?: any }> {
    return this.messagingManager.getDependencies(tabId).map(dep => ({
      providerId: dep.providerId,
      type: dep.type,
      metadata: dep.metadata,
    }));
  }

  getTabDependents(tabId: string): Array<{ dependentId: string; type: string; metadata?: any }> {
    return this.messagingManager.getDependents(tabId).map(dep => ({
      dependentId: dep.dependentId,
      type: dep.type,
      metadata: dep.metadata,
    }));
  }
}
