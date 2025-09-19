import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private lobbies: Record<string, any> = {};

  handleConnection(socket: Socket) {
    console.log('client connected:', socket.id);
    socket.emit('message', 'Hello from backend!');
  }

  handleDisconnect(socket: Socket) {
    for (const code in this.lobbies) {
      if (this.lobbies[code]) {
        this.lobbies[code].players = this.lobbies[code].players.filter((p: any) => p.id !== socket.id);
        socket.to(code).emit('lobbyUpdate', this.lobbies[code]);
      }
    }
  }

  @SubscribeMessage('createLobby')
  createLobby(
    @MessageBody() data: { name: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const lobbyCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.lobbies[lobbyCode] = { players: [{ id: socket.id, name: data.name, score: 0 }], gameState: 'waiting', sabotageTargets: [] };
    socket.join(lobbyCode);
    socket.emit('lobbyCode', lobbyCode);
    socket.to(lobbyCode).emit('lobbyUpdate', this.lobbies[lobbyCode]);
  }

  @SubscribeMessage('joinLobby')
  joinLobby(
    @MessageBody() data: { lobbyCode: string; name: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const lobby = this.lobbies[data.lobbyCode];
    if (lobby) {
      lobby.players.push({ id: socket.id, name: data.name, score: 0 });
      socket.join(data.lobbyCode);
      socket.emit('joinSuccess', true);
      socket.to(data.lobbyCode).emit('lobbyUpdate', lobby);
    } else {
      socket.emit('joinSuccess', false);
    }
  }

  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() data: { lobbyCode: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const lobby = this.lobbies[data.lobbyCode];
    if (!lobby) return;
    const players = lobby.players;
    const imposterIdx = Math.floor(Math.random() * players.length);
    players.forEach((p: any, i: number) => (p.role = i === imposterIdx ? 'imposter' : 'villager'));
    lobby.gameState = 'roleReveal';
    socket.to(data.lobbyCode).emit('gameUpdate', lobby);
  }
}