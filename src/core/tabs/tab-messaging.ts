import { generateUUID } from '../utils/uuid';

/**
 * Message types for the tab messaging system
 */
export enum MessageType {
  STATE_UPDATE = 'state_update',
  CUSTOM_EVENT = 'custom_event',
  DEPENDENCY_UPDATE = 'dependency_update',
  REQUEST_STATE = 'request_state',
}

/**
 * Interface for tab messages
 */
export interface TabMessage {
  id: string;
  type: MessageType;
  senderId: string;
  targetId?: string; // If undefined, message is broadcast to all tabs
  timestamp: number;
  payload: any;
}

/**
 * Interface for tab dependencies
 */
export interface TabDependency {
  dependentId: string; // The tab that depends on another
  providerId: string; // The tab that provides a dependency
  type: string; // The type of dependency
  metadata?: any; // Additional metadata about the dependency
}

/**
 * Interface for message subscriptions
 */
export interface MessageSubscription {
  id: string;
  tabId: string;
  messageType?: MessageType; // If undefined, subscribe to all message types
  senderId?: string; // If defined, only messages from this sender
  callback: (message: TabMessage) => void;
}

/**
 * Interface for the tab messaging manager
 */
export interface TabMessagingManager {
  // Messaging
  sendMessage(message: Omit<TabMessage, 'id' | 'timestamp'>): Promise<void>;
  subscribe(subscription: Omit<MessageSubscription, 'id'>): string;
  unsubscribe(subscriptionId: string): void;

  // State sharing
  getTabState(tabId: string): any;
  updateTabState(tabId: string, state: any, broadcast?: boolean): Promise<void>;

  // Dependencies
  addDependency(dependency: TabDependency): Promise<void>;
  removeDependency(dependentId: string, providerId: string): Promise<void>;
  getDependencies(tabId: string): TabDependency[];
  getDependents(tabId: string): TabDependency[];
}

/**
 * Default implementation of the tab messaging manager
 */
export class DefaultTabMessagingManager implements TabMessagingManager {
  private messages: TabMessage[] = [];
  private subscriptions: MessageSubscription[] = [];
  private tabStates: Map<string, any> = new Map();
  private dependencies: TabDependency[] = [];
  private messageHistoryLimit: number = 100;

  constructor(messageHistoryLimit?: number) {
    if (messageHistoryLimit) {
      this.messageHistoryLimit = messageHistoryLimit;
    }
  }

  /**
   * Send a message to tabs
   */
  async sendMessage(message: Omit<TabMessage, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: TabMessage = {
      ...message,
      id: generateUUID(),
      timestamp: Date.now(),
    };

    // Add to message history
    this.messages.push(fullMessage);

    // Trim message history if needed
    if (this.messages.length > this.messageHistoryLimit) {
      this.messages = this.messages.slice(-this.messageHistoryLimit);
    }

    // Notify subscribers
    this.notifySubscribers(fullMessage);
  }

  /**
   * Subscribe to messages
   */
  subscribe(subscription: Omit<MessageSubscription, 'id'>): string {
    const id = generateUUID();
    const fullSubscription: MessageSubscription = {
      ...subscription,
      id,
    };

    this.subscriptions.push(fullSubscription);
    return id;
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== subscriptionId);
  }

  /**
   * Get the state of a tab
   */
  getTabState(tabId: string): any {
    return this.tabStates.get(tabId) || null;
  }

  /**
   * Update the state of a tab
   */
  async updateTabState(tabId: string, state: any, broadcast: boolean = true): Promise<void> {
    this.tabStates.set(tabId, state);

    if (broadcast) {
      await this.sendMessage({
        type: MessageType.STATE_UPDATE,
        senderId: tabId,
        payload: state,
      });
    }

    // Notify dependents of state change
    const dependents = this.getDependents(tabId);
    for (const dependency of dependents) {
      await this.sendMessage({
        type: MessageType.DEPENDENCY_UPDATE,
        senderId: tabId,
        targetId: dependency.dependentId,
        payload: {
          dependencyType: dependency.type,
          state,
        },
      });
    }
  }

  /**
   * Add a dependency between tabs
   */
  async addDependency(dependency: TabDependency): Promise<void> {
    // Check if dependency already exists
    const existingIndex = this.dependencies.findIndex(
      d =>
        d.dependentId === dependency.dependentId &&
        d.providerId === dependency.providerId &&
        d.type === dependency.type
    );

    if (existingIndex !== -1) {
      // Update existing dependency
      this.dependencies[existingIndex] = dependency;
    } else {
      // Add new dependency
      this.dependencies.push(dependency);
    }

    // Send initial state to the dependent
    const providerState = this.getTabState(dependency.providerId);
    if (providerState) {
      await this.sendMessage({
        type: MessageType.DEPENDENCY_UPDATE,
        senderId: dependency.providerId,
        targetId: dependency.dependentId,
        payload: {
          dependencyType: dependency.type,
          state: providerState,
        },
      });
    }
  }

  /**
   * Remove a dependency between tabs
   */
  async removeDependency(dependentId: string, providerId: string): Promise<void> {
    this.dependencies = this.dependencies.filter(
      d => !(d.dependentId === dependentId && d.providerId === providerId)
    );
  }

  /**
   * Get all dependencies for a tab
   */
  getDependencies(tabId: string): TabDependency[] {
    return this.dependencies.filter(d => d.dependentId === tabId);
  }

  /**
   * Get all tabs that depend on a tab
   */
  getDependents(tabId: string): TabDependency[] {
    return this.dependencies.filter(d => d.providerId === tabId);
  }

  /**
   * Notify subscribers of a new message
   */
  private notifySubscribers(message: TabMessage): void {
    for (const subscription of this.subscriptions) {
      // Check if subscription applies to this message
      const isTargetMatch = !message.targetId || message.targetId === subscription.tabId;
      const isTypeMatch = !subscription.messageType || subscription.messageType === message.type;
      const isSenderMatch = !subscription.senderId || subscription.senderId === message.senderId;

      if (isTargetMatch && isTypeMatch && isSenderMatch) {
        try {
          subscription.callback(message);
        } catch (error) {
          console.error('Error in message subscription callback:', error);
        }
      }
    }
  }
}
