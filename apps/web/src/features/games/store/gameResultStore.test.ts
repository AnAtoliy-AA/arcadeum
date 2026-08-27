import { beforeEach, describe, expect, it } from 'vitest';
import { useGameResultStore } from './gameResultStore';

describe('gameResultStore', () => {
  beforeEach(() => {
    useGameResultStore.getState().reset();
  });

  it('initializes with default closed state', () => {
    const state = useGameResultStore.getState();
    expect(state.hasResult).toBe(false);
    expect(state.isOpen).toBe(false);
  });

  it('opens and sets hasResult', () => {
    useGameResultStore.getState().open();
    const state = useGameResultStore.getState();
    expect(state.hasResult).toBe(true);
    expect(state.isOpen).toBe(true);
  });

  it('closes modal but preserves hasResult', () => {
    useGameResultStore.getState().open();
    useGameResultStore.getState().close();
    const state = useGameResultStore.getState();
    expect(state.hasResult).toBe(true);
    expect(state.isOpen).toBe(false);
  });

  it('toggles modal visibility', () => {
    useGameResultStore.getState().setHasResult(true);
    expect(useGameResultStore.getState().isOpen).toBe(false);

    useGameResultStore.getState().toggle();
    expect(useGameResultStore.getState().isOpen).toBe(true);

    useGameResultStore.getState().toggle();
    expect(useGameResultStore.getState().isOpen).toBe(false);
  });

  it('resets state completely', () => {
    useGameResultStore.getState().open();
    useGameResultStore.getState().reset();
    const state = useGameResultStore.getState();
    expect(state.hasResult).toBe(false);
    expect(state.isOpen).toBe(false);
  });
});
