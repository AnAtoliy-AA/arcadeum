import type { TranslationKey } from '@/shared/i18n/useTranslation';

export type TutorialStepTargetId = 'board' | 'controls' | 'chat';

export const TUTORIAL_TARGET_SELECTORS: Record<TutorialStepTargetId, string> = {
  board: '[data-testid="game-board-area"]',
  controls: '[data-testid="games-control-panel"]',
  chat: '[data-testid="game-chat-area"]',
};

export interface InteractiveStepAction {
  type: 'move' | 'click' | 'select';
  expected?: string;
  hint?: string;
}

export interface TutorialStep {
  icon?: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  target?: TutorialStepTargetId;
  interactiveAction?: InteractiveStepAction;
}

export interface TutorialDefinition {
  nameKey: TranslationKey;
  steps: TutorialStep[];
}

export interface ResolvedTutorialStep extends TutorialStep {
  key: string;
}
