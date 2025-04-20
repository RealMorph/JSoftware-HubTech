import { FirebaseAuthService } from './firebase-auth-service';

// Activity types for websocket messages
export type ActivityType = 
  'contact_created' | 
  'contact_updated' | 
  'contact_deleted' | 
  'deal_created' | 
  'deal_updated' | 
  'deal_deleted' | 
  'task_created' | 
  'task_completed' |
  'payment_received' |
  'user_login' |
  'subscription_updated';

// Structure of activity log message
export interface ActivityLogMessage {
  id: string;
  type: ActivityType;
  userId: string;
  timestamp: number;
  entityId?: string;
  entityType?: 'contact' | 'deal' | 'task' | 'payment' | 'user' | 'subscription';
  data?: Record<string, any>;
}

// Interface for subscriptions
export interface ActivitySubscription {
  id: string;
  callback: (message: ActivityLogMessage) => void;
  filter?: {
    types?: ActivityType[];
    entityId?: string;
    entityType?: string;
  };
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000; // Start with 2 seconds delay
  private activitySubscriptions: Map<string, ActivitySubscription> = new Map();
  private messageQueue: ActivityLogMessage[] = [];
  private authService: FirebaseAuthService;
  
  private constructor() {
    this.authService = FirebaseAuthService.getInstance();
  }
  
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.connected || this.connecting) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be authenticated to connect to WebSocket');
    }
    
    this.connecting = true;
    
    try {
      // Get an authentication token
      const token = await currentUser.getIdToken();
      
      // Connect to websocket with auth token
      const wsUrl = `${process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001/websocket'}?token=${token}`;
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000;
        
        // Send any queued messages
        this.processQueue();
        
        console.log('Connected to WebSocket server');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ActivityLogMessage;
          this.broadcastToSubscribers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        this.connected = false;
        this.connecting = false;
        
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        
        if (!event.wasClean) {
          this.attemptReconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
        this.connecting = false;
        this.socket?.close();
        
        this.attemptReconnect();
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.connecting = false;
      this.attemptReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
      this.reconnectAttempts = 0;
    }
  }
  
  /**
   * Publish an activity message
   */
  public publishActivity(message: Omit<ActivityLogMessage, 'id' | 'userId' | 'timestamp'>): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User must be authenticated to publish activities');
      return;
    }
    
    const activityMessage: ActivityLogMessage = {
      id: this.generateId(),
      userId: currentUser.uid,
      timestamp: Date.now(),
      ...message
    };
    
    if (this.connected && this.socket) {
      this.socket.send(JSON.stringify(activityMessage));
    } else {
      // Queue message to send when connected
      this.messageQueue.push(activityMessage);
      
      // Try to connect if not already connecting
      if (!this.connecting) {
        this.connect();
      }
    }
    
    // Also broadcast locally for immediate feedback
    this.broadcastToSubscribers(activityMessage);
  }
  
  /**
   * Subscribe to activity messages
   */
  public subscribe(
    callback: (message: ActivityLogMessage) => void,
    filter?: ActivitySubscription['filter']
  ): string {
    const id = this.generateId();
    
    this.activitySubscriptions.set(id, {
      id,
      callback,
      filter
    });
    
    return id;
  }
  
  /**
   * Unsubscribe from activity messages
   */
  public unsubscribe(subscriptionId: string): void {
    this.activitySubscriptions.delete(subscriptionId);
  }
  
  /**
   * Process the message queue
   */
  private processQueue(): void {
    if (!this.connected || !this.socket) return;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }
  
  /**
   * Broadcast message to all relevant subscribers
   */
  private broadcastToSubscribers(message: ActivityLogMessage): void {
    this.activitySubscriptions.forEach(subscription => {
      // Check if the message matches the subscription filter
      if (this.matchesFilter(message, subscription.filter)) {
        subscription.callback(message);
      }
    });
  }
  
  /**
   * Check if a message matches a subscription filter
   */
  private matchesFilter(
    message: ActivityLogMessage, 
    filter?: ActivitySubscription['filter']
  ): boolean {
    if (!filter) return true;
    
    // Check activity type
    if (filter.types && !filter.types.includes(message.type)) {
      return false;
    }
    
    // Check entity ID
    if (filter.entityId && filter.entityId !== message.entityId) {
      return false;
    }
    
    // Check entity type
    if (filter.entityType && filter.entityType !== message.entityType) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum WebSocket reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Generate a random ID for messages and subscriptions
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 