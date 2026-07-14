---
name: websocket-engineer
description: Implement real-time WebSocket connections with Socket.IO for live updates, chat, and multiplayer features. Use when adding real-time functionality, implementing chat, or building multiplayer game features. Trigger on keywords like WebSocket, Socket.IO, real-time, live, multiplayer, chat, broadcast.
---

# WebSocket Engineer

## When to Use

- Implementing real-time features
- Building chat functionality
- Adding multiplayer game features
- Broadcasting events to clients
- Handling connection management

## Project Conventions

- Use Socket.IO for WebSocket connections
- Use NestJS Gateway pattern
- Use shared socket infrastructure (`@/shared/lib/socket`)
- Never create ad-hoc `socket.io-client` connections

## NestJS Gateway

```typescript
// games.gateway.ts
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
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ namespace: '/games' })
@UseGuards(WsJwtGuard)
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    this.server.to(roomId).emit('userJoined', { userId: client.data.userId });
  }

  @SubscribeMessage('gameMove')
  handleGameMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: GameMove,
  ) {
    // Validate and process move
    this.server.to(move.roomId).emit('moveUpdate', move);
  }

  // Broadcast to all clients in room
  broadcastToRoom(roomId: string, event: string, data: unknown) {
    this.server.to(roomId).emit(event, data);
  }
}
```

## Client-Side Socket

```typescript
// shared/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

```tsx
// React hook for socket
'use client';

import { useEffect, useCallback } from 'react';
import { getSocket } from '@/shared/lib/socket';

export function useGameSocket(roomId: string) {
  const socket = getSocket();

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    return () => {
      socket.emit('leaveRoom', roomId);
    };
  }, [roomId]);

  const onMove = useCallback((handler: (move: GameMove) => void) => {
    socket.on('moveUpdate', handler);
    return () => socket.off('moveUpdate', handler);
  }, []);

  const sendMove = useCallback((move: GameMove) => {
    socket.emit('gameMove', move);
  }, []);

  return { onMove, sendMove };
}
```

## Event Patterns

### Room Management
```typescript
// Join room
socket.emit('joinRoom', roomId);

// Leave room
socket.emit('leaveRoom', roomId);

// Broadcast to room
gateway.broadcastToRoom(roomId, 'gameUpdate', data);
```

### Authentication
```typescript
// Server: validate token on connection
handleConnection(client: Socket) {
  const token = client.handshake.auth.token;
  const user = this.jwtService.verify(token);
  client.data.userId = user.id;
}

// Client: send token
const socket = io(url, { auth: { token } });
```

### Error Handling
```typescript
// Server
@SubscribeMessage('gameMove')
handleMove(@ConnectedSocket() client: Socket, @MessageBody() move: GameMove) {
  try {
    this.gamesService.processMove(move);
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}

// Client
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Performance Tips

### DO
- Use rooms for targeted broadcasts
- Throttle high-frequency events (position updates)
- Use binary protocol for large data
- Implement heartbeat/ping-pong
- Handle reconnection gracefully

### DON'T
- Broadcast to all clients unnecessarily
- Send large payloads
- Use `console.log` in production
- Ignore disconnections
- Create new connections per request

## Common Patterns

### Presence (Online Status)
```typescript
// Track online users
const onlineUsers = new Map<string, Set<string>>();

handleConnection(client: Socket) {
  const roomId = client.handshake.query.roomId as string;
  if (!onlineUsers.has(roomId)) onlineUsers.set(roomId, new Set());
  onlineUsers.get(roomId)!.add(client.data.userId);
  this.broadcastPresence(roomId);
}

handleDisconnect(client: Socket) {
  const roomId = client.handshake.query.roomId as string;
  onlineUsers.get(roomId)?.delete(client.data.userId);
  this.broadcastPresence(roomId);
}
```

### Typing Indicator
```typescript
// Client
socket.emit('typing', { roomId, isTyping: true });

// Server
@SubscribeMessage('typing')
handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; isTyping: boolean }) {
  client.to(data.roomId).emit('userTyping', {
    userId: client.data.userId,
    isTyping: data.isTyping,
  });
}
```

## Constraints

### MUST DO
- Authenticate WebSocket connections
- Use rooms for targeted broadcasts
- Handle disconnections gracefully
- Validate all incoming messages
- Use TypeScript for type safety

### MUST NOT DO
- Broadcast sensitive data to all clients
- Store sensitive data in socket instance
- Skip authentication
- Use `any` type
- Ignore error handling
