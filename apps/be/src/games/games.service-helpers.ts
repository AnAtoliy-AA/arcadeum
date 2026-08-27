import type {
  GameSessionSummary,
  GameSessionsService,
} from './sessions/game-sessions.service';
import type { SeaBattleService } from './sea-battle/sea-battle.service';
import type { CriticalService } from './critical/critical.service';

export type RematchHistoryOptions = {
  gameId?: string;
  name?: string;
  visibility?: 'public' | 'private';
  gameOptions?: Record<string, unknown>;
  message?: string;
};

export function sanitizeSessionForPlayer(
  sessionsService: GameSessionsService,
  s: GameSessionSummary,
  pId: string,
): GameSessionSummary {
  const sanitized = sessionsService.sanitizeSummaryForPlayer(s, pId);
  if (sanitized && typeof sanitized === 'object') {
    return { ...s, state: sanitized as Record<string, unknown> };
  }
  return s;
}

export async function touchEngineSession(
  session: GameSessionSummary,
  seaBattleService: SeaBattleService,
  criticalService: CriticalService,
): Promise<void> {
  if (session.gameId === 'sea_battle_v1') {
    await seaBattleService.findSessionByRoom(session.roomId);
  } else if (session.gameId === 'critical_v1') {
    await criticalService.findSessionByRoom(session.roomId);
  }
}
