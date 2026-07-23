import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';
import { extractString } from './games.gateway.utils';
import { handleEmote } from './games.gateway.emote';
import { handleUndoRequest, handleUndoResponse } from './games.gateway.undo';
import {
  handleJoinRoom,
  handleLeaveRoom,
  handleKickPlayer,
  handleWatchRoom,
  handleSetOption,
} from './games.gateway.room';
import {
  maybeEncrypt,
  isSocketEncryptionEnabled,
  getEncryptionKeyHex,
} from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';
@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class GamesGateway {
  private readonly logger = new Logger(GamesGateway.name);
  @WebSocketServer()
  private server: Server;
  constructor(
    private readonly gamesService: GamesService,
    private readonly realtime: GamesRealtimeService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  afterInit(): void {
    this.realtime.registerServer(this.server);

    // Raise per-socket listener cap for the shared games namespace.
    const PER_SOCKET_LISTENER_CAP = 20;
    this.server.use((socket, next) => {
      socket.setMaxListeners(PER_SOCKET_LISTENER_CAP);
      next();
    });

    this.logger.debug('Games gateway initialized.');
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.verbose(`Client connected ${client.id}`);
    // Verify JWT if present (optional — guest mode allowed without token)
    const authUserId = await verifySocketJwt(
      client,
      this.jwt,
      this.config,
      this.logger,
      'GamesGateway',
    );

    if (authUserId) {
      this.logger.debug(
        `Authenticated user ${authUserId} connected to games namespace`,
      );
      this.realtime.trackSocket(authUserId, client.id);
    } else {
      // Store the anonId from handshake to prevent impersonation
      const anonId =
        typeof client.handshake?.query?.anonId === 'string'
          ? client.handshake.query.anonId
          : undefined;
      if (anonId) {
        (client.data as Record<string, unknown>).anonId = anonId;
      }
      this.logger.verbose(
        `Anonymous client connected to games namespace: ${client.id}`,
      );
    }

    // Only send encryption key to clients with a valid identity
    // (JWT-authenticated or anonymous with a proper anon_ ID).
    // Never broadcast the key to completely unauthenticated connections.
    if (isSocketEncryptionEnabled()) {
      const hasIdentity =
        authUserId ||
        (typeof client.handshake?.query?.anonId === 'string' &&
          client.handshake.query.anonId.startsWith('anon_'));

      if (hasIdentity) {
        try {
          const encryptionKey = getEncryptionKeyHex();
          client.emit('socket.encryption_key', { key: encryptionKey });
          this.logger.debug(`Encryption key sent to ${client.id}`);
        } catch (error) {
          this.logger.error(`Failed to send encryption key: ${error}`);
        }
      } else {
        this.logger.warn(
          `Encryption key withheld from unauthenticated client ${client.id}`,
        );
      }
    }

    void client.join(this.realtime.lobbyChannel());
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(`Client disconnected ${client.id}`);

    const userId = (client.data as Record<string, unknown>)?.userId as
      | string
      | undefined;
    if (userId) {
      this.realtime.untrackSocket(userId, client.id);
    }
    if (!userId || !this.server) return;

    for (const room of client.rooms) {
      if (room.startsWith('game-room:')) {
        const data = { userId, idle: true };
        this.server.to(room).emit('games.player.idle_changed', data);
        const roomId = room.replace('game-room:', '');
        const specChannel = this.realtime.spectatorChannel(roomId);
        this.server.to(specChannel).emit('games.player.idle_changed', data);
      }
    }
  }

  /**
   * Prevents users from impersonating others.
   * For authenticated users: ensures payload userId matches JWT.
   * For anonymous users: ensures payload userId matches the anonId from handshake.
   */
  private validateUserId(client: Socket, payloadUserId: string): void {
    const authUserId = (client.data as Record<string, unknown>)?.userId as
      | string
      | undefined;
    const isAuthenticated =
      (client.data as Record<string, unknown>)?.authenticated === true;
    const anonId = (client.data as Record<string, unknown>)?.anonId as
      | string
      | undefined;

    if (isAuthenticated && authUserId && payloadUserId !== authUserId) {
      this.logger.warn(
        `User ${authUserId} attempted to act as ${payloadUserId} — blocking`,
      );
      throw new WsException('Cannot perform actions as another user.');
    }

    if (!isAuthenticated && anonId && payloadUserId !== anonId) {
      this.logger.warn(
        `Anonymous ${anonId} attempted to act as ${payloadUserId} — blocking`,
      );
      throw new WsException('Cannot perform actions as another user.');
    }
  }

  @SubscribeMessage('games.room.join')
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; inviteCode?: string },
  ): Promise<void> {
    await handleJoinRoom(
      this.logger,
      this.server,
      client,
      this.realtime,
      this.gamesService,
      payload,
      (c, u) => this.validateUserId(c, u),
    );
  }

  @SubscribeMessage('games.room.leave')
  async onLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<{ success: boolean }> {
    return handleLeaveRoom(
      this.logger,
      client,
      this.realtime,
      this.gamesService,
      payload,
      (c, u) => this.validateUserId(c, u),
    );
  }

  @SubscribeMessage('games.room.kick')
  async onKickPlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; targetUserId?: string; callerId?: string },
  ): Promise<{ success: boolean }> {
    return handleKickPlayer(
      this.logger,
      this.server,
      client,
      this.realtime,
      this.gamesService,
      payload,
      (c, u) => this.validateUserId(c, u),
    );
  }

  @SubscribeMessage('games.room.watch')
  async onWatchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    await handleWatchRoom(
      this.logger,
      client,
      this.realtime,
      this.gamesService,
      payload,
    );
  }

  @SubscribeMessage('games.session.request')
  async handleSessionRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    const roomId = extractString(payload, 'roomId');
    const channel = this.realtime.roomChannel(roomId);
    if (!client.rooms.has(channel)) {
      throw new WsException('Join the room before requesting the session.');
    }
    const session = await this.gamesService.findSessionByRoom(roomId);
    if (!session) return;
    const userId = (client.data as Record<string, unknown>)?.userId as
      | string
      | undefined;
    let diffSession = session;
    if (userId) {
      try {
        const sanitizedState = await this.gamesService.getSanitizedState(
          session.id,
          userId,
        );
        if (sanitizedState && typeof sanitizedState === 'object') {
          diffSession = {
            ...session,
            state: sanitizedState as Record<string, unknown>,
          };
        }
      } catch (error) {
        this.logger.error(
          `Failed to get sanitized state for user ${userId}: ${error}`,
        );
      }
    }

    this.realtime.emitSessionSnapshotToClient(client, roomId, diffSession);
  }

  @SubscribeMessage('games.player.idle')
  handlePlayerIdle(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): void {
    const roomId = extractString(payload, 'roomId');
    const userId = extractString(payload, 'userId');
    this.validateUserId(client, userId);
    const channel = this.realtime.roomChannel(roomId);
    if (!client.rooms.has(channel)) return;
    const data = { userId, idle: true };
    this.server.to(channel).emit('games.player.idle_changed', data);
    const specChannel = this.realtime.spectatorChannel(roomId);
    this.server.to(specChannel).emit('games.player.idle_changed', data);
  }

  @SubscribeMessage('games.player.active')
  handlePlayerActive(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): void {
    const roomId = extractString(payload, 'roomId');
    const userId = extractString(payload, 'userId');
    this.validateUserId(client, userId);
    const channel = this.realtime.roomChannel(roomId);
    if (!client.rooms.has(channel)) return;
    const data = { userId, idle: false };
    this.server.to(channel).emit('games.player.idle_changed', data);
    const specChannel = this.realtime.spectatorChannel(roomId);
    this.server.to(specChannel).emit('games.player.idle_changed', data);
  }

  @SubscribeMessage('games.room.set_option')
  async onSetOption(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      options?: Record<string, unknown>;
    },
  ): Promise<void> {
    await handleSetOption(
      this.logger,
      this.realtime,
      this.gamesService,
      payload,
      (c, u) => this.validateUserId(c, u),
      client,
    );
  }

  @SubscribeMessage('games.session.history_note')
  async handleHistoryNote(
    @MessageBody()
    payload: {
      roomId: string;
      userId: string;
      message: string;
      scope: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = extractString(payload, 'roomId');
    const userId = extractString(payload, 'userId');
    const message = extractString(payload, 'message');
    const scopeRaw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';
    const scope = ['players', 'private'].includes(scopeRaw) ? scopeRaw : 'all';

    this.validateUserId(client, userId);

    try {
      await this.gamesService.postHistoryNote(
        roomId,
        userId,
        message,
        scope as 'all' | 'players' | 'private',
      );
      client.emit(
        'games.session.history_note.ack',
        maybeEncrypt({ roomId, userId, scope }),
      );
    } catch (error) {
      this.logger.error(
        `handleHistoryNote failed for room ${roomId}: ${error}`,
      );
    }
  }
  @SubscribeMessage('games.session.undo_request')
  onUndoRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): void {
    handleUndoRequest(this.logger, this.server, client, this.realtime, payload);
  }
  @SubscribeMessage('games.session.undo_response')
  async onUndoResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    await handleUndoResponse(
      this.logger,
      this.server,
      client,
      this.realtime,
      payload,
      this.gamesService,
    );
  }
  @SubscribeMessage('games.session.emote')
  handleEmote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: unknown,
  ): void {
    handleEmote(this.logger, this.server, client, this.realtime, payload);
  }
}
