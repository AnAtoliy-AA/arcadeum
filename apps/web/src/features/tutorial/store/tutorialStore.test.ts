import { beforeEach, describe, expect, it } from 'vitest';
import { TUTORIALS_STORAGE_KEY, useTutorialStore } from './tutorialStore';

describe('tutorialStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useTutorialStore.setState({ completedAt: {}, dismissedAt: {} });
  });

  it('starts with nothing seen or completed', () => {
    expect(useTutorialStore.getState().hasSeenTutorial('chess_v1')).toBe(false);
    expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(false);
  });

  it('marks completion and reports seen + completed', () => {
    useTutorialStore.getState().markCompleted('chess_v1');
    const state = useTutorialStore.getState();
    expect(state.isCompleted('chess_v1')).toBe(true);
    expect(state.hasSeenTutorial('chess_v1')).toBe(true);
    expect(state.completedAt['chess_v1']).toBeGreaterThan(0);
  });

  it('marks dismissal as seen but not completed', () => {
    useTutorialStore.getState().markDismissed('go_v1');
    const state = useTutorialStore.getState();
    expect(state.hasSeenTutorial('go_v1')).toBe(true);
    expect(state.isCompleted('go_v1')).toBe(false);
  });

  it('tracks games independently', () => {
    useTutorialStore.getState().markCompleted('chess_v1');
    useTutorialStore.getState().markDismissed('checkers_v1');
    expect(useTutorialStore.getState().hasSeenTutorial('tic_tac_toe_v1')).toBe(
      false,
    );
    expect(useTutorialStore.getState().isCompleted('chess_v1')).toBe(true);
    expect(useTutorialStore.getState().isCompleted('checkers_v1')).toBe(false);
  });

  it('completion overwrites a prior dismissal', () => {
    useTutorialStore.getState().markDismissed('hearts_v1');
    useTutorialStore.getState().markCompleted('hearts_v1');
    expect(useTutorialStore.getState().isCompleted('hearts_v1')).toBe(true);
  });

  it('resetTutorials clears all progress', () => {
    useTutorialStore.getState().markCompleted('chess_v1');
    useTutorialStore.getState().markDismissed('go_v1');
    useTutorialStore.getState().resetTutorials();
    expect(useTutorialStore.getState().hasSeenTutorial('chess_v1')).toBe(false);
    expect(useTutorialStore.getState().hasSeenTutorial('go_v1')).toBe(false);
  });

  it('persists progress under the versioned storage key', () => {
    useTutorialStore.getState().markCompleted('pachisi_v1');
    const raw = localStorage.getItem(TUTORIALS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? '{}') as {
      state: { completedAt: Record<string, number> };
    };
    expect(parsed.state.completedAt['pachisi_v1']).toBeGreaterThan(0);
  });
});
