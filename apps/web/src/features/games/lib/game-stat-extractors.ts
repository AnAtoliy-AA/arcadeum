import type { GameResultStats } from '../ui/GameResultStatsGrid';
import type { StateExtractor } from './game-stat-extractors.types';
import { boardGameExtractors } from './game-stat-extractors-board';
import { cardGameExtractors } from './game-stat-extractors-card';

const extractors: Record<string, StateExtractor> = {
  ...boardGameExtractors,
  ...cardGameExtractors,
};

export function extractGameStats(
  gameId: string,
  state: Record<string, unknown>,
  currentUserId: string,
): GameResultStats | null {
  const extractor = extractors[gameId];
  if (!extractor) return null;
  return extractor(state, currentUserId);
}
