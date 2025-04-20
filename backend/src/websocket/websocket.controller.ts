import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Query,
  Param,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';
import { ActivityMessage } from './websocket.service';

@Controller('websocket')
export class WebsocketController {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly authService: AuthService,
  ) {}

  @Get('status')
  async getStatus() {
    const clientCount = this.websocketService.getClientCount();
    return {
      status: 'online',
      connections: clientCount,
      timestamp: Date.now(),
    };
  }

  @Post('broadcast')
  async broadcastMessage(
    @Body() body: any,
    @Request() req,
  ) {
    // Validate the authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    
    const token = authHeader.slice(7);
    const user = await this.authService.verifyToken(token);
    
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Create and broadcast the message
    const message: Omit<ActivityMessage, 'id' | 'timestamp'> = {
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

  @Get('clients/:userId')
  async getUserClients(@Param('userId') userId: string, @Request() req) {
    // Validate the authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    
    const token = authHeader.slice(7);
    const user = await this.authService.verifyToken(token);
    
    if (!user || (user.uid !== userId && !user.admin)) {
      throw new UnauthorizedException('Unauthorized');
    }

    const clients = this.websocketService.getClientsByUserId(userId);
    
    return {
      userId,
      connectionCount: clients.length,
      timestamp: Date.now(),
    };
  }
} 