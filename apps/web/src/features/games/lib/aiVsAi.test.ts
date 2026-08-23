import { describe, it, expect } from 'vitest';
import {
  parseAiVsAiFilterFromUrl,
  serializeAiVsAiFilterToUrl,
} from '@/app/[locale]/(app)/games/types';
import { isAiVsAiSupported } from '@/features/games/lib/aiVsAi';

describe('aiVsAi filter serialization', () => {
  it('parses the ai_vs_ai URL value', () => {
    expect(parseAiVsAiFilterFromUrl('ai_vs_ai')).toBe('ai_vs_ai');
  });

  it.each([null, undefined, '', 'all', 'hosting'])(
    'parses %p as all',
    (raw) => {
      expect(parseAiVsAiFilterFromUrl(raw as string | null)).toBe('all');
    },
  );

  it('serializes the active filter to a URL value', () => {
    expect(serializeAiVsAiFilterToUrl('ai_vs_ai')).toBe('ai_vs_ai');
    expect(serializeAiVsAiFilterToUrl('all')).toBeUndefined();
  });
});

describe('isAiVsAiSupported', () => {
  it.each([
    'chess_v1',
    'checkers_v1',
    'tic_tac_toe_v1',
    'cascade_v1',
    'critical_v1',
    'sea_battle_v1',
    'cat_dash_v1',
    'backgammon_v1',
    'hearts_v1',
    'spades_v1',
  ])('supports %s', (gameId) => {
    expect(isAiVsAiSupported(gameId)).toBe(true);
  });

  it.each(['glimworm_v1', 'texas-holdem_v1', 'unknown'])(
    'rejects %s',
    (gameId) => {
      expect(isAiVsAiSupported(gameId)).toBe(false);
    },
  );
});
