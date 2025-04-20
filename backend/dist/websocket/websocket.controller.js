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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketController = void 0;
const common_1 = require("@nestjs/common");
const websocket_service_1 = require("./websocket.service");
const auth_service_1 = require("../auth/auth.service");
let WebsocketController = class WebsocketController {
    constructor(websocketService, authService) {
        this.websocketService = websocketService;
        this.authService = authService;
    }
    async getStatus() {
        const clientCount = this.websocketService.getClientCount();
        return {
            status: 'online',
            connections: clientCount,
            timestamp: Date.now(),
        };
    }
    async broadcastMessage(body, req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Invalid or missing token');
        }
        const token = authHeader.slice(7);
        const user = await this.authService.verifyToken(token);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const message = {
            type: body.type,
            userId: user.uid,
            entityId: body.entityId,
            entityType: body.entityType,
            data: body.data,
        };
        const fullMessage = this.websocketService.broadcastActivity(message);
        return {
            status: 'success',
            messageId: fullMessage.id,
            timestamp: fullMessage.timestamp,
        };
    }
    async getUserClients(userId, req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Invalid or missing token');
        }
        const token = authHeader.slice(7);
        const user = await this.authService.verifyToken(token);
        if (!user || (user.uid !== userId && !user.admin)) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        const clients = this.websocketService.getClientsByUserId(userId);
        return {
            userId,
            connectionCount: clients.length,
            timestamp: Date.now(),
        };
    }
};
exports.WebsocketController = WebsocketController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebsocketController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebsocketController.prototype, "broadcastMessage", null);
__decorate([
    (0, common_1.Get)('clients/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebsocketController.prototype, "getUserClients", null);
exports.WebsocketController = WebsocketController = __decorate([
    (0, common_1.Controller)('websocket'),
    __metadata("design:paramtypes", [websocket_service_1.WebsocketService,
        auth_service_1.AuthService])
], WebsocketController);
//# sourceMappingURL=websocket.controller.js.map