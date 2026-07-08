import type { Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { GameSessionSummary } from './games.types';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

type Sanitizer = (
  session: GameSessionSummary,
  userId: string,
) => GameSessionSummary | Promise<GameSessionSummary>;

export function filterSessionForSpectators(
  session: GameSessionSummary,
): GameSessionSummary {
  if (!session.state || typeof session.state !== 'object') {
    return session;
  }

  const state = session.state;
  if (!Array.isArray(state.logs)) {
    return session;
  }

  const filteredLogs = state.logs.filter((log: Record<string, unknown>) => {
    return log.scope === 'all' || log.scope === undefined;
  });

  return {
    ...session,
    state: {
      ...state,
      logs: filteredLogs,
    },
  };
}

export async function emitSessionSnapshot(
  logger: Logger,
  server: Server,
  roomId: string,
  session: GameSessionSummary,
  roomChannel: (id: string) => string,
  spectatorChannel: (id: string) => string,
  sanitizer?: Sanitizer,
): Promise<void> {
  if (!server) return;

  const roomSockets = await server.in(roomChannel(roomId)).fetchSockets();

  const sanitizedByUser = new Map<string, GameSessionSummary>();

  await Promise.all(
    roomSockets.map(async (socket) => {
      const socketData = socket.data as Record<string, unknown> | undefined;
      const userId = socketData?.userId as string | undefined;

      if (userId && sanitizer) {
        if (!sanitizedByUser.has(userId)) {
          try {
            sanitizedByUser.set(userId, await sanitizer(session, userId));
          } catch (err) {
            logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            sanitizedByUser.set(userId, filterSessionForSpectators(session));
          }
        }
        socket.emit(
          'games.session.snapshot',
          maybeEncrypt({
            roomId,
            session: sanitizedByUser.get(userId),
          }),
        );
      } else if (sanitizer) {
        socket.emit(
          'games.session.snapshot',
          maybeEncrypt({
            roomId,
            session: filterSessionForSpectators(session),
          }),
        );
      } else {
        socket.emit(
          'games.session.snapshot',
          maybeEncrypt({
            roomId,
            session,
          }),
        );
      }
    }),
  );

  const filteredSession = filterSessionForSpectators(session);
  server.to(spectatorChannel(roomId)).emit(
    'games.session.snapshot',
    maybeEncrypt({
      roomId,
      session: filteredSession,
    }),
  );
}

export function emitSessionSnapshotToClient(
  client: Socket,
  roomId: string,
  session: GameSessionSummary,
  isSpectator = false,
): void {
  const sessionToSend = isSpectator
    ? filterSessionForSpectators(session)
    : session;

  client.emit(
    'games.session.snapshot',
    maybeEncrypt({
      roomId,
      session: sessionToSend,
    }),
  );
}

export async function emitGameStarted(
  logger: Logger,
  server: Server,
  room: { id: string },
  session: GameSessionSummary,
  roomChannel: (id: string) => string,
  spectatorChannel: (id: string) => string,
  sanitizer?: Sanitizer,
): Promise<void> {
  if (!server) return;

  logger.log(
    `Emitting game started events for room ${room.id}, session ${session.id}`,
  );

  const roomSockets = await server.in(roomChannel(room.id)).fetchSockets();

  const sanitizedByUser = new Map<string, GameSessionSummary>();

  await Promise.all(
    roomSockets.map(async (socket) => {
      const socketData = socket.data as Record<string, unknown> | undefined;
      const userId = socketData?.userId as string | undefined;

      if (userId && sanitizer) {
        if (!sanitizedByUser.has(userId)) {
          try {
            sanitizedByUser.set(userId, await sanitizer(session, userId));
          } catch (err) {
            logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            sanitizedByUser.set(userId, filterSessionForSpectators(session));
          }
        }
        const diffSession = sanitizedByUser.get(userId)!;
        socket.emit(
          'games.game.started',
          maybeEncrypt({ room, session: diffSession }),
        );
        socket.emit(
          'games.session.started',
          maybeEncrypt({ room, session: diffSession }),
        );
      } else if (sanitizer) {
        const diffSession = filterSessionForSpectators(session);
        socket.emit(
          'games.game.started',
          maybeEncrypt({ room, session: diffSession }),
        );
        socket.emit(
          'games.session.started',
          maybeEncrypt({ room, session: diffSession }),
        );
      } else {
        socket.emit('games.game.started', maybeEncrypt({ room, session }));
        socket.emit('games.session.started', maybeEncrypt({ room, session }));
      }
    }),
  );

  const filteredSession = filterSessionForSpectators(session);
  server
    .to(spectatorChannel(room.id))
    .emit(
      'games.game.started',
      maybeEncrypt({ room, session: filteredSession }),
    );
  server
    .to(spectatorChannel(room.id))
    .emit(
      'games.session.started',
      maybeEncrypt({ room, session: filteredSession }),
    );
}

export async function emitActionExecuted(
  logger: Logger,
  server: Server,
  session: GameSessionSummary,
  action: string,
  userId: string,
  roomChannel: (id: string) => string,
  spectatorChannel: (id: string) => string,
  emitSnapshot: () => Promise<void>,
  sanitizer?: Sanitizer,
): Promise<void> {
  if (!server || !session.roomId) return;

  const roomSockets = await server
    .in(roomChannel(session.roomId))
    .fetchSockets();

  const sanitizedByUser = new Map<string, GameSessionSummary>();

  await Promise.all(
    roomSockets.map(async (socket) => {
      const socketData = socket.data as Record<string, unknown> | undefined;
      const socketUserId = socketData?.userId as string | undefined;

      if (socketUserId && sanitizer) {
        if (!sanitizedByUser.has(socketUserId)) {
          try {
            sanitizedByUser.set(
              socketUserId,
              await sanitizer(session, socketUserId),
            );
          } catch (err) {
            logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            sanitizedByUser.set(
              socketUserId,
              filterSessionForSpectators(session),
            );
          }
        }
        socket.emit(
          'games.action.executed',
          maybeEncrypt({
            session: sanitizedByUser.get(socketUserId),
            action,
            userId,
          }),
        );
      } else if (sanitizer) {
        socket.emit(
          'games.action.executed',
          maybeEncrypt({
            session: filterSessionForSpectators(session),
            action,
            userId,
          }),
        );
      } else {
        socket.emit(
          'games.action.executed',
          maybeEncrypt({
            session,
            action,
            userId,
          }),
        );
      }
    }),
  );

  const filteredSession = filterSessionForSpectators(session);
  server.to(spectatorChannel(session.roomId)).emit(
    'games.action.executed',
    maybeEncrypt({
      session: filteredSession,
      action,
      userId,
    }),
  );

  await emitSnapshot();
}
