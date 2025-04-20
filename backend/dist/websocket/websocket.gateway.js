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
var WebsocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const websocket_service_1 = require("./websocket.service");
const firebase_admin_service_1 = require("../firebase-admin/firebase-admin.service");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    constructor(websocketService, firebaseAdminService) {
        this.websocketService = websocketService;
        this.firebaseAdminService = firebaseAdminService;
        this.logger = new common_1.Logger(WebsocketGateway_1.name);
        this.userSocketMap = new Map();
    }
    afterInit(server) {
        this.websocketService.setServer(server);
        this.logger.log('WebSocket gateway initialized');
    }
    async handleConnection(client) {
        const { token } = client.handshake.auth;
        if (!token) {
            this.logger.log(`Anonymous client connected: ${client.id}`);
            return;
        }
        try {
            const decodedToken = await this.firebaseAdminService.verifyIdToken(token);
            const userId = decodedToken.uid;
            this.websocketService.registerClient(client.id, userId);
            const userRoom = this.websocketService.getUserRoom(userId);
            client.join(userRoom);
            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
            client.emit('authenticated', { userId, status: 'connected' });
        }
        catch (error) {
            this.logger.error(`Authentication error: ${error.message}`);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.websocketService.unregisterClient(client.id);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleSubscribe(client, payload) {
        const { entityType, entityId } = payload;
        const room = this.websocketService.getEntityRoom(entityType, entityId);
        client.join(room);
        this.logger.log(`Client ${client.id} subscribed to ${entityType}:${entityId}`);
        client.emit('subscribed', { entityType, entityId });
    }
    handleUnsubscribe(client, payload) {
        const { entityType, entityId } = payload;
        const room = this.websocketService.getEntityRoom(entityType, entityId);
        client.leave(room);
        this.logger.log(`Client ${client.id} unsubscribed from ${entityType}:${entityId}`);
        client.emit('unsubscribed', { entityType, entityId });
    }
    handleActivity(client, payload) {
        const userId = client.data.userId;
        if (!userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const activity = Object.assign({ id: this.generateId(), userId, timestamp: new Date() }, payload);
        const rooms = [
            this.websocketService.getUserRoom(userId),
        ];
        if (activity.entityType && activity.entityId) {
            rooms.push(this.websocketService.getEntityRoom(activity.entityType, activity.entityId));
        }
        this.websocketService.sendActivityLog(activity, rooms);
        return activity;
    }
    handlePing(client) {
        client.emit('pong', { timestamp: Date.now() });
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('activity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], WebsocketGateway.prototype, "handleActivity", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handlePing", null);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [websocket_service_1.WebsocketService,
        firebase_admin_service_1.FirebaseAdminService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map