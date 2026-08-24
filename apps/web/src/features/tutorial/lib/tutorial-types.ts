import type { TranslationKey } from '@/shared/lib/useTranslation';

/**
 * Shared layout anchors a tutorial step can spotlight. Each maps to a
 * stable selector rendered by the game room layout (not by individual
 * game widgets), so every game gets the same integration for free.
 */
export type TutorialStepTargetId = 'board' | 'controls' | 'chat';

export const TUTORIAL_TARGET_SELECTORS: Record<TutorialStepTargetId, string> = {
  board: '[data-testid="game-board-area"]',
  controls: '[data-testid="games-control-panel"]',
  chat: '[data-testid="game-chat-area"]',
};

export interface TutorialStep {
  /** Emoji shown on the step card. */
  icon?: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  /** Layout region to spotlight; omit for a centered card. */
  target?: TutorialStepTargetId;
}

export interface TutorialDefinition {
  /** Display-name key, used for the completion card copy. */
  nameKey: TranslationKey;
  steps: TutorialStep[];
}

export interface ResolvedTutorialStep extends TutorialStep {
  key: string;
}
