/**
 * DataSync
 * 
 * Provides real-time data synchronization capabilities using WebSockets.
 * This module integrates with the ETL system to enable bidirectional 
 * data flow for up-to-date information across clients.
 */

import { TransformerFunction } from './types';
import { DataProcessor } from './DataProcessor';
import { DataTransformer } from './DataTransformer';

/**
 * WebSocket connection status
 */
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
  ERROR = 'error'
}

/**
 * WebSocket connection options
 */
export interface WebSocketOptions {
  /** URL of the WebSocket server */
  url: string;
  
  /** Protocol(s) to use, if any */
  protocols?: string | string[];
  
  /** Whether to automatically reconnect on connection close/error */
  autoReconnect?: boolean;
  
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  
  /** Base delay between reconnection attempts (ms) */
  reconnectDelay?: number;
  
  /** Whether to use exponential backoff for reconnection */
  useExponentialBackoff?: boolean;
  
  /** Whether to automatically connect when creating the instance */
  autoConnect?: boolean;
  
  /** Custom headers for the initial WebSocket connection */
  headers?: Record<string, string>;
  
  /** Authentication token, if required */
  authToken?: string;
}

/**
 * Subscription configuration
 */
export interface SubscriptionConfig<T> {
  /** Topic or channel to subscribe to */
  topic: string;
  
  /** Any parameters or filters for this subscription */
  params?: Record<string, any>;
  
  /** Handler function to process incoming messages */
  onMessage: (data: T) => void;
  
  /** Handler for subscription errors */
  onError?: (error: Error) => void;
  
  /** Preprocessing pipeline for incoming data */
  transformers?: Array<TransformerFunction<any, any>>;
  
  /** Whether to process messages in batches */
  batchProcess?: boolean;
  
  /** Batch size if batch processing is enabled */
  batchSize?: number;
  
  /** ID of this subscription */
  id?: string;
}

/**
 * Message to send to the WebSocket server
 */
export interface WebSocketMessage<T> {
  /** Type or action of the message */
  type: string;
  
  /** Topic or channel this message relates to */
  topic?: string;
  
  /** The payload data */
  data?: T;
  
  /** Unique ID for this message, useful for tracking responses */
  id?: string;
  
  /** Any additional metadata */
  meta?: Record<string, any>;
}

/**
 * Event types emitted by the DataSync
 */
export type DataSyncEventType = 
  | 'open' 
  | 'close' 
  | 'error' 
  | 'message' 
  | 'reconnect' 
  | 'subscription_success' 
  | 'subscription_error';

/**
 * Event handler for DataSync events
 */
export type DataSyncEventHandler = (event: any) => void;

/**
 * Main DataSync class for WebSocket-based real-time data synchronization
 */
export class DataSync {
  private ws: WebSocket | null = null;
  private options: WebSocketOptions;
  private status: WebSocketStatus = WebSocketStatus.CLOSED;
  private reconnectAttempts: number = 0;
  private reconnectTimer: any = null;
  private subscriptions: Map<string, SubscriptionConfig<any>> = new Map();
  private eventHandlers: Map<DataSyncEventType, Set<DataSyncEventHandler>> = new Map();
  private messageQueue: WebSocketMessage<any>[] = [];
  private isConnecting: boolean = false;
  
  /**
   * Create a new DataSync instance
   */
  constructor(options: WebSocketOptions) {
    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectDelay: 1000,
      useExponentialBackoff: true,
      autoConnect: true,
      ...options
    };
    
