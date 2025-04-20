import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService, ActivityLogMessage } from './websocket.service';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
export declare class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly websocketService;
    private readonly firebaseAdminService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    constructor(websocketService: WebsocketService, firebaseAdminService: FirebaseAdminService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, payload: {
        entityType: string;
        entityId: string;
    }): void;
    handleUnsubscribe(client: Socket, payload: {
        entityType: string;
        entityId: string;
    }): void;
    handleActivity(client: Socket, payload: Omit<ActivityLogMessage, 'id' | 'userId' | 'timestamp'>): ActivityLogMessage;
    handlePing(client: Socket): void;
    private generateId;
}
