import { 
  WebSocketGateway as NestWebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  jobId: string | number; // Allow both string and number types
  data?: any;
}

@NestWebSocketGateway({ 
  cors: {
    origin: true, // Allow all origins in development
    credentials: true
  } 
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebSocketGateway.name);
  
  @WebSocketServer()
  server: Server;

  private connectedClients: Socket[] = [];

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.push(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients = this.connectedClients.filter(c => c.id !== client.id);
  }

  sendNotification(notification: Notification) {
    this.logger.log(`Sending notification: ${notification.message}`);
    this.server.emit('notification', notification);
    return notification;
  }

  getConnectedClients() {
    return this.connectedClients.length;
  }
}