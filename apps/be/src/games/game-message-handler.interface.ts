import type { Socket } from 'socket.io';

export type GameMessageHandlerFn = (
  client: Socket,
  payload: Record<string, unknown>,
) => Promise<void> | void;

export interface GameMessageHandler {
  readonly handlers: Record<string, GameMessageHandlerFn>;
}

export const GAME_GATEWAYS = 'GAME_GATEWAYS';
