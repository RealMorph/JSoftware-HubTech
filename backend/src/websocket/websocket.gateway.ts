import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WebsocketService, ActivityLogMessage } from './websocket.service';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your domain
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private userSocketMap = new Map<string, Set<string>>();

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  /**
   * Called when the gateway is initialized
   * @param server The Socket.io server instance
   */
  afterInit(server: Server): void {
    this.websocketService.setServer(server);
    this.logger.log('WebSocket gateway initialized');
  }

  /**
   * Called when a client connects
   * @param client The Socket.io client
   */
  async handleConnection(client: Socket): Promise<void> {
    const { token } = client.handshake.auth;
    
    // Handle anonymous connections (no token)
    if (!token) {
      this.logger.log(`Anonymous client connected: ${client.id}`);
      return;
    }

    try {
      // Verify token and get user ID
      const decodedToken = await this.firebaseAdminService.verifyIdToken(token);
      const userId = decodedToken.uid;
      
      // Register client
      this.websocketService.registerClient(client.id, userId);
      
      // Add client to user-specific room
      const userRoom = this.websocketService.getUserRoom(userId);
      client.join(userRoom);
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Notify client about successful authentication
      client.emit('authenticated', { userId, status: 'connected' });
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Called when a client disconnects
   * @param client The Socket.io client
   */
  handleDisconnect(client: Socket): void {
    this.websocketService.unregisterClient(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handle subscription requests from clients
   * @param client The Socket.io client
   * @param payload The subscription payload
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { entityType: string; entityId: string }) {
    const { entityType, entityId } = payload;
    const room = this.websocketService.getEntityRoom(entityType, entityId);
    client.join(room);
    
    this.logger.log(`Client ${client.id} subscribed to ${entityType}:${entityId}`);
    client.emit('subscribed', { entityType, entityId });
  }

  /**
   * Handle unsubscription requests from clients
   * @param client The Socket.io client
   * @param payload The unsubscription payload
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { entityType: string; entityId: string }) {
    const { entityType, entityId } = payload;
    const room = this.websocketService.getEntityRoom(entityType, entityId);
    client.leave(room);
    
    this.logger.log(`Client ${client.id} unsubscribed from ${entityType}:${entityId}`);
    client.emit('unsubscribed', { entityType, entityId });
  }

  /**
   * Handle activity messages from clients
   * @param client The Socket.io client
   * @param payload The activity message payload
   */
  @SubscribeMessage('activity')
  handleActivity(client: Socket, payload: Omit<ActivityLogMessage, 'id' | 'userId' | 'timestamp'>): ActivityLogMessage {
    const userId = client.data.userId;
    if (!userId) {
      throw new WsException('Unauthorized');
    }

    // Create the full activity message
    const activity: ActivityLogMessage = {
      id: this.generateId(),
      userId,
      timestamp: Date.now(),
      ...payload,
    };

    // Determine which rooms should receive this activity
    const rooms: string[] = [
      this.websocketService.getUserRoom(userId), // User-specific room
    ];

    // Add entity-specific room if the activity has an entity
    if (activity.entityType && activity.entityId) {
      rooms.push(this.websocketService.getEntityRoom(activity.entityType, activity.entityId));
    }

    // Send the activity to the relevant rooms
    this.websocketService.sendActivityLog(activity, rooms);

    return activity;
  }

  /**
   * Handle ping messages
   * @param client The Socket.io client
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Generate a unique ID for activity messages
   * @returns A unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 