    if (this.options.autoConnect) {
      this.connect();
    }
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket connection already open or connecting');
      return true;
    }
    
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return false;
    }
    
    this.isConnecting = true;
    this.status = WebSocketStatus.CONNECTING;
    
    try {
      this.ws = new WebSocket(this.options.url, this.options.protocols);
      
      return await new Promise<boolean>((resolve) => {
        if (!this.ws) {
          this.isConnecting = false;
          this.status = WebSocketStatus.ERROR;
          this.emit('error', new Error('Failed to create WebSocket instance'));
          resolve(false);
          return;
        }
        
        this.ws.onopen = (event) => {
          this.status = WebSocketStatus.OPEN;
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.emit('open', event);
          
          // Resubscribe to existing subscriptions
          this.resubscribeAll();
          
          // Send any queued messages
          this.flushMessageQueue();
          
          resolve(true);
        };
        
        this.ws.onclose = (event) => {
          this.status = WebSocketStatus.CLOSED;
          this.isConnecting = false;
          this.emit('close', event);
          
          if (this.options.autoReconnect && !event.wasClean) {
            this.scheduleReconnect();
          }
          
          resolve(false);
        };
        
        this.ws.onerror = (event) => {
          this.status = WebSocketStatus.ERROR;
          this.isConnecting = false;
          this.emit('error', event);
          // Don't resolve here, let onclose handle it
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      });
    } catch (error) {
      this.status = WebSocketStatus.ERROR;
      this.isConnecting = false;
      this.emit('error', error);
      
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
      
      return false;
    }
  }
  
  /**
   * Handle messages from the WebSocket server
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.emit('message', message);
      
      // Check if this is a message for a specific subscription
      if (message.topic && this.subscriptions.has(message.topic)) {
        const subscription = this.subscriptions.get(message.topic);
        
        if (subscription) {
          let data = message.data;
          
          // Apply transformers if configured
          if (subscription.transformers && subscription.transformers.length > 0) {
            data = DataTransformer.transform(data, ...subscription.transformers);
          }
          
          // Handle the message
          subscription.onMessage(data);
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    const { maxReconnectAttempts, reconnectDelay, useExponentialBackoff } = this.options;
    
    if (maxReconnectAttempts !== undefined && this.reconnectAttempts >= maxReconnectAttempts) {
      console.log(`Maximum reconnect attempts (${maxReconnectAttempts}) reached`);
      return;
    }
    
    let delay = reconnectDelay || 1000;
    
    if (useExponentialBackoff) {
      // Exponential backoff with jitter
      delay = delay * Math.pow(2, this.reconnectAttempts) + Math.random() * 100;
    }
    
    console.log(`Scheduling reconnect attempt in ${Math.round(delay)}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnect', { attempt: this.reconnectAttempts });
      this.connect();
    }, delay);
  }
  
  /**
   * Close the WebSocket connection
   */
  disconnect(code?: number, reason?: string): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.status = WebSocketStatus.CLOSING;
      this.ws.close(code, reason);
    }
  }
  
  /**
   * Subscribe to a topic or channel
   */
  subscribe<T>(config: SubscriptionConfig<T>): string {
    const id = config.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const subscriptionConfig = { ...config, id };
    
    this.subscriptions.set(config.topic, subscriptionConfig);
    
    // If we're connected, send the subscription request
    if (this.isConnected()) {
      this.sendSubscriptionRequest(subscriptionConfig);
    }
    
    return id;
  }
  
  /**
   * Unsubscribe from a topic or channel
   */
  unsubscribe(topicOrId: string): boolean {
    // Check if this is a topic
    if (this.subscriptions.has(topicOrId)) {
      const subscription = this.subscriptions.get(topicOrId);
      this.subscriptions.delete(topicOrId);
      
      if (this.isConnected() && subscription) {
        this.send({
          type: 'unsubscribe',
          topic: topicOrId
        });
      }
      
      return true;
    }
    
    // Check if this is a subscription ID
    for (const [topic, sub] of this.subscriptions.entries()) {
      if (sub.id === topicOrId) {
        this.subscriptions.delete(topic);
        
        if (this.isConnected()) {
          this.send({
            type: 'unsubscribe',
            topic
          });
        }
        
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Send a subscription request to the server
   */
  private sendSubscriptionRequest(subscription: SubscriptionConfig<any>): void {
    this.send({
      type: 'subscribe',
      topic: subscription.topic,
      data: subscription.params || {}
    });
  }
  
  /**
   * Resubscribe to all existing subscriptions
   */
  private resubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      this.sendSubscriptionRequest(subscription);
    }
  }
  
  /**
   * Send a message to the WebSocket server
   */
  send<T>(message: WebSocketMessage<T>): boolean {
    if (!this.isConnected()) {
      // Queue the message to send when connected
      this.messageQueue.push(message);
      
      // If not connecting or reconnecting, try to connect
      if (this.status !== WebSocketStatus.CONNECTING && !this.reconnectTimer) {
        this.connect();
      }
      
      return false;
    }
    
    try {
      this.ws?.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.emit('error', error);
      return false;
    }
  }
  
  /**
   * Flush the message queue
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0 || !this.isConnected()) {
      return;
    }
    
    console.log(`Flushing ${this.messageQueue.length} queued messages`);
    
    for (const message of this.messageQueue) {
      this.send(message);
    }
    
    this.messageQueue = [];
  }
  
  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get the current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }
  
  /**
   * Register an event handler
   */
  on(event: DataSyncEventType, handler: DataSyncEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(handler);
  }
  
  /**
   * Remove an event handler
   */
  off(event: DataSyncEventType, handler: DataSyncEventHandler): boolean {
    const handlers = this.eventHandlers.get(event);
    
    if (handlers && handlers.has(handler)) {
      handlers.delete(handler);
      return true;
    }
    
    return false;
  }
  
  /**
   * Emit an event to all registered handlers
   */
  private emit(event: DataSyncEventType, data: any): void {
    const handlers = this.eventHandlers.get(event);
    
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      }
    }
  }
}

/**
 * Factory for creating DataSync instances
 */
export const DataSyncFactory = {
  /**
   * Create a new DataSync instance
   */
  create(options: WebSocketOptions): DataSync {
    return new DataSync(options);
  },
  
  /**
   * Create a DataProcessor that synchronizes with a WebSocket
   */
  createSyncProcessor<TInput, TOutput>(
    dataSyncOptions: WebSocketOptions,
    processorConfig: {
      topic: string;
      transformers: Array<TransformerFunction<any, any>>;
      processorName?: string;
      onSuccess?: (result: TOutput) => void;
      onFailure?: (error: Error, input: TInput) => void;
    }
  ): {
    dataSync: DataSync;
    processor: DataProcessor<TInput, TOutput>;
  } {
    const dataSync = new DataSync(dataSyncOptions);
    
    const processor = new DataProcessor<TInput, TOutput>({
      id: `sync-processor-${Date.now()}`,
      name: processorConfig.processorName || 'WebSocket Sync Processor',
      transformers: processorConfig.transformers,
      onSuccess: processorConfig.onSuccess,
      onFailure: processorConfig.onFailure
    });
    
    // Return both so the caller can manage them
    return {
      dataSync,
      processor
    };
  }
}; 