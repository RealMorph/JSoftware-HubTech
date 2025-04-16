import { jest } from '@jest/globals';
import { DefaultStateManager } from '../state-manager';

describe('StateManager', () => {
  let stateManager: DefaultStateManager;

  beforeEach(() => {
    stateManager = new DefaultStateManager();
  });

  it('should initialize with empty state', async () => {
    await stateManager.initialize();
    expect(stateManager.state).toEqual({});
  });

  it('should set and get state values', async () => {
    await stateManager.set('testKey', 'testValue');
    expect(stateManager.get('testKey')).toBe('testValue');
  });

  it('should handle different value types', async () => {
    const testCases = [
      { key: 'string', value: 'test' },
      { key: 'number', value: 42 },
      { key: 'boolean', value: true },
      { key: 'null', value: null },
      { key: 'object', value: { foo: 'bar' } },
      { key: 'array', value: [1, 2, 3] },
    ];

    for (const { key, value } of testCases) {
      await stateManager.set(key, value);
      expect(stateManager.get(key)).toEqual(value);
    }
  });

  it('should remove state values', async () => {
    await stateManager.set('testKey', 'testValue');
    await stateManager.remove('testKey');
    expect(stateManager.get('testKey')).toBeUndefined();
  });

  it('should clear all state values', async () => {
    await stateManager.set('key1', 'value1');
    await stateManager.set('key2', 'value2');
    await stateManager.clear();
    expect(stateManager.state).toEqual({});
  });

  it('should notify subscribers when state changes', async () => {
    const mockCallback = jest.fn();
    stateManager.subscribe(mockCallback);

    await stateManager.set('testKey', 'testValue');
    expect(mockCallback).toHaveBeenCalledWith({ testKey: 'testValue' });

    await stateManager.remove('testKey');
    expect(mockCallback).toHaveBeenCalledWith({});
  });

  it('should handle multiple subscribers', async () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    stateManager.subscribe(mockCallback1);
    stateManager.subscribe(mockCallback2);

    await stateManager.set('testKey', 'testValue');

    expect(mockCallback1).toHaveBeenCalledWith({ testKey: 'testValue' });
    expect(mockCallback2).toHaveBeenCalledWith({ testKey: 'testValue' });
  });

  it('should unsubscribe correctly', async () => {
    const mockCallback = jest.fn();
    const unsubscribe = stateManager.subscribe(mockCallback);

    await stateManager.set('testKey', 'testValue');
    expect(mockCallback).toHaveBeenCalledTimes(1);

    unsubscribe();

    await stateManager.set('testKey', 'newValue');
    expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should handle nested state objects', async () => {
    const nestedState = {
      user: {
        name: 'John',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    };

    await stateManager.set('app', nestedState);
    expect(stateManager.get('app')).toEqual(nestedState);
  });

  it('should handle state arrays', async () => {
    const testArray = [
      { id: 1, value: 'one' },
      { id: 2, value: 'two' },
    ];

    await stateManager.set('items', testArray);
    expect(stateManager.get('items')).toEqual(testArray);
  });
});
