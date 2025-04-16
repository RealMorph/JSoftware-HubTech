import { DefaultTabManager } from '../tab-manager';
import { TabStorage } from '../tab-storage';

describe('TabManager', () => {
  let tabManager: DefaultTabManager;
  let storage: TabStorage;

  beforeEach(async () => {
    storage = new TabStorage();
    await storage.clearTabs(); // Clear storage before each test
    tabManager = new DefaultTabManager(storage);
    await tabManager.initialize(); // Initialize with clean storage
  });

  afterEach(async () => {
    await storage.clearTabs(); // Clean up after each test
  });

  it('should initialize with no tabs', async () => {
    expect(tabManager.tabs).toHaveLength(0);
    expect(tabManager.activeTab).toBeNull();
  });

  it('should add a new tab', async () => {
    const tab = await tabManager.addTab({
      title: 'Test Tab',
      content: 'Test Content',
    });

    expect(tab.title).toBe('Test Tab');
    expect(tab.content).toBe('Test Content');
    expect(tab.isActive).toBe(true); // First tab should be active
    expect(tabManager.tabs).toHaveLength(1);
    expect(tabManager.activeTab).toBe(tab);
  });

  it('should remove a tab', async () => {
    const tab = await tabManager.addTab({
      title: 'Test Tab',
      content: 'Test Content',
    });

    await tabManager.removeTab(tab.id);
    expect(tabManager.tabs).toHaveLength(0);
    expect(tabManager.activeTab).toBeNull();
  });

  it('should activate a tab', async () => {
    const tab1 = await tabManager.addTab({
      title: 'Tab 1',
      content: 'Content 1',
    });

    const tab2 = await tabManager.addTab({
      title: 'Tab 2',
      content: 'Content 2',
    });

    await tabManager.activateTab(tab2.id);
    expect(tab1.isActive).toBe(false);
    expect(tab2.isActive).toBe(true);
    expect(tabManager.activeTab).toBe(tab2);
  });

  it('should update a tab', async () => {
    const tab = await tabManager.addTab({
      title: 'Test Tab',
      content: 'Test Content',
    });

    const updatedTab = await tabManager.updateTab(tab.id, {
      title: 'Updated Tab',
      content: 'Updated Content',
    });

    expect(updatedTab.title).toBe('Updated Tab');
    expect(updatedTab.content).toBe('Updated Content');
  });

  it('should throw error when removing non-existent tab', async () => {
    await expect(tabManager.removeTab('non-existent')).rejects.toThrow(
      'Tab with id non-existent not found'
    );
  });

  it('should throw error when activating non-existent tab', async () => {
    await expect(tabManager.activateTab('non-existent')).rejects.toThrow(
      'Tab with id non-existent not found'
    );
  });

  it('should throw error when updating non-existent tab', async () => {
    await expect(tabManager.updateTab('non-existent', { title: 'Updated' })).rejects.toThrow(
      'Tab with id non-existent not found'
    );
  });

  it('should handle removing active tab', async () => {
    const tab1 = await tabManager.addTab({
      title: 'Tab 1',
      content: 'Content 1',
    });

    const tab2 = await tabManager.addTab({
      title: 'Tab 2',
      content: 'Content 2',
    });

    await tabManager.activateTab(tab2.id);
    await tabManager.removeTab(tab2.id);

    expect(tabManager.tabs).toHaveLength(1);
    expect(tabManager.activeTab).toBe(tab1);
    expect(tab1.isActive).toBe(true);
  });

  describe('Tab Ordering', () => {
    let tab1: any, tab2: any, tab3: any;

    beforeEach(async () => {
      tab1 = await tabManager.addTab({ title: 'Tab 1', content: 'Content 1' });
      tab2 = await tabManager.addTab({ title: 'Tab 2', content: 'Content 2' });
      tab3 = await tabManager.addTab({ title: 'Tab 3', content: 'Content 3' });
    });

    it('should maintain initial order when adding tabs', async () => {
      const tabs = await tabManager.getTabs();
      expect(tabs.map(t => t.id)).toEqual([tab1.id, tab2.id, tab3.id]);
      expect(tabs.map(t => t.order)).toEqual([0, 1, 2]);
    });

    it('should reorder tabs correctly', async () => {
      await tabManager.reorderTabs([tab2.id, tab3.id, tab1.id]);
      const tabs = await tabManager.getTabs();
      expect(tabs.map(t => t.id)).toEqual([tab2.id, tab3.id, tab1.id]);
      expect(tabs.map(t => t.order)).toEqual([0, 1, 2]);
    });

    it('should move a single tab to new position', async () => {
      await tabManager.moveTab(tab1.id, 2);
      const tabs = await tabManager.getTabs();
      expect(tabs.map(t => t.id)).toEqual([tab2.id, tab3.id, tab1.id]);
      expect(tabs.map(t => t.order)).toEqual([0, 1, 2]);
    });

    it('should throw error when reordering with invalid tab IDs', async () => {
      await expect(tabManager.reorderTabs(['invalid-id'])).rejects.toThrow(
        'New order must include all existing tabs'
      );
    });

    it('should throw error when reordering with incomplete tab list', async () => {
      await expect(tabManager.reorderTabs([tab1.id])).rejects.toThrow(
        'New order must include all existing tabs'
      );
    });

    it('should throw error when moving tab to invalid index', async () => {
      await expect(tabManager.moveTab(tab1.id, 5)).rejects.toThrow('Invalid index');
      await expect(tabManager.moveTab(tab1.id, -1)).rejects.toThrow('Invalid index');
    });

    it('should maintain order after removing and adding tabs', async () => {
      await tabManager.removeTab(tab2.id);
      await tabManager.reorderTabs([tab3.id, tab1.id]);
      const tabs = await tabManager.getTabs();
      expect(tabs.map(t => t.id)).toEqual([tab3.id, tab1.id]);
      expect(tabs.map(t => t.order)).toEqual([0, 1]);
    });
  });
});
