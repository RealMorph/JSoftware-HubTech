import React, { useEffect } from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { useTabMessaging } from '../useTabMessaging';
import { MessageType } from '../../tab-messaging';

// Mock TabManager
const mockTabManager = {
  sendTabMessage: jest.fn(),
  subscribeToTabMessages: jest.fn(),
  unsubscribeFromTabMessages: jest.fn(),
  getTabState: jest.fn(),
  updateTabState: jest.fn()
};

// Create a test component to use the hook
function TestComponent({ tabId, onHookResult }: { tabId: string, onHookResult: (result: any) => void }) {
  const hookResult = useTabMessaging(mockTabManager as any, tabId);
  
  useEffect(() => {
    onHookResult(hookResult);
  }, [hookResult, onHookResult]);
  
  return null;
}

describe('useTabMessaging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up subscription ID return value
    mockTabManager.subscribeToTabMessages.mockReturnValue('mock-subscription-id');
  });

  it('should subscribe to messages on mount', () => {
    const onHookResult = jest.fn();
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);

    expect(mockTabManager.subscribeToTabMessages).toHaveBeenCalledWith(
      'tab-1',
      expect.any(Function),
      undefined
    );
  });

  it('should send messages correctly', () => {
    let hookResult: any;
    const onHookResult = jest.fn((result) => {
      hookResult = result;
    });
    
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);
    
    expect(onHookResult).toHaveBeenCalled();
    
    act(() => {
      hookResult.sendMessage(
        MessageType.CUSTOM_EVENT,
        { test: 'value' },
        'tab-2'
      );
    });

    expect(mockTabManager.sendTabMessage).toHaveBeenCalledWith(
      'tab-1',
      MessageType.CUSTOM_EVENT,
      { test: 'value' },
      'tab-2'
    );
  });

  it('should send events correctly', () => {
    let hookResult: any;
    const onHookResult = jest.fn((result) => {
      hookResult = result;
    });
    
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);
    
    act(() => {
      hookResult.sendEvent('testEvent', { data: 123 }, 'tab-2');
    });

    expect(mockTabManager.sendTabMessage).toHaveBeenCalledWith(
      'tab-1',
      MessageType.CUSTOM_EVENT,
      { eventName: 'testEvent', data: { data: 123 } },
      'tab-2'
    );
  });

  it('should update state correctly', () => {
    let hookResult: any;
    const onHookResult = jest.fn((result) => {
      hookResult = result;
    });
    
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);
    
    act(() => {
      hookResult.updateState({ test: 'value' }, true);
    });

    expect(mockTabManager.updateTabState).toHaveBeenCalledWith(
      'tab-1',
      { test: 'value' },
      true
    );
  });

  it('should request state correctly', () => {
    let hookResult: any;
    const onHookResult = jest.fn((result) => {
      hookResult = result;
    });
    
    render(<TestComponent tabId="tab-1" onHookResult={onHookResult} />);
    
    act(() => {
      hookResult.requestState('tab-2');
    });

    expect(mockTabManager.sendTabMessage).toHaveBeenCalledWith(
      'tab-1',
      MessageType.REQUEST_STATE,
      { requestingTabId: 'tab-1' },
      'tab-2'
    );
  });

  it('should update messages when receiving a message', () => {
    let messageCallback: (message: any) => void;
    mockTabManager.subscribeToTabMessages.mockImplementation((tabId, callback) => {
      messageCallback = callback;
      return 'mock-subscription-id';
    });

    const { result } = renderHook(() => 
      useTabMessaging(mockTabManager as any, 'tab-1')
    );

    // Initially should have no messages
    expect(result.current.messages).toEqual([]);
    expect(result.current.lastMessage).toBeNull();

    // Simulate receiving a message
    const testMessage = {
      id: 'msg-1',
      type: MessageType.CUSTOM_EVENT,
      senderId: 'tab-2',
      timestamp: Date.now(),
      payload: { test: 'value' }
    };

    act(() => {
      messageCallback(testMessage);
    });

    // Should update messages and lastMessage
    expect(result.current.messages).toEqual([testMessage]);
    expect(result.current.lastMessage).toEqual(testMessage);
  });

  it('should clear messages', () => {
    let messageCallback: (message: any) => void;
    mockTabManager.subscribeToTabMessages.mockImplementation((tabId, callback) => {
      messageCallback = callback;
      return 'mock-subscription-id';
    });

    const { result } = renderHook(() => 
      useTabMessaging(mockTabManager as any, 'tab-1')
    );

    // Simulate receiving a message
    act(() => {
      messageCallback({
        id: 'msg-1',
        type: MessageType.CUSTOM_EVENT,
        senderId: 'tab-2',
        timestamp: Date.now(),
        payload: { test: 'value' }
      });
    });

    // Should have one message
    expect(result.current.messages.length).toBe(1);

    // Clear messages
    act(() => {
      result.current.clearMessages();
    });

    // Should have no messages
    expect(result.current.messages).toEqual([]);
    expect(result.current.lastMessage).toBeNull();
  });
}); 