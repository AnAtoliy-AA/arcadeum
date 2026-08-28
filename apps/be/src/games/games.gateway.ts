import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import {
  Injectable,
  Inject,
  Logger,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { LiveStatsService } from './live-stats/live-stats.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameRoomsMatchmakingService } from './rooms/game-rooms.matchmaking.service';
import { extractString } from './games.gateway.utils';
import { handleEmote } from './games.gateway.emote';
import { handleUndoRequest, handleUndoResponse } from './games.gateway.undo';
import { handleRequestHint } from './games.gateway.hint';
import { ChessBotService } from './engines/chess/chess-bot.service';
import {
  handleJoinRoom,
  handleLeaveRoom,
  handleKickPlayer,
  handleWatchRoom,
  handleSetOption,
} from './games.gateway.room';
import { registerChatHandlers } from './games.gateway.chat-handlers';
// prettier-ignore
import { maybeEncrypt, isSocketEncryptionEnabled, getEncryptionKeyHex } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';
import type { GameMessageHandler } from './game-message-handler.interface';
import { GAME_GATEWAYS } from './game-message-handler.interface';

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
    private readonly sessionsService: GameSessionsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly matchmakingService: GameRoomsMatchmakingService,
    @Inject(GAME_GATEWAYS) private readonly gameHandlers: GameMessageHandler[],
    private readonly chessBotService?: ChessBotService,
    @Optional()
    @Inject(forwardRef(() => LiveStatsService))
    private readonly liveStatsService?: LiveStatsService,
  ) {}
  afterInit(): void {
    this.realtime.registerServer(this.server);

    const registry = new Map<string, GameMessageHandler['handlers'][string]>();
    for (const handler of this.gameHandlers) {
      for (const [event, fn] of Object.entries(handler.handlers)) {
        registry.set(event, fn);
      }
    }

    registerChatHandlers(registry, {
      logger: this.logger,
      server: this.server,
      realtime: this.realtime,
      gamesService: this.gamesService,
      sessionsService: this.sessionsService,
      validateUserId: (c, u) => this.validateUserId(c, u),
    });

    this.server.on('connection', (socket: Socket) => {
      socket.onAny((event: string, payload: unknown) => {
        const handler = registry.get(event);
        if (handler) {
          const result = handler(
            socket,
            (payload as Record<string, unknown>) ?? {},
          );
          if (result && typeof result === 'object' && 'catch' in result) {
            result.catch((err: unknown) => {
              this.logger.error(
                `onAny handler failed for ${event}: ${err instanceof Error ? err.message : String(err)}`,
              );
            });
          }
        }
      });
    });

    this.logger.debug(
      `Games gateway initialized with ${registry.size} game event handlers.`,
    );
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.verbose(`Client connected ${client.id}`);
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
      const anonId =
        typeof client.handshake?.query?.anonId === 'string'
          ? client.handshake.query.anonId
          : undefined;
      const guestId = anonId || `guest_${client.id}`;
      (client.data as Record<string, unknown>).anonId = guestId;
      this.realtime.trackSocket(guestId, client.id);
      this.logger.verbose(
        `Client connected to games namespace: ${client.id} (${guestId})`,
      );
    }

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
    if (this.liveStatsService) {
      void this.liveStatsService.getLiveStats().then((stats) => {
        this.liveStatsService?.broadcastLiveStats(stats);
      });
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(`Client disconnected ${client.id}`);

    const userId = (client.data as Record<string, unknown>)?.userId as
      string | undefined;
    const anonId = (client.data as Record<string, unknown>)?.anonId as
      string | undefined;
    const activeUserId = userId || anonId || `guest_${client.id}`;
    if (activeUserId) {
      this.realtime.untrackSocket(activeUserId, client.id);
      this.matchmakingService.leaveQueue(activeUserId);
    }
    if (this.liveStatsService) {
      void this.liveStatsService.getLiveStats().then((stats) => {
        this.liveStatsService?.broadcastLiveStats(stats);
      });
    }
    if (!activeUserId || !this.server) return;

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

  private validateUserId(client: Socket, payloadUserId: string): void {
    const authUserId = (client.data as Record<string, unknown>)?.userId as
      string | undefined;
    const isAuthenticated =
      (client.data as Record<string, unknown>)?.authenticated === true;
    const anonId = (client.data as Record<string, unknown>)?.anonId as
      string | undefined;

    if (isAuthenticated) {
      if (payloadUserId !== authUserId) {
        this.logger.warn(
          `User ${authUserId} attempted to act as ${payloadUserId} — blocking`,
        );
        throw new WsException('Cannot perform actions as another user.');
      }
      return;
    }

    // Fail closed — anonymous sockets must present the same server-tracked
    // anonId from their handshake; identity-less sockets cannot act at all.
    if (!anonId || payloadUserId !== anonId) {
      this.logger.warn(
        `Identity-less socket attempted to act as ${payloadUserId} — blocking`,
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
      string | undefined;
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

  @SubscribeMessage('games.session.hint')
  async onRequestHint(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    await handleRequestHint(
      this.logger,
      this.server,
      client,
      this.realtime,
      payload,
      this.sessionsService,
      this.gamesService,
      this.chessBotService!,
    );
  }

  @SubscribeMessage('games.matchmaking.join')
  handleMatchmakingJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      userId: string;
      gameId: string;
      variant?: string;
      ranked?: boolean;
    },
  ): void {
    const userId = extractString(payload, 'userId');
    const gameId = extractString(payload, 'gameId');
    const variant = payload.variant ? String(payload.variant) : undefined;
    const ranked = payload.ranked === true;

    this.validateUserId(client, userId);

    const ipHeader = client.handshake.headers['x-forwarded-for'];
    const ip =
      typeof ipHeader === 'string'
        ? ipHeader.split(',')[0].trim()
        : client.handshake.address;

    this.matchmakingService.joinQueue(
      userId,
      client.id,
      gameId,
      variant,
      ranked,
      undefined,
      ip,
    );
    client.emit(
      'games.matchmaking.joined',
      maybeEncrypt({ gameId, variant, ranked }),
    );
  }

  @SubscribeMessage('games.matchmaking.leave')
  handleMatchmakingLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      userId: string;
    },
  ): void {
    const userId = extractString(payload, 'userId');
    this.validateUserId(client, userId);
    this.matchmakingService.leaveQueue(userId);
    client.emit('games.matchmaking.left', maybeEncrypt({}));
  }
}
