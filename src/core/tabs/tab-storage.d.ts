declare module './tab-storage' {
  import { Tab, TabGroup } from './types';

  export class TabStorage {
    constructor();
    loadTabs(): Promise<Tab[]>;
    loadGroups(): Promise<TabGroup[]>;
    saveTabs(tabs: Tab[], groups?: TabGroup[]): Promise<void>;
    clearTabs(): Promise<void>;
  }
} 