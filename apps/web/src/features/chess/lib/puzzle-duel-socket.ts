import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from '@/shared/lib/api-base';

let _duelSocket: Socket | null = null;

export function getChessPuzzleDuelSocket(): Socket {
  if (!_duelSocket) {
    const apiUrl = resolveApiUrl('').replace(/\/$/, '');
    _duelSocket = io(`${apiUrl}/chess-puzzle-duel`, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return _duelSocket;
}
