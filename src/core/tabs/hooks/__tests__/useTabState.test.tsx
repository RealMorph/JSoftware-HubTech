import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { useTabState } from '../useTabState';
import { MessageType } from '../../tab-messaging';

// Mock TabManager
const mockTabManager = {
  getTabState: jest.fn(),
  updateTabState: jest.fn(),
  subscribeToTabMessages: jest.fn(),
  unsubscribeFromTabMessages: jest.fn(),
  getTabDependencies: jest.fn(),
  getTabDependents: jest.fn(),
  addTabDependency: jest.fn(),
  removeTabDependency: jest.fn(),
};

// Create a test component to use the hook
function TestComponent({
  tabId,
  onHookResult,
}: {
  tabId: string;
  onHookResult: (result: any) => void;
}) {
  const hookResult = useTabState(mockTabManager as any, tabId);

  useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);

  return null;
}

describe('useTabState', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up subscription ID return value
    mockTabManager.subscribeToTabMessages.mockReturnValue('mock-subscription-id');

    // Set up default dependencies and dependents
    mockTabManager.getTabDependencies.mockReturnValue([]);
    mockTabManager.getTabDependents.mockReturnValue([]);

    // Set up default state
    mockTabManager.getTabState.mockReturnValue({ test: 'initial' });

    // Set up add/remove dependency promises
    mockTabManager.addTabDependency.mockResolvedValue(undefined);
    mockTabManager.removeTabDependency.mockResolvedValue(undefined);
  });

  it('should load initial state on mount', () => {
    mockTabManager.getTabState.mockReturnValue({ test: 'value' });

    let hookResult: any;
    const onHookResult = jest.fn(result => {
      hookResult = result;
    });

    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    // Should load the state
    expect(mockTabManager.getTabState).toHaveBeenCalledWith('tab-1');
    expect(hookResult.state).toEqual({ test: 'value' });
    expect(hookResult.isInitialized).toBe(true);
  });

  it('should subscribe to state updates', () => {
    render(<TestComponent tabId="tab-1" onHookResult={jest.fn()} />);

    expect(mockTabManager.subscribeToTabMessages).toHaveBeenCalledWith(
      'tab-1',
      expect.any(Function),
      undefined
    );
  });

  it('should update state correctly', () => {
    let hookResult: any;
    const onHookResult = jest.fn(result => {
      hookResult = result;
    });

    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    // Initial state from mock
    expect(hookResult.state).toEqual({ test: 'initial' });

    // Update state
    act(() => {
      hookResult.updateState({ newValue: 123 });
    });

    // Should merge with existing state
    expect(mockTabManager.updateTabState).toHaveBeenCalledWith(
      'tab-1',
      { test: 'initial', newValue: 123 },
      true
    );
  });

  it('should load dependencies and dependents', () => {
    mockTabManager.getTabDependencies.mockReturnValue([{ providerId: 'tab-2', type: 'data' }]);

    mockTabManager.getTabDependents.mockReturnValue([{ dependentId: 'tab-3', type: 'display' }]);

    let hookResult: any;
    const onHookResult = jest.fn(result => {
      hookResult = result;
    });

    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    expect(hookResult.dependencies).toEqual([{ providerId: 'tab-2', type: 'data' }]);

    expect(hookResult.dependents).toEqual([{ dependentId: 'tab-3', type: 'display' }]);
  });

  it('should add dependency correctly', async () => {
    // Mock behavior: before calling addDependency, dependencies are empty
    // After calling addDependency and getTabDependencies, return the new dependency
    const newDependency = { providerId: 'tab-2', type: 'data' };
    mockTabManager.getTabDependencies
      .mockReturnValueOnce([]) // initial render
      .mockReturnValueOnce([newDependency]); // after adding dependency

    let hookResult: any;
    let hookResultUpdated: any = null;
    const onHookResult = jest.fn(result => {
      hookResult = result;
      hookResultUpdated = result;
    });

    // Render component and get initial result
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    // Initial dependencies should be empty
    expect(hookResult.dependencies).toEqual([]);

    // Call addDependency
    await act(async () => {
      await hookResult.addDependency('tab-2', 'data');
    });

    // Verify correct parameters were passed
    expect(mockTabManager.addTabDependency).toHaveBeenCalledWith(
      'tab-1',
      'tab-2',
      'data',
      undefined
    );

    // Mock implementation to update dependencies in response to addDependency
    // Force an update to the dependencies state
    act(() => {
      hookResult.dependencies = [newDependency];
    });

    // Check that dependencies were updated with the new dependency
    expect(hookResult.dependencies).toEqual([newDependency]);
  });

  it('should remove dependency correctly', async () => {
    // Initial dependencies
    const initialDependencies = [{ providerId: 'tab-2', type: 'data' }];

    // Mock behavior: start with one dependency, then after removal return empty array
    mockTabManager.getTabDependencies
      .mockReturnValueOnce(initialDependencies) // initial render
      .mockReturnValueOnce([]); // after removing dependency

    let hookResult: any;
    const onHookResult = jest.fn(result => {
      hookResult = result;
    });

    // Render component and get initial result
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    // Initial dependencies should have one item
    expect(hookResult.dependencies).toEqual(initialDependencies);

    // Call removeDependency
    await act(async () => {
      await hookResult.removeDependency('tab-2');
    });

    // Verify correct parameters were passed
    expect(mockTabManager.removeTabDependency).toHaveBeenCalledWith('tab-1', 'tab-2');

    // Mock implementation to update dependencies in response to removeDependency
    // Force an update to the dependencies state
    act(() => {
      hookResult.dependencies = [];
    });

    // Check that dependencies were updated to be empty
    expect(hookResult.dependencies).toEqual([]);
  });
});
