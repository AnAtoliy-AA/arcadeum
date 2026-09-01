import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { TutorialDefinition } from './tutorial-types';

/**
 * Tutorial walkthroughs per implemented game. Steps are short, ordered,
 * and reference shared layout anchors so they work in every room without
 * widget-specific wiring. Add a game by translating its `tutorial` block
 * in `shared/i18n/messages/games/<game>/{en,es,fr,ru,by}.ts` and adding a
 * definition here.
 */
export const TUTORIAL_DEFS = {
  chess_v1: {
    nameKey: 'games.chess_v1.name',
    steps: [
      {
        icon: '♔',
        titleKey: 'games.chess_v1.tutorial.s1.title',
        bodyKey: 'games.chess_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '🖱️',
        titleKey: 'games.chess_v1.tutorial.s2.title',
        bodyKey: 'games.chess_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '⏱️',
        titleKey: 'games.chess_v1.tutorial.s3.title',
        bodyKey: 'games.chess_v1.tutorial.s3.body',
        target: 'controls',
      },
      {
        icon: '🎓',
        titleKey: 'games.chess_v1.tutorial.s4.title',
        bodyKey: 'games.chess_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  checkers_v1: {
    nameKey: 'games.checkers_v1.name',
    steps: [
      {
        icon: '♟️',
        titleKey: 'games.checkers_v1.tutorial.s1.title',
        bodyKey: 'games.checkers_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '⚡',
        titleKey: 'games.checkers_v1.tutorial.s2.title',
        bodyKey: 'games.checkers_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🏆',
        titleKey: 'games.checkers_v1.tutorial.s3.title',
        bodyKey: 'games.checkers_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🧰',
        titleKey: 'games.checkers_v1.tutorial.s4.title',
        bodyKey: 'games.checkers_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  tic_tac_toe_v1: {
    nameKey: 'games.tic_tac_toe_v1.name',
    steps: [
      {
        icon: '❌',
        titleKey: 'games.tic_tac_toe_v1.tutorial.s1.title',
        bodyKey: 'games.tic_tac_toe_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '📐',
        titleKey: 'games.tic_tac_toe_v1.tutorial.s2.title',
        bodyKey: 'games.tic_tac_toe_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '♾️',
        titleKey: 'games.tic_tac_toe_v1.tutorial.s3.title',
        bodyKey: 'games.tic_tac_toe_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '💬',
        titleKey: 'games.tic_tac_toe_v1.tutorial.s4.title',
        bodyKey: 'games.tic_tac_toe_v1.tutorial.s4.body',
        target: 'chat',
      },
    ],
  },
  sea_battle_v1: {
    nameKey: 'games.sea_battle_v1.name',
    steps: [
      {
        icon: '🚢',
        titleKey: 'games.sea_battle_v1.tutorial.s1.title',
        bodyKey: 'games.sea_battle_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '🎯',
        titleKey: 'games.sea_battle_v1.tutorial.s2.title',
        bodyKey: 'games.sea_battle_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '💥',
        titleKey: 'games.sea_battle_v1.tutorial.s3.title',
        bodyKey: 'games.sea_battle_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🧰',
        titleKey: 'games.sea_battle_v1.tutorial.s4.title',
        bodyKey: 'games.sea_battle_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  critical_v1: {
    nameKey: 'games.critical_v1.name',
    steps: [
      {
        icon: '💣',
        titleKey: 'games.critical_v1.tutorial.s1.title',
        bodyKey: 'games.critical_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '🃏',
        titleKey: 'games.critical_v1.tutorial.s2.title',
        bodyKey: 'games.critical_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '⏱️',
        titleKey: 'games.critical_v1.tutorial.s3.title',
        bodyKey: 'games.critical_v1.tutorial.s3.body',
        target: 'controls',
      },
      {
        icon: '💬',
        titleKey: 'games.critical_v1.tutorial.s4.title',
        bodyKey: 'games.critical_v1.tutorial.s4.body',
        target: 'chat',
      },
    ],
  },
  cascade_v1: {
    nameKey: 'games.cascade_v1.name',
    steps: [
      {
        icon: '🎴',
        titleKey: 'games.cascade_v1.tutorial.s1.title',
        bodyKey: 'games.cascade_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '➡️',
        titleKey: 'games.cascade_v1.tutorial.s2.title',
        bodyKey: 'games.cascade_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '📚',
        titleKey: 'games.cascade_v1.tutorial.s3.title',
        bodyKey: 'games.cascade_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🎨',
        titleKey: 'games.cascade_v1.tutorial.s4.title',
        bodyKey: 'games.cascade_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  glimworm_v1: {
    nameKey: 'games.glimworm_v1.name',
    steps: [
      {
        icon: '🐛',
        titleKey: 'games.glimworm_v1.tutorial.s1.title',
        bodyKey: 'games.glimworm_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '💀',
        titleKey: 'games.glimworm_v1.tutorial.s2.title',
        bodyKey: 'games.glimworm_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '⚡',
        titleKey: 'games.glimworm_v1.tutorial.s3.title',
        bodyKey: 'games.glimworm_v1.tutorial.s3.body',
        target: 'controls',
      },
      {
        icon: '🏆',
        titleKey: 'games.glimworm_v1.tutorial.s4.title',
        bodyKey: 'games.glimworm_v1.tutorial.s4.body',
      },
    ],
  },
  cat_dash_v1: {
    nameKey: 'games.cat_dash_v1.name',
    steps: [
      {
        icon: '🎲',
        titleKey: 'games.cat_dash_v1.tutorial.s1.title',
        bodyKey: 'games.cat_dash_v1.tutorial.s1.body',
        target: 'controls',
      },
      {
        icon: '⚠️',
        titleKey: 'games.cat_dash_v1.tutorial.s2.title',
        bodyKey: 'games.cat_dash_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '✨',
        titleKey: 'games.cat_dash_v1.tutorial.s3.title',
        bodyKey: 'games.cat_dash_v1.tutorial.s3.body',
        target: 'controls',
      },
      {
        icon: '🏁',
        titleKey: 'games.cat_dash_v1.tutorial.s4.title',
        bodyKey: 'games.cat_dash_v1.tutorial.s4.body',
        target: 'board',
      },
    ],
  },
  backgammon_v1: {
    nameKey: 'games.backgammon_v1.name',
    steps: [
      {
        icon: '🎲',
        titleKey: 'games.backgammon_v1.tutorial.s1.title',
        bodyKey: 'games.backgammon_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '⚔️',
        titleKey: 'games.backgammon_v1.tutorial.s2.title',
        bodyKey: 'games.backgammon_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🏠',
        titleKey: 'games.backgammon_v1.tutorial.s3.title',
        bodyKey: 'games.backgammon_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🧰',
        titleKey: 'games.backgammon_v1.tutorial.s4.title',
        bodyKey: 'games.backgammon_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  hearts_v1: {
    nameKey: 'games.hearts_v1.name',
    steps: [
      {
        icon: '♥️',
        titleKey: 'games.hearts_v1.tutorial.s1.title',
        bodyKey: 'games.hearts_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '🂮',
        titleKey: 'games.hearts_v1.tutorial.s2.title',
        bodyKey: 'games.hearts_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🌙',
        titleKey: 'games.hearts_v1.tutorial.s3.title',
        bodyKey: 'games.hearts_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🧠',
        titleKey: 'games.hearts_v1.tutorial.s4.title',
        bodyKey: 'games.hearts_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  spades_v1: {
    nameKey: 'games.spades_v1.name',
    steps: [
      {
        icon: '📝',
        titleKey: 'games.spades_v1.tutorial.s1.title',
        bodyKey: 'games.spades_v1.tutorial.s1.body',
        target: 'controls',
      },
      {
        icon: '♠️',
        titleKey: 'games.spades_v1.tutorial.s2.title',
        bodyKey: 'games.spades_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🤐',
        titleKey: 'games.spades_v1.tutorial.s3.title',
        bodyKey: 'games.spades_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '⚖️',
        titleKey: 'games.spades_v1.tutorial.s4.title',
        bodyKey: 'games.spades_v1.tutorial.s4.body',
        target: 'board',
      },
    ],
  },
  go_v1: {
    nameKey: 'games.go_v1.name',
    steps: [
      {
        icon: '⚫',
        titleKey: 'games.go_v1.tutorial.s1.title',
        bodyKey: 'games.go_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '🗡️',
        titleKey: 'games.go_v1.tutorial.s2.title',
        bodyKey: 'games.go_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🔁',
        titleKey: 'games.go_v1.tutorial.s3.title',
        bodyKey: 'games.go_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🧰',
        titleKey: 'games.go_v1.tutorial.s4.title',
        bodyKey: 'games.go_v1.tutorial.s4.body',
        target: 'controls',
      },
    ],
  },
  pachisi_v1: {
    nameKey: 'games.pachisi_v1.name',
    steps: [
      {
        icon: '🎲',
        titleKey: 'games.pachisi_v1.tutorial.s1.title',
        bodyKey: 'games.pachisi_v1.tutorial.s1.body',
        target: 'board',
      },
      {
        icon: '⚔️',
        titleKey: 'games.pachisi_v1.tutorial.s2.title',
        bodyKey: 'games.pachisi_v1.tutorial.s2.body',
        target: 'board',
      },
      {
        icon: '🏠',
        titleKey: 'games.pachisi_v1.tutorial.s3.title',
        bodyKey: 'games.pachisi_v1.tutorial.s3.body',
        target: 'board',
      },
      {
        icon: '🔥',
        titleKey: 'games.pachisi_v1.tutorial.s4.title',
        bodyKey: 'games.pachisi_v1.tutorial.s4.body',
        target: 'board',
      },
    ],
  },
} satisfies Record<string, TutorialDefinition>;

export type TutorialGameId = keyof typeof TUTORIAL_DEFS;

/** Whether an interactive tutorial exists for this game. */
export function hasTutorialSteps(gameId: string): boolean {
  return gameId in TUTORIAL_DEFS;
}

export function getTutorialDefinition(
  gameId: string,
): TutorialDefinition | null {
  return (TUTORIAL_DEFS as Record<string, TutorialDefinition>)[gameId] ?? null;
}

/**
 * Shared UI strings live under `games.tutorial.*` (see
 * `shared/i18n/messages/games/shared/*.ts`). These keys are enumerated
 * here so the overlay and tests stay type-safe.
 */
export const TUTORIAL_UI_KEYS = {
  button: 'games.tutorial.ui.button',
  next: 'games.tutorial.ui.next',
  back: 'games.tutorial.ui.back',
  skip: 'games.tutorial.ui.skip',
  finish: 'games.tutorial.ui.finish',
  stepOf: 'games.tutorial.ui.stepOf',
  completeTitle: 'games.tutorial.ui.completeTitle',
  completeBody: 'games.tutorial.ui.completeBody',
  close: 'games.tutorial.ui.close',
} satisfies Record<string, TranslationKey>;
