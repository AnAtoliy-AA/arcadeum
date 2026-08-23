import { describe, expect, it } from 'vitest';
import { loadGames } from '@/shared/i18n/messages/games/load-games';
import {
  TUTORIAL_DEFS,
  TUTORIAL_UI_KEYS,
  getTutorialDefinition,
  hasTutorialSteps,
} from './tutorial-steps';
import type { TutorialDefinition } from './tutorial-types';

const GAME_LOADERS_IMPLEMENTED = [
  'critical_v1',
  'sea_battle_v1',
  'glimworm_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'chess_v1',
  'checkers_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
];

function getAt(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

describe('tutorial-steps', () => {
  it('defines tutorials for every implemented game', () => {
    expect(Object.keys(TUTORIAL_DEFS).sort()).toEqual(
      [...GAME_LOADERS_IMPLEMENTED].sort(),
    );
  });

  it('hasTutorialSteps / getTutorialDefinition agree', () => {
    expect(hasTutorialSteps('chess_v1')).toBe(true);
    expect(hasTutorialSteps('nope_v9')).toBe(false);
    expect(getTutorialDefinition('chess_v1')).not.toBeNull();
    expect(getTutorialDefinition('nope_v9')).toBeNull();
  });

  it('every definition has at least three steps', () => {
    for (const [gameId, def] of Object.entries(TUTORIAL_DEFS)) {
      expect(def.steps.length, gameId).toBeGreaterThanOrEqual(3);
    }
  });

  it('targets are only board, controls or chat', () => {
    for (const [, def] of Object.entries(TUTORIAL_DEFS)) {
      for (const step of def.steps) {
        if (step.target) {
          expect(['board', 'controls', 'chat']).toContain(step.target);
        }
      }
    }
  });

  describe('message keys resolve in every locale', () => {
    const LOCALES = ['en', 'es', 'fr', 'ru', 'by'] as const;

    it.each(LOCALES)('%s resolves all keys', async (locale) => {
      const games = (await loadGames(locale)) as Record<string, unknown>;

      for (const gameId of Object.keys(TUTORIAL_DEFS)) {
        const def = (TUTORIAL_DEFS as Record<string, TutorialDefinition>)[
          gameId
        ];
        const name = getAt({ games }, def.nameKey);
        expect(typeof name).toBe('string');
        expect(name as string).not.toHaveLength(0);

        def.steps.forEach((step) => {
          const title = getAt({ games }, step.titleKey);
          const body = getAt({ games }, step.bodyKey);
          expect(typeof title, step.titleKey).toBe('string');
          expect(title as string, step.titleKey).not.toHaveLength(0);
          expect(typeof body, step.bodyKey).toBe('string');
          expect(body as string, step.bodyKey).not.toHaveLength(0);
        });
      }

      for (const key of Object.values(TUTORIAL_UI_KEYS)) {
        expect(getAt({ games }, key), key).toBeTruthy();
      }
    });
  });
});
