import { DefaultTabManager } from './tab-manager';
import { TabStorage } from './tab-storage';
import { Tab, TabGroup, StoredTabData, TabState as TypeTabState } from './types';

// Export types from types.ts explicitly
export type { Tab, TabGroup, StoredTabData, TypeTabState as TabState };

// Export from other modules
export * from './tab-manager';
export * from './tab-storage';
export * from './tab-messaging';
export * from './hooks';
export * from './components';

// Initialize tab system
export function initializeTabManager(storage: TabStorage = new TabStorage()) {
  return new DefaultTabManager(storage);
}
