/**
 * Worker thread entry: runs one chess bot search per message so the search
 * never blocks the main event loop (other games, sockets, timers).
 */
import { parentPort } from 'node:worker_threads';
import {
  searchBotMove,
  type BotSearchRequest,
} from '@arcadeum/games-core/games/chess/chess-bot-search';

export interface BotWorkerRequest {
  id: number;
  req: BotSearchRequest;
}

parentPort?.on('message', (msg: BotWorkerRequest) => {
  try {
    parentPort?.postMessage({ id: msg.id, move: searchBotMove(msg.req) });
  } catch (err) {
    parentPort?.postMessage({ id: msg.id, error: String(err) });
  }
});
