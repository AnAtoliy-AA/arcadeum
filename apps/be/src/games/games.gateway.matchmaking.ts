import type { Socket } from 'socket.io';
import { extractString } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import type { GameRoomsMatchmakingService } from './rooms/game-rooms.matchmaking.service';
import { Logger } from '@nestjs/common';

export function handleMatchmakingJoin(
  logger: Logger,
  client: Socket,
  matchmakingService: GameRoomsMatchmakingService,
  validateUserId: (client: Socket, userId: string) => void,
  payload: {
    userId: string;
    gameId: string;
    variant?: string;
    ranked?: boolean;
    rating?: number;
  },
): void {
  const userId = extractString(payload, 'userId');
  const gameId = extractString(payload, 'gameId');
  const variant = payload.variant ? String(payload.variant) : undefined;
  const ranked = payload.ranked === true;
  const rating =
    typeof payload.rating === 'number' ? payload.rating : undefined;
  validateUserId(client, userId);
  const ipHeader = client.handshake.headers['x-forwarded-for'];
  const ip =
    typeof ipHeader === 'string'
      ? ipHeader.split(',')[0].trim()
      : client.handshake.address;
  void matchmakingService.joinQueue(
    userId,
    client.id,
    gameId,
    variant,
    ranked,
    undefined,
    ip,
    rating,
  );
  client.emit(
    'games.matchmaking.joined',
    maybeEncrypt({ gameId, variant, ranked }),
  );
}

export function handleMatchmakingLeave(
  client: Socket,
  matchmakingService: GameRoomsMatchmakingService,
  validateUserId: (client: Socket, userId: string) => void,
  payload: { userId: string },
): void {
  const userId = extractString(payload, 'userId');
  validateUserId(client, userId);
  void matchmakingService.leaveQueue(userId);
  client.emit('games.matchmaking.left', maybeEncrypt({}));
}
