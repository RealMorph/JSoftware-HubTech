import { useState, useEffect, useCallback } from 'react';
import { TabManager } from '../tab-manager';
import { MessageType } from '../tab-messaging';

/**
 * Hook for managing tab state and dependencies
 * 
 * @param tabManager The tab manager instance
 * @param tabId The ID of the current tab
 * @returns An object with state utilities
 */
export function useTabState<T = any>(
  tabManager: TabManager,
  tabId: string
) {
  const [state, setState] = useState<T | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dependencies, setDependencies] = useState<Array<{providerId: string; type: string; metadata?: any}>>([]);
  const [dependents, setDependents] = useState<Array<{dependentId: string; type: string; metadata?: any}>>([]);

  // Load initial state
  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        const currentState = tabManager.getTabState(tabId);
        if (mounted) {
          setState(currentState);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error loading tab state:', error);
      }
    };

    loadState();

    // Subscribe to state updates
    const subscriptionId = tabManager.subscribeToTabMessages(
      tabId,
      (message) => {
        if (
          message.type === MessageType.STATE_UPDATE ||
          message.type === MessageType.DEPENDENCY_UPDATE
        ) {
          if (mounted) {
            setState(tabManager.getTabState(tabId));
          }
        }
      },
      undefined // Listen to all message types
    );

    return () => {
      mounted = false;
      tabManager.unsubscribeFromTabMessages(subscriptionId);
    };
  }, [tabManager, tabId]);

  // Load dependencies and dependents
  useEffect(() => {
    const loadDependencies = () => {
      const deps = tabManager.getTabDependencies(tabId);
      setDependencies(deps);
    };

    const loadDependents = () => {
      const deps = tabManager.getTabDependents(tabId);
      setDependents(deps);
    };

    loadDependencies();
    loadDependents();
  }, [tabManager, tabId]);

  // Update tab state
  const updateState = useCallback(
    (newState: Partial<T>, broadcast = true) => {
      const currentState = tabManager.getTabState(tabId) || {};
      const mergedState = { ...currentState, ...newState };
      tabManager.updateTabState(tabId, mergedState, broadcast);
      setState(mergedState as T);
      return mergedState;
    },
    [tabManager, tabId]
  );

  // Add dependency
  const addDependency = useCallback(
    (providerId: string, type: string, metadata?: any) => {
      return tabManager.addTabDependency(tabId, providerId, type, metadata).then(() => {
        setDependencies(tabManager.getTabDependencies(tabId));
      });
    },
    [tabManager, tabId]
  );

  // Remove dependency
  const removeDependency = useCallback(
    (providerId: string) => {
      return tabManager.removeTabDependency(tabId, providerId).then(() => {
        setDependencies(tabManager.getTabDependencies(tabId));
      });
    },
    [tabManager, tabId]
  );

  return {
    state,
    isInitialized,
    updateState,
    dependencies,
    dependents,
    addDependency,
    removeDependency
  };
} 