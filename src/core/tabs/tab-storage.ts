import { Tab, TabGroup, StoredTabData } from './types';

export class TabStorage {
  private readonly STORAGE_KEY = 'app_tabs';
  private readonly GROUPS_KEY = 'app_tab_groups';
  private storage: Storage;

  constructor() {
    // Use memory storage for tests, localStorage for production
    this.storage =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : new MemoryStorage();
  }

  async loadTabs(): Promise<Tab[]> {
    try {
      const stored = this.storage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      // Check if the stored data is the new format with tabs and groups
      try {
        const parsedData = JSON.parse(stored) as StoredTabData;
        if (parsedData.tabs) {
          return parsedData.tabs;
        }
      } catch {
        // If parsing as StoredTabData fails, try parsing as the old format (just tabs)
        return JSON.parse(stored) as Tab[];
      }
      
      return [];
    } catch (error) {
      console.error('Error loading tabs:', error);
      return [];
    }
  }

  async loadGroups(): Promise<TabGroup[]> {
    try {
      const storedTabs = this.storage.getItem(this.STORAGE_KEY);
      if (!storedTabs) return [];
      
      // First try to get groups from the new combined format
      try {
        const parsedData = JSON.parse(storedTabs) as StoredTabData;
        if (parsedData.groups) {
          return parsedData.groups;
        }
      } catch {
        // If that fails, try the dedicated groups storage
        const storedGroups = this.storage.getItem(this.GROUPS_KEY);
        if (storedGroups) {
          return JSON.parse(storedGroups);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error loading tab groups:', error);
      return [];
    }
  }

  async saveTabs(tabs: Tab[], groups: TabGroup[] = []): Promise<void> {
    try {
      // Save in the new format with tabs and groups together
      const data: StoredTabData = { tabs, groups };
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tabs and groups:', error);
    }
  }

  async clearTabs(): Promise<void> {
    try {
      this.storage.removeItem(this.STORAGE_KEY);
      this.storage.removeItem(this.GROUPS_KEY);
    } catch (error) {
      console.error('Error clearing tabs and groups:', error);
    }
  }
}

// Memory storage for tests
class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  get length(): number {
    return Object.keys(this.data).length;
  }

  key(index: number): string | null {
    return Object.keys(this.data)[index] || null;
  }
}
