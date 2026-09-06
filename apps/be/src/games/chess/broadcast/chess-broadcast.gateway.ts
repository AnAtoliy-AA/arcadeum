import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChessBroadcastService } from './chess-broadcast.service';

@WebSocketGateway({ namespace: '/chess-broadcast' })
export class ChessBroadcastGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly broadcastService: ChessBroadcastService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-broadcast')
  handleJoinBroadcast(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { broadcastId: string },
  ): void {
    client.join(`broadcast-${data.broadcastId}`);
    void this.broadcastService.incrementViewerCount(data.broadcastId);
    const broadcast = this.broadcastService.getBroadcast(data.broadcastId);
    this.server.to(`broadcast-${data.broadcastId}`).emit('viewer-count', {
      count: broadcast.viewerCount,
    });
  }

  @SubscribeMessage('leave-broadcast')
  handleLeaveBroadcast(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { broadcastId: string },
  ): void {
    client.leave(`broadcast-${data.broadcastId}`);
    void this.broadcastService.decrementViewerCount(data.broadcastId);
    const broadcast = this.broadcastService.getBroadcast(data.broadcastId);
    this.server.to(`broadcast-${data.broadcastId}`).emit('viewer-count', {
      count: broadcast.viewerCount,
    });
  }

  @SubscribeMessage('add-commentary')
  handleAddCommentary(
    @MessageBody() data: { broadcastId: string; commentary: string },
  ): void {
    const broadcast = this.broadcastService.addCommentary(
      data.broadcastId,
      data.commentary,
    );
    this.server.to(`broadcast-${data.broadcastId}`).emit('commentary', {
      commentary: broadcast.commentary,
    });
  }

  @SubscribeMessage('game-update')
  handleGameUpdate(
    @MessageBody() data: { broadcastId: string; state: unknown },
  ): void {
    this.server
      .to(`broadcast-${data.broadcastId}`)
      .emit('game-state', data.state);
  }

  private readonly logger = {
    log: (msg: string) => console.log(`[BroadcastGateway] ${msg}`),
  };
}
