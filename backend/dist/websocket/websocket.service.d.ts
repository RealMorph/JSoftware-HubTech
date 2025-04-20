import { Server } from 'socket.io';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
export interface ActivityLogMessage {
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    userId: string;
    timestamp: Date;
    data: any;
}
export type ActivityMessage = ActivityLogMessage;
export declare class WebsocketService {
    private readonly firebaseAdminService;
    private server;
    private logger;
    private clientToUserMap;
    private userToClientsMap;
    constructor(firebaseAdminService: FirebaseAdminService);
    setServer(server: Server): void;
    getServer(): Server;
    registerClient(clientId: string, userId: string): void;
    unregisterClient(clientId: string): void;
    getEntityRoom(entityType: string, entityId: string): string;
    getUserRoom(userId: string): string;
    sendToEntity(entityType: string, entityId: string, event: string, data: any): void;
    sendToUser(userId: string, event: string, data: any): void;
    broadcastActivityLog(message: ActivityLogMessage): void;
    sendNotification(userIds: string[], notification: any): void;
    getConnectedClientsCount(): number;
    getClientCount(): number;
    getClientsByUserId(userId: string): string[];
    broadcastActivity(message: Omit<ActivityLogMessage, 'id' | 'timestamp'>): ActivityLogMessage;
    sendActivityLog(activity: ActivityLogMessage, rooms?: string[]): void;
    getConnectedUsersCount(): number;
    broadcastToAll(event: string, data: any): void;
    verifyToken(token: string): Promise<string>;
    addToRoom(socketId: string, room: string): void;
    removeFromRoom(socketId: string, room: string): void;
}
