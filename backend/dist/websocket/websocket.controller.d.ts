import { WebsocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';
export declare class WebsocketController {
    private readonly websocketService;
    private readonly authService;
    constructor(websocketService: WebsocketService, authService: AuthService);
    getStatus(): Promise<{
        status: string;
        connections: number;
        timestamp: number;
    }>;
    broadcastMessage(body: any, req: any): Promise<{
        status: string;
        messageId: string;
        timestamp: Date;
    }>;
    getUserClients(userId: string, req: any): Promise<{
        userId: string;
        connectionCount: number;
        timestamp: number;
    }>;
}
