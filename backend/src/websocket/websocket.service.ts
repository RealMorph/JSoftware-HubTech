import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Type definition for real-time activity log messages
 */
export interface ActivityLogMessage {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

// Re-export ActivityLogMessage as ActivityMessage for backward compatibility
export type ActivityMessage = ActivityLogMessage;

@Injectable()
export class WebsocketService {
  private server: Server;
  private logger = new Logger('WebsocketService');
  
  // Map of client IDs to user IDs
  private clientToUserMap = new Map<string, string>();
  
  // Map of user IDs to set of client IDs
  private userToClientsMap = new Map<string, Set<string>>();

  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  /**
   * Set the Socket.io server instance
   * @param server The Socket.io server instance
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Get the Socket.io server instance
   * @returns The Socket.io server instance
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Register a client connection with a user ID
   * @param clientId The Socket.io client ID
   * @param userId The user ID
   */
  registerClient(clientId: string, userId: string): void {
    // Store client-to-user mapping
    this.clientToUserMap.set(clientId, userId);
    
    // Store user-to-clients mapping
    if (!this.userToClientsMap.has(userId)) {
      this.userToClientsMap.set(userId, new Set());
    }
    this.userToClientsMap.get(userId).add(clientId);
  }

  /**
   * Unregister a client connection
   * @param clientId The Socket.io client ID
   */
  unregisterClient(clientId: string): void {
    const userId = this.clientToUserMap.get(clientId);
    
    // Remove client-to-user mapping
    this.clientToUserMap.delete(clientId);
    
    if (userId) {
      // Remove client from user-to-clients mapping
      const userClients = this.userToClientsMap.get(userId);
      if (userClients) {
        userClients.delete(clientId);
        
        // Remove user mapping if no clients left
        if (userClients.size === 0) {
          this.userToClientsMap.delete(userId);
        }
      }
    }
  }

  /**
   * Get the room name for a specific entity
   * @param entityType The entity type (e.g., 'project', 'task')
   * @param entityId The entity ID
   * @returns The room name for the entity
   */
  getEntityRoom(entityType: string, entityId: string): string {
    return `entity:${entityType}:${entityId}`;
  }

  /**
   * Get the room name for a specific user
   * @param userId The user ID
   * @returns The room name for the user
   */
  getUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Send a message to all clients in a specific entity room
   * @param entityType The entity type
   * @param entityId The entity ID
   * @param event The event name
   * @param data The event data
   */
  sendToEntity(entityType: string, entityId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }
    
    const room = this.getEntityRoom(entityType, entityId);
    this.server.to(room).emit(event, data);
    
    this.logger.debug(`Sent ${event} to ${room}: ${JSON.stringify(data)}`);
  }

  /**
   * Send a message to all clients of a specific user
   * @param userId The user ID
   * @param event The event name
   * @param data The event data
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }
    
    const room = this.getUserRoom(userId);
    this.server.to(room).emit(event, data);
    
    this.logger.debug(`Sent ${event} to ${room}: ${JSON.stringify(data)}`);
  }

  /**
   * Send an activity log message to relevant subscribers
   * @param message The activity log message
   */
  broadcastActivityLog(message: ActivityLogMessage): void {
    // Send to entity subscribers
    this.sendToEntity(
      message.entityType,
      message.entityId,
      'activity',
      message
    );
    
    // Send to the user who performed the action
    this.sendToUser(message.userId, 'activity', message);
  }

  /**
   * Send a notification to specific users
   * @param userIds Array of user IDs to notify
   * @param notification The notification data
   */
  sendNotification(userIds: string[], notification: any): void {
    for (const userId of userIds) {
      this.sendToUser(userId, 'notification', notification);
    }
  }

  /**
   * Get the number of connected clients
   * @returns The total number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.clientToUserMap.size;
  }

  /**
   * Get the number of connected users
   * @returns The number of unique connected users
   */
  getConnectedUsersCount(): number {
    return this.userToClientsMap.size;
  }

  /**
   * Broadcast a message to all connected clients
   * @param event The event name
   * @param data The event data
   */
  broadcastToAll(event: string, data: any): void {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }
    
    this.server.emit(event, data);
    this.logger.debug(`Broadcast ${event} to all clients: ${JSON.stringify(data)}`);
  }

  /**
   * Verify a token and extract the user ID
   * @param token The Firebase ID token
   * @returns The user ID
   */
  async verifyToken(token: string): Promise<string> {
    try {
      const decodedToken = await this.firebaseAdminService.verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Unauthorized');
    }
  }

  /**
   * Add a client to a room
   * @param socketId The Socket.io client ID
   * @param room The room name
   */
  addToRoom(socketId: string, room: string): void {
    if (!this.server) {
      console.error('WebSocket server not initialized');
      return;
    }
    
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
    }
  }

  /**
   * Remove a client from a room
   * @param socketId The Socket.io client ID
   * @param room The room name
   */
  removeFromRoom(socketId: string, room: string): void {
    if (!this.server) {
      console.error('WebSocket server not initialized');
      return;
    }
    
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(room);
    }
  }
} 