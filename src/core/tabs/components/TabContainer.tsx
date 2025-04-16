import React, { useEffect, useState } from 'react';
import { TabManager } from '../tab-manager';
import { Tab, TabGroup } from '../types';
import { TabList } from './TabList';
import { TabGroupList } from './TabGroupList';
import './tab-container.css';

interface TabContainerProps {
  tabManager: TabManager;
  showGroups?: boolean; // Whether to show the groups panel
}

export const TabContainer: React.FC<TabContainerProps> = ({ 
  tabManager,
  showGroups = true
}) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const refreshState = async () => {
    const loadedTabs = await tabManager.getTabs();
    const activeTab = await tabManager.getActiveTab();
    const loadedGroups = await tabManager.groups;
    
    setTabs(loadedTabs);
    setActiveTab(activeTab);
    setGroups(loadedGroups);
  };

  useEffect(() => {
    // Load initial tabs and groups
    refreshState();
  }, [tabManager]);

  const handleTabClick = async (tab: Tab) => {
    await tabManager.activateTab(tab.id);
    await refreshState();
  };

  const handleTabClose = async (tab: Tab) => {
    await tabManager.removeTab(tab.id);
    await refreshState();
  };

  const handleTabReorder = async (newTabs: Tab[]) => {
    const newOrder = newTabs.map(tab => tab.id);
    await tabManager.reorderTabs(newOrder);
    await refreshState();
  };

  // New handlers for group functionality
  const handleGroupCreate = async (title: string) => {
    const newGroup = await tabManager.createGroup({ 
      title,
      tabIds: [] // Add the required tabIds property
    });
    await refreshState();
    return newGroup;
  };

  const handleGroupDelete = async (groupId: string, keepTabs = true) => {
    await tabManager.removeGroup(groupId, keepTabs);
    await refreshState();
  };

  const handleGroupRename = async (groupId: string, newTitle: string) => {
    await tabManager.updateGroup(groupId, { title: newTitle });
    await refreshState();
  };

  const handleGroupReorder = async (newOrder: string[]) => {
    await tabManager.reorderGroups(newOrder);
    await refreshState();
  };

  const handleGroupCollapse = async (groupId: string) => {
    await tabManager.toggleGroupCollapse(groupId);
    await refreshState();
  };

  const handleAddTabToGroup = async (tabId: string, groupId: string) => {
    await tabManager.addTabToGroup(tabId, groupId);
    await refreshState();
  };

  const handleRemoveTabFromGroup = async (tabId: string) => {
    await tabManager.removeTabFromGroup(tabId);
    await refreshState();
  };

  return (
    <div className={`${showGroups ? 'tab-container-with-groups' : 'tab-container'}`} data-testid="tab-container">
      {showGroups && (
        <TabGroupList
          groups={groups}
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabReorder={handleTabReorder}
          onGroupCreate={handleGroupCreate}
          onGroupDelete={handleGroupDelete}
          onGroupRename={handleGroupRename}
          onGroupReorder={handleGroupReorder}
          onGroupCollapse={handleGroupCollapse}
          onTabAddToGroup={handleAddTabToGroup}
          onTabRemoveFromGroup={handleRemoveTabFromGroup}
        />
      )}
      <div className="tab-container-main">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabReorder={handleTabReorder}
        />
        <div className="tab-content" data-testid="tab-content">
          {activeTab && (
            <div
              className="tab-panel active"
              role="tabpanel"
              id={`tab-panel-${activeTab.id}`}
              data-testid={`tab-panel-${activeTab.id}`}
              aria-labelledby={`tab-${activeTab.id}`}
            >
              {activeTab.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};