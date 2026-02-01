import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';
import { extractString } from './games.gateway.utils';
import {
  maybeEncrypt,
  isSocketEncryptionEnabled,
  getEncryptionKeyHex,
} from '../common/utils/socket-encryption.util';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class GamesGateway {
  private readonly logger = new Logger(GamesGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly gamesService: GamesService,
    private readonly realtime: GamesRealtimeService,
  ) {}

  afterInit(): void {
    this.realtime.registerServer(this.server);
    this.logger.debug('Games gateway initialized.');
  }

  handleConnection(client: Socket): void {
    this.logger.verbose(`Client connected ${client.id}`);

    // Send encryption key to authenticated client if encryption is enabled
    if (isSocketEncryptionEnabled()) {
      try {
        const encryptionKey = getEncryptionKeyHex();
        client.emit('socket.encryption_key', { key: encryptionKey });
        this.logger.debug(`Encryption key sent to ${client.id}`);
      } catch (error) {
        this.logger.error(`Failed to send encryption key: ${error}`);
      }
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('games.room.join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; inviteCode?: string },
  ): Promise<void> {
    const roomId =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const userId =
      typeof payload?.userId === 'string' ? payload.userId.trim() : '';

    if (!roomId) {
      throw new WsException('roomId is required.');
    }
    if (!userId) {
      throw new WsException('userId is required.');
    }

    const inviteCode =
      typeof payload?.inviteCode === 'string'
        ? payload.inviteCode.trim()
        : undefined;

    this.logger.log(`User ${userId} joining room ${roomId}`);

    try {
      const { room, session } = await this.gamesService.joinRoom(
        { roomId, inviteCode },
        userId,
      );

      this.logger.log(
        `Room ${roomId}: status=${room.status}, session=${
          session ? session.id : 'null'
        }`,
      );

      const channel = this.realtime.roomChannel(room.id);
      await client.join(channel);

      // Store userId on socket for per-player log filtering
      if (!client.data) {
        client.data = {};
      }
      (client.data as Record<string, unknown>).userId = userId;

      // Sanitize initial session state for the joining player
      let diffSession = session;
      if (session) {
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

      client.emit(
        'games.room.joined',
        maybeEncrypt({
          room,
          session: diffSession,
        }),
      );

      if (diffSession) {
        this.logger.log(
          `Sending session snapshot to client for session ${diffSession.id}`,
        );
        this.realtime.emitSessionSnapshotToClient(client, room.id, diffSession);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to join room';
      this.logger.error(`Failed to join room ${roomId}: ${message}`);
      throw new WsException(message);
    }
  }

  @SubscribeMessage('games.room.leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<{ success: boolean }> {
    const roomId = extractString(payload, 'roomId');
    const userId = extractString(payload, 'userId');

    if (!roomId) throw new WsException('roomId is required.');
    if (!userId) throw new WsException('userId is required.');

    this.logger.log(`User ${userId} leaving room ${roomId}`);

    try {
      const result = await this.gamesService.leaveRoom({ roomId }, userId);

      const channel = this.realtime.roomChannel(roomId);
      await client.leave(channel);

      // Also leave spec channel if they were there (unlikely but safe)
      const specChannel = this.realtime.spectatorChannel(roomId);
      await client.leave(specChannel);

      if (result.deleted) {
        this.realtime.emitRoomDeleted(roomId);
      } else {
        // Emit player left event (which also triggers global games.room.updated)
        // Pass the updated room summary to ensure clients see new host/participants
        this.realtime.emitPlayerLeft(result.room, userId, false);
      }

      client.emit('games.room.left', { roomId });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to leave room';
      this.logger.error(`Failed to leave room ${roomId}: ${message}`);
      // Return success false so client knows? Or throw?
      // If we throw, the client ack might get an error depending on setup.
      // Safest is to return success: false
      return { success: false };
    }
  }

  @SubscribeMessage('games.room.watch')
  async handleWatchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    const roomId = extractString(payload, 'roomId');

    try {
      const room = await this.gamesService.getRoom(roomId);
      const session = await this.gamesService.findSessionByRoom(room.id);

      // Spectators join the spectator channel (receives filtered data)
      const channel = this.realtime.spectatorChannel(room.id);
      await client.join(channel);

      // Filter session for spectators (removes private logs)
      const filteredSession = session
        ? this.realtime.filterSessionForSpectators(session)
        : null;

      client.emit(
        'games.room.watching',
        maybeEncrypt({
          room,
          session: filteredSession,
        }),
      );

      if (session) {
        this.realtime.emitSessionSnapshotToClient(
          client,
          room.id,
          session,
          true,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error && typeof error.message === 'string'
          ? error.message
          : 'Unable to spectate this room.';
      this.logger.warn(
        `Failed to register spectator for room ${roomId}: ${message}`,
      );
      throw new WsException(message);
    }
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
    if (!session) {
      return;
    }

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
}
