import { useEffect, useState, useCallback, useRef } from 'react';
import { TabManager } from '../tab-manager';
import { TabMessage, MessageType } from '../tab-messaging';

/**
 * Hook for managing tab messaging
 *
 * @param tabManager The tab manager instance
 * @param tabId The ID of the current tab
 * @param messageType Optional filter for message types
 * @param senderId Optional filter for sender IDs
 * @returns An object with messaging utilities
 */
export function useTabMessaging(
  tabManager: TabManager,
  tabId: string,
  messageType?: MessageType,
  senderId?: string
) {
  const [messages, setMessages] = useState<TabMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<TabMessage | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);

  // Function to send a message
  const sendMessage = useCallback(
    (type: MessageType, payload: any, targetId?: string) => {
      return tabManager.sendTabMessage(tabId, type, payload, targetId);
    },
    [tabManager, tabId]
  );

  // Function to send a custom event
  const sendEvent = useCallback(
    (eventName: string, data: any, targetId?: string) => {
      return sendMessage(MessageType.CUSTOM_EVENT, { eventName, data }, targetId);
    },
    [sendMessage]
  );

  // Function to update tab state
  const updateState = useCallback(
    (state: any, broadcast = true) => {
      return tabManager.updateTabState(tabId, state, broadcast);
    },
    [tabManager, tabId]
  );

  // Function to request state from another tab
  const requestState = useCallback(
    (fromTabId: string) => {
      return sendMessage(MessageType.REQUEST_STATE, { requestingTabId: tabId }, fromTabId);
    },
    [sendMessage, tabId]
  );

  // Subscribe to messages
  useEffect(() => {
    const handleMessage = (message: TabMessage) => {
      setMessages(prevMessages => [...prevMessages, message]);
      setLastMessage(message);
    };

    subscriptionIdRef.current = tabManager.subscribeToTabMessages(
      tabId,
      handleMessage,
      messageType
    );

    return () => {
      if (subscriptionIdRef.current) {
        tabManager.unsubscribeFromTabMessages(subscriptionIdRef.current);
      }
    };
  }, [tabManager, tabId, messageType, senderId]);

  // Helper function to clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  return {
    messages,
    lastMessage,
    sendMessage,
    sendEvent,
    updateState,
    requestState,
    clearMessages,
  };
}
