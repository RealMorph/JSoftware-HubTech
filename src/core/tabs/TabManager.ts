import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface defining a tab structure
 */
export interface Tab {
  id: string;
  title: string;
  route: string;
  active: boolean;
  closable?: boolean;
  data?: Record<string, any>;
}

/**
 * Interface for the TabManager service
 */
export interface ITabManager {
  /**
   * Observable of the current tabs
   */
  tabs$: Observable<Tab[]>;
  
  /**
   * Observable of the currently active tab
   */
  activeTab$: Observable<Tab | null>;
  
  /**
   * Get the current tabs
   */
  getTabs(): Tab[];
  
  /**
   * Get a tab by its ID
   * @param id The ID of the tab to retrieve
   */
  getTabById(id: string): Tab | undefined;
  
  /**
   * Open a new tab
   * @param tab The tab configuration
   * @returns The opened tab
   */
  openTab(tab: Omit<Tab, 'active'>): Tab;
  
  /**
   * Close a tab by its ID
   * @param id The ID of the tab to close
   * @returns The ID of the next active tab, or null if no tabs remain
   */
  closeTab(id: string): string | null;
  
  /**
   * Activate a tab by its ID
   * @param id The ID of the tab to activate
   * @returns The activated tab, or undefined if not found
   */
  activateTab(id: string): Tab | undefined;
  
  /**
   * Update a tab's properties
   * @param id The ID of the tab to update
   * @param updates The properties to update
   * @returns The updated tab, or undefined if not found
   */
  updateTab(id: string, updates: Partial<Omit<Tab, 'id'>>): Tab | undefined;
  
  /**
   * Check if a tab with the given route already exists
   * @param route The route to check
   * @returns The existing tab if found, otherwise undefined
   */
  findTabByRoute(route: string): Tab | undefined;
}

/**
 * TabManager service for managing tabs in the application
 */
export class TabManager implements ITabManager {
  private _tabs = new BehaviorSubject<Tab[]>([]);
  private _activeTab = new BehaviorSubject<Tab | null>(null);
  
  public tabs$ = this._tabs.asObservable();
  public activeTab$ = this._activeTab.asObservable();
  
  /**
   * Get the current tabs
   */
  public getTabs(): Tab[] {
    return this._tabs.getValue();
  }
  
  /**
   * Get a tab by its ID
   * @param id The ID of the tab to retrieve
   */
  public getTabById(id: string): Tab | undefined {
    return this.getTabs().find(tab => tab.id === id);
  }
  
  /**
   * Open a new tab
   * @param tab The tab configuration
   * @returns The opened tab
   */
  public openTab(tab: Omit<Tab, 'active'>): Tab {
    const currentTabs = this.getTabs();
    const existingTab = currentTabs.find(t => t.id === tab.id);
    
    if (existingTab) {
      return this.activateTab(existingTab.id) as Tab;
    }
    
    const newTab: Tab = {
      ...tab,
      active: true,
      closable: tab.closable !== undefined ? tab.closable : true,
    };
    
    // Deactivate all other tabs
    const updatedTabs = currentTabs.map(t => ({
      ...t,
      active: false,
    }));
    
    // Add the new tab
    updatedTabs.push(newTab);
    
    this._tabs.next(updatedTabs);
    this._activeTab.next(newTab);
    
    return newTab;
  }
  
  /**
   * Close a tab by its ID
   * @param id The ID of the tab to close
   * @returns The ID of the next active tab, or null if no tabs remain
   */
  public closeTab(id: string): string | null {
    const currentTabs = this.getTabs();
    const tabToClose = currentTabs.find(tab => tab.id === id);
    
    if (!tabToClose) {
      return this._activeTab.getValue()?.id || null;
    }
    
    // Remove the tab
    const filteredTabs = currentTabs.filter(tab => tab.id !== id);
    
    if (filteredTabs.length === 0) {
      this._tabs.next([]);
      this._activeTab.next(null);
      return null;
    }
    
    let nextActiveTab: Tab;
    
    // If we're closing the active tab, activate another one
    if (tabToClose.active) {
      // Try to activate the next tab, or the previous if it's the last
      const closedIndex = currentTabs.findIndex(tab => tab.id === id);
      const nextIndex = closedIndex < filteredTabs.length ? closedIndex : filteredTabs.length - 1;
      
      nextActiveTab = filteredTabs[nextIndex];
      nextActiveTab.active = true;
    } else {
      // Keep the current active tab
      nextActiveTab = filteredTabs.find(tab => tab.active) || filteredTabs[0];
      
      if (!nextActiveTab.active) {
        nextActiveTab.active = true;
      }
    }
    
    this._tabs.next(filteredTabs);
    this._activeTab.next(nextActiveTab);
    
    return nextActiveTab.id;
  }
  
  /**
   * Activate a tab by its ID
   * @param id The ID of the tab to activate
   * @returns The activated tab, or undefined if not found
   */
  public activateTab(id: string): Tab | undefined {
    const currentTabs = this.getTabs();
    const tabToActivate = currentTabs.find(tab => tab.id === id);
    
    if (!tabToActivate) {
      return undefined;
    }
    
    // Already active, no need to update
    if (tabToActivate.active) {
      return tabToActivate;
    }
    
    // Update all tabs, setting only the target tab as active
    const updatedTabs = currentTabs.map(tab => ({
      ...tab,
      active: tab.id === id,
    }));
    
    this._tabs.next(updatedTabs);
    this._activeTab.next(tabToActivate);
    
    return tabToActivate;
  }
  
  /**
   * Update a tab's properties
   * @param id The ID of the tab to update
   * @param updates The properties to update
   * @returns The updated tab, or undefined if not found
   */
  public updateTab(id: string, updates: Partial<Omit<Tab, 'id'>>): Tab | undefined {
    const currentTabs = this.getTabs();
    const tabIndex = currentTabs.findIndex(tab => tab.id === id);
    
    if (tabIndex === -1) {
      return undefined;
    }
    
    const updatedTab: Tab = {
      ...currentTabs[tabIndex],
      ...updates,
    };
    
    const updatedTabs = [...currentTabs];
    updatedTabs[tabIndex] = updatedTab;
    
    this._tabs.next(updatedTabs);
    
    // Update active tab reference if needed
    if (updatedTab.active) {
      this._activeTab.next(updatedTab);
    } else if (updates.active === false && currentTabs[tabIndex].active) {
      this._activeTab.next(null);
    }
    
    return updatedTab;
  }
  
  /**
   * Check if a tab with the given route already exists
   * @param route The route to check
   * @returns The existing tab if found, otherwise undefined
   */
  public findTabByRoute(route: string): Tab | undefined {
    return this.getTabs().find(tab => this.normalizeRoute(tab.route) === this.normalizeRoute(route));
  }
  
  /**
   * Normalize a route for comparison (removes query params and trailing slashes)
   * @param route The route to normalize
   * @returns The normalized route
   */
  private normalizeRoute(route: string): string {
    // Remove query parameters
    const basePath = route.split('?')[0];
    
    // Remove trailing slash if it exists
    return basePath.endsWith('/') && basePath.length > 1
      ? basePath.slice(0, -1)
      : basePath;
  }
}

/**
 * Event names for tab-related events
 */
export enum TabEvents {
  TAB_OPENED = 'tabOpened',
  TAB_CLOSED = 'tabClosed',
  TAB_ACTIVATED = 'tabActivated',
  TAB_UPDATED = 'tabUpdated'
}

/**
 * Tab event interface
 */
export interface TabEvent {
  type: TabEvents;
  tabId: string;
  url?: string;
  title?: string;
} 