export { TutorialOverlay } from './ui/TutorialOverlay';
export { useTutorialStore, TUTORIALS_STORAGE_KEY } from './store/tutorialStore';
export {
  TUTORIAL_DEFS,
  TUTORIAL_UI_KEYS,
  getTutorialDefinition,
  hasTutorialSteps,
  type TutorialGameId,
} from './lib/tutorial-steps';
export type {
  TutorialDefinition,
  TutorialStep,
  TutorialStepTargetId,
} from './lib/tutorial-types';
