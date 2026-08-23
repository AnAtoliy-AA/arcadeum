import type { Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import {
  handleRoomChat,
  handleDeleteRoomChat,
} from './games.gateway.room-chat';
import { handleHistoryNote } from './games.gateway.history-note';
import { handleSessionDeleteChat } from './games.gateway.session-delete-chat';

type RegistryHandler = (
  socket: Socket,
  payload: Record<string, unknown>,
) => unknown;

export interface ChatHandlerDeps {
  logger: Logger;
  server: Server;
  realtime: GamesRealtimeService;
  gamesService: GamesService;
  sessionsService: GameSessionsService;
  validateUserId: (client: Socket, payloadUserId: string) => void;
}

/**
 * Room-chat / history-note event handlers shared by GamesGateway.
 * Extracted so the gateway stays under the file-length limit while the
 * central dispatcher keeps growing with each new game.
 */
export function registerChatHandlers(
  registry: Map<string, RegistryHandler>,
  deps: ChatHandlerDeps,
): void {
  const { logger, server, realtime, gamesService, sessionsService } = deps;

  registry.set('games.room.chat', (socket, payload) =>
    handleRoomChat(logger, server, socket, realtime, gamesService, payload),
  );

  registry.set('games.room.delete_chat', (socket, payload) =>
    handleDeleteRoomChat(
      logger,
      server,
      socket,
      realtime,
      gamesService,
      payload,
    ),
  );

  registry.set('games.session.history_note', (socket, payload) =>
    handleHistoryNote(
      logger,
      socket,
      gamesService,
      deps.validateUserId,
      payload,
    ),
  );

  registry.set('games.session.delete_chat', (socket, payload) =>
    handleSessionDeleteChat(
      logger,
      socket,
      sessionsService,
      realtime,
      deps.validateUserId,
      payload,
    ),
  );
}
