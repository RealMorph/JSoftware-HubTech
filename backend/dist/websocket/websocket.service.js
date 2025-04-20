"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketService = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_service_1 = require("../firebase-admin/firebase-admin.service");
const uuid_1 = require("uuid");
let WebsocketService = class WebsocketService {
    constructor(firebaseAdminService) {
        this.firebaseAdminService = firebaseAdminService;
        this.logger = new common_1.Logger('WebsocketService');
        this.clientToUserMap = new Map();
        this.userToClientsMap = new Map();
    }
    setServer(server) {
        this.server = server;
    }
    getServer() {
        return this.server;
    }
    registerClient(clientId, userId) {
        this.clientToUserMap.set(clientId, userId);
        if (!this.userToClientsMap.has(userId)) {
            this.userToClientsMap.set(userId, new Set());
        }
        this.userToClientsMap.get(userId).add(clientId);
    }
    unregisterClient(clientId) {
        const userId = this.clientToUserMap.get(clientId);
        this.clientToUserMap.delete(clientId);
        if (userId) {
            const userClients = this.userToClientsMap.get(userId);
            if (userClients) {
                userClients.delete(clientId);
                if (userClients.size === 0) {
                    this.userToClientsMap.delete(userId);
                }
            }
        }
    }
    getEntityRoom(entityType, entityId) {
        return `entity:${entityType}:${entityId}`;
    }
    getUserRoom(userId) {
        return `user:${userId}`;
    }
    sendToEntity(entityType, entityId, event, data) {
        if (!this.server) {
            this.logger.error('WebSocket server not initialized');
            return;
        }
        const room = this.getEntityRoom(entityType, entityId);
        this.server.to(room).emit(event, data);
        this.logger.debug(`Sent ${event} to ${room}: ${JSON.stringify(data)}`);
    }
    sendToUser(userId, event, data) {
        if (!this.server) {
            this.logger.error('WebSocket server not initialized');
            return;
        }
        const room = this.getUserRoom(userId);
        this.server.to(room).emit(event, data);
        this.logger.debug(`Sent ${event} to ${room}: ${JSON.stringify(data)}`);
    }
    broadcastActivityLog(message) {
        this.sendToEntity(message.entityType, message.entityId, 'activity', message);
        this.sendToUser(message.userId, 'activity', message);
    }
    sendNotification(userIds, notification) {
        for (const userId of userIds) {
            this.sendToUser(userId, 'notification', notification);
        }
    }
    getConnectedClientsCount() {
        return this.clientToUserMap.size;
    }
    getClientCount() {
        return this.getConnectedClientsCount();
    }
    getClientsByUserId(userId) {
        const clients = this.userToClientsMap.get(userId);
        return clients ? Array.from(clients) : [];
    }
    broadcastActivity(message) {
        const fullMessage = Object.assign({ id: (0, uuid_1.v4)(), timestamp: new Date() }, message);
        this.broadcastActivityLog(fullMessage);
        return fullMessage;
    }
    sendActivityLog(activity, rooms) {
        if (!this.server) {
            this.logger.error('WebSocket server not initialized');
            return;
        }
        if (rooms && rooms.length > 0) {
            for (const room of rooms) {
                this.server.to(room).emit('activity', activity);
            }
        }
        else {
            this.broadcastActivityLog(activity);
        }
    }
    getConnectedUsersCount() {
        return this.userToClientsMap.size;
    }
    broadcastToAll(event, data) {
        if (!this.server) {
            this.logger.error('WebSocket server not initialized');
            return;
        }
        this.server.emit(event, data);
        this.logger.debug(`Broadcast ${event} to all clients: ${JSON.stringify(data)}`);
    }
    async verifyToken(token) {
        try {
            const decodedToken = await this.firebaseAdminService.verifyIdToken(token);
            return decodedToken.uid;
        }
        catch (error) {
            console.error('Token verification failed:', error);
            throw new Error('Unauthorized');
        }
    }
    addToRoom(socketId, room) {
        if (!this.server) {
            console.error('WebSocket server not initialized');
            return;
        }
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
            socket.join(room);
        }
    }
    removeFromRoom(socketId, room) {
        if (!this.server) {
            console.error('WebSocket server not initialized');
            return;
        }
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
            socket.leave(room);
        }
    }
};
exports.WebsocketService = WebsocketService;
exports.WebsocketService = WebsocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_admin_service_1.FirebaseAdminService])
], WebsocketService);
//# sourceMappingURL=websocket.service.js.